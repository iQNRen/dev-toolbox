// 日期计算器

const datecalcTools = {
    // 把 yyyy-mm-dd 解析为当天 00:00 的 Date，避免时区偏移
    parse(str) {
        if (!str) return null;
        const [y, m, d] = str.split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    },

    fmt(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    weekday(date) {
        return '日一二三四五六'[date.getDay()];
    },

    // 日期差
    diff() {
        const a = this.parse(document.getElementById('datecalcStart').value);
        const b = this.parse(document.getElementById('datecalcEnd').value);
        const out = document.getElementById('datecalcDiffResult');
        if (!a || !b) { out.innerHTML = '<div style="color:var(--error-color)">请选择两个日期</div>'; return; }

        const ms = b - a;
        const days = Math.round(ms / 86400000);
        const abs = Math.abs(days);
        const weeks = Math.floor(abs / 7);
        const remain = abs % 7;
        const sign = days < 0 ? '前' : '后';

        out.innerHTML = `
            <div>相差 <b style="color:var(--accent-color)">${abs}</b> 天（结束${sign}于起始）</div>
            <div>约 ${weeks} 周 ${remain} 天</div>
            <div>约 ${(abs * 24).toLocaleString()} 小时</div>
        `;
    },

    // 日期加减
    addDays() {
        const base = this.parse(document.getElementById('datecalcBase').value);
        const delta = parseInt(document.getElementById('datecalcDelta').value);
        const out = document.getElementById('datecalcAddResult');
        if (!base || isNaN(delta)) { out.innerHTML = '<div style="color:var(--error-color)">请选择日期并输入天数</div>'; return; }

        const result = new Date(base);
        result.setDate(result.getDate() + delta);

        const ms = result - base;
        const days = Math.round(ms / 86400000);

        out.innerHTML = `
            <div>${this.fmt(base)} <b>${delta >= 0 ? '+' : ''}${delta}</b> 天</div>
            <div>= <b style="color:var(--accent-color)">${this.fmt(result)}</b>（周${this.weekday(result)}）</div>
        `;
    },

    // 工作日计算（不含周末，起始日算）
    workdays() {
        const a = this.parse(document.getElementById('datecalcWkStart').value);
        const b = this.parse(document.getElementById('datecalcWkEnd').value);
        const out = document.getElementById('datecalcWkResult');
        if (!a || !b) { out.innerHTML = '<div style="color:var(--error-color)">请选择两个日期</div>'; return; }

        let start = a, end = b;
        let reversed = false;
        if (start > end) { [start, end] = [end, start]; reversed = true; }

        let workdays = 0, weekend = 0;
        const cur = new Date(start);
        while (cur <= end) {
            const wd = cur.getDay();
            if (wd === 0 || wd === 6) weekend++;
            else workdays++;
            cur.setDate(cur.getDate() + 1);
        }
        const totalDays = Math.round((end - start) / 86400000) + 1;

        out.innerHTML = `
            <div>区间共 <b>${totalDays}</b> 天</div>
            <div>工作日 <b style="color:var(--success-color)">${workdays}</b> 天</div>
            <div>周末 <b>${weekend}</b> 天</div>
            <div style="font-size:12px;color:var(--text-secondary)">（按自然日历统计，不含法定节假日调休）</div>
        `;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 默认填入今天，方便直接用
    const today = new Date();
    const t = datecalcTools.fmt(today);
    ['datecalcStart', 'datecalcEnd', 'datecalcBase', 'datecalcWkStart', 'datecalcWkEnd'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = t;
    });
});
