// 数据库工具

// ===== SQL格式化 =====
const sqlformatTools = {
    keywords: [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
        'INDEX', 'VIEW', 'DATABASE', 'IF', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
        'UNIQUE', 'DEFAULT', 'AUTO_INCREMENT', 'SERIAL', 'NOT', 'NULL', 'CHECK', 'CONSTRAINT',
        'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS',
        'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
        'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'CONVERT', 'DISTINCT', 'TOP',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'IFNULL', 'ISNULL', 'NVL',
        'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'TRIGGER', 'PROCEDURE', 'FUNCTION',
        'RETURN', 'RETURNS', 'DECLARE', 'VARIABLE', 'INT', 'VARCHAR', 'TEXT', 'INTEGER',
        'BIGINT', 'SMALLINT', 'DECIMAL', 'FLOAT', 'DOUBLE', 'DATE', 'TIMESTAMP', 'BOOLEAN',
        'CHAR', 'BLOB', 'CLOB', 'ENUM', 'JSON', 'UUID'
    ],

    format() {
        const input = document.getElementById('sqlformatInput').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }

        let sql = input.trim().replace(/\s+/g, ' ');

        // 在关键字前后换行
        const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'HAVING',
            'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
            'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];

        // 处理逗号后换行（在SELECT中）
        sql = sql.replace(/,\s*/g, ',\n    ');

        // 处理主要关键字换行
        for (const kw of majorKeywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            sql = sql.replace(regex, '\n' + kw);
        }

        // 处理子查询缩进
        sql = sql.replace(/\(\s*SELECT/gi, '(\n    SELECT');
        sql = sql.replace(/\)\s*(AND|OR|JOIN|GROUP|ORDER|LIMIT|UNION)/gi, '\n)\n$1');

        // 清理多余空行
        sql = sql.replace(/\n\s*\n/g, '\n').trim();

        document.getElementById('sqlformatOutput').value = sql;
    },

    compress() {
        const input = document.getElementById('sqlformatInput').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }
        const compressed = input.replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1').trim();
        document.getElementById('sqlformatOutput').value = compressed;
    },

    upper() {
        const input = document.getElementById('sqlformatInput').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }
        let result = input;
        for (const kw of this.keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            result = result.replace(regex, kw);
        }
        document.getElementById('sqlformatOutput').value = result;
    },

    lower() {
        const input = document.getElementById('sqlformatInput').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }
        let result = input;
        for (const kw of this.keywords) {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            result = result.replace(regex, kw.toLowerCase());
        }
        document.getElementById('sqlformatOutput').value = result;
    },

    copy() { const v = document.getElementById('sqlformatOutput').value; if (v) copyToClipboard(v); },
    clear() { document.getElementById('sqlformatInput').value = ''; document.getElementById('sqlformatOutput').value = ''; }
};

// ===== SQL转JSON =====
const sql2jsonTools = {
    convert() {
        const input = document.getElementById('sql2jsonInput').value;
        const type = document.getElementById('sql2jsonType').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }

        try {
            let result;
            if (type === 'insert') {
                result = this.parseInsert(input);
            } else {
                result = this.parseCreate(input);
            }
            document.getElementById('sql2jsonOutput').value = JSON.stringify(result, null, 2);
        } catch (e) {
            showToast('解析失败: ' + e.message, 3000);
        }
    },

    parseInsert(sql) {
        const results = [];
        // 匹配 INSERT INTO table (cols) VALUES (vals), (vals);
        const regex = /INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*((?:\([^)]+\)\s*,?\s*)+);?/gi;
        let match;

        while ((match = regex.exec(sql)) !== null) {
            const columns = match[2].split(',').map(c => c.trim().replace(/[`"]/g, ''));
            const valuesBlock = match[3];
            const valueRegex = /\(([^)]+)\)/g;
            let vm;

            while ((vm = valueRegex.exec(valuesBlock)) !== null) {
                const values = this.parseValues(vm[1]);
                const row = {};
                columns.forEach((col, i) => {
                    row[col] = values[i] !== undefined ? values[i] : null;
                });
                results.push(row);
            }
        }

        return results;
    },

    parseValues(str) {
        const values = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (inQuote) {
                if (ch === quoteChar && str[i+1] === quoteChar) {
                    current += ch; i++;
                } else if (ch === quoteChar) {
                    inQuote = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === "'" || ch === '"') {
                    inQuote = true; quoteChar = ch;
                } else if (ch === ',') {
                    values.push(this.parseValue(current.trim()));
                    current = '';
                } else {
                    current += ch;
                }
            }
        }
        if (current.trim()) values.push(this.parseValue(current.trim()));
        return values;
    },

    parseValue(v) {
        if (v.toUpperCase() === 'NULL') return null;
        if (v.toUpperCase() === 'TRUE') return true;
        if (v.toUpperCase() === 'FALSE') return false;
        if (/^-?\d+$/.test(v)) return parseInt(v);
        if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
        if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
            return v.slice(1, -1).replace(/''/g, "'");
        }
        return v;
    },

    parseCreate(sql) {
        const tables = [];
        const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([\s\S]+?)\)\s*;?/gi;
        let match;

        while ((match = regex.exec(sql)) !== null) {
            const table = { name: match[1], columns: [] };
            const body = match[2];
            const lines = body.split(',').map(l => l.trim()).filter(l => l && !l.match(/^\s*(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT|INDEX|KEY)\s/i));

            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 2) {
                    const col = {
                        name: parts[0].replace(/[`"]/g, ''),
                        type: parts[1].replace(/[()`"]/g, ''),
                        nullable: !line.toUpperCase().includes('NOT NULL'),
                        pk: line.toUpperCase().includes('PRIMARY KEY'),
                        auto: line.toUpperCase().includes('AUTO_INCREMENT') || line.toUpperCase().includes('SERIAL')
                    };
                    table.columns.push(col);
                }
            }
            tables.push(table);
        }
        return tables;
    },

    copy() { const v = document.getElementById('sql2jsonOutput').value; if (v) copyToClipboard(v); },
    clear() { document.getElementById('sql2jsonInput').value = ''; document.getElementById('sql2jsonOutput').value = ''; }
};

// ===== JSON生成SQL =====
const json2sqlTools = {
    convert() {
        const input = document.getElementById('json2sqlInput').value;
        const table = document.getElementById('json2sqlTable').value || 'users';
        const type = document.getElementById('json2sqlType').value;
        const db = document.getElementById('json2sqlDb').value;

        if (!input.trim()) { showToast('请输入JSON'); return; }

        try {
            const data = JSON.parse(input);
            const arr = Array.isArray(data) ? data : [data];
            let result;

            if (type === 'insert') {
                result = arr.map(row => this.genInsert(row, table, db)).join('\n');
            } else if (type === 'update') {
                result = arr.map(row => this.genUpdate(row, table, db)).join('\n');
            } else {
                result = this.genBatchInsert(arr, table, db);
            }

            document.getElementById('json2sqlOutput').value = result;
        } catch (e) {
            showToast('JSON解析失败: ' + e.message, 3000);
        }
    },

    escapeVal(v, db) {
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return db === 'postgresql' ? (v ? 'TRUE' : 'FALSE') : (v ? '1' : '0');
        if (typeof v === 'number') return String(v);
        if (typeof v === 'object') return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
        return "'" + String(v).replace(/'/g, "''") + "'";
    },

    q(name, db) {
        if (db === 'postgresql') return `"${name}"`;
        if (db === 'mysql') return `\`${name}\``;
        return name;
    },

    genInsert(row, table, db) {
        const keys = Object.keys(row);
        const cols = keys.map(k => this.q(k, db)).join(', ');
        const vals = keys.map(k => this.escapeVal(row[k], db)).join(', ');
        return `INSERT INTO ${this.q(table, db)} (${cols}) VALUES (${vals});`;
    },

    genUpdate(row, table, db) {
        const keys = Object.keys(row);
        if (keys.length === 0) return '';
        const idKey = keys.find(k => k.toLowerCase() === 'id') || keys[0];
        const sets = keys.filter(k => k !== idKey).map(k => `${this.q(k, db)} = ${this.escapeVal(row[k], db)}`).join(', ');
        return `UPDATE ${this.q(table, db)} SET ${sets} WHERE ${this.q(idKey, db)} = ${this.escapeVal(row[idKey], db)};`;
    },

    genBatchInsert(rows, table, db) {
        if (rows.length === 0) return '';
        const keys = Object.keys(rows[0]);
        const cols = keys.map(k => this.q(k, db)).join(', ');
        const valuesList = rows.map(row => {
            const vals = keys.map(k => this.escapeVal(row[k], db)).join(', ');
            return `(${vals})`;
        });
        return `INSERT INTO ${this.q(table, db)} (${cols}) VALUES\n${valuesList.join(',\n')};`;
    },

    copy() { const v = document.getElementById('json2sqlOutput').value; if (v) copyToClipboard(v); },
    clear() { document.getElementById('json2sqlInput').value = ''; document.getElementById('json2sqlOutput').value = ''; }
};

// ===== Mock数据生成 =====
const mockdataTools = {
    _fields: [],

    addField(name = '', type = 'string', rule = '') {
        const list = document.getElementById('mockFieldList');
        const row = document.createElement('div');
        row.className = 'mock-field-row';
        row.innerHTML = `
            <input type="text" class="input" value="${name}" placeholder="字段名">
            <select class="select">
                <option value="string" ${type==='string'?'selected':''}>字符串</option>
                <option value="int" ${type==='int'?'selected':''}>整数</option>
                <option value="float" ${type==='float'?'selected':''}>小数</option>
                <option value="bool" ${type==='bool'?'selected':''}>布尔</option>
                <option value="date" ${type==='date'?'selected':''}>日期</option>
                <option value="email" ${type==='email'?'selected':''}>邮箱</option>
                <option value="phone" ${type==='phone'?'selected':''}>手机号</option>
                <option value="name" ${type==='name'?'selected':''}>姓名</option>
                <option value="address" ${type==='address'?'selected':''}>地址</option>
                <option value="url" ${type==='url'?'selected':''}>URL</option>
                <option value="uuid" ${type==='uuid'?'selected':''}>UUID</option>
                <option value="image" ${type==='image'?'selected':''}>图片URL</option>
                <option value="title" ${type==='title'?'selected':''}>标题</option>
                <option value="content" ${type==='content'?'selected':''}>内容</option>
                <option value="ip" ${type==='ip'?'selected':''}>IP地址</option>
                <option value="id" ${type==='id'?'selected':''}>自增ID</option>
            </select>
            <input type="text" class="input" value="${rule}" placeholder="规则(可选) 如: 1-100, A|B|C">
            <button class="btn btn-outline btn-small" onclick="this.parentElement.remove()">删除</button>
        `;
        list.appendChild(row);
    },

    addPreset(type) {
        document.getElementById('mockFieldList').innerHTML = '';
        if (type === 'user') {
            this.addField('id', 'id', '');
            this.addField('name', 'name', '');
            this.addField('email', 'email', '');
            this.addField('phone', 'phone', '');
            this.addField('age', 'int', '18-65');
            this.addField('address', 'address', '');
            this.addField('avatar', 'image', '');
            this.addField('created_at', 'date', '');
        } else if (type === 'product') {
            this.addField('id', 'id', '');
            this.addField('name', 'title', '');
            this.addField('price', 'float', '0.01-9999.99');
            this.addField('stock', 'int', '0-1000');
            this.addField('category', 'string', '电子|服装|食品|家居|图书');
            this.addField('image', 'image', '');
            this.addField('description', 'content', '');
            this.addField('status', 'bool', '');
            this.addField('created_at', 'date', '');
        } else if (type === 'order') {
            this.addField('id', 'id', '');
            this.addField('order_no', 'string', 'ORD-20240000-99999');
            this.addField('user_id', 'int', '1-1000');
            this.addField('product_name', 'title', '');
            this.addField('amount', 'float', '0.01-99999.99');
            this.addField('quantity', 'int', '1-10');
            this.addField('status', 'string', '待付款|已付款|已发货|已完成|已取消');
            this.addField('address', 'address', '');
            this.addField('created_at', 'date', '');
        }
    },

    generate() {
        const rows = document.getElementById('mockFieldList').children;
        if (rows.length === 0) { showToast('请先添加字段'); return; }

        const fields = [];
        for (const row of rows) {
            const inputs = row.querySelectorAll('input');
            const select = row.querySelector('select');
            fields.push({
                name: inputs[0].value || 'field',
                type: select.value,
                rule: inputs[1].value
            });
        }

        const count = Math.min(parseInt(document.getElementById('mockCount').value) || 10, 1000);
        const data = [];

        for (let i = 0; i < count; i++) {
            const row = {};
            for (const f of fields) {
                row[f.name] = this.mockValue(f.type, f.rule, i);
            }
            data.push(row);
        }

        document.getElementById('mockOutput').value = JSON.stringify(data, null, 2);
    },

    mockValue(type, rule, index) {
        const r = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const pick = arr => arr[Math.floor(Math.random() * arr.length)];

        switch (type) {
            case 'id': return index + 1;
            case 'int': {
                if (rule) { const [min, max] = rule.split('-').map(Number); return r(min||0, max||100); }
                return r(1, 10000);
            }
            case 'float': {
                if (rule) { const [min, max] = rule.split('-').map(Number); return +(Math.random() * ((max||100) - (min||0)) + (min||0)).toFixed(2); }
                return +(Math.random() * 1000).toFixed(2);
            }
            case 'bool': return Math.random() > 0.5;
            case 'date': {
                const d = new Date(Date.now() - r(0, 365 * 24 * 3600 * 1000));
                return d.toISOString().slice(0, 19).replace('T', ' ');
            }
            case 'string': {
                if (rule && rule.includes('|')) return pick(rule.split('|'));
                if (rule && rule.includes('-')) {
                    const [a, b] = rule.split('-');
                    if (!isNaN(a)) return String(r(Number(a), Number(b)));
                }
                return rule || 'item_' + r(1000, 9999);
            }
            case 'email': return pick(['zhangsan','lisi','wangwu','zhaoliu','qianqi','sunba']) + r(1,999) + '@example.com';
            case 'phone': return '1' + pick(['30','31','32','33','34','35','36','37','38','39','50','51','52','53','55','56','58','59','70','71','75','76','77','78','80','81','82','83','84','85','86','87','88','89','90','91','92','95','96','97','98']) + String(r(10000000, 99999999));
            case 'name': return pick(['张三','李四','王五','赵六','钱七','孙八','周九','吴十','郑十一','冯十二','陈十三','褚十四','卫十五','蒋十六','沈十七','韩十八','杨十九','朱二十','秦二一','许二二','何二三','吕二四','施二五','张二六','孔二七','曹二八','严二九','华三十','金三一','魏三二','陶三三','姜三四','戚三五','谢三六','邹三七','喻三八','柏三九','窦四十']);
            case 'address': return pick(['北京市朝阳区建国路88号','上海市浦东新区陆家嘴环路1000号','广州市天河区天河路385号','深圳市南山区科技园路1号','杭州市西湖区文三路478号','成都市武侯区天府大道1号','南京市玄武区中山路169号','武汉市江汉区建设大道568号','重庆市渝中区解放碑88号','西安市雁塔区高新路25号']);
            case 'url': return 'https://example.com/page/' + r(1, 9999);
            case 'image': return 'https://picsum.photos/seed/' + r(1,9999) + '/400/300';
            case 'title': return pick(['深入理解JavaScript','Python编程指南','Java核心技术','Go语言实战','Rust程序设计','数据库系统概论','算法导论','操作系统原理','计算机网络','人工智能基础']) + (r(1,9) > 5 ? ' 第' + r(2,10) + '版' : '');
            case 'content': return pick(['这是一段示例文本内容，用于测试数据展示效果。','今天天气真不错，适合出去走走。','产品质量很好，物流也很快，好评！','学习编程是一件很有趣的事情。','科技创新改变生活，数据驱动未来。','Lorem ipsum dolor sit amet, consectetur adipiscing elit.']) ;
            case 'ip': return r(10,192) + '.' + r(0,255) + '.' + r(0,255) + '.' + r(1,254);
            case 'uuid': {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                    const rv = Math.random() * 16 | 0;
                    return (c === 'x' ? rv : (rv & 0x3 | 0x8)).toString(16);
                });
            }
            default: return 'value_' + r(1, 9999);
        }
    },

    export() {
        const output = document.getElementById('mockOutput').value;
        if (!output) { showToast('请先生成数据'); return; }

        const type = document.getElementById('mockExportType').value;
        const table = document.getElementById('mockTableName').value || 'users';
        let result = output;

        try {
            const data = JSON.parse(output);

            if (type === 'sql') {
                result = json2sqlTools.genBatchInsert(data, table, 'mysql');
            } else if (type === 'csv') {
                if (data.length > 0) {
                    const keys = Object.keys(data[0]);
                    const header = keys.join(',');
                    const rows = data.map(row => keys.map(k => {
                        const v = String(row[k] ?? '');
                        return v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v;
                    }).join(','));
                    result = header + '\n' + rows.join('\n');
                }
            }

            document.getElementById('mockOutput').value = result;
        } catch (e) {
            showToast('导出失败: ' + e.message, 3000);
        }
    },

    copy() { const v = document.getElementById('mockOutput').value; if (v) copyToClipboard(v); }
};

// ===== 建表语句生成 =====
const sqlgenTools = {
    addField(name = '', type = 'VARCHAR(255)', constraint = '') {
        const list = document.getElementById('sqlgenFieldList');
        const row = document.createElement('div');
        row.className = 'mock-field-row';
        row.innerHTML = `
            <input type="text" class="input" value="${name}" placeholder="字段名">
            <select class="select">
                <option ${type==='INT'?'selected':''}>INT</option>
                <option ${type==='BIGINT'?'selected':''}>BIGINT</option>
                <option ${type==='VARCHAR(255)'?'selected':''}>VARCHAR(255)</option>
                <option ${type==='VARCHAR(100)'?'selected':''}>VARCHAR(100)</option>
                <option ${type==='VARCHAR(50)'?'selected':''}>VARCHAR(50)</option>
                <option ${type==='TEXT'?'selected':''}>TEXT</option>
                <option ${type==='DECIMAL(10,2)'?'selected':''}>DECIMAL(10,2)</option>
                <option ${type==='FLOAT'?'selected':''}>FLOAT</option>
                <option ${type==='DOUBLE'?'selected':''}>DOUBLE</option>
                <option ${type==='BOOLEAN'?'selected':''}>BOOLEAN</option>
                <option ${type==='DATE'?'selected':''}>DATE</option>
                <option ${type==='DATETIME'?'selected':''}>DATETIME</option>
                <option ${type==='TIMESTAMP'?'selected':''}>TIMESTAMP</option>
                <option ${type==='JSON'?'selected':''}>JSON</option>
                <option ${type==='UUID'?'selected':''}>UUID</option>
            </select>
            <input type="text" class="input" value="${constraint}" placeholder="PK, NOT NULL, UNIQUE...">
            <button class="btn btn-outline btn-small" onclick="this.parentElement.remove()">删除</button>
        `;
        list.appendChild(row);
    },

    addPreset(type) {
        document.getElementById('sqlgenFieldList').innerHTML = '';
        if (type === 'user') {
            this.addField('id', 'BIGINT', 'PK, AUTO_INCREMENT');
            this.addField('username', 'VARCHAR(50)', 'NOT NULL, UNIQUE');
            this.addField('email', 'VARCHAR(100)', 'NOT NULL, UNIQUE');
            this.addField('phone', 'VARCHAR(20)', '');
            this.addField('password_hash', 'VARCHAR(255)', 'NOT NULL');
            this.addField('avatar', 'VARCHAR(255)', '');
            this.addField('status', 'BOOLEAN', 'DEFAULT TRUE');
        }
    },

    generate() {
        const table = document.getElementById('sqlgenTableName').value || 'users';
        const db = document.getElementById('sqlgenDb').value;
        const withTs = document.getElementById('sqlgenTimestamp').checked;
        const rows = document.getElementById('sqlgenFieldList').children;

        if (rows.length === 0) { showToast('请先添加字段'); return; }

        let sql = '';
        const q = n => db === 'postgresql' ? `"${n}"` : db === 'mysql' ? `\`${n}\`` : n;

        sql += `CREATE TABLE ${q(table)} (\n`;

        const fields = [];
        let hasPk = false;

        for (const row of rows) {
            const inputs = row.querySelectorAll('input');
            const select = row.querySelector('select');
            const name = inputs[0].value || 'field';
            const type = select.value;
            const constraint = inputs[1].value;

            let line = `    ${q(name)} ${type}`;
            if (constraint) {
                line += ' ' + constraint;
                if (constraint.toUpperCase().includes('PK') || constraint.toUpperCase().includes('PRIMARY')) hasPk = true;
            }
            fields.push(line);
        }

        if (withTs) {
            if (db === 'postgresql') {
                fields.push('    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
                fields.push('    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            } else {
                fields.push('    created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
                fields.push('    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
            }
        }

        sql += fields.join(',\n');
        sql += '\n)';

        if (db === 'mysql') sql += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
        else if (db === 'postgresql') sql += ';';
        else sql += ';';

        document.getElementById('sqlgenOutput').value = sql;
    },

    copy() { const v = document.getElementById('sqlgenOutput').value; if (v) copyToClipboard(v); }
};

// ===== SQL解析ER =====
const erdetectTools = {
    parse() {
        const input = document.getElementById('erdetectInput').value;
        if (!input.trim()) { showToast('请输入SQL'); return; }

        const result = sql2jsonTools.parseCreate(input);
        if (result.length === 0) { showToast('未找到建表语句'); return; }

        let html = '';
        for (const table of result) {
            html += `<div class="erd-table">`;
            html += `<div class="erd-table-name">📋 ${table.name}</div>`;
            html += `<div class="erd-table-cols">`;

            for (const col of table.columns) {
                html += `<div class="erd-col">`;
                if (col.pk) html += `<span class="erd-col-key pk">PK</span>`;
                html += `<span class="erd-col-name">${col.name}</span>`;
                html += `<span class="erd-col-type">${col.type}</span>`;
                if (!col.nullable) html += `<span class="erd-col-nullable">NOT NULL</span>`;
                if (col.auto) html += `<span class="erd-col-nullable">AUTO</span>`;
                html += `</div>`;
            }

            html += `</div></div>`;
        }

        document.getElementById('erdetectOutput').innerHTML = html;
    },

    sample() {
        document.getElementById('erdetectInput').value = `CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    status BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(50),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
    },

    clear() { document.getElementById('erdetectInput').value = ''; document.getElementById('erdetectOutput').innerHTML = ''; }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    mockdataTools.addPreset('user');
    sqlgenTools.addPreset('user');
});
