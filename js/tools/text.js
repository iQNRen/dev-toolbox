// 文本处理工具

// 文本对比
const textdiffTools = {
    compare() {
        const t1 = document.getElementById('textdiffInput1').value;
        const t2 = document.getElementById('textdiffInput2').value;
        if (!t1 && !t2) { showToast('请输入文本'); return; }

        const lines1 = t1.split('\n');
        const lines2 = t2.split('\n');
        const max = Math.max(lines1.length, lines2.length);
        let html = '';

        for (let i = 0; i < max; i++) {
            const a = lines1[i] !== undefined ? lines1[i] : null;
            const b = lines2[i] !== undefined ? lines2[i] : null;
            if (a === null) {
                html += `<div class="diff-added">+ ${esc(b)}</div>`;
            } else if (b === null) {
                html += `<div class="diff-removed">- ${esc(a)}</div>`;
            } else if (a !== b) {
                html += `<div class="diff-removed">- ${esc(a)}</div>`;
                html += `<div class="diff-added">+ ${esc(b)}</div>`;
            } else {
                html += `<div>  ${esc(a)}</div>`;
            }
        }
        document.getElementById('textdiffOutput').innerHTML = html || '<div style="color:var(--success-color)">✅ 完全相同</div>';
    },
    clear() {
        document.getElementById('textdiffInput1').value = '';
        document.getElementById('textdiffInput2').value = '';
        document.getElementById('textdiffOutput').innerHTML = '';
    }
};

// 字数统计
const textcountTools = {
    count() {
        const text = document.getElementById('textcountInput').value;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split('\n').length : 0;
        const chinese = (text.match(/[一-龥]/g) || []).length;
        const bytes = new Blob([text]).size;

        const grid = document.getElementById('textcountResult');
        grid.innerHTML = `
            <div class="stat-item"><span class="stat-value">${chars}</span><span class="stat-label">字符数</span></div>
            <div class="stat-item"><span class="stat-value">${charsNoSpace}</span><span class="stat-label">不含空格</span></div>
            <div class="stat-item"><span class="stat-value">${words}</span><span class="stat-label">单词数</span></div>
            <div class="stat-item"><span class="stat-value">${lines}</span><span class="stat-label">行数</span></div>
            <div class="stat-item"><span class="stat-value">${chinese}</span><span class="stat-label">中文字数</span></div>
            <div class="stat-item"><span class="stat-value">${bytes}</span><span class="stat-label">字节数</span></div>
        `;
    }
};

// 文本替换
const textreplaceTools = {
    replace() {
        const text = document.getElementById('textreplaceInput').value;
        const find = document.getElementById('replaceFind').value;
        const replace = document.getElementById('replaceWith').value;
        const useRegex = document.getElementById('replaceRegex').checked;
        const caseSensitive = document.getElementById('replaceCase').checked;

        if (!text || !find) { showToast('请输入文本和查找内容'); return; }

        let result;
        if (useRegex) {
            try {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(find, flags);
                result = text.replace(regex, replace);
            } catch (e) {
                showToast('正则表达式错误: ' + e.message, 3000);
                return;
            }
        } else {
            const flags = caseSensitive ? 'g' : 'gi';
            const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, flags);
            result = text.replace(regex, replace);
        }

        document.getElementById('textreplaceOutput').value = result;
    }
};

// 行排序
const linesortTools = {
    _sort(fn) {
        const text = document.getElementById('linesortInput').value;
        if (!text) { showToast('请输入文本'); return; }
        const lines = text.split('\n');
        fn(lines);
        document.getElementById('linesortOutput').value = lines.join('\n');
    },
    asc() { this._sort(lines => lines.sort((a, b) => a.localeCompare(b, 'zh'))); },
    desc() { this._sort(lines => lines.sort((a, b) => b.localeCompare(a, 'zh'))); },
    reverse() { this._sort(lines => lines.reverse()); },
    shuffle() { this._sort(lines => { for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } }); },
    clear() { document.getElementById('linesortInput').value = ''; document.getElementById('linesortOutput').value = ''; }
};

// 行去重
const linededupTools = {
    dedup() {
        const text = document.getElementById('linededupInput').value;
        if (!text) { showToast('请输入文本'); return; }
        const caseSensitive = document.getElementById('linededupCase').checked;
        const lines = text.split('\n');
        const seen = new Set();
        const result = [];
        lines.forEach(line => {
            const key = caseSensitive ? line : line.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                result.push(line);
            }
        });
        document.getElementById('linededupOutput').value = result.join('\n');
        document.getElementById('linededupStatus').textContent = `原始 ${lines.length} 行 → 去重后 ${result.length} 行，移除 ${lines.length - result.length} 行`;
        document.getElementById('linededupStatus').className = 'status-bar success';
    },
    clear() {
        document.getElementById('linededupInput').value = '';
        document.getElementById('linededupOutput').value = '';
        document.getElementById('linededupStatus').textContent = '';
    }
};

// 大小写转换
const caseconvTools = {
    _get() { return document.getElementById('caseconvInput').value; },
    _set(v) { document.getElementById('caseconvInput').value = v; },
    upper() { this._set(this._get().toUpperCase()); },
    lower() { this._set(this._get().toLowerCase()); },
    capitalize() {
        this._set(this._get().replace(/\b\w/g, c => c.toUpperCase()));
    },
    toggle() {
        this._set(this._get().split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''));
    },
    copy() { copyToClipboard(this._get()); },
    clear() { this._set(''); },
    update() {}
};

// 字符串格式转换
const stringconvTools = {
    _words(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[-_.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase()
            .split(' ');
    },
    convert() {
        const input = document.getElementById('stringconvInput').value.trim();
        if (!input) {
            ['camel','pascal','snake','kebab','constant','dot'].forEach(k => {
                document.getElementById(`str-${k}`).textContent = '-';
            });
            return;
        }
        const words = this._words(input);
        const camel = words.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join('');
        const pascal = words.map(w => w[0].toUpperCase() + w.slice(1)).join('');
        const snake = words.join('_');
        const kebab = words.join('-');
        const constant = words.join('_').toUpperCase();
        const dot = words.join('.');

        document.getElementById('str-camel').textContent = camel;
        document.getElementById('str-pascal').textContent = pascal;
        document.getElementById('str-snake').textContent = snake;
        document.getElementById('str-kebab').textContent = kebab;
        document.getElementById('str-constant').textContent = constant;
        document.getElementById('str-dot').textContent = dot;
    },
    copy(type) {
        const id = { camelCase: 'camel', PascalCase: 'pascal', snake_case: 'snake', 'kebab-case': 'kebab', CONSTANT: 'constant', 'dot.case': 'dot' }[type];
        const val = document.getElementById(`str-${id}`).textContent;
        if (val && val !== '-') copyToClipboard(val);
    }
};

// JSON转义
const escapeTools = {
    doEscape() {
        const input = document.getElementById('escapeInput').value;
        if (!input) { showToast('请输入文本'); return; }
        const escaped = JSON.stringify(input);
        document.getElementById('escapeOutput').value = escaped.slice(1, -1);
    },
    unescape() {
        const input = getDecodeInput('escapeOutput', 'escapeInput');
        if (!input) { showToast('请将要反转义的文本粘贴到上方或下方的输入框中'); return; }
        try {
            const unescaped = JSON.parse('"' + input + '"');
            document.getElementById('escapeInput').value = unescaped;
        } catch (e) {
            showToast('反转义失败: ' + e.message, 3000);
        }
    },
    copy() { const v = document.getElementById('escapeOutput').value; if (v) copyToClipboard(v); },
    clear() { document.getElementById('escapeInput').value = ''; document.getElementById('escapeOutput').value = ''; }
};
