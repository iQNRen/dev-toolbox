// 图片工具

// 图片上传处理基类
const imgUtils = {
    _images: {},

    initUpload(toolId, callback) {
        const area = document.getElementById(toolId + 'Upload');
        const fileInput = document.getElementById(toolId + 'File');
        const preview = document.getElementById(toolId + 'Preview');

        if (!area || !fileInput) return;

        area.addEventListener('click', () => fileInput.click());

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = 'var(--accent-color)';
        });

        area.addEventListener('dragleave', () => {
            area.style.borderColor = '';
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = '';
            if (e.dataTransfer.files.length) {
                this.loadImage(toolId, e.dataTransfer.files[0], callback);
            }
        });

        fileInput.addEventListener('change', function() {
            if (this.files.length) {
                imgUtils.loadImage(toolId, this.files[0], callback);
            }
        });
    },

    loadImage(toolId, file, callback) {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this._images[toolId] = img;
                const preview = document.getElementById(toolId + 'Preview');
                const area = document.getElementById(toolId + 'Upload');

                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                if (area) area.classList.add('has-image');

                // 显示图片信息
                const info = document.getElementById(toolId + 'Info');
                if (info) {
                    info.innerHTML = `
                        <div class="img-info-grid">
                            <div class="img-info-item"><span class="img-info-label">宽度</span><span class="img-info-value">${img.width} px</span></div>
                            <div class="img-info-item"><span class="img-info-label">高度</span><span class="img-info-value">${img.height} px</span></div>
                            <div class="img-info-item"><span class="img-info-label">文件大小</span><span class="img-info-value">${(file.size / 1024).toFixed(1)} KB</span></div>
                            <div class="img-info-item"><span class="img-info-label">格式</span><span class="img-info-value">${file.type.split('/')[1].toUpperCase()}</span></div>
                        </div>
                    `;
                    info.classList.add('show');
                }

                // 自动填充尺寸
                const wInput = document.getElementById(toolId + 'W');
                const hInput = document.getElementById(toolId + 'H');
                if (wInput) wInput.value = img.width;
                if (hInput) hInput.value = img.height;

                if (callback) callback(img);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    getImage(toolId) {
        return this._images[toolId];
    },

    canvasToBlob(canvas, type = 'image/png', quality = 0.9) {
        return new Promise(resolve => {
            canvas.toBlob(resolve, type, quality);
        });
    },

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadCanvas(canvas, filename, type = 'image/png', quality = 0.9) {
        const url = canvas.toDataURL(type, quality);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// ===== 图片压缩 =====
const imgcompressTools = {
    init() {
        imgUtils.initUpload('imgcompress', (img) => {
            document.getElementById('imgresizeW').value = img.width;
        });

        const slider = document.getElementById('imgcompressQuality');
        if (slider) {
            slider.addEventListener('input', () => {
                document.getElementById('imgcompressQualityVal').textContent = slider.value + '%';
            });
        }
    },

    async compress() {
        const img = imgUtils.getImage('imgcompress');
        if (!img) { showToast('请先上传图片'); return; }

        const quality = parseInt(document.getElementById('imgcompressQuality').value) / 100;
        const maxWidth = parseInt(document.getElementById('imgcompressMaxWidth').value) || 1920;

        let w = img.width;
        let h = img.height;

        if (w > maxWidth) {
            h = Math.round(h * maxWidth / w);
            w = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const blob = await imgUtils.canvasToBlob(canvas, 'image/jpeg', quality);
        const info = document.getElementById('imgcompressInfo');
        const originalSize = img.width * img.height * 4; // 估算
        const compressedSize = blob.size;

        info.innerHTML = `
            <div class="img-info-grid">
                <div class="img-info-item"><span class="img-info-label">压缩后大小</span><span class="img-info-value">${(compressedSize / 1024).toFixed(1)} KB</span></div>
                <div class="img-info-item"><span class="img-info-label">输出尺寸</span><span class="img-info-value">${w} × ${h}</span></div>
                <div class="img-info-item"><span class="img-info-label">质量</span><span class="img-info-value">${Math.round(quality * 100)}%</span></div>
            </div>
        `;
        info.classList.add('show');

        // 显示压缩后的图片
        const preview = document.getElementById('imgcompressPreview');
        preview.src = URL.createObjectURL(blob);
        preview.style.display = 'block';

        this._blob = blob;
        showToast('压缩完成');
    },

    download() {
        if (!this._blob) { showToast('请先压缩图片'); return; }
        imgUtils.downloadBlob(this._blob, 'compressed.jpg');
    }
};

// ===== 调整大小 =====
const imgresizeTools = {
    _canvas: null,

    init() {
        imgUtils.initUpload('imgresize');

        const wInput = document.getElementById('imgresizeW');
        const hInput = document.getElementById('imgresizeH');
        const lock = document.getElementById('imgresizeLock');

        wInput.addEventListener('input', () => {
            if (lock.checked && imgUtils.getImage('imgresize')) {
                const img = imgUtils.getImage('imgresize');
                hInput.value = Math.round(parseInt(wInput.value) * img.height / img.width);
            }
        });

        hInput.addEventListener('input', () => {
            if (lock.checked && imgUtils.getImage('imgresize')) {
                const img = imgUtils.getImage('imgresize');
                wInput.value = Math.round(parseInt(hInput.value) * img.width / img.height);
            }
        });
    },

    resize() {
        const img = imgUtils.getImage('imgresize');
        if (!img) { showToast('请先上传图片'); return; }

        const w = parseInt(document.getElementById('imgresizeW').value) || img.width;
        const h = parseInt(document.getElementById('imgresizeH').value) || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const preview = document.getElementById('imgresizePreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
        showToast('调整完成');
    },

    download() {
        if (!this._canvas) { showToast('请先调整大小'); return; }
        imgUtils.downloadCanvas(this._canvas, 'resized.png');
    }
};

// ===== 图片裁剪 =====
const imgcropTools = {
    _canvas: null,

    init() {
        imgUtils.initUpload('imgcrop');
    },

    crop() {
        const img = imgUtils.getImage('imgcrop');
        if (!img) { showToast('请先上传图片'); return; }

        const x = parseInt(document.getElementById('imgcropX').value) || 0;
        const y = parseInt(document.getElementById('imgcropY').value) || 0;
        const w = parseInt(document.getElementById('imgcropW').value) || img.width;
        const h = parseInt(document.getElementById('imgcropH').value) || img.height;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

        const preview = document.getElementById('imgcropPreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
        showToast('裁剪完成');
    },

    download() {
        if (!this._canvas) { showToast('请先裁剪图片'); return; }
        imgUtils.downloadCanvas(this._canvas, 'cropped.png');
    }
};

// ===== 格式转换 =====
const imgformatTools = {
    _canvas: null,
    _type: 'image/png',

    init() {
        imgUtils.initUpload('imgformat');

        const slider = document.getElementById('imgformatQuality');
        if (slider) {
            slider.addEventListener('input', () => {
                document.getElementById('imgformatQualityVal').textContent = slider.value + '%';
            });
        }
    },

    convert() {
        const img = imgUtils.getImage('imgformat');
        if (!img) { showToast('请先上传图片'); return; }

        const type = document.getElementById('imgformatType').value;
        const quality = parseInt(document.getElementById('imgformatQuality').value) / 100;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // JPG不支持透明度，需要白色背景
        if (type === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const preview = document.getElementById('imgformatPreview');
        preview.src = canvas.toDataURL(type, quality);
        preview.style.display = 'block';

        this._canvas = canvas;
        this._type = type;
        showToast('转换完成');
    },

    download() {
        if (!this._canvas) { showToast('请先转换格式'); return; }
        const ext = this._type.split('/')[1].replace('jpeg', 'jpg');
        imgUtils.downloadCanvas(this._canvas, `converted.${ext}`, this._type, 0.9);
    }
};

// ===== 旋转翻转 =====
const imgrotateTools = {
    _canvas: null,

    init() {
        imgUtils.initUpload('imgrotate');
    },

    rotate(angle) {
        const img = imgUtils.getImage('imgrotate');
        if (!img) { showToast('请先上传图片'); return; }

        const radians = angle * Math.PI / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        let w, h;
        if (angle % 180 === 0) {
            w = img.width; h = img.height;
        } else if (angle % 90 === 0) {
            w = img.height; h = img.width;
        } else {
            w = Math.ceil(img.width * cos + img.height * sin);
            h = Math.ceil(img.width * sin + img.height * cos);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        ctx.translate(w / 2, h / 2);
        ctx.rotate(radians);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const preview = document.getElementById('imgrotatePreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
    },

    flip(direction) {
        const img = imgUtils.getImage('imgrotate');
        if (!img) { showToast('请先上传图片'); return; }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (direction === 'h') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
        }

        ctx.drawImage(img, 0, 0);

        const preview = document.getElementById('imgrotatePreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
    },

    download() {
        if (!this._canvas) { showToast('请先旋转/翻转图片'); return; }
        imgUtils.downloadCanvas(this._canvas, 'rotated.png');
    }
};

// ===== 滤镜效果 =====
const imgfilterTools = {
    _canvas: null,
    _original: null,

    init() {
        imgUtils.initUpload('imgfilter', (img) => {
            // 保存原始图像
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            imgfilterTools._original = canvas;
        });
    },

    apply(filter) {
        const img = imgUtils.getImage('imgfilter');
        if (!img) { showToast('请先上传图片'); return; }

        if (filter === 'reset') {
            const preview = document.getElementById('imgfilterPreview');
            preview.src = this._original ? this._original.toDataURL() : img.src;
            this._canvas = this._original;
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // 使用 CSS 滤镜
        const filters = {
            grayscale: 'grayscale(100%)',
            sepia: 'sepia(100%)',
            invert: 'invert(100%)',
            blur: 'blur(5px)',
            brightness: 'brightness(150%)',
            contrast: 'contrast(150%)',
            saturate: 'saturate(200%)'
        };

        ctx.filter = filters[filter] || 'none';
        ctx.drawImage(this._original || img, 0, 0);

        const preview = document.getElementById('imgfilterPreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
    },

    download() {
        if (!this._canvas) { showToast('请先应用滤镜'); return; }
        imgUtils.downloadCanvas(this._canvas, 'filtered.png');
    }
};

// ===== 添加水印 =====
const imgwatermarkTools = {
    _canvas: null,

    init() {
        imgUtils.initUpload('imgwatermark');
    },

    apply() {
        const img = imgUtils.getImage('imgwatermark');
        if (!img) { showToast('请先上传图片'); return; }

        const text = document.getElementById('imgwatermarkText').value || 'Watermark';
        const fontSize = parseInt(document.getElementById('imgwatermarkSize').value) || 24;
        const color = document.getElementById('imgwatermarkColor').value || '#ffffff';
        const opacity = parseInt(document.getElementById('imgwatermarkOpacity').value) / 100;
        const position = document.getElementById('imgwatermarkPos').value;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);

        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;

        const metrics = ctx.measureText(text);
        const textW = metrics.width;
        const textH = fontSize;
        const padding = 20;

        if (position === 'tile') {
            // 平铺水印
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 6);

            const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
            const cols = Math.ceil(diagonal / (textW + 100));
            const rows = Math.ceil(diagonal / (textH + 60));

            for (let r = -rows; r < rows; r++) {
                for (let c = -cols; c < cols; c++) {
                    ctx.fillText(text, c * (textW + 100), r * (textH + 60));
                }
            }
            ctx.restore();
        } else {
            let x, y;
            switch (position) {
                case 'top-left':
                    x = padding; y = textH + padding;
                    break;
                case 'top-right':
                    x = canvas.width - textW - padding; y = textH + padding;
                    break;
                case 'bottom-left':
                    x = padding; y = canvas.height - padding;
                    break;
                case 'center':
                    x = (canvas.width - textW) / 2; y = (canvas.height + textH) / 2;
                    break;
                case 'bottom-right':
                default:
                    x = canvas.width - textW - padding; y = canvas.height - padding;
                    break;
            }
            ctx.fillText(text, x, y);
        }

        ctx.globalAlpha = 1;

        const preview = document.getElementById('imgwatermarkPreview');
        preview.src = canvas.toDataURL();
        preview.style.display = 'block';

        this._canvas = canvas;
        showToast('水印已添加');
    },

    download() {
        if (!this._canvas) { showToast('请先添加水印'); return; }
        imgUtils.downloadCanvas(this._canvas, 'watermarked.png');
    }
};

// 初始化所有图片工具
document.addEventListener('DOMContentLoaded', () => {
    imgcompressTools.init();
    imgresizeTools.init();
    imgcropTools.init();
    imgformatTools.init();
    imgrotateTools.init();
    imgfilterTools.init();
    imgwatermarkTools.init();
});
