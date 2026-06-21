// 公共工具函数

// 显示Toast通知
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板');
    } catch (err) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    }
}

/**
 * 智能获取待解码内容：优先从输出框读取，如果为空则自动从输入框取。
 * 解决用户习惯把内容贴到上面"原始文本"框但解码读下面"结果"框的问题。
 * @param {string} outputId - 输出框（编码结果）ID
 * @param {string} inputId - 输入框（原始文本）ID
 * @returns {string} 内容，都为空返回 ''
 */
function getDecodeInput(outputId, inputId) {
    const out = document.getElementById(outputId);
    const inp = document.getElementById(inputId);
    if (out.value.trim()) return out.value;
    if (inp.value.trim()) {
        out.value = inp.value;
        return inp.value;
    }
    return '';
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 安全的JSON解析
function safeJsonParse(str) {
    try {
        const result = JSON.parse(str);
        return { success: true, data: result };
    } catch (e) {
        return { success: false, error: e.message, position: getJsonErrorPosition(str, e) };
    }
}

// 获取JSON错误位置
function getJsonErrorPosition(str, error) {
    const match = error.message.match(/position\s+(\d+)/i);
    if (match) {
        const pos = parseInt(match[1]);
        const lines = str.substring(0, pos).split('\n');
        return {
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
            position: pos
        };
    }
    return null;
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 深拷贝
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const copy = {};
        Object.keys(obj).forEach(key => {
            copy[key] = deepClone(obj[key]);
        });
        return copy;
    }
    return obj;
}

// 深度比较两个对象
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}

// XML转JSON的简单实现
function xmlToJson(xml) {
    let obj = {};

    if (xml.nodeType === 1) {
        if (xml.attributes.length > 0) {
            obj['@attributes'] = {};
            for (let j = 0; j < xml.attributes.length; j++) {
                const attribute = xml.attributes.item(j);
                obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType === 3) {
        obj = xml.nodeValue.trim();
    }

    if (xml.hasChildNodes()) {
        for (let i = 0; i < xml.childNodes.length; i++) {
            const item = xml.childNodes.item(i);
            const nodeName = item.nodeName;

            if (typeof obj[nodeName] === 'undefined') {
                const result = xmlToJson(item);
                if (result !== '') {
                    obj[nodeName] = result;
                }
            } else {
                if (typeof obj[nodeName].push === 'undefined') {
                    const old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                const result = xmlToJson(item);
                if (result !== '') {
                    obj[nodeName].push(result);
                }
            }
        }
    }

    return obj;
}

// JSON转XML的简单实现
function jsonToXml(obj, rootName = 'root', indent = 0) {
    let xml = '';
    const spaces = '  '.repeat(indent);

    if (indent === 0) {
        xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
    }

    if (Array.isArray(obj)) {
        xml += `${spaces}<${rootName}>\n`;
        obj.forEach((item, index) => {
            xml += jsonToXml(item, 'item', indent + 1);
        });
        xml += `${spaces}</${rootName}>\n`;
    } else if (typeof obj === 'object' && obj !== null) {
        xml += `${spaces}<${rootName}>\n`;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const validKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
                xml += jsonToXml(obj[key], validKey, indent + 1);
            }
        }
        xml += `${spaces}</${rootName}>\n`;
    } else {
        const value = String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        xml += `${spaces}<${rootName}>${value}</${rootName}>\n`;
    }

    return xml;
}

// JSON转YAML的简单实现
function jsonToYaml(obj, indent = 0) {
    let yaml = '';
    const spaces = '  '.repeat(indent);

    if (Array.isArray(obj)) {
        obj.forEach(item => {
            if (typeof item === 'object' && item !== null) {
                yaml += `${spaces}-\n`;
                yaml += jsonToYaml(item, indent + 1);
            } else {
                yaml += `${spaces}- ${formatYamlValue(item)}\n`;
            }
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                    yaml += `${spaces}${key}:\n`;
                    yaml += jsonToYaml(value, indent + 1);
                } else {
                    yaml += `${spaces}${key}: ${formatYamlValue(value)}\n`;
                }
            }
        }
    } else {
        yaml += `${spaces}${formatYamlValue(obj)}\n`;
    }

    return yaml;
}

function formatYamlValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'null';
    if (typeof value === 'string') {
        if (value.includes('\n') || value.includes(':') || value.includes('#') ||
            value.includes('[') || value.includes(']') || value.includes('{') ||
            value.includes('}') || value.includes(',') || value.includes('&') ||
            value.includes('*') || value.includes('?') || value.includes('|') ||
            value.includes('>') || value.includes('!') || value.includes('%') ||
            value.includes('@') || value.includes('`') || value.includes('"') ||
            value.includes("'") || value.trim() !== value) {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
    }
    return String(value);
}

// JSONPath 简单实现
function evaluateJsonPath(obj, path) {
    if (path === '$') return obj;

    const parts = path.replace(/^\$\.?/, '').split(/\.|\[(\d+)\]/).filter(Boolean);
    let current = obj;

    for (let part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }

        if (part === '*') {
            if (Array.isArray(current)) {
                return current;
            } else {
                return Object.values(current);
            }
        }

        if (part.startsWith('..')) {
            // 递归下降
            const key = part.substring(2);
            return recursiveDescent(current, key);
        }

        if (Array.isArray(current)) {
            const index = parseInt(part);
            if (!isNaN(index)) {
                current = current[index];
            }
        } else {
            current = current[part];
        }
    }

    return current;
}

function recursiveDescent(obj, key) {
    const results = [];

    function search(current) {
        if (current === null || current === undefined) return;

        if (Array.isArray(current)) {
            current.forEach(item => search(item));
        } else if (typeof current === 'object') {
            if (current[key] !== undefined) {
                results.push(current[key]);
            }
            Object.values(current).forEach(value => search(value));
        }
    }

    search(obj);
    return results;
}

// JSON转TypeScript类型
function jsonToTypescript(obj, interfaceName = 'RootObject') {
    const interfaces = [];
    const processedObjects = new Map();

    function getTypeName(obj, key) {
        if (Array.isArray(obj)) {
            if (obj.length > 0) {
                return `${getTypeName(obj[0], key)}[]`;
            }
            return 'any[]';
        }
        if (obj === null) return 'null';
        if (typeof obj === 'object') {
            const name = key.charAt(0).toUpperCase() + key.slice(1);
            return name;
        }
        return typeof obj;
    }

    function processObject(obj, name) {
        if (processedObjects.has(obj)) {
            return processedObjects.get(obj);
        }

        const properties = [];
        processedObjects.set(obj, name);

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const type = getTypeName(value, key);

                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    processObject(value, type);
                } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    processObject(value[0], type.replace('[]', ''));
                }

                properties.push(`  ${key}: ${type};`);
            }
        }

        interfaces.push(`interface ${name} {\n${properties.join('\n')}\n}`);
        return name;
    }

    if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') {
            processObject(obj[0], interfaceName);
        }
    } else {
        processObject(obj, interfaceName);
    }

    return interfaces.reverse().join('\n\n');
}

// CSV解析
function parseCsv(text, delimiter = ',') {
    const lines = text.trim().split('\n');
    const result = [];

    for (let line of lines) {
        const row = [];
        let inQuote = false;
        let current = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuote && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (char === delimiter && !inQuote) {
                row.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        row.push(current.trim());
        result.push(row);
    }

    return result;
}

// CSV转JSON
function csvToJson(text, delimiter = ',') {
    const rows = parseCsv(text, delimiter);
    if (rows.length < 2) return '[]';

    const headers = rows[0];
    const result = [];

    for (let i = 1; i < rows.length; i++) {
        const obj = {};
        headers.forEach((header, index) => {
            let value = rows[i][index] || '';
            // 尝试转换数字
            if (!isNaN(value) && value !== '') {
                value = Number(value);
            } else if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            }
            obj[header] = value;
        });
        result.push(obj);
    }

    return result;
}

// JSON数组转CSV
function jsonToCsv(jsonArray, delimiter = ',') {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
        return '';
    }

    // 收集所有键
    const keys = new Set();
    jsonArray.forEach(item => {
        if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => keys.add(key));
        }
    });

    const headers = Array.from(keys);
    const rows = [headers.join(delimiter)];

    jsonArray.forEach(item => {
        const row = headers.map(header => {
            let value = item[header] !== undefined ? String(item[header]) : '';
            // 如果值包含分隔符或引号，用引号包裹
            if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
        });
        rows.push(row.join(delimiter));
    });

    return rows.join('\n');
}

// 哈希计算（使用Web Crypto API）
async function calculateHash(text, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Base64编码（支持UTF-8）
function base64Encode(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    let binary = '';
    data.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

// Base64解码（支持UTF-8）
function base64Decode(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

// HTML实体编码
function htmlEncode(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// HTML实体解码
function htmlDecode(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
}
