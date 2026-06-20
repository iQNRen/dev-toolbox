// 网络工具：我的IP / IP归属地 / DNS解析 / HTTP探活

// ===== 共享辅助 =====
const netUtil = {
    // 带超时的 fetch
    fetchTimeout(url, options = {}, ms = 8000) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), ms);
        return fetch(url, { ...options, signal: ctrl.signal })
            .then(r => { clearTimeout(t); return r; })
            .catch(e => { clearTimeout(t); throw e; });
    },

    // DoH 查询（Cloudflare 1.1.1.1），返回 JSON
    async doh(name, type = 'A') {
        const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
        const res = await netUtil.fetchTimeout(url, { headers: { 'accept': 'application/dns-json' } });
        return res.json();
    },

    // 判断是否为 IPv4
    isIPv4(s) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(s); },
    // 判断是否为域名
    isDomain(s) { return /^[a-zA-Z0-9]([a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/.test(s); },

    // 渲染归属地信息为字段表
    renderInfo(obj) {
        const fields = [
            ['IP 地址', obj.ip],
            ['国家/地区', [obj.country_name, obj.region, obj.city].filter(Boolean).join(' · ')],
            ['运营商 (ISP)', obj.org || obj.isp],
            ['ASN', obj.asn],
            ['时区', obj.timezone],
            ['经纬度', obj.latitude && obj.longitude ? `${obj.latitude}, ${obj.longitude}` : obj.loc],
            ['邮编', obj.postal]
        ];
        return fields
            .filter(f => f[1] !== undefined && f[1] !== null && f[1] !== '')
            .map(f => `<div class="net-field"><span class="net-field-label">${f[0]}</span><span class="net-field-value">${netUtil.esc(String(f[1]))}</span></div>`)
            .join('');
    },

    loading(el, msg = '查询中...') { el.innerHTML = `<div class="net-loading">${msg}</div>`; },
    error(el, msg) { el.innerHTML = `<div class="net-error">❌ ${netUtil.esc(msg)}</div>`; },

    // 百度 qifu-api 字段映射为统一结构
    mapQifu(d) {
        return {
            ip: d.ip,
            country_name: d.country,
            region: d.province,
            city: d.city,
            org: d.isp,
            asn: d.areacode || '',
            timezone: d.timeZone,
            latitude: d.latitude,
            longitude: d.longitude,
            postal: d.zipCode
        };
    },

    // ipinfo.io 字段映射为统一结构
    mapIpinfo(d) {
        const [lat, lng] = (d.loc || '').split(',');
        return {
            ip: d.ip,
            country_name: d.country,
            region: d.region,
            city: d.city,
            org: d.org,
            asn: d.asn ? (typeof d.asn === 'object' ? d.asn.asn : d.asn) : '',
            timezone: d.timezone,
            latitude: lat,
            longitude: lng,
            postal: d.postal
        };
    },

    esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

// DNS 记录类型号 → 名称
const DNS_TYPE_NAME = { 1: 'A', 28: 'AAAA', 5: 'CNAME', 15: 'MX', 16: 'TXT', 2: 'NS', 6: 'SOA' };

// ===== 我的 IP =====
const myipTools = {
    _ip: '',

    async query() {
        const out = document.getElementById('myipResult');
        netUtil.loading(out);
        let data = null;

        // 主接口：百度 qifu-api（国内快、CORS 友好）
        try {
            const res = await netUtil.fetchTimeout('https://qifu-api.baidubce.com/ip/local/geo/v1/district');
            const r = await res.json();
            if (r.code === 'Success' && r.data && r.data.ip) {
                data = netUtil.mapQifu(r.data);
            }
        } catch (e) {}

        // 回退：ipinfo.io（国际）
        if (!data) {
            try {
                const res = await netUtil.fetchTimeout('https://ipinfo.io/json');
                data = netUtil.mapIpinfo(await res.json());
            } catch (e) {}
        }

        if (data && data.ip) {
            this._ip = data.ip;
            out.innerHTML = `<div class="net-card">${netUtil.renderInfo(data)}</div>`;
        } else {
            this._ip = '';
            netUtil.error(out, '查询失败：所有 IP 接口均不可达（可能网络受限或被拦截）');
        }
    },

    copy() {
        if (this._ip) copyToClipboard(this._ip);
        else showToast('请先查询 IP');
    }
};

// ===== IP / 域名归属地 =====
const iplookupTools = {
    async query() {
        const input = document.getElementById('iplookupInput').value.trim();
        const out = document.getElementById('iplookupResult');
        if (!input) { showToast('请输入 IP 或域名'); return; }

        netUtil.loading(out);
        try {
            let target = input;
            // 域名先解析为 IP
            if (!netUtil.isIPv4(target) && netUtil.isDomain(target)) {
                const dns = await netUtil.doh(target, 'A');
                const a = (dns.Answer || []).find(a => a.type === 1);
                if (!a) throw new Error('域名无法解析为 IP');
                target = a.data;
                out.innerHTML = `<div class="net-hint">域名 ${netUtil.esc(input)} 解析为 IP：<b>${netUtil.esc(target)}</b>，正在查询归属地...</div>`;
            }

            // 主接口：百度 qifu-api
            let data = null;
            try {
                const res = await netUtil.fetchTimeout(`https://qifu-api.baidubce.com/ip/local/geo/v1/district?ip=${encodeURIComponent(target)}`);
                const r = await res.json();
                if (r.code === 'Success' && r.data && r.data.ip) {
                    data = netUtil.mapQifu(r.data);
                }
            } catch (e) {}

            // 回退：ipinfo.io
            if (!data) {
                const r2 = await netUtil.fetchTimeout(`https://ipinfo.io/${target}/json`);
                data = netUtil.mapIpinfo(await r2.json());
            }
            out.innerHTML = `<div class="net-card">${netUtil.renderInfo(data)}</div>`;
        } catch (e) {
            netUtil.error(out, '查询失败：' + e.message);
        }
    }
};

// ===== DNS 解析 =====
const dnsTools = {
    async query() {
        const name = document.getElementById('dnsInput').value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const type = document.getElementById('dnsType').value;
        const out = document.getElementById('dnsResult');
        if (!name) { showToast('请输入域名'); return; }

        netUtil.loading(out, `查询 ${name} 的 ${type} 记录...`);
        try {
            const data = await netUtil.doh(name, type);
            if (data.Status !== 0) {
                netUtil.error(out, `DNS 查询失败（状态码 ${data.Status}）`);
                return;
            }
            const answers = data.Answer || [];
            if (!answers.length) {
                out.innerHTML = `<div class="net-hint">未找到 ${name} 的 ${type} 记录</div>`;
                return;
            }
            out.innerHTML = `
                <div class="net-card">
                    <div class="dns-table">
                        <div class="dns-row dns-head"><span>类型</span><span>TTL</span><span>记录值</span></div>
                        ${answers.map(a => `
                            <div class="dns-row">
                                <span class="dns-type">${DNS_TYPE_NAME[a.type] || a.type}</span>
                                <span class="dns-ttl">${a.TTL}s</span>
                                <span class="dns-data" title="点击复制">${netUtil.esc(a.data)}</span>
                            </div>`).join('')}
                    </div>
                </div>`;
        } catch (e) {
            netUtil.error(out, '查询失败：' + e.message + '（可能被网络拦截）');
        }
    }
};

// ===== HTTP 探活与延迟 =====
const httppingTools = {
    async ping() {
        const url = document.getElementById('httppingInput').value.trim();
        const count = Math.min(Math.max(parseInt(document.getElementById('httppingCount').value) || 5, 1), 20);
        const out = document.getElementById('httppingResult');
        if (!url) { showToast('请输入 URL'); return; }
        if (!/^https?:\/\//i.test(url)) { showToast('URL 需以 http:// 或 https:// 开头'); return; }

        out.innerHTML = `<div class="net-loading">正在探测 ${netUtil.esc(url)}（${count} 次）...</div>`;

        const times = [];
        let lastStatus = '-';
        let reachable = false;

        for (let i = 0; i < count; i++) {
            const t0 = performance.now();
            try {
                // 先尝试 cors 模式拿状态码；失败则 no-cors 测可达性
                let res;
                try {
                    res = await netUtil.fetchTimeout(url, { method: 'GET', mode: 'cors', cache: 'no-store' }, 6000);
                    lastStatus = res.status;
                    reachable = true;
                } catch (e) {
                    res = await netUtil.fetchTimeout(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' }, 6000);
                    lastStatus = '(opaque)';
                    reachable = true; // no-cors 不抛错即视为可达
                }
                const dt = Math.round(performance.now() - t0);
                times.push(dt);
            } catch (e) {
                times.push(null);
            }
            // 实时更新每次结果
            this._renderProgress(out, url, times, lastStatus);
        }

        this._renderFinal(out, url, times, lastStatus, reachable);
    },

    _renderProgress(out, url, times, status) {
        const rows = times.map((t, i) =>
            `<div class="ping-row"><span class="ping-seq">#${i + 1}</span>${t === null ? '<span class="ping-fail">超时/失败</span>' : `<span class="ping-time">${t} ms</span>`}</div>`
        ).join('');
        out.innerHTML = `
            <div class="net-card">
                <div class="ping-target">目标：<b>${netUtil.esc(url)}</b> · 状态：${status}</div>
                <div class="ping-rows">${rows}</div>
            </div>`;
    },

    _renderFinal(out, url, times, status, reachable) {
        const valid = times.filter(t => t !== null);
        const rows = times.map((t, i) =>
            `<div class="ping-row"><span class="ping-seq">#${i + 1}</span>${t === null ? '<span class="ping-fail">超时/失败</span>' : `<span class="ping-time">${t} ms</span>`}</div>`
        ).join('');

        let stats = '';
        if (valid.length) {
            const avg = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
            const min = Math.min(...valid);
            const max = Math.max(...valid);
            const loss = Math.round((times.length - valid.length) / times.length * 100);
            stats = `
                <div class="ping-stats">
                    <span>可达：<b style="color:var(--success-color)">${reachable ? '是' : '否'}</b></span>
                    <span>平均：<b>${avg} ms</b></span>
                    <span>最小：<b>${min} ms</b></span>
                    <span>最大：<b>${max} ms</b></span>
                    <span>丢包：<b>${loss}%</b></span>
                </div>`;
        } else {
            stats = `<div class="ping-stats"><span style="color:var(--error-color)">全部失败，目标可能不可达或被 CORS 拦截</span></div>`;
        }

        out.innerHTML = `
            <div class="net-card">
                <div class="ping-target">目标：<b>${netUtil.esc(url)}</b> · 状态码：${status}</div>
                ${stats}
                <div class="ping-rows">${rows}</div>
                <div class="net-hint">提示：浏览器受 CORS 限制，跨域请求可能拿不到状态码（显示 opaque），但延迟测量仍有效。</div>
            </div>`;
    }
};
