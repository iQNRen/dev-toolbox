// 代码对比工具 - 优化版

const codediffTools = {
    diffResult: null,
    _timer: null,

    init() {
        const input1 = document.getElementById('codediffInput1');
        const input2 = document.getElementById('codediffInput2');
        if (!input1 || !input2) return;

        // 同步滚动
        let syncing = false;
        const sync = (src, dst) => () => {
            if (!document.getElementById('codediffSync').checked) return;
            if (syncing) return;
            syncing = true;
            dst.scrollTop = src.scrollTop;
            dst.scrollLeft = src.scrollLeft;
            const y = src.scrollTop;
            ['codediffHighlight1','codediffHighlight2'].forEach(id => {
                document.getElementById(id).style.transform = `translateY(-${y}px)`;
            });
            ['codediffGutter1','codediffGutter2'].forEach(id => {
                document.getElementById(id).style.transform = `translateY(-${y}px)`;
            });
            requestAnimationFrame(() => { syncing = false; });
        };
        input1.addEventListener('scroll', sync(input1, input2));
        input2.addEventListener('scroll', sync(input2, input1));

        // 粘贴自动格式化 + 自动对比
        const onPaste = (e) => {
            if (document.getElementById('codediffFormat').checked) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                const lang = document.getElementById('codediffLang').value;
                e.target.value = this.autoFormat(text, lang);
            }
            setTimeout(() => this.autoCompare(), 30);
        };
        input1.addEventListener('paste', onPaste);
        input2.addEventListener('paste', onPaste);

        // 输入自动对比（防抖）
        const onInput = () => {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.autoCompare(), 200);
        };
        input1.addEventListener('input', onInput);
        input2.addEventListener('input', onInput);

        // Tab支持
        const onTab = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const s = e.target.selectionStart;
                const en = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, s) + '    ' + e.target.value.substring(en);
                e.target.selectionStart = e.target.selectionEnd = s + 4;
                this.autoCompare();
            }
        };
        input1.addEventListener('keydown', onTab);
        input2.addEventListener('keydown', onTab);

        this._initResizer();
        this.updateGutter();
    },

    // 拖拽底部手柄调整编辑区高度
    _initResizer() {
        const resizer = document.getElementById('codediffResizer');
        const container = document.getElementById('codediffContainer');
        if (!resizer || !container) return;

        let dragging = false, startY = 0, startH = 0;

        resizer.addEventListener('mousedown', (e) => {
            dragging = true;
            resizer.classList.add('dragging');
            startY = e.clientY;
            startH = container.offsetHeight;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'row-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const h = Math.max(180, Math.min(1200, startH + (e.clientY - startY)));
            container.style.height = h + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            resizer.classList.remove('dragging');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        });
    },

    // 两边都有内容时自动对比
    autoCompare() {
        const v1 = document.getElementById('codediffInput1').value;
        const v2 = document.getElementById('codediffInput2').value;
        this.updateGutter();
        if (v1 && v2) {
            this.compare();
        } else {
            document.getElementById('codediffHighlight1').innerHTML = this.plainHtml(v1);
            document.getElementById('codediffHighlight2').innerHTML = this.plainHtml(v2);
            document.getElementById('codediffSummary').innerHTML = '';
            this.diffResult = null;
        }
    },

    updateGutter() {
        const v1 = document.getElementById('codediffInput1').value;
        const v2 = document.getElementById('codediffInput2').value;
        const n1 = v1 ? v1.split('\n').length : 0;
        const n2 = v2 ? v2.split('\n').length : 0;
        document.getElementById('codediffGutter1').innerHTML =
            Array.from({length: n1}, (_, i) => `<span class="line-num">${i+1}</span>`).join('');
        document.getElementById('codediffGutter2').innerHTML =
            Array.from({length: n2}, (_, i) => `<span class="line-num">${i+1}</span>`).join('');
        document.getElementById('codediffStats1').textContent = n1 ? `${n1} 行` : '';
        document.getElementById('codediffStats2').textContent = n2 ? `${n2} 行` : '';
    },

    autoFormat(text, lang) {
        try {
            if (lang === 'json') return JSON.stringify(JSON.parse(text), null, 4);
        } catch(e) {}
        return text;
    },

    // ======== 核心对比 ========

    compare() {
        const t1 = document.getElementById('codediffInput1').value;
        const t2 = document.getElementById('codediffInput2').value;
        this.diffResult = this.computeDiff(t1, t2);
        this.renderDiff();
        this.renderSummary();
    },

    computeDiff(text1, text2) {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const ops = this.myers(lines1, lines2);

        const res = { lines1: [], lines2: [], stats: { add: 0, del: 0, mod: 0, eq: 0 } };
        let i1 = 0, i2 = 0;

        for (const op of ops) {
            if (op.t === '=') {
                for (let i = 0; i < op.n; i++) {
                    res.lines1.push({ type: 'eq', text: lines1[i1], num: i1+1, cd: [] });
                    res.lines2.push({ type: 'eq', text: lines2[i2], num: i2+1, cd: [] });
                    res.stats.eq++; i1++; i2++;
                }
            } else if (op.t === '-') {
                for (let i = 0; i < op.n; i++) {
                    res.lines1.push({ type: 'del', text: lines1[i1], num: i1+1, cd: [] });
                    res.lines2.push({ type: 'empty', text: '', num: null, cd: [] });
                    res.stats.del++; i1++;
                }
            } else if (op.t === '+') {
                for (let i = 0; i < op.n; i++) {
                    res.lines1.push({ type: 'empty', text: '', num: null, cd: [] });
                    res.lines2.push({ type: 'add', text: lines2[i2], num: i2+1, cd: [] });
                    res.stats.add++; i2++;
                }
            }
        }

        this.pairModify(res);
        return res;
    },

    myers(a, b) {
        const n = a.length, m = b.length, max = n + m;
        const v = new Array(2 * max + 1).fill(0);
        const trace = [];
        for (let d = 0; d <= max; d++) {
            trace.push([...v]);
            for (let k = -d; k <= d; k += 2) {
                let x = (k === -d || (k !== d && v[k-1+max] < v[k+1+max])) ? v[k+1+max] : v[k-1+max]+1;
                let y = x - k;
                while (x < n && y < m && a[x] === b[y]) { x++; y++; }
                v[k+max] = x;
                if (x >= n && y >= m) return this.backtrack(trace, a, b, max);
            }
        }
        return [];
    },

    backtrack(trace, a, b, max) {
        const ops = [];
        let x = a.length, y = b.length;
        for (let d = trace.length - 1; d >= 0; d--) {
            const v = trace[d], k = x - y;
            const pk = (k === -d || (k !== d && v[k-1+max] < v[k+1+max])) ? k+1 : k-1;
            const px = v[pk+max], py = px - pk;
            while (x > px && y > py) { ops.unshift({t:'=',n:1}); x--; y--; }
            if (d > 0) {
                if (x === px) { ops.unshift({t:'+',n:1}); y--; }
                else { ops.unshift({t:'-',n:1}); x--; }
            }
        }
        const merged = [];
        for (const op of ops) {
            if (merged.length && merged[merged.length-1].t === op.t) merged[merged.length-1].n++;
            else merged.push({...op});
        }
        return merged;
    },

    // 配对 delete+insert 为 modify，计算字符级差异
    pairModify(res) {
        const { lines1, lines2, stats } = res;
        let i = 0;
        while (i < lines1.length) {
            if (lines1[i].type === 'del') {
                // 找连续 del
                let dEnd = i;
                while (dEnd < lines1.length && lines1[dEnd].type === 'del') dEnd++;
                // 找紧随的连续 add
                let aStart = dEnd;
                let aEnd = aStart;
                while (aEnd < lines1.length && lines2[aEnd].type === 'add') aEnd++;

                const pairs = Math.min(dEnd - i, aEnd - aStart);
                for (let p = 0; p < pairs; p++) {
                    const di = i + p, ai = aStart + p;
                    lines1[di].type = 'mod';
                    lines2[ai].type = 'mod';
                    const cd = this.charDiff(lines1[di].text, lines2[ai].text);
                    lines1[di].cd = cd.left;
                    lines2[ai].cd = cd.right;
                    stats.del--; stats.add--; stats.mod++;
                }
                i = aEnd;
            } else {
                i++;
            }
        }
    },

    // ======== 字符级差异 ========

    charDiff(a, b) {
        if (a === b) return { left: [{t:'eq',v:a}], right: [{t:'eq',v:b}] };
        const tokA = this.tokenize(a);
        const tokB = this.tokenize(b);
        const lcs = this.lcs(tokA, tokB);
        return {
            left: this.buildCd(tokA, lcs, 'left'),
            right: this.buildCd(tokB, lcs, 'right')
        };
    },

    tokenize(s) {
        // 按 word / space / symbol 分词
        const r = [];
        let i = 0;
        while (i < s.length) {
            const ch = s[i];
            if (/\s/.test(ch)) {
                let j = i; while (j < s.length && /\s/.test(s[j])) j++;
                r.push(s.slice(i, j)); i = j;
            } else if (/[a-zA-Z0-9_$]/.test(ch)) {
                let j = i; while (j < s.length && /[a-zA-Z0-9_$]/.test(s[j])) j++;
                r.push(s.slice(i, j)); i = j;
            } else {
                r.push(ch); i++;
            }
        }
        return r;
    },

    lcs(a, b) {
        const n = a.length, m = b.length;
        const dp = Array.from({length:n+1}, ()=>Array(m+1).fill(0));
        for (let i = 1; i <= n; i++)
            for (let j = 1; j <= m; j++)
                dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j],dp[i][j-1]);
        const r = [];
        let i = n, j = m;
        while (i > 0 && j > 0) {
            if (a[i-1]===b[j-1]) { r.unshift(a[i-1]); i--; j--; }
            else if (dp[i-1][j] > dp[i][j-1]) i--;
            else j--;
        }
        return r;
    },

    buildCd(tokens, lcs, side) {
        const diffs = [];
        let ti = 0, li = 0;
        while (ti < tokens.length || li < lcs.length) {
            if (li < lcs.length && ti < tokens.length && tokens[ti] === lcs[li]) {
                diffs.push({t:'eq', v:tokens[ti]}); ti++; li++;
            } else if (ti < tokens.length) {
                diffs.push({t: side==='left'?'del':'add', v:tokens[ti]}); ti++;
            } else break;
        }
        return diffs;
    },

    // ======== 渲染 ========

    renderDiff() {
        if (!this.diffResult) return;
        const { lines1, lines2 } = this.diffResult;
        this.renderGutter('codediffGutter1', lines1);
        this.renderGutter('codediffGutter2', lines2);
        this.renderLines('codediffHighlight1', lines1);
        this.renderLines('codediffHighlight2', lines2);
        document.getElementById('codediffStats1').textContent = `${lines1.filter(l=>l.type!=='empty').length} 行`;
        document.getElementById('codediffStats2').textContent = `${lines2.filter(l=>l.type!=='empty').length} 行`;
    },

    renderGutter(id, lines) {
        document.getElementById(id).innerHTML = lines.map(l => {
            let c = 'line-num';
            if (l.type==='add') c+=' diff-add';
            else if (l.type==='del') c+=' diff-del';
            else if (l.type==='mod') c+=' diff-mod';
            return `<span class="${c}">${l.num||''}</span>`;
        }).join('');
    },

    renderLines(id, lines) {
        document.getElementById(id).innerHTML = lines.map(l => {
            let cls = 'line';
            if (l.type === 'empty') return `<span class="line">&nbsp;</span>`;
            if (l.type === 'eq') return `<span class="line">${this.esc(l.text)}</span>`;

            if (l.type === 'add') cls += ' diff-add';
            else if (l.type === 'del') cls += ' diff-del';
            else if (l.type === 'mod') cls += ' diff-mod';

            const content = l.cd && l.cd.length ? this.renderCd(l.cd) : this.esc(l.text);
            return `<span class="${cls}">${content}</span>`;
        }).join('');
    },

    renderCd(cd) {
        return cd.map(p => {
            const esc = this.esc(p.v);
            if (p.t === 'eq') return esc;
            if (p.t === 'del') return `<span class="char-del">${esc}</span>`;
            if (p.t === 'add') return `<span class="char-add">${esc}</span>`;
            return esc;
        }).join('');
    },

    renderSummary() {
        if (!this.diffResult) return;
        const s = this.diffResult.stats;
        document.getElementById('codediffSummary').innerHTML = `
            <span class="summary-item"><span class="summary-dot green"></span> 新增 <b>${s.add}</b> 行</span>
            <span class="summary-item"><span class="summary-dot red"></span> 删除 <b>${s.del}</b> 行</span>
            <span class="summary-item"><span class="summary-dot yellow"></span> 修改 <b>${s.mod}</b> 行</span>
            <span class="summary-item">未变 <b>${s.eq}</b> 行</span>
        `;
    },

    plainHtml(text) {
        if (!text) return '';
        return text.split('\n').map(l => `<span class="line">${this.esc(l)||'&nbsp;'}</span>`).join('');
    },

    swap() {
        const i1 = document.getElementById('codediffInput1');
        const i2 = document.getElementById('codediffInput2');
        const t = i1.value; i1.value = i2.value; i2.value = t;
        this.autoCompare();
    },

    clear() {
        ['codediffInput1','codediffInput2'].forEach(id => document.getElementById(id).value = '');
        ['codediffGutter1','codediffGutter2','codediffHighlight1','codediffHighlight2'].forEach(id => document.getElementById(id).innerHTML = '');
        ['codediffStats1','codediffStats2'].forEach(id => document.getElementById(id).textContent = '');
        document.getElementById('codediffSummary').innerHTML = '';
        this.diffResult = null;
    },

    updateLang() {},

    esc(s) {
        if (!s) return '';
        return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => codediffTools.init());
