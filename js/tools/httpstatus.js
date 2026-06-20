// HTTP 状态码速查

const HTTP_STATUS_CATS = [
    { key: '1', label: 'ℹ️ 信息 1xx' },
    { key: '2', label: '✅ 成功 2xx' },
    { key: '3', label: '➡️ 重定向 3xx' },
    { key: '4', label: '⚠️ 客户端错误 4xx' },
    { key: '5', label: '❌ 服务端错误 5xx' }
];

const HTTP_STATUS = [
    { code: 100, cat: '1', name: 'Continue', desc: '继续。客户端应继续发送请求' },
    { code: 101, cat: '1', name: 'Switching Protocols', desc: '切换协议。服务器同意切换协议（如升级 WebSocket）' },
    { code: 200, cat: '2', name: 'OK', desc: '请求成功' },
    { code: 201, cat: '2', name: 'Created', desc: '已创建。资源创建成功（常用于 POST）' },
    { code: 202, cat: '2', name: 'Accepted', desc: '已接受。请求已接收但未处理完成' },
    { code: 204, cat: '2', name: 'No Content', desc: '无内容。成功但无返回体（常用于 DELETE）' },
    { code: 206, cat: '2', name: 'Partial Content', desc: '部分内容。范围请求成功（断点下载）' },
    { code: 301, cat: '3', name: 'Moved Permanently', desc: '永久重定向' },
    { code: 302, cat: '3', name: 'Found', desc: '临时重定向' },
    { code: 304, cat: '3', name: 'Not Modified', desc: '未修改。使用缓存' },
    { code: 307, cat: '3', name: 'Temporary Redirect', desc: '临时重定向，保持原请求方法' },
    { code: 308, cat: '3', name: 'Permanent Redirect', desc: '永久重定向，保持原请求方法' },
    { code: 400, cat: '4', name: 'Bad Request', desc: '请求错误。参数/语法错误' },
    { code: 401, cat: '4', name: 'Unauthorized', desc: '未授权。需要身份验证' },
    { code: 403, cat: '4', name: 'Forbidden', desc: '禁止访问。已认证但无权限' },
    { code: 404, cat: '4', name: 'Not Found', desc: '未找到资源' },
    { code: 405, cat: '4', name: 'Method Not Allowed', desc: '方法不允许（如对只读接口用 POST）' },
    { code: 408, cat: '4', name: 'Request Timeout', desc: '请求超时' },
    { code: 409, cat: '4', name: 'Conflict', desc: '冲突。资源状态冲突' },
    { code: 413, cat: '4', name: 'Payload Too Large', desc: '请求体过大' },
    { code: 415, cat: '4', name: 'Unsupported Media Type', desc: '不支持的媒体类型' },
    { code: 422, cat: '4', name: 'Unprocessable Entity', desc: '不可处理。语义错误（校验失败）' },
    { code: 429, cat: '4', name: 'Too Many Requests', desc: '请求过多。触发限流' },
    { code: 500, cat: '5', name: 'Internal Server Error', desc: '服务器内部错误' },
    { code: 501, cat: '5', name: 'Not Implemented', desc: '未实现。服务器不支持该功能' },
    { code: 502, cat: '5', name: 'Bad Gateway', desc: '网关错误。上游响应无效' },
    { code: 503, cat: '5', name: 'Service Unavailable', desc: '服务不可用。过载或维护中' },
    { code: 504, cat: '5', name: 'Gateway Timeout', desc: '网关超时。上游未及时响应' }
];

const httpstatusTools = {
    _cat: 'all',

    init() {
        this.renderCats();
        this.filter();
    },

    renderCats() {
        const wrap = document.getElementById('httpstatusCats');
        const cats = [{ key: 'all', label: '🌟 全部' }, ...HTTP_STATUS_CATS];
        wrap.innerHTML = cats.map(c =>
            `<button class="linuxcmd-cat ${c.key === 'all' ? 'active' : ''}" data-cat="${c.key}" onclick="httpstatusTools.selectCat('${c.key}')">${c.label}</button>`
        ).join('');
    },

    selectCat(key) {
        this._cat = key;
        document.querySelectorAll('#httpstatusCats .linuxcmd-cat').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === key);
        });
        this.filter();
    },

    filter() {
        const q = document.getElementById('httpstatusSearch').value.trim().toLowerCase();
        const list = HTTP_STATUS.filter(s => {
            const catOk = this._cat === 'all' || s.cat === this._cat;
            if (!catOk) return false;
            if (!q) return true;
            return (s.code + ' ' + s.name + ' ' + s.desc).toLowerCase().includes(q);
        });
        document.getElementById('httpstatusCount').textContent = `${list.length} / ${HTTP_STATUS.length} 条`;
        document.getElementById('httpstatusList').innerHTML = list.length
            ? list.map(s => `
                <div class="linuxcmd-card">
                    <div class="linuxcmd-top">
                        <code class="linuxcmd-name">${s.code}</code>
                        <span class="linuxcmd-tag">${this.catLabel(s.cat)}</span>
                    </div>
                    <div class="linuxcmd-desc"><b>${this.esc(s.name)}</b></div>
                    <div class="linuxcmd-desc">${this.esc(s.desc)}</div>
                </div>`).join('')
            : '<div class="linuxcmd-empty">未找到匹配的状态码</div>';
    },

    catLabel(k) {
        return (HTTP_STATUS_CATS.find(c => c.key === k) || {}).label || '';
    },

    esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => httpstatusTools.init());
