// 实用工具

// 时间戳工具
const timestampTools = {
    now() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        const milliseconds = now.getTime();

        document.getElementById('timestampInput').value = timestamp;
        this.toDate();
    },

    toDate() {
        const input = document.getElementById('timestampInput').value.trim();
        if (!input) {
            showToast('请输入时间戳');
            return;
        }

        let timestamp = parseInt(input);
        if (isNaN(timestamp)) {
            showToast('请输入有效的数字时间戳');
            return;
        }

        // 判断是秒还是毫秒
        if (timestamp.toString().length <= 10) {
            timestamp *= 1000;
        }

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            showToast('无效的时间戳');
            return;
        }

        const result = document.getElementById('timestampToDateResult');
        result.innerHTML = `
            <div><strong>本地时间:</strong> ${date.toLocaleString('zh-CN')}</div>
            <div><strong>UTC时间:</strong> ${date.toUTCString()}</div>
            <div><strong>ISO格式:</strong> ${date.toISOString()}</div>
            <div><strong>相对时间:</strong> ${this.getRelativeTime(date)}</div>
        `;
    },

    toTimestamp() {
        const input = document.getElementById('dateInput').value;
        if (!input) {
            showToast('请选择日期时间');
            return;
        }

        const date = new Date(input);
        if (isNaN(date.getTime())) {
            showToast('无效的日期时间');
            return;
        }

        const timestamp = Math.floor(date.getTime() / 1000);
        const milliseconds = date.getTime();

        const result = document.getElementById('dateToTimestampResult');
        result.innerHTML = `
            <div><strong>秒级时间戳:</strong> ${timestamp}</div>
            <div><strong>毫秒级时间戳:</strong> ${milliseconds}</div>
            <div><strong>本地时间:</strong> ${date.toLocaleString('zh-CN')}</div>
        `;
    },

    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const absDiff = Math.abs(diff);

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (diff > 0) {
            if (seconds < 60) return `${seconds}秒前`;
            if (minutes < 60) return `${minutes}分钟前`;
            if (hours < 24) return `${hours}小时前`;
            if (days < 30) return `${days}天前`;
            return `${Math.floor(days / 30)}个月前`;
        } else {
            if (seconds < 60) return `${seconds}秒后`;
            if (minutes < 60) return `${minutes}分钟后`;
            if (hours < 24) return `${hours}小时后`;
            if (days < 30) return `${days}天后`;
            return `${Math.floor(days / 30)}个月后`;
        }
    }
};

// 正则表达式测试工具
document.addEventListener('DOMContentLoaded', function() {
    const regexPattern = document.getElementById('regexPattern');
    const regexFlags = document.getElementById('regexFlags');
    const regexTestInput = document.getElementById('regexTestInput');

    if (regexPattern && regexTestInput) {
        const updateRegex = debounce(function() {
            const pattern = regexPattern.value;
            const flags = regexFlags.value;
            const text = regexTestInput.value;

            if (!pattern || !text) {
                document.getElementById('regexResult').innerHTML = '';
                document.getElementById('regexMatches').innerHTML = '';
                return;
            }

            try {
                const regex = new RegExp(pattern, flags);
                const matches = [];
                let match;

                // 高亮匹配结果
                let highlighted = text;
                if (flags.includes('g')) {
                    while ((match = regex.exec(text)) !== null) {
                        matches.push({
                            value: match[0],
                            index: match.index,
                            groups: match.slice(1)
                        });
                        if (match.index === regex.lastIndex) {
                            regex.lastIndex++;
                        }
                    }
                } else {
                    match = regex.exec(text);
                    if (match) {
                        matches.push({
                            value: match[0],
                            index: match.index,
                            groups: match.slice(1)
                        });
                    }
                }

                // 显示高亮结果
                let resultHtml = '<div style="margin-bottom: 10px;"><strong>匹配预览:</strong></div>';
                if (matches.length > 0) {
                    let lastIndex = 0;
                    let preview = '';

                    matches.sort((a, b) => a.index - b.index).forEach(m => {
                        preview += escapeHtml(text.substring(lastIndex, m.index));
                        preview += `<span style="background: rgba(52, 152, 219, 0.3); padding: 2px 4px; border-radius: 2px; border: 1px solid var(--accent-color);">${escapeHtml(m.value)}</span>`;
                        lastIndex = m.index + m.value.length;
                    });
                    preview += escapeHtml(text.substring(lastIndex));

                    resultHtml += `<div style="word-break: break-all;">${preview}</div>`;
                } else {
                    resultHtml += '<div style="color: var(--text-secondary);">无匹配结果</div>';
                }

                document.getElementById('regexResult').innerHTML = resultHtml;

                // 显示匹配详情
                let matchesHtml = `<div style="margin-bottom: 10px;"><strong>匹配详情 (共 ${matches.length} 个):</strong></div>`;
                matches.forEach((m, i) => {
                    matchesHtml += `<div style="margin-bottom: 8px; padding: 8px; background: var(--bg-secondary); border-radius: 4px;">`;
                    matchesHtml += `<div><strong>匹配 ${i + 1}:</strong> "${escapeHtml(m.value)}"</div>`;
                    matchesHtml += `<div>位置: ${m.index}</div>`;
                    if (m.groups.length > 0) {
                        matchesHtml += `<div>捕获组: ${m.groups.map(g => `"${escapeHtml(g || '')}"`).join(', ')}</div>`;
                    }
                    matchesHtml += '</div>';
                });

                document.getElementById('regexMatches').innerHTML = matchesHtml;

            } catch (e) {
                document.getElementById('regexResult').innerHTML = `<div style="color: var(--error-color);">正则表达式错误: ${e.message}</div>`;
                document.getElementById('regexMatches').innerHTML = '';
            }
        }, 300);

        regexPattern.addEventListener('input', updateRegex);
        regexFlags.addEventListener('input', updateRegex);
        regexTestInput.addEventListener('input', updateRegex);
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// 颜色转换工具
const colorTools = {
    convertFromHex() {
        const hex = document.getElementById('colorHex').value.trim();
        if (!hex) {
            showToast('请输入HEX颜色值');
            return;
        }

        const result = this.hexToRgb(hex);
        if (result) {
            document.getElementById('colorRgb').value = `rgb(${result.r}, ${result.g}, ${result.b})`;
            const hsl = this.rgbToHsl(result.r, result.g, result.b);
            document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
            document.getElementById('colorPreview').style.backgroundColor = hex;
            document.getElementById('colorPicker').value = hex;
        } else {
            showToast('无效的HEX颜色值');
        }
    },

    convertFromRgb() {
        const rgb = document.getElementById('colorRgb').value.trim();
        if (!rgb) {
            showToast('请输入RGB颜色值');
            return;
        }

        const match = rgb.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (!match) {
            showToast('RGB格式不正确，请使用 rgb(r, g, b) 格式');
            return;
        }

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);

        const hex = this.rgbToHex(r, g, b);
        document.getElementById('colorHex').value = hex;

        const hsl = this.rgbToHsl(r, g, b);
        document.getElementById('colorHsl').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        document.getElementById('colorPreview').style.backgroundColor = hex;
        document.getElementById('colorPicker').value = hex;
    },

    convertFromHsl() {
        const hsl = document.getElementById('colorHsl').value.trim();
        if (!hsl) {
            showToast('请输入HSL颜色值');
            return;
        }

        const match = hsl.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
        if (!match) {
            showToast('HSL格式不正确，请使用 hsl(h, s%, l%) 格式');
            return;
        }

        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);

        const rgb = this.hslToRgb(h, s, l);
        document.getElementById('colorRgb').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        document.getElementById('colorHex').value = hex;

        document.getElementById('colorPreview').style.backgroundColor = hex;
        document.getElementById('colorPicker').value = hex;
    },

    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) return null;

        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    },

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s;
        const l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    },

    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
};

// 颜色选择器事件
document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('input', function() {
            document.getElementById('colorHex').value = this.value;
            colorTools.convertFromHex();
        });
    }

    // 初始化颜色预览
    colorTools.convertFromHex();
});

// 哈希计算工具
const hashTools = {
    async calculate() {
        const input = document.getElementById('hashInput').value;
        if (!input.trim()) {
            showToast('请输入要计算哈希的文本');
            return;
        }

        try {
            const [md5, sha1, sha256] = await Promise.all([
                this.md5(input),
                calculateHash(input, 'SHA-1'),
                calculateHash(input, 'SHA-256')
            ]);

            document.getElementById('hashMd5').value = md5;
            document.getElementById('hashSha1').value = sha1;
            document.getElementById('hashSha256').value = sha256;
        } catch (e) {
            showToast('哈希计算错误: ' + e.message, 3000);
        }
    },

    // 简单的MD5实现
    async md5(string) {
        function md5cycle(x, k) {
            let a = x[0], b = x[1], c = x[2], d = x[3];

            a = ff(a, b, c, d, k[0], 7, -680876936);
            d = ff(d, a, b, c, k[1], 12, -389564586);
            c = ff(c, d, a, b, k[2], 17, 606105819);
            b = ff(b, c, d, a, k[3], 22, -1044525330);
            a = ff(a, b, c, d, k[4], 7, -176418897);
            d = ff(d, a, b, c, k[5], 12, 1200080426);
            c = ff(c, d, a, b, k[6], 17, -1473231341);
            b = ff(b, c, d, a, k[7], 22, -45705983);
            a = ff(a, b, c, d, k[8], 7, 1770035416);
            d = ff(d, a, b, c, k[9], 12, -1958414417);
            c = ff(c, d, a, b, k[10], 17, -42063);
            b = ff(b, c, d, a, k[11], 22, -1990404162);
            a = ff(a, b, c, d, k[12], 7, 1804603682);
            d = ff(d, a, b, c, k[13], 12, -40341101);
            c = ff(c, d, a, b, k[14], 17, -1502002290);
            b = ff(b, c, d, a, k[15], 22, 1236535329);

            a = gg(a, b, c, d, k[1], 5, -165796510);
            d = gg(d, a, b, c, k[6], 9, -1069501632);
            c = gg(c, d, a, b, k[11], 14, 643717713);
            b = gg(b, c, d, a, k[0], 20, -373897302);
            a = gg(a, b, c, d, k[5], 5, -701558691);
            d = gg(d, a, b, c, k[10], 9, 38016083);
            c = gg(c, d, a, b, k[15], 14, -660478335);
            b = gg(b, c, d, a, k[4], 20, -405537848);
            a = gg(a, b, c, d, k[9], 5, 568446438);
            d = gg(d, a, b, c, k[14], 9, -1019803690);
            c = gg(c, d, a, b, k[3], 14, -187363961);
            b = gg(b, c, d, a, k[8], 20, 1163531501);
            a = gg(a, b, c, d, k[13], 5, -1444681467);
            d = gg(d, a, b, c, k[2], 9, -51403784);
            c = gg(c, d, a, b, k[7], 14, 1735328473);
            b = gg(b, c, d, a, k[12], 20, -1926607734);

            a = hh(a, b, c, d, k[5], 4, -378558);
            d = hh(d, a, b, c, k[8], 11, -2022574463);
            c = hh(c, d, a, b, k[11], 16, 1839030562);
            b = hh(b, c, d, a, k[14], 23, -35309556);
            a = hh(a, b, c, d, k[1], 4, -1530992060);
            d = hh(d, a, b, c, k[4], 11, 1272893353);
            c = hh(c, d, a, b, k[7], 16, -155497632);
            b = hh(b, c, d, a, k[10], 23, -1094730640);
            a = hh(a, b, c, d, k[13], 4, 681279174);
            d = hh(d, a, b, c, k[0], 11, -358537222);
            c = hh(c, d, a, b, k[3], 16, -722521979);
            b = hh(b, c, d, a, k[6], 23, 76029189);
            a = hh(a, b, c, d, k[9], 4, -640364487);
            d = hh(d, a, b, c, k[12], 11, -421815835);
            c = hh(c, d, a, b, k[15], 16, 530742520);
            b = hh(b, c, d, a, k[2], 23, -995338651);

            a = ii(a, b, c, d, k[0], 6, -198630844);
            d = ii(d, a, b, c, k[7], 10, 1126891415);
            c = ii(c, d, a, b, k[14], 15, -1416354905);
            b = ii(b, c, d, a, k[5], 21, -57434055);
            a = ii(a, b, c, d, k[12], 6, 1700485571);
            d = ii(d, a, b, c, k[3], 10, -1894986606);
            c = ii(c, d, a, b, k[10], 15, -1051523);
            b = ii(b, c, d, a, k[1], 21, -2054922799);
            a = ii(a, b, c, d, k[8], 6, 1873313359);
            d = ii(d, a, b, c, k[15], 10, -30611744);
            c = ii(c, d, a, b, k[6], 15, -1560198380);
            b = ii(b, c, d, a, k[13], 21, 1309151649);
            a = ii(a, b, c, d, k[4], 6, -145523070);
            d = ii(d, a, b, c, k[11], 10, -1120210379);
            c = ii(c, d, a, b, k[2], 15, 718787259);
            b = ii(b, c, d, a, k[9], 21, -343485551);

            x[0] = add32(a, x[0]);
            x[1] = add32(b, x[1]);
            x[2] = add32(c, x[2]);
            x[3] = add32(d, x[3]);
        }

        function cmn(q, a, b, x, s, t) {
            a = add32(add32(a, q), add32(x, t));
            return add32((a << s) | (a >>> (32 - s)), b);
        }

        function ff(a, b, c, d, x, s, t) {
            return cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }

        function gg(a, b, c, d, x, s, t) {
            return cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }

        function hh(a, b, c, d, x, s, t) {
            return cmn(b ^ c ^ d, a, b, x, s, t);
        }

        function ii(a, b, c, d, x, s, t) {
            return cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        function md51(s) {
            const n = s.length;
            let state = [1732584193, -271733879, -1732584194, 271733878];
            let i;

            for (i = 64; i <= n; i += 64) {
                md5cycle(state, md5blk(s.substring(i - 64, i)));
            }

            s = s.substring(i - 64);
            const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for (i = 0; i < s.length; i++) {
                tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
            }

            tail[i >> 2] |= 0x80 << ((i % 4) << 3);

            if (i > 55) {
                md5cycle(state, tail);
                for (i = 0; i < 16; i++) tail[i] = 0;
            }

            tail[14] = n * 8;
            md5cycle(state, tail);
            return state;
        }

        function md5blk(s) {
            const md5blks = [];
            for (let i = 0; i < 64; i += 4) {
                md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
            }
            return md5blks;
        }

        const hex_chr = '0123456789abcdef'.split('');

        function rhex(n) {
            let s = '';
            for (let j = 0; j < 4; j++) {
                s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
            }
            return s;
        }

        function hex(x) {
            return x.map(rhex).join('');
        }

        function add32(a, b) {
            return (a + b) & 0xFFFFFFFF;
        }

        return hex(md51(string));
    },

    copy(elementId) {
        const value = document.getElementById(elementId).value;
        if (value) {
            copyToClipboard(value);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('hashInput').value = '';
        document.getElementById('hashMd5').value = '';
        document.getElementById('hashSha1').value = '';
        document.getElementById('hashSha256').value = '';
    }
};
