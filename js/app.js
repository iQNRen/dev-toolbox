// 应用主逻辑

const editors = {};

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initTheme();
    initCodeMirror();
    initTimestamp();
    initRegex();
    initColorPicker();
    initMarkdown();
    initImgUpload();
});

// ===== 导航系统 =====
function initNavigation() {
    // 一级导航
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            switchCategory(category);
        });
    });

    // 二级导航
    document.querySelectorAll('.sub-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tool = this.dataset.tool;
            switchTool(tool);
        });
    });
}

function switchCategory(category) {
    // 更新一级标签
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-category="${category}"]`).classList.add('active');

    // 更新二级导航
    document.querySelectorAll('.sub-nav-group').forEach(g => g.classList.remove('active'));
    document.querySelector(`.sub-nav-group[data-category="${category}"]`).classList.add('active');

    // 切换到该分类下的第一个工具
    const firstTab = document.querySelector(`.sub-nav-group[data-category="${category}"] .sub-tab`);
    if (firstTab) {
        switchTool(firstTab.dataset.tool);
    }
}

function switchTool(toolName) {
    // 更新二级标签
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
    const targetTab = document.querySelector(`.sub-tab[data-tool="${toolName}"]`);
    if (targetTab) targetTab.classList.add('active');

    // 确保对应的一级分类也激活
    const parentGroup = targetTab.closest('.sub-nav-group');
    if (parentGroup) {
        const category = parentGroup.dataset.category;
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.nav-tab[data-category="${category}"]`).classList.add('active');
        document.querySelectorAll('.sub-nav-group').forEach(g => g.classList.remove('active'));
        parentGroup.classList.add('active');
    }

    // 切换页面
    document.querySelectorAll('.tool-page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(`tool-${toolName}`);
    if (page) page.classList.add('active');

    // 刷新CodeMirror
    setTimeout(() => {
        Object.values(editors).forEach(editor => {
            if (editor && editor.refresh) editor.refresh();
        });
    }, 50);
}

// ===== 主题 =====
function initTheme() {
    const btn = document.getElementById('themeToggle');
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';

    btn.addEventListener('click', function() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.textContent = next === 'dark' ? '☀️' : '🌙';
        Object.values(editors).forEach(editor => {
            if (editor) editor.setOption('theme', next === 'dark' ? 'dracula' : 'default');
        });
    });
}

// ===== CodeMirror =====
function initCodeMirror() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dracula' : 'default';
    const configs = [
        { id: 'formatterInput', mode: 'application/json' },
        { id: 'formatterOutput', mode: 'application/json', readOnly: true },
        { id: 'compressInput', mode: 'application/json' },
        { id: 'compressOutput', mode: 'application/json', readOnly: true },
        { id: 'validateInput', mode: 'application/json' },
        { id: 'treeInput', mode: 'application/json' },
        { id: 'diffInput1', mode: 'application/json' },
        { id: 'diffInput2', mode: 'application/json' },
        { id: 'pathJsonInput', mode: 'application/json' },
        { id: 'pathOutput', mode: 'application/json', readOnly: true },
        { id: 'json2xmlInput', mode: 'application/json' },
        { id: 'json2xmlOutput', mode: 'application/xml', readOnly: true },
        { id: 'json2csvInput', mode: 'application/json' },
        { id: 'json2yamlInput', mode: 'application/json' },
        { id: 'json2tsInput', mode: 'application/json' },
        { id: 'xml2jsonInput', mode: 'application/xml' },
        { id: 'xml2jsonOutput', mode: 'application/json', readOnly: true },
        { id: 'yaml2jsonInput', mode: 'yaml' },
        { id: 'yaml2jsonOutput', mode: 'application/json', readOnly: true },
    ];

    configs.forEach(config => {
        const el = document.getElementById(config.id);
        if (el) {
            editors[config.id] = CodeMirror.fromTextArea(el, {
                mode: config.mode,
                theme: theme,
                lineNumbers: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                readOnly: config.readOnly || false,
                tabSize: 2,
                indentWithTabs: false,
                lineWrapping: true
            });
        }
    });
}

// ===== 时间戳 =====
function initTimestamp() {
    updateCurrentTimestamp();
    setInterval(updateCurrentTimestamp, 1000);
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        dateInput.value = local.toISOString().slice(0, 16);
    }
}

function updateCurrentTimestamp() {
    const el = document.getElementById('currentTimeStamp');
    if (el) {
        const now = new Date();
        el.innerHTML = `当前: ${now.toLocaleString('zh-CN')}　|　秒: ${Math.floor(now.getTime()/1000)}　|　毫秒: ${now.getTime()}`;
    }
}

// ===== 正则 =====
function initRegex() {
    const pattern = document.getElementById('regexPattern');
    const flags = document.getElementById('regexFlags');
    const input = document.getElementById('regexTestInput');
    if (!pattern || !input) return;

    const update = debounce(function() {
        const p = pattern.value;
        const f = flags.value;
        const t = input.value;
        if (!p || !t) {
            document.getElementById('regexResult').innerHTML = '';
            document.getElementById('regexMatches').innerHTML = '';
            return;
        }
        try {
            const regex = new RegExp(p, f);
            const matches = [];
            let match;
            if (f.includes('g')) {
                while ((match = regex.exec(t)) !== null) {
                    matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
                    if (match.index === regex.lastIndex) regex.lastIndex++;
                }
            } else {
                match = regex.exec(t);
                if (match) matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
            }

            let preview = '';
            let lastIdx = 0;
            matches.forEach(m => {
                preview += esc(t.substring(lastIdx, m.index));
                preview += `<mark>${esc(m.value)}</mark>`;
                lastIdx = m.index + m.value.length;
            });
            preview += esc(t.substring(lastIdx));

            document.getElementById('regexResult').innerHTML = matches.length
                ? `<div style="margin-bottom:6px;font-weight:600">匹配预览 (${matches.length}个)</div><div>${preview}</div>`
                : '<div style="color:var(--text-secondary)">无匹配</div>';

            let detail = '';
            matches.forEach((m, i) => {
                detail += `<div style="margin-bottom:6px;padding:6px;background:var(--bg-secondary);border-radius:4px">`;
                detail += `<strong>#${i+1}</strong> "${esc(m.value)}" @ ${m.index}`;
                if (m.groups.length) detail += ` → [${m.groups.map(g=>`"${esc(g||'')}"`).join(', ')}]`;
                detail += '</div>';
            });
            document.getElementById('regexMatches').innerHTML = detail;
        } catch (e) {
            document.getElementById('regexResult').innerHTML = `<div style="color:var(--error-color)">错误: ${e.message}</div>`;
            document.getElementById('regexMatches').innerHTML = '';
        }
    }, 200);

    pattern.addEventListener('input', update);
    flags.addEventListener('input', update);
    input.addEventListener('input', update);
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ===== 颜色 =====
function initColorPicker() {
    const picker = document.getElementById('colorPicker');
    if (picker) {
        picker.addEventListener('input', function() {
            document.getElementById('colorHex').value = this.value;
            colorTools.convertFromHex();
        });
    }
    if (document.getElementById('colorHex')) colorTools.convertFromHex();
}

// ===== Markdown =====
function initMarkdown() {
    const input = document.getElementById('markdownInput');
    if (input) markdownTools.render();
}

// ===== 图片上传 =====
function initImgUpload() {
    const area = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imgUpload');
    if (!area || !fileInput) return;

    area.addEventListener('click', () => fileInput.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragover'); });
    area.addEventListener('dragleave', () => area.classList.remove('dragover'));
    area.addEventListener('drop', e => {
        e.preventDefault();
        area.classList.remove('dragover');
        if (e.dataTransfer.files.length) img2base64Tools.handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function() {
        if (this.files.length) img2base64Tools.handleFile(this.files[0]);
    });
}

// ===== 辅助函数 =====
function getEditorValue(id) {
    if (editors[id]) return editors[id].getValue();
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function setEditorValue(id, value) {
    if (editors[id]) { editors[id].setValue(value); return; }
    const el = document.getElementById(id);
    if (el) el.value = value;
}
