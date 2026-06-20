// 正则表达式速查

// 分组式数据：每个分类一个卡片，含若干 {sym, desc}
const REGEX_REF = [
    { cat: '元字符', items: [
        ['.', '匹配除换行符外任意字符（/s 模式下含换行）'],
        ['^', '字符串开头（/m 下匹配行首）'],
        ['$', '字符串结尾（/m 下匹配行尾）'],
        ['\\', '转义下一个字符'],
        ['|', '或，匹配左边或右边'],
    ]},
    { cat: '量词', items: [
        ['*', '0 次或多次（贪婪）'],
        ['+', '1 次或多次'],
        ['?', '0 次或 1 次'],
        ['{n}', '恰好 n 次'],
        ['{n,}', '至少 n 次'],
        ['{n,m}', 'n 到 m 次'],
        ['*?', '*+? 后加 ? 变懒惰（非贪婪）匹配'],
    ]},
    { cat: '字符类', items: [
        ['\\d', '数字 [0-9]'],
        ['\\D', '非数字'],
        ['\\w', '单词字符 [A-Za-z0-9_]'],
        ['\\W', '非单词字符'],
        ['\\s', '空白字符（空格/制表/换行）'],
        ['\\S', '非空白字符'],
        ['[abc]', 'a 或 b 或 c'],
        ['[^abc]', '除 a/b/c 外任意字符'],
        ['[a-z]', 'a 到 z 范围'],
    ]},
    { cat: '分组与引用', items: [
        ['(abc)', '捕获分组，可用 $1 反向引用'],
        ['(?:abc)', '非捕获分组'],
        ['(?<name>x)', '命名捕获分组'],
        ['\\1', '反向引用第 1 个分组'],
        ['\\k<name>', '反向引用命名分组'],
    ]},
    { cat: '零宽断言', items: [
        ['x(?=y)', '先行断言：x 后面紧跟 y'],
        ['x(?!y)', '否定先行断言：x 后面不跟 y'],
        ['(?<=y)x', '后行断言：x 前面是 y'],
        ['(?<!y)x', '否定后行断言：x 前面不是 y'],
    ]},
    { cat: '修饰符', items: [
        ['g', '全局匹配（找全部）'],
        ['i', '忽略大小写'],
        ['m', '多行模式，^ $ 匹配行首行尾'],
        ['s', '让 . 匹配换行符'],
        ['u', 'Unicode 模式'],
        ['y', '粘连匹配，从 lastIndex 精确开始'],
    ]},
    { cat: '常用示例', items: [
        ['邮箱', '^[\\w.-]+@[\\w-]+(\\.[\\w-]+)+$'],
        ['手机号', '^1[3-9]\\d{9}$'],
        ['URL', '^https?://[\\w.-]+(/.*)?$'],
        ['IPv4', '^(\\d{1,3}\\.){3}\\d{1,3}$'],
        ['日期', '^\\d{4}-\\d{2}-\\d{2}$'],
    ]},
];

const regexrefTools = {
    init() {
        this.filter();
    },

    filter() {
        const q = document.getElementById('regexrefSearch').value.trim().toLowerCase();
        const cards = REGEX_REF.map(group => {
            const items = group.items.filter(([sym, desc]) =>
                !q || (sym + ' ' + desc + ' ' + group.cat).toLowerCase().includes(q)
            );
            if (!items.length) return '';
            const rows = items.map(([sym, desc]) => `
                <div class="regexref-row">
                    <code class="regexref-sym" title="点击复制">${this.esc(sym)}</code>
                    <span class="regexref-desc">${this.esc(desc)}</span>
                </div>`).join('');
            return `
                <div class="linuxcmd-card regexref-card">
                    <div class="regexref-title">${this.esc(group.cat)}</div>
                    ${rows}
                </div>`;
        }).join('');

        const total = REGEX_REF.reduce((n, g) => n + g.items.length, 0);
        document.getElementById('regexrefCount').textContent = `${total} 条`;
        document.getElementById('regexrefList').innerHTML = cards
            || '<div class="linuxcmd-empty">未找到匹配项</div>';
    },

    esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    regexrefTools.init();
    // 点击符号复制
    document.getElementById('regexrefList').addEventListener('click', (e) => {
        const code = e.target.closest('.regexref-sym');
        if (!code) return;
        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => showToast('已复制：' + text)).catch(() => {});
    });
});
