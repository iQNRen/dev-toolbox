// 开发工具

// UUID生成
const uuidTools = {
    generate() {
        const count = parseInt(document.getElementById('uuidCount').value) || 10;
        const format = document.getElementById('uuidFormat').value;
        const uuids = [];
        for (let i = 0; i < Math.min(count, 1000); i++) {
            let uuid = this.v4();
            if (format === 'upper') uuid = uuid.toUpperCase();
            if (format === 'nohyphen') uuid = uuid.replace(/-/g, '');
            uuids.push(uuid);
        }
        document.getElementById('uuidOutput').value = uuids.join('\n');
    },
    v4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },
    copy() {
        const v = document.getElementById('uuidOutput').value;
        if (v) copyToClipboard(v); else showToast('请先生成UUID');
    }
};

// 密码生成
const passwordTools = {
    generate() {
        const length = parseInt(document.getElementById('pwdLength').value) || 16;
        const count = parseInt(document.getElementById('pwdCount').value) || 5;
        const useUpper = document.getElementById('pwdUpper').checked;
        const useLower = document.getElementById('pwdLower').checked;
        const useDigit = document.getElementById('pwdDigit').checked;
        const useSymbol = document.getElementById('pwdSymbol').checked;

        let chars = '';
        if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (useDigit) chars += '0123456789';
        if (useSymbol) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) { showToast('请至少选择一种字符类型'); return; }

        const passwords = [];
        for (let i = 0; i < Math.min(count, 100); i++) {
            let pwd = '';
            for (let j = 0; j < Math.min(length, 128); j++) {
                pwd += chars[Math.floor(Math.random() * chars.length)];
            }
            passwords.push(pwd);
        }
        document.getElementById('passwordOutput').value = passwords.join('\n');
    },
    copy() {
        const v = document.getElementById('passwordOutput').value;
        if (v) copyToClipboard(v); else showToast('请先生成密码');
    }
};

// px/rem转换
const px2remTools = {
    pxToRem() {
        const base = parseFloat(document.getElementById('px2remBase').value) || 16;
        const px = parseFloat(document.getElementById('pxInput').value);
        const result = document.getElementById('pxResult');
        if (isNaN(px)) { result.innerHTML = ''; return; }
        const rem = (px / base).toFixed(4);
        result.innerHTML = `<div><strong>${px}px</strong> = <strong>${rem}rem</strong></div><div>calc: ${px} ÷ ${base}</div>`;
    },
    remToPx() {
        const base = parseFloat(document.getElementById('px2remBase').value) || 16;
        const rem = parseFloat(document.getElementById('remInput').value);
        const result = document.getElementById('remResult');
        if (isNaN(rem)) { result.innerHTML = ''; return; }
        const px = (rem * base).toFixed(2);
        result.innerHTML = `<div><strong>${rem}rem</strong> = <strong>${px}px</strong></div><div>calc: ${rem} × ${base}</div>`;
    }
};

// Cron解析
const crontabTools = {
    parse() {
        const expr = document.getElementById('cronInput').value.trim();
        const result = document.getElementById('cronResult');
        if (!expr) { result.innerHTML = ''; return; }

        const parts = expr.split(/\s+/);
        if (parts.length < 5 || parts.length > 6) {
            result.innerHTML = '<div style="color:var(--error-color)">格式错误: Cron表达式需要5或6个字段</div>';
            return;
        }

        const [min, hour, dom, month, dow] = parts;
        let desc = '<div style="margin-bottom:8px"><strong>解析结果:</strong></div>';
        desc += `<div>分钟: ${this.explain(min, 0, 59)}</div>`;
        desc += `<div>小时: ${this.explain(hour, 0, 23)}</div>`;
        desc += `<div>日期: ${this.explain(dom, 1, 31)}</div>`;
        desc += `<div>月份: ${this.explain(month, 1, 12)}</div>`;
        desc += `<div>星期: ${this.explain(dow, 0, 6)} (0=周日)</div>`;

        desc += '<div style="margin-top:12px"><strong>最近5次执行时间:</strong></div>';
        try {
            const times = this.getNextRuns(parts, 5);
            times.forEach(t => { desc += `<div>${t}</div>`; });
        } catch (e) {
            desc += `<div style="color:var(--error-color)">计算失败: ${e.message}</div>`;
        }

        result.innerHTML = desc;
    },
    explain(field, min, max) {
        if (field === '*') return '每' + (max - min + 1 <= 60 ? '分/时' : '天/月');
        if (field.includes('/')) {
            const [range, step] = field.split('/');
            return `每 ${step} 个单位 (从 ${range === '*' ? min : range} 开始)`;
        }
        if (field.includes('-')) return `范围 ${field}`;
        if (field.includes(',')) return `列表 ${field}`;
        return `第 ${field} 个`;
    },
    getNextRuns(parts, count) {
        const [minE, hourE, domE, monthE, dowE] = parts;
        const times = [];
        const now = new Date();
        let d = new Date(now);
        d.setSeconds(0);
        d.setMilliseconds(0);
        d.setMinutes(d.getMinutes() + 1);

        for (let i = 0; i < 525960 && times.length < count; i++) {
            if (this.match(d, minE, hourE, domE, monthE, dowE)) {
                times.push(d.toLocaleString('zh-CN'));
            }
            d = new Date(d.getTime() + 60000);
        }
        return times;
    },
    match(d, minE, hourE, domE, monthE, dowE) {
        return this.matchField(d.getMinutes(), minE, 0, 59) &&
               this.matchField(d.getHours(), hourE, 0, 23) &&
               this.matchField(d.getDate(), domE, 1, 31) &&
               this.matchField(d.getMonth() + 1, monthE, 1, 12) &&
               this.matchField(d.getDay(), dowE, 0, 6);
    },
    matchField(value, expr, min, max) {
        if (expr === '*') return true;
        if (expr.includes('/')) {
            const [range, step] = expr.split('/');
            const s = parseInt(step);
            if (range === '*') return (value - min) % s === 0;
            return value >= parseInt(range) && (value - parseInt(range)) % s === 0;
        }
        if (expr.includes('-')) {
            const [a, b] = expr.split('-').map(Number);
            return value >= a && value <= b;
        }
        if (expr.includes(',')) {
            return expr.split(',').map(Number).includes(value);
        }
        return value === parseInt(expr);
    }
};

// 随机数生成
const randomTools = {
    generate() {
        const min = parseFloat(document.getElementById('randomMin').value);
        const max = parseFloat(document.getElementById('randomMax').value);
        const count = Math.min(Math.max(parseInt(document.getElementById('randomCount').value) || 1, 1), 10000);
        const decimal = document.getElementById('randomDecimal').checked;
        const unique = document.getElementById('randomUnique').checked;
        const digits = Math.min(Math.max(parseInt(document.getElementById('randomDigits').value) || 0, 0), 10);
        const format = document.getElementById('randomFormat').value;

        if (isNaN(min) || isNaN(max)) { showToast('请输入有效的数值范围'); return; }
        if (min > max) { showToast('最小值不能大于最大值'); return; }

        let nums;
        if (unique) {
            // 不重复：用 Set 去重，范围不足时提前停止
            const set = new Set();
            let guard = 0;
            const limit = count * 1000;
            while (set.size < count && guard < limit) {
                set.add(this.rand(min, max, decimal, digits));
                guard++;
            }
            nums = Array.from(set);
            if (nums.length < count) {
                showToast(`范围内不重复值不足，仅生成 ${nums.length} 个（可扩大范围或取消"不重复"）`);
            }
        } else {
            nums = [];
            for (let i = 0; i < count; i++) nums.push(this.rand(min, max, decimal, digits));
        }

        let text;
        switch (format) {
            case 'comma': text = nums.join(', '); break;
            case 'space': text = nums.join(' '); break;
            case 'json':  text = JSON.stringify(nums); break;
            default:      text = nums.join('\n');
        }
        document.getElementById('randomOutput').value = text;
        showToast(`已生成 ${nums.length} 个随机数`);
    },

    rand(min, max, decimal, digits) {
        if (decimal) {
            const v = Math.random() * (max - min) + min;
            return +v.toFixed(digits);
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    copy() {
        const v = document.getElementById('randomOutput').value;
        if (v) copyToClipboard(v); else showToast('请先生成随机数');
    },

    clear() {
        document.getElementById('randomOutput').value = '';
    }
};

// 进制转换
const numberbaseTools = {
    convert() {
        const input = document.getElementById('numberInput').value.trim();
        const base = parseInt(document.getElementById('numberBase').value);
        if (!input) {
            ['Bin','Oct','Dec','Hex'].forEach(k => document.getElementById('num'+k).textContent = '-');
            return;
        }
        try {
            const num = parseInt(input, base);
            if (isNaN(num)) throw new Error('invalid');
            document.getElementById('numBin').textContent = num.toString(2);
            document.getElementById('numOct').textContent = num.toString(8);
            document.getElementById('numDec').textContent = num.toString(10);
            document.getElementById('numHex').textContent = num.toString(16).toUpperCase();
        } catch (e) {
            ['Bin','Oct','Dec','Hex'].forEach(k => document.getElementById('num'+k).textContent = '错误');
        }
    },
    copy(id) {
        const v = document.getElementById(id).textContent;
        if (v && v !== '-' && v !== '错误') copyToClipboard(v);
    }
};

// 时间戳工具
const timestampTools = {
    now() {
        const now = new Date();
        document.getElementById('timestampInput').value = Math.floor(now.getTime() / 1000);
        this.toDate();
    },
    toDate() {
        const input = document.getElementById('timestampInput').value.trim();
        if (!input) { showToast('请输入时间戳'); return; }
        let ts = parseInt(input);
        if (isNaN(ts)) { showToast('请输入有效数字'); return; }
        if (ts.toString().length <= 10) ts *= 1000;
        const d = new Date(ts);
        if (isNaN(d.getTime())) { showToast('无效时间戳'); return; }
        document.getElementById('timestampToDateResult').innerHTML =
            `<div>本地: ${d.toLocaleString('zh-CN')}</div>` +
            `<div>UTC: ${d.toUTCString()}</div>` +
            `<div>ISO: ${d.toISOString()}</div>`;
    },
    toTimestamp() {
        const input = document.getElementById('dateInput').value;
        if (!input) { showToast('请选择日期'); return; }
        const d = new Date(input);
        if (isNaN(d.getTime())) { showToast('无效日期'); return; }
        document.getElementById('dateToTimestampResult').innerHTML =
            `<div>秒: ${Math.floor(d.getTime()/1000)}</div>` +
            `<div>毫秒: ${d.getTime()}</div>`;
    }
};

// 哈希计算
const hashTools = {
    async calculate() {
        const text = document.getElementById('hashInput').value;
        if (!text) { showToast('请输入文本'); return; }
        try {
            const [sha1, sha256] = await Promise.all([
                this.sha(text, 'SHA-1'),
                this.sha(text, 'SHA-256')
            ]);
            document.getElementById('hashMd5').value = this.md5(text);
            document.getElementById('hashSha1').value = sha1;
            document.getElementById('hashSha256').value = sha256;
        } catch (e) {
            showToast('计算失败: ' + e.message, 3000);
        }
    },
    async sha(text, algo) {
        const data = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest(algo, data);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    md5(s) {
        function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d)return(x^2147483648^F^H);if(I|d){if(x&1073741824)return(x^3221225472^F^H);else return(x^1073741824^F^H)}else return(x^F^H)}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}var C=[];var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=unescape(encodeURIComponent(s));C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}return(B(Y)+B(X)+B(W)+B(V)).toLowerCase()},
    copy(id) { const v = document.getElementById(id).value; if (v) copyToClipboard(v); },
    clear() { document.getElementById('hashInput').value = ''; ['hashMd5','hashSha1','hashSha256'].forEach(id => document.getElementById(id).value = ''); }
};

// 颜色转换
const colorTools = {
    convertFromHex() {
        const hex = document.getElementById('colorHex').value.trim();
        if (!hex) return;
        const rgb = this.hexToRgb(hex);
        if (!rgb) { showToast('无效HEX值'); return; }
        document.getElementById('colorRgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        document.getElementById('colorPreview').style.backgroundColor = hex;
        document.getElementById('colorPicker').value = hex.length === 4
            ? '#' + hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3] : hex;
    },
    convertFromRgb() {
        const m = document.getElementById('colorRgb').value.match(/(\d+)\D+(\d+)\D+(\d+)/);
        if (!m) { showToast('RGB格式错误'); return; }
        const [_, r, g, b] = m.map(Number);
        const hex = this.rgbToHex(r, g, b);
        document.getElementById('colorHex').value = hex;
        const hsl = this.rgbToHsl(r, g, b);
        document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        document.getElementById('colorPreview').style.backgroundColor = hex;
        document.getElementById('colorPicker').value = hex;
    },
    convertFromHsl() {
        const m = document.getElementById('colorHsl').value.match(/(\d+)\D+(\d+)\D+(\d+)/);
        if (!m) { showToast('HSL格式错误'); return; }
        const [_, h, s, l] = m.map(Number);
        const rgb = this.hslToRgb(h, s, l);
        document.getElementById('colorRgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        document.getElementById('colorHex').value = hex;
        document.getElementById('colorPreview').style.backgroundColor = hex;
        document.getElementById('colorPicker').value = hex;
    },
    hexToRgb(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        if (hex.length !== 6) return null;
        return { r: parseInt(hex.slice(0,2),16), g: parseInt(hex.slice(2,4),16), b: parseInt(hex.slice(4,6),16) };
    },
    rgbToHex(r,g,b) { return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join(''); },
    rgbToHsl(r,g,b) {
        r/=255; g/=255; b/=255;
        const max=Math.max(r,g,b), min=Math.min(r,g,b), l=(max+min)/2;
        let h=0, s=0;
        if (max!==min) {
            const d=max-min;
            s=l>0.5?d/(2-max-min):d/(max+min);
            if (max===r) h=((g-b)/d+(g<b?6:0))/6;
            else if (max===g) h=((b-r)/d+2)/6;
            else h=((r-g)/d+4)/6;
        }
        return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
    },
    hslToRgb(h,s,l) {
        h/=360; s/=100; l/=100;
        let r,g,b;
        if (s===0) { r=g=b=l; } else {
            const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
            const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
            r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
        }
        return {r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255)};
    }
};
