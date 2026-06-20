// MIME 类型速查

const MIME_CATS = [
    { key: 'text',   label: '📝 文本' },
    { key: 'image',  label: '🖼️ 图片' },
    { key: 'audio',  label: '🎵 音频' },
    { key: 'video',  label: '🎬 视频' },
    { key: 'app',    label: '⚙️ 应用' },
    { key: 'archive',label: '📦 压缩' },
    { key: 'font',   label: '🔤 字体' }
];

const MIME_DATA = [
    // 文本
    { ext: '.txt',  mime: 'text/plain', cat: 'text', desc: '纯文本' },
    { ext: '.html', mime: 'text/html', cat: 'text', desc: 'HTML 文档' },
    { ext: '.css',  mime: 'text/css', cat: 'text', desc: 'CSS 样式表' },
    { ext: '.js',   mime: 'text/javascript', cat: 'text', desc: 'JavaScript 脚本' },
    { ext: '.json', mime: 'application/json', cat: 'app', desc: 'JSON 数据' },
    { ext: '.xml',  mime: 'application/xml', cat: 'app', desc: 'XML 文档' },
    { ext: '.csv',  mime: 'text/csv', cat: 'text', desc: 'CSV 表格' },
    { ext: '.md',   mime: 'text/markdown', cat: 'text', desc: 'Markdown 文档' },
    { ext: '.yaml', mime: 'application/yaml', cat: 'app', desc: 'YAML 配置' },
    { ext: '.svg',  mime: 'image/svg+xml', cat: 'image', desc: 'SVG 矢量图' },
    // 图片
    { ext: '.png',  mime: 'image/png', cat: 'image', desc: 'PNG 图片' },
    { ext: '.jpg',  mime: 'image/jpeg', cat: 'image', desc: 'JPEG 图片' },
    { ext: '.jpeg', mime: 'image/jpeg', cat: 'image', desc: 'JPEG 图片' },
    { ext: '.gif',  mime: 'image/gif', cat: 'image', desc: 'GIF 动图' },
    { ext: '.webp', mime: 'image/webp', cat: 'image', desc: 'WebP 图片' },
    { ext: '.ico',  mime: 'image/x-icon', cat: 'image', desc: '图标文件' },
    { ext: '.bmp',  mime: 'image/bmp', cat: 'image', desc: '位图' },
    { ext: '.avif', mime: 'image/avif', cat: 'image', desc: 'AVIF 图片' },
    // 音频
    { ext: '.mp3',  mime: 'audio/mpeg', cat: 'audio', desc: 'MP3 音频' },
    { ext: '.wav',  mime: 'audio/wav', cat: 'audio', desc: 'WAV 音频' },
    { ext: '.ogg',  mime: 'audio/ogg', cat: 'audio', desc: 'OGG 音频' },
    { ext: '.flac', mime: 'audio/flac', cat: 'audio', desc: 'FLAC 无损音频' },
    { ext: '.m4a',  mime: 'audio/mp4', cat: 'audio', desc: 'M4A 音频' },
    // 视频
    { ext: '.mp4',  mime: 'video/mp4', cat: 'video', desc: 'MP4 视频' },
    { ext: '.webm', mime: 'video/webm', cat: 'video', desc: 'WebM 视频' },
    { ext: '.avi',  mime: 'video/x-msvideo', cat: 'video', desc: 'AVI 视频' },
    { ext: '.mov',  mime: 'video/quicktime', cat: 'video', desc: 'QuickTime 视频' },
    { ext: '.mkv',  mime: 'video/x-matroska', cat: 'video', desc: 'MKV 视频' },
    // 应用/文档
    { ext: '.pdf',  mime: 'application/pdf', cat: 'app', desc: 'PDF 文档' },
    { ext: '.doc',  mime: 'application/msword', cat: 'app', desc: 'Word 文档' },
    { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', cat: 'app', desc: 'Word 文档' },
    { ext: '.xls',  mime: 'application/vnd.ms-excel', cat: 'app', desc: 'Excel 表格' },
    { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', cat: 'app', desc: 'Excel 表格' },
    { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', cat: 'app', desc: 'PPT 演示' },
    { ext: '.wasm', mime: 'application/wasm', cat: 'app', desc: 'WebAssembly' },
    { ext: '.bin',  mime: 'application/octet-stream', cat: 'app', desc: '二进制流（默认未知类型）' },
    // 压缩
    { ext: '.zip',  mime: 'application/zip', cat: 'archive', desc: 'ZIP 压缩包' },
    { ext: '.gz',   mime: 'application/gzip', cat: 'archive', desc: 'Gzip 压缩' },
    { ext: '.tar',  mime: 'application/x-tar', cat: 'archive', desc: 'Tar 归档' },
    { ext: '.rar',  mime: 'application/vnd.rar', cat: 'archive', desc: 'RAR 压缩包' },
    { ext: '.7z',   mime: 'application/x-7z-compressed', cat: 'archive', desc: '7z 压缩包' },
    // 字体
    { ext: '.woff', mime: 'font/woff', cat: 'font', desc: 'WOFF 字体' },
    { ext: '.woff2',mime: 'font/woff2', cat: 'font', desc: 'WOFF2 字体' },
    { ext: '.ttf',  mime: 'font/ttf', cat: 'font', desc: 'TrueType 字体' },
    { ext: '.otf',  mime: 'font/otf', cat: 'font', desc: 'OpenType 字体' }
];

const mimequeryTools = {
    _cat: 'all',

    init() {
        this.renderCats();
        this.filter();
    },

    renderCats() {
        const wrap = document.getElementById('mimequeryCats');
        const cats = [{ key: 'all', label: '🌟 全部' }, ...MIME_CATS];
        wrap.innerHTML = cats.map(c =>
            `<button class="linuxcmd-cat ${c.key === 'all' ? 'active' : ''}" data-cat="${c.key}" onclick="mimequeryTools.selectCat('${c.key}')">${c.label}</button>`
        ).join('');
    },

    selectCat(key) {
        this._cat = key;
        document.querySelectorAll('#mimequeryCats .linuxcmd-cat').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === key);
        });
        this.filter();
    },

    filter() {
        const q = document.getElementById('mimequerySearch').value.trim().toLowerCase();
        const list = MIME_DATA.filter(m => {
            const catOk = this._cat === 'all' || m.cat === this._cat;
            if (!catOk) return false;
            if (!q) return true;
            return (m.ext + ' ' + m.mime + ' ' + m.desc).toLowerCase().includes(q);
        });
        document.getElementById('mimequeryCount').textContent = `${list.length} / ${MIME_DATA.length} 条`;
        document.getElementById('mimequeryList').innerHTML = list.length
            ? list.map(m => `
                <div class="linuxcmd-card">
                    <div class="linuxcmd-top">
                        <code class="linuxcmd-name">${this.esc(m.ext)}</code>
                        <span class="linuxcmd-tag">${this.catLabel(m.cat)}</span>
                    </div>
                    <code class="mime-mime" title="点击复制">${this.esc(m.mime)}</code>
                    <div class="linuxcmd-desc">${this.esc(m.desc)}</div>
                </div>`).join('')
            : '<div class="linuxcmd-empty">未找到匹配的 MIME 类型</div>';
    },

    catLabel(k) {
        return (MIME_CATS.find(c => c.key === k) || {}).label || '';
    },

    esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mimequeryTools.init();
    // 点击 MIME 复制
    document.getElementById('mimequeryList').addEventListener('click', (e) => {
        const code = e.target.closest('.mime-mime');
        if (!code) return;
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => showToast('已复制：' + text)).catch(() => {});
    });
});
