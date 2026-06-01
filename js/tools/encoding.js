// 编码工具

// Base64工具
const base64Tools = {
    encode() {
        const input = document.getElementById('base64Input').value;
        if (!input.trim()) {
            showToast('请输入要编码的文本');
            return;
        }

        try {
            const encoded = base64Encode(input);
            document.getElementById('base64Output').value = encoded;
        } catch (e) {
            showToast('编码错误: ' + e.message, 3000);
        }
    },

    decode() {
        const input = document.getElementById('base64Output').value;
        if (!input.trim()) {
            showToast('请输入要解码的Base64文本');
            return;
        }

        try {
            const decoded = base64Decode(input);
            document.getElementById('base64Input').value = decoded;
        } catch (e) {
            showToast('解码错误: 无效的Base64格式', 3000);
        }
    },

    copy() {
        const output = document.getElementById('base64Output').value;
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('base64Input').value = '';
        document.getElementById('base64Output').value = '';
    }
};

// URL编码工具
const urlencodeTools = {
    encode() {
        const input = document.getElementById('urlencodeInput').value;
        if (!input.trim()) {
            showToast('请输入要编码的文本');
            return;
        }

        const encoded = encodeURI(input);
        document.getElementById('urlencodeOutput').value = encoded;
    },

    decode() {
        const input = document.getElementById('urlencodeOutput').value;
        if (!input.trim()) {
            showToast('请输入要解码的URL');
            return;
        }

        try {
            const decoded = decodeURI(input);
            document.getElementById('urlencodeInput').value = decoded;
        } catch (e) {
            showToast('解码错误: 无效的URL编码', 3000);
        }
    },

    encodeComponent() {
        const input = document.getElementById('urlencodeInput').value;
        if (!input.trim()) {
            showToast('请输入要编码的文本');
            return;
        }

        const encoded = encodeURIComponent(input);
        document.getElementById('urlencodeOutput').value = encoded;
    },

    decodeComponent() {
        const input = document.getElementById('urlencodeOutput').value;
        if (!input.trim()) {
            showToast('请输入要解码的文本');
            return;
        }

        try {
            const decoded = decodeURIComponent(input);
            document.getElementById('urlencodeInput').value = decoded;
        } catch (e) {
            showToast('解码错误: 无效的URL编码', 3000);
        }
    },

    copy() {
        const output = document.getElementById('urlencodeOutput').value;
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('urlencodeInput').value = '';
        document.getElementById('urlencodeOutput').value = '';
    }
};

// Unicode工具
const unicodeTools = {
    encode() {
        const input = document.getElementById('unicodeInput').value;
        if (!input.trim()) {
            showToast('请输入要编码的文本');
            return;
        }

        let encoded = '';
        for (let i = 0; i < input.length; i++) {
            const code = input.charCodeAt(i);
            if (code > 127) {
                encoded += '\\u' + code.toString(16).padStart(4, '0');
            } else {
                encoded += input[i];
            }
        }

        document.getElementById('unicodeOutput').value = encoded;
    },

    decode() {
        const input = document.getElementById('unicodeOutput').value;
        if (!input.trim()) {
            showToast('请输入要解码的Unicode文本');
            return;
        }

        try {
            const decoded = input.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => {
                return String.fromCharCode(parseInt(grp, 16));
            });
            document.getElementById('unicodeInput').value = decoded;
        } catch (e) {
            showToast('解码错误: 无效的Unicode格式', 3000);
        }
    },

    copy() {
        const output = document.getElementById('unicodeOutput').value;
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('unicodeInput').value = '';
        document.getElementById('unicodeOutput').value = '';
    }
};

// HTML实体工具
const htmlentityTools = {
    encode() {
        const input = document.getElementById('htmlentityInput').value;
        if (!input.trim()) {
            showToast('请输入要编码的文本');
            return;
        }

        const encoded = htmlEncode(input);
        document.getElementById('htmlentityOutput').value = encoded;
    },

    decode() {
        const input = document.getElementById('htmlentityOutput').value;
        if (!input.trim()) {
            showToast('请输入要解码的HTML实体');
            return;
        }

        const decoded = htmlDecode(input);
        document.getElementById('htmlentityInput').value = decoded;
    },

    copy() {
        const output = document.getElementById('htmlentityOutput').value;
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('htmlentityInput').value = '';
        document.getElementById('htmlentityOutput').value = '';
    }
};

// Hex编解码工具
const hexTools = {
    encode() {
        const input = document.getElementById('hexInput').value;
        if (!input.trim()) { showToast('请输入文本'); return; }
        const encoded = Array.from(new TextEncoder().encode(input))
            .map(b => b.toString(16).padStart(2, '0'))
            .join(' ');
        document.getElementById('hexOutput').value = encoded;
    },

    decode() {
        const input = document.getElementById('hexOutput').value;
        if (!input.trim()) { showToast('请输入Hex数据'); return; }
        try {
            const bytes = input.replace(/\s+/g, '').match(/.{1,2}/g)
                .map(h => parseInt(h, 16));
            const decoded = new TextDecoder().decode(new Uint8Array(bytes));
            document.getElementById('hexInput').value = decoded;
        } catch (e) {
            showToast('解码错误: 无效的Hex格式', 3000);
        }
    },

    copy() {
        const output = document.getElementById('hexOutput').value;
        if (output) copyToClipboard(output);
    },

    clear() {
        document.getElementById('hexInput').value = '';
        document.getElementById('hexOutput').value = '';
    }
};
