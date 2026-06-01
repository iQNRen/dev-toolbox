// JSON格式化工具

const formatterTools = {
    // 格式化JSON
    beautify() {
        const input = getEditorValue('formatterInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const indentSelect = document.getElementById('formatterIndent');
        let indent = 2;
        if (indentSelect.value === 'tab') {
            indent = '\t';
        } else {
            indent = parseInt(indentSelect.value);
        }

        const formatted = JSON.stringify(result.data, null, indent);
        setEditorValue('formatterOutput', formatted);

        this.updateStatus('formatterStatus', '格式化成功', true);
    },

    // 压缩JSON
    compress() {
        const input = getEditorValue('formatterInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const compressed = JSON.stringify(result.data);
        setEditorValue('formatterOutput', compressed);

        this.updateStatus('formatterStatus', '压缩成功', true);
    },

    // 复制结果
    copy() {
        const output = getEditorValue('formatterOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    // 清空
    clear() {
        setEditorValue('formatterInput', '');
        setEditorValue('formatterOutput', '');
        document.getElementById('formatterStatus').textContent = '';
    },

    // 示例数据
    sample() {
        const sampleData = {
            "name": "JSON工具箱",
            "version": "1.0.0",
            "features": ["格式化", "压缩", "验证", "树视图"],
            "author": {
                "name": "开发者",
                "email": "dev@example.com"
            },
            "isFree": true,
            "rating": 4.8,
            "links": {
                "github": "https://github.com",
                "website": "https://example.com"
            },
            "languages": ["JavaScript", "TypeScript", "Python"],
            "stats": {
                "users": 10000,
                "downloads": 50000
            }
        };
        setEditorValue('formatterInput', JSON.stringify(sampleData));
    },

    // 更新状态
    updateStatus(elementId, message, isSuccess) {
        const status = document.getElementById(elementId);
        if (status) {
            status.textContent = message;
            status.className = 'status-bar ' + (isSuccess ? 'success' : 'error');
        }
    }
};

// JSON压缩工具
const compressTools = {
    doCompress() {
        const input = getEditorValue('compressInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const compressed = JSON.stringify(result.data);
        setEditorValue('compressOutput', compressed);

        const originalSize = input.length;
        const compressedSize = compressed.length;
        const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

        document.getElementById('compressStatus').textContent =
            `原始大小: ${originalSize} 字符 | 压缩后: ${compressedSize} 字符 | 压缩率: ${ratio}%`;
        document.getElementById('compressStatus').className = 'status-bar success';
    },

    copy() {
        const output = getEditorValue('compressOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        setEditorValue('compressInput', '');
        setEditorValue('compressOutput', '');
        document.getElementById('compressStatus').textContent = '';
    }
};

// JSON验证工具
const validateTools = {
    validate() {
        const input = getEditorValue('validateInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const output = document.getElementById('validateOutput');
        const result = safeJsonParse(input);

        if (result.success) {
            output.innerHTML = `
                <div class="success-msg">✅ JSON格式正确</div>
                <div style="margin-top: 15px; color: var(--text-secondary);">
                    <p>数据类型: ${Array.isArray(result.data) ? '数组' : typeof result.data}</p>
                    <p>字符数: ${input.length}</p>
                    <p>字节数: ${new Blob([input]).size}</p>
                </div>
            `;
        } else {
            let errorHtml = `
                <div class="error-msg">❌ JSON格式错误</div>
                <div class="error-location">
                    <p><strong>错误信息:</strong> ${result.error}</p>
            `;

            if (result.position) {
                errorHtml += `<p><strong>错误位置:</strong> 第 ${result.position.line} 行, 第 ${result.position.column} 列</p>`;
            }

            errorHtml += '</div>';
            output.innerHTML = errorHtml;
        }
    },

    clear() {
        setEditorValue('validateInput', '');
        document.getElementById('validateOutput').innerHTML = '';
    },

    sampleError() {
        const errorSample = `{
    "name": "JSON工具箱",
    "version": 1.0.0,
    "features": ["格式化", "压缩", "验证"
    "isFree": true,
    rating: 4.8
}`;
        setEditorValue('validateInput', errorSample);
    }
};

// JSON树视图工具
const treeTools = {
    render() {
        const input = getEditorValue('treeInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const output = document.getElementById('treeOutput');
        output.innerHTML = this.buildTree(result.data, '', true);
    },

    buildTree(data, key, isLast = true) {
        if (data === null) {
            return `<span class="tree-null">null</span>${isLast ? '' : '<span class="tree-comma">,</span>'}`;
        }

        if (typeof data !== 'object') {
            return this.renderValue(data, isLast);
        }

        const isArray = Array.isArray(data);
        const entries = isArray ? data : Object.entries(data);
        const count = isArray ? data.length : Object.keys(data).length;

        if (count === 0) {
            return `${isArray ? '[]' : '{}'}${isLast ? '' : '<span class="tree-comma">,</span>'}`;
        }

        let html = `<span class="tree-toggle" onclick="treeTools.toggle(this)"></span>`;
        html += `<span class="tree-bracket">${isArray ? '[' : '{'}</span>`;
        html += `<span class="tree-content">`;

        if (isArray) {
            data.forEach((item, index) => {
                html += `<div class="tree-node">`;
                html += this.buildTree(item, '', index === data.length - 1);
                html += `</div>`;
            });
        } else {
            const keys = Object.keys(data);
            keys.forEach((k, index) => {
                html += `<div class="tree-node">`;
                html += `<span class="tree-key">"${k}"</span>: `;
                html += this.buildTree(data[k], k, index === keys.length - 1);
                html += `</div>`;
            });
        }

        html += `</span>`;
        html += `<span class="tree-bracket">${isArray ? ']' : '}'}</span>`;
        html += isLast ? '' : '<span class="tree-comma">,</span>';

        return html;
    },

    renderValue(value, isLast) {
        let html = '';
        if (typeof value === 'string') {
            html += `<span class="tree-string">"${this.escapeHtml(value)}"</span>`;
        } else if (typeof value === 'number') {
            html += `<span class="tree-number">${value}</span>`;
        } else if (typeof value === 'boolean') {
            html += `<span class="tree-boolean">${value}</span>`;
        }
        html += isLast ? '' : '<span class="tree-comma">,</span>';
        return html;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    },

    toggle(element) {
        element.classList.toggle('collapsed');
        const content = element.nextElementSibling.nextElementSibling;
        content.classList.toggle('collapsed');
    },

    expandAll() {
        document.querySelectorAll('.tree-toggle.collapsed').forEach(el => {
            el.classList.remove('collapsed');
            el.nextElementSibling.nextElementSibling.classList.remove('collapsed');
        });
    },

    collapseAll() {
        document.querySelectorAll('.tree-toggle').forEach(el => {
            el.classList.add('collapsed');
            el.nextElementSibling.nextElementSibling.classList.add('collapsed');
        });
    },

    clear() {
        setEditorValue('treeInput', '');
        document.getElementById('treeOutput').innerHTML = '';
    }
};

// JSON对比工具
const diffTools = {
    compare() {
        const input1 = getEditorValue('diffInput1');
        const input2 = getEditorValue('diffInput2');

        if (!input1.trim() || !input2.trim()) {
            showToast('请输入两个JSON数据进行对比');
            return;
        }

        const result1 = safeJsonParse(input1);
        const result2 = safeJsonParse(input2);

        if (!result1.success) {
            showToast(`第一个JSON解析错误: ${result1.error}`, 3000);
            return;
        }

        if (!result2.success) {
            showToast(`第二个JSON解析错误: ${result2.error}`, 3000);
            return;
        }

        const diffs = this.findDifferences(result1.data, result2.data);
        const output = document.getElementById('diffOutput');

        if (diffs.length === 0) {
            output.innerHTML = '<div class="success-msg">✅ 两个JSON完全相同</div>';
        } else {
            let html = `<div style="margin-bottom: 10px; color: var(--text-secondary);">发现 ${diffs.length} 处差异:</div>`;
            diffs.forEach(diff => {
                html += `<div class="diff-${diff.type}">${diff.message}</div>`;
            });
            output.innerHTML = html;
        }
    },

    findDifferences(obj1, obj2, path = '') {
        const diffs = [];

        if (typeof obj1 !== typeof obj2) {
            diffs.push({
                type: 'changed',
                message: `${path || '$'}: 类型不同 - ${typeof obj1} vs ${typeof obj2}`
            });
            return diffs;
        }

        if (obj1 === null || obj2 === null) {
            if (obj1 !== obj2) {
                diffs.push({
                    type: 'changed',
                    message: `${path || '$'}: ${obj1} vs ${obj2}`
                });
            }
            return diffs;
        }

        if (typeof obj1 !== 'object') {
            if (obj1 !== obj2) {
                diffs.push({
                    type: 'changed',
                    message: `${path || '$'}: "${obj1}" vs "${obj2}"`
                });
            }
            return diffs;
        }

        const isArray = Array.isArray(obj1);

        if (isArray !== Array.isArray(obj2)) {
            diffs.push({
                type: 'changed',
                message: `${path || '$'}: 数组 vs 对象`
            });
            return diffs;
        }

        if (isArray) {
            const maxLen = Math.max(obj1.length, obj2.length);
            for (let i = 0; i < maxLen; i++) {
                const newPath = `${path}[${i}]`;
                if (i >= obj1.length) {
                    diffs.push({
                        type: 'added',
                        message: `${newPath}: 新增元素`
                    });
                } else if (i >= obj2.length) {
                    diffs.push({
                        type: 'removed',
                        message: `${newPath}: 删除元素`
                    });
                } else {
                    diffs.push(...this.findDifferences(obj1[i], obj2[i], newPath));
                }
            }
        } else {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            const allKeys = new Set([...keys1, ...keys2]);

            for (let key of allKeys) {
                const newPath = path ? `${path}.${key}` : key;

                if (!(key in obj1)) {
                    diffs.push({
                        type: 'added',
                        message: `${newPath}: 新增属性`
                    });
                } else if (!(key in obj2)) {
                    diffs.push({
                        type: 'removed',
                        message: `${newPath}: 删除属性`
                    });
                } else {
                    diffs.push(...this.findDifferences(obj1[key], obj2[key], newPath));
                }
            }
        }

        return diffs;
    },

    swap() {
        const input1 = getEditorValue('diffInput1');
        const input2 = getEditorValue('diffInput2');
        setEditorValue('diffInput1', input2);
        setEditorValue('diffInput2', input1);
    },

    clear() {
        setEditorValue('diffInput1', '');
        setEditorValue('diffInput2', '');
        document.getElementById('diffOutput').innerHTML = '';
    }
};

// JSON路径工具
const pathTools = {
    query() {
        const jsonInput = getEditorValue('pathJsonInput');
        const pathInput = document.getElementById('jsonPathInput').value;

        if (!jsonInput.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(jsonInput);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        try {
            const queryResult = evaluateJsonPath(result.data, pathInput);
            setEditorValue('pathOutput', JSON.stringify(queryResult, null, 2));
        } catch (e) {
            showToast(`路径查询错误: ${e.message}`, 3000);
        }
    },

    clear() {
        setEditorValue('pathJsonInput', '');
        setEditorValue('pathOutput', '');
    }
};
