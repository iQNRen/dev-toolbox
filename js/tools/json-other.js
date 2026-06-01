// JSON转换工具

// JSON转XML
const json2xmlTools = {
    convert() {
        const input = getEditorValue('json2xmlInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const rootName = document.getElementById('xmlRootName').value || 'root';
        const xml = jsonToXml(result.data, rootName);
        setEditorValue('json2xmlOutput', xml);
    },

    copy() {
        const output = getEditorValue('json2xmlOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        setEditorValue('json2xmlInput', '');
        setEditorValue('json2xmlOutput', '');
    }
};

// JSON转CSV
const json2csvTools = {
    convert() {
        const input = getEditorValue('json2csvInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        if (!Array.isArray(result.data)) {
            showToast('请输入JSON数组格式的数据');
            return;
        }

        const delimiter = document.getElementById('csvDelimiter').value;
        const csv = jsonToCsv(result.data, delimiter);
        setEditorValue('json2csvOutput', csv);
    },

    copy() {
        const output = getEditorValue('json2csvOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    download() {
        const output = getEditorValue('json2csvOutput');
        if (!output) {
            showToast('没有可下载的内容');
            return;
        }

        const blob = new Blob(['﻿' + output], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('CSV文件已下载');
    },

    clear() {
        setEditorValue('json2csvInput', '');
        setEditorValue('json2csvOutput', '');
    }
};

// JSON转YAML
const json2yamlTools = {
    convert() {
        const input = getEditorValue('json2yamlInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const yaml = jsonToYaml(result.data);
        setEditorValue('json2yamlOutput', yaml);
    },

    copy() {
        const output = getEditorValue('json2yamlOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        setEditorValue('json2yamlInput', '');
        setEditorValue('json2yamlOutput', '');
    }
};

// JSON转TypeScript
const json2tsTools = {
    convert() {
        const input = getEditorValue('json2tsInput');
        if (!input.trim()) {
            showToast('请输入JSON数据');
            return;
        }

        const result = safeJsonParse(input);
        if (!result.success) {
            showToast(`JSON解析错误: ${result.error}`, 3000);
            return;
        }

        const interfaceName = document.getElementById('tsInterfaceName').value || 'RootObject';
        const ts = jsonToTypescript(result.data, interfaceName);
        setEditorValue('json2tsOutput', ts);
    },

    copy() {
        const output = getEditorValue('json2tsOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        setEditorValue('json2tsInput', '');
        setEditorValue('json2tsOutput', '');
    }
};

// XML转JSON
const xml2jsonTools = {
    convert() {
        const input = getEditorValue('xml2jsonInput');
        if (!input.trim()) {
            showToast('请输入XML数据');
            return;
        }

        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(input, 'text/xml');

            // 检查解析错误
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                showToast('XML格式错误: ' + parseError.textContent.substring(0, 100), 3000);
                return;
            }

            const json = xmlToJson(xmlDoc.documentElement);
            setEditorValue('xml2jsonOutput', JSON.stringify(json, null, 2));
        } catch (e) {
            showToast('XML解析错误: ' + e.message, 3000);
        }
    },

    copy() {
        const output = getEditorValue('xml2jsonOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        setEditorValue('xml2jsonInput', '');
        setEditorValue('xml2jsonOutput', '');
    }
};

// CSV转JSON
const csv2jsonTools = {
    convert() {
        const input = document.getElementById('csv2jsonInput').value;
        if (!input.trim()) {
            showToast('请输入CSV数据');
            return;
        }

        try {
            const delimiter = document.getElementById('csv2jsonDelimiter').value;
            const json = csvToJson(input, delimiter);
            setEditorValue('csv2jsonOutput', JSON.stringify(json, null, 2));
        } catch (e) {
            showToast('CSV解析错误: ' + e.message, 3000);
        }
    },

    copy() {
        const output = getEditorValue('csv2jsonOutput');
        if (output) {
            copyToClipboard(output);
        } else {
            showToast('没有可复制的内容');
        }
    },

    clear() {
        document.getElementById('csv2jsonInput').value = '';
        setEditorValue('csv2jsonOutput', '');
    }
};

// YAML转JSON
const yaml2jsonTools = {
    convert() {
        const input = document.getElementById('yaml2jsonInput').value;
        if (!input.trim()) { showToast('请输入YAML数据'); return; }
        try {
            const json = this.parse(input);
            setEditorValue('yaml2jsonOutput', JSON.stringify(json, null, 2));
        } catch (e) {
            showToast('YAML解析错误: ' + e.message, 3000);
        }
    },
    parse(yaml) {
        // 简易YAML解析器
        const lines = yaml.split('\n');
        const result = {};
        let currentObj = result;
        const stack = [{ obj: result, indent: -1 }];

        for (let line of lines) {
            if (!line.trim() || line.trim().startsWith('#')) continue;

            const indent = line.search(/\S/);
            const content = line.trim();

            // 处理缩进层级
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                stack.pop();
            }
            currentObj = stack[stack.length - 1].obj;

            if (content.startsWith('- ')) {
                // 数组项
                const value = content.substring(2).trim();
                if (!Array.isArray(currentObj)) {
                    // 找到父级的key
                    const parent = stack[stack.length - 2];
                    if (parent) {
                        const keys = Object.keys(parent.obj);
                        const lastKey = keys[keys.length - 1];
                        if (lastKey && !Array.isArray(parent.obj[lastKey])) {
                            parent.obj[lastKey] = [];
                        }
                        currentObj = parent.obj[lastKey];
                    }
                }
                if (value.includes(': ')) {
                    const [key, val] = value.split(/:\s(.+)/);
                    const obj = {};
                    obj[key.trim()] = this.parseValue(val.trim());
                    currentObj.push(obj);
                } else {
                    currentObj.push(this.parseValue(value));
                }
            } else if (content.includes(': ')) {
                const [key, val] = content.split(/:\s(.+)/);
                const trimmedVal = val.trim();
                if (trimmedVal === '' || trimmedVal === '|' || trimmedVal === '>') {
                    currentObj[key.trim()] = '';
                    stack.push({ obj: currentObj[key.trim()], indent: indent });
                } else if (trimmedVal === '{') {
                    currentObj[key.trim()] = {};
                    stack.push({ obj: currentObj[key.trim()], indent: indent });
                } else if (trimmedVal === '[') {
                    currentObj[key.trim()] = [];
                    stack.push({ obj: currentObj[key.trim()], indent: indent });
                } else {
                    currentObj[key.trim()] = this.parseValue(trimmedVal);
                }
            } else if (content.endsWith(':')) {
                const key = content.slice(0, -1).trim();
                currentObj[key] = {};
                stack.push({ obj: currentObj[key], indent: indent });
            }
        }
        return result;
    },
    parseValue(val) {
        if (val === 'true') return true;
        if (val === 'false') return false;
        if (val === 'null' || val === '~') return null;
        if (/^-?\d+$/.test(val)) return parseInt(val);
        if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            return val.slice(1, -1);
        }
        // 处理内联数组 [a, b, c]
        if (val.startsWith('[') && val.endsWith(']')) {
            return val.slice(1, -1).split(',').map(v => this.parseValue(v.trim()));
        }
        // 处理内联对象 {a: b, c: d}
        if (val.startsWith('{') && val.endsWith('}')) {
            const obj = {};
            val.slice(1, -1).split(',').forEach(pair => {
                const [k, v] = pair.split(/:\s(.+)/);
                obj[k.trim()] = this.parseValue(v.trim());
            });
            return obj;
        }
        return val;
    },
    copy() { const v = getEditorValue('yaml2jsonOutput'); if (v) copyToClipboard(v); },
    clear() { document.getElementById('yaml2jsonInput').value = ''; setEditorValue('yaml2jsonOutput', ''); }
};

// JSON转INI
const json2iniTools = {
    convert() {
        const input = getEditorValue('json2iniInput');
        if (!input.trim()) { showToast('请输入JSON数据'); return; }
        const result = safeJsonParse(input);
        if (!result.success) { showToast('JSON解析错误: ' + result.error, 3000); return; }
        setEditorValue('json2iniOutput', this.toIni(result.data));
    },
    toIni(obj, prefix = '') {
        let ini = '';
        const sections = [];
        const keys = [];

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sections.push({ key, value });
            } else {
                keys.push({ key, value });
            }
        }

        // 输出当前层级的键值对
        for (const { key, value } of keys) {
            ini += `${key} = ${Array.isArray(value) ? JSON.stringify(value) : value}\n`;
        }

        if (keys.length > 0 && sections.length > 0) ini += '\n';

        // 输出子段
        for (const { key, value } of sections) {
            const sectionName = prefix ? `${prefix}.${key}` : key;
            ini += `[${sectionName}]\n`;
            ini += this.toIni(value, sectionName);
            ini += '\n';
        }

        return ini;
    },
    copy() { const v = getEditorValue('json2iniOutput'); if (v) copyToClipboard(v); },
    clear() { setEditorValue('json2iniInput', ''); setEditorValue('json2iniOutput', ''); }
};

// INI转JSON
const ini2jsonTools = {
    convert() {
        const input = document.getElementById('ini2jsonInput').value;
        if (!input.trim()) { showToast('请输入INI数据'); return; }
        try {
            const json = this.parse(input);
            setEditorValue('ini2jsonOutput', JSON.stringify(json, null, 2));
        } catch (e) {
            showToast('INI解析错误: ' + e.message, 3000);
        }
    },
    parse(ini) {
        const result = {};
        let currentSection = result;
        const lines = ini.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('#') || line.startsWith(';')) continue;

            // 段落
            const sectionMatch = line.match(/^\[(.+)\]$/);
            if (sectionMatch) {
                const path = sectionMatch[1].split('.');
                currentSection = result;
                for (const key of path) {
                    if (!currentSection[key]) currentSection[key] = {};
                    currentSection = currentSection[key];
                }
                continue;
            }

            // 键值对
            const kvMatch = line.match(/^([^=]+)=(.*)$/);
            if (kvMatch) {
                const key = kvMatch[1].trim();
                let value = kvMatch[2].trim();

                // 解析值
                if (value === 'true') value = true;
                else if (value === 'false') value = false;
                else if (value === 'null') value = null;
                else if (/^-?\d+$/.test(value)) value = parseInt(value);
                else if (/^-?\d+\.\d+$/.test(value)) value = parseFloat(value);
                else if ((value.startsWith('"') && value.endsWith('"')) ||
                         (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }

                currentSection[key] = value;
            }
        }
        return result;
    },
    copy() { const v = getEditorValue('ini2jsonOutput'); if (v) copyToClipboard(v); },
    clear() { document.getElementById('ini2jsonInput').value = ''; setEditorValue('ini2jsonOutput', ''); }
};

// JWT解析
const jwtTools = {
    decode() {
        const input = document.getElementById('jwtInput').value.trim();
        if (!input) { showToast('请输入JWT Token'); return; }

        const parts = input.split('.');
        if (parts.length < 2) { showToast('无效的JWT格式'); return; }

        try {
            const header = JSON.parse(base64Decode(parts[0]));
            document.getElementById('jwtHeader').textContent = JSON.stringify(header, null, 2);

            try {
                const payload = JSON.parse(base64Decode(parts[1]));
                document.getElementById('jwtPayload').textContent = JSON.stringify(payload, null, 2);
            } catch (e) {
                document.getElementById('jwtPayload').textContent = base64Decode(parts[1]);
            }
        } catch (e) {
            showToast('JWT解析失败: ' + e.message, 3000);
        }
    },
    clear() {
        document.getElementById('jwtInput').value = '';
        document.getElementById('jwtHeader').textContent = '';
        document.getElementById('jwtPayload').textContent = '';
    }
};
