// 其他工具

// 二维码生成（基于 qrious 库，可被扫描识别）
const qrcodeTools = {
    generate() {
        const text = document.getElementById('qrcodeInput').value.trim();
        if (!text) { showToast('请输入文本或URL'); return; }

        const canvas = document.getElementById('qrcodeCanvas');
        if (typeof QRious === 'undefined') { showToast('二维码库未加载'); return; }

        new QRious({
            element: canvas,
            value: text,
            size: 256,
            level: 'M',
            background: '#ffffff',
            foreground: '#000000'
        });
    },

    download() {
        const canvas = document.getElementById('qrcodeCanvas');
        if (canvas.width <= 1) { showToast('请先生成二维码'); return; }
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
    }
};

// Markdown预览
const markdownTools = {
    render() {
        const input = document.getElementById('markdownInput').value;
        const output = document.getElementById('markdownOutput');

        // 简易Markdown渲染
        let html = input
            // 代码块
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // 行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 标题
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // 粗体、斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 链接、图片
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width:100%">')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 引用
            .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
            // 列表
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
            // 水平线
            .replace(/^---$/gm, '<hr>')
            // 段落
            .replace(/\n\n/g, '</p><p>')
            // 换行
            .replace(/\n/g, '<br>');

        // 包装列表项
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        output.innerHTML = `<p>${html}</p>`;
    }
};

// Lorem Ipsum生成
const loremTools = {
    paragraphs: [
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
        "Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna.",
        "Praesent placerat risus quis eros. Fusce pellentesque suscipit nibh. Integer sed libero. Ut lectus ipsum, vestibulum a, hendrerit eget, commodo vitae, enim.",
        "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed aliquam, nisi quis porttitor congue, elit erat euismod orci.",
        "Proin magna. Duis vel dolor in enim sagittis ultricies aliquet. Nullam feugiat, turpis at pulvinar vulputate, erat libero tristique tellus.",
        "Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pedunculum."
    ],

    generate() {
        const count = Math.min(parseInt(document.getElementById('loremCount').value) || 3, 50);
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.paragraphs[i % this.paragraphs.length]);
        }
        document.getElementById('loremOutput').value = result.join('\n\n');
    },

    copy() {
        const v = document.getElementById('loremOutput').value;
        if (v) copyToClipboard(v); else showToast('请先生成文本');
    }
};

// 图片转Base64
const img2base64Tools = {
    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('img2base64Output').value = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    copy() {
        const v = document.getElementById('img2base64Output').value;
        if (v) copyToClipboard(v); else showToast('请先上传图片');
    },

    clear() {
        document.getElementById('img2base64Output').value = '';
    }
};
