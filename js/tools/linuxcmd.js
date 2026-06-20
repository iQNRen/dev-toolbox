// Linux 命令查询

// 分类定义
const LINUX_CMD_CATS = [
    { key: 'file',  label: '📁 文件目录' },
    { key: 'text',  label: '📝 文本处理' },
    { key: 'proc',  label: '⚙️ 进程管理' },
    { key: 'net',   label: '🌐 网络' },
    { key: 'disk',  label: '💾 磁盘' },
    { key: 'perm',  label: '🔐 权限' },
    { key: 'arch',  label: '📦 压缩归档' },
    { key: 'sys',   label: '🖥️ 系统信息' },
    { key: 'pkg',   label: '📗 包管理' },
    { key: 'user',  label: '👤 用户' }
];

// 命令库
const LINUX_CMDS = [
    // ===== 文件目录 =====
    { cmd: 'ls', cat: 'file', desc: '列出目录内容',
        params: [['-l', '长格式(权限/大小/时间)'], ['-a', '显示隐藏文件'], ['-h', '人类可读大小'], ['-R', '递归列出']],
        examples: [['ls -lah', '以长格式显示所有文件含隐藏']] },
    { cmd: 'cd', cat: 'file', desc: '切换工作目录',
        examples: [['cd /var/log', '进入指定目录'], ['cd ~', '回到主目录'], ['cd -', '回到上次目录']] },
    { cmd: 'pwd', cat: 'file', desc: '显示当前工作目录的绝对路径' },
    { cmd: 'cp', cat: 'file', desc: '复制文件或目录',
        params: [['-r', '递归复制目录'], ['-i', '覆盖前确认'], ['-p', '保留属性']],
        examples: [['cp -r src dst', '复制整个目录']] },
    { cmd: 'mv', cat: 'file', desc: '移动/重命名文件或目录',
        examples: [['mv old.txt new.txt', '重命名'], ['mv f.txt /tmp/', '移动到指定目录']] },
    { cmd: 'rm', cat: 'file', desc: '删除文件或目录（谨慎使用）',
        params: [['-r', '递归删除目录'], ['-f', '强制删除不确认'], ['-i', '删除前确认']],
        examples: [['rm -rf build/', '强制递归删除目录']] },
    { cmd: 'mkdir', cat: 'file', desc: '创建目录',
        params: [['-p', '递归创建父目录']],
        examples: [['mkdir -p a/b/c', '递归创建多层目录']] },
    { cmd: 'touch', cat: 'file', desc: '创建空文件或更新时间戳',
        examples: [['touch a.txt', '创建或更新时间']] },
    { cmd: 'find', cat: 'file', desc: '按条件查找文件',
        examples: [['find . -name "*.log"', '按文件名查找'], ['find / -size +100M', '查找大于100M的文件'], ['find . -mtime -7', '查找7天内修改的文件']] },
    { cmd: 'tree', cat: 'file', desc: '树状显示目录结构',
        params: [['-L 2', '限制深度为2'], ['-d', '只显示目录']] },
    { cmd: 'ln', cat: 'file', desc: '创建链接',
        examples: [['ln -s /opt/app app', '创建软链接']] },

    // ===== 文本处理 =====
    { cmd: 'cat', cat: 'text', desc: '查看/拼接文件内容',
        params: [['-n', '显示行号']],
        examples: [['cat a.txt b.txt > c.txt', '合并文件']] },
    { cmd: 'grep', cat: 'text', desc: '文本搜索/过滤',
        params: [['-i', '忽略大小写'], ['-r', '递归搜索'], ['-n', '显示行号'], ['-v', '反向匹配']],
        examples: [['grep -rn "TODO" .', '递归搜索关键词'], ['grep -v "^#" f.conf', '排除注释行']] },
    { cmd: 'sed', cat: 'text', desc: '流编辑器，文本替换/编辑',
        examples: [['sed -i "s/old/new/g" f.txt', '原地全局替换'], ['sed -n "5,10p" f.txt', '打印5-10行']] },
    { cmd: 'awk', cat: 'text', desc: '强大的文本分析工具，按列处理',
        examples: [['awk "{print $1}" f.txt', '打印第一列'], ['awk -F: "{print $1}" /etc/passwd', '按:分隔取用户名']] },
    { cmd: 'head', cat: 'text', desc: '显示文件开头内容',
        examples: [['head -n 20 f.log', '显示前20行']] },
    { cmd: 'tail', cat: 'text', desc: '显示文件末尾内容',
        params: [['-f', '持续跟踪追加内容']],
        examples: [['tail -f app.log', '实时查看日志'], ['tail -n 100 f.log', '显示最后100行']] },
    { cmd: 'wc', cat: 'text', desc: '统计行数/单词数/字节数',
        params: [['-l', '行数'], ['-w', '单词数'], ['-c', '字节数']],
        examples: [['wc -l f.txt', '统计行数']] },
    { cmd: 'sort', cat: 'text', desc: '排序文本行',
        params: [['-n', '按数值排序'], ['-r', '逆序'], ['-u', '去重']] },
    { cmd: 'uniq', cat: 'text', desc: '去除相邻重复行（常配合 sort）',
        examples: [['sort f.txt | uniq -c', '统计每行出现次数']] },
    { cmd: 'cut', cat: 'text', desc: '按分隔符/列截取',
        examples: [['cut -d, -f2 f.csv', '取CSV第2列']] },
    { cmd: 'tr', cat: 'text', desc: '字符转换/删除',
        examples: [['echo "HELLO" | tr A-Z a-z', '转小写']] },
    { cmd: 'tee', cat: 'text', desc: '同时输出到屏幕和文件',
        examples: [['cmd | tee out.log', '保存并显示输出']] },
    { cmd: 'less', cat: 'text', desc: '分页查看大文件（q退出）' },
    { cmd: 'xargs', cat: 'text', desc: '把输入作为参数传给后续命令',
        examples: [['find . -name "*.tmp" | xargs rm', '批量删除']] },

    // ===== 进程管理 =====
    { cmd: 'ps', cat: 'proc', desc: '查看进程',
        examples: [['ps aux', '查看所有进程'], ['ps -ef | grep nginx', '查找nginx进程']] },
    { cmd: 'top', cat: 'proc', desc: '实时进程与系统资源监控' },
    { cmd: 'htop', cat: 'proc', desc: '更友好的交互式进程监控（需安装）' },
    { cmd: 'kill', cat: 'proc', desc: '结束进程',
        params: [['-9', '强制杀掉']],
        examples: [['kill -9 1234', '强制结束PID 1234']] },
    { cmd: 'killall', cat: 'proc', desc: '按进程名结束',
        examples: [['killall nginx', '结束所有nginx进程']] },
    { cmd: 'jobs', cat: 'proc', desc: '查看后台任务',
        examples: [['jobs -l', '列出后台任务及PID']] },
    { cmd: 'bg', cat: 'proc', desc: '将任务放到后台运行' },
    { cmd: 'fg', cat: 'proc', desc: '将后台任务调到前台' },
    { cmd: 'nohup', cat: 'proc', desc: '忽略挂断信号运行命令',
        examples: [['nohup ./run.sh &', '后台持久运行']] },

    // ===== 网络 =====
    { cmd: 'ping', cat: 'net', desc: '测试网络连通性',
        examples: [['ping -c 4 baidu.com', 'ping 4次后停止']] },
    { cmd: 'curl', cat: 'net', desc: '命令行 HTTP 请求工具',
        examples: [['curl -O url', '下载文件'], ['curl -X POST -d "a=1" url', 'POST请求'], ['curl -I url', '只看响应头']] },
    { cmd: 'wget', cat: 'net', desc: '下载文件',
        examples: [['wget -c url', '断点续传下载']] },
    { cmd: 'netstat', cat: 'net', desc: '查看网络连接/端口',
        examples: [['netstat -tlnp', '查看监听端口及进程']] },
    { cmd: 'ss', cat: 'net', desc: '更快的 socket 统计（netstat 替代）',
        examples: [['ss -tlnp', '查看监听TCP端口']] },
    { cmd: 'scp', cat: 'net', desc: '远程安全复制文件',
        examples: [['scp f.txt user@host:/path', '上传到远程']] },
    { cmd: 'ssh', cat: 'net', desc: '远程登录',
        examples: [['ssh user@192.168.1.1', '登录远程主机']] },
    { cmd: 'ifconfig', cat: 'net', desc: '查看/配置网卡（旧）' },
    { cmd: 'ip', cat: 'net', desc: '查看/配置网络（ifconfig 替代）',
        examples: [['ip addr', '查看网卡地址']] },
    { cmd: 'nslookup', cat: 'net', desc: 'DNS 域名解析查询',
        examples: [['nslookup baidu.com', '查询域名IP']] },

    // ===== 磁盘 =====
    { cmd: 'df', cat: 'disk', desc: '查看磁盘使用情况',
        params: [['-h', '人类可读']],
        examples: [['df -h', '查看各分区使用率']] },
    { cmd: 'du', cat: 'disk', desc: '查看目录/文件占用空间',
        params: [['-h', '人类可读'], ['-s', '只显示汇总']],
        examples: [['du -sh *', '查看当前目录各项大小'], ['du -h --max-depth=1', '限制深度']] },
    { cmd: 'lsblk', cat: 'disk', desc: '列出块设备' },
    { cmd: 'mount', cat: 'disk', desc: '挂载文件系统',
        examples: [['mount /dev/sdb1 /mnt', '挂载分区到/mnt']] },
    { cmd: 'fdisk', cat: 'disk', desc: '磁盘分区管理（危险）' },

    // ===== 权限 =====
    { cmd: 'chmod', cat: 'perm', desc: '修改文件权限',
        examples: [['chmod 755 script.sh', '设置rwxr-xr-x'], ['chmod +x run.sh', '添加执行权限']] },
    { cmd: 'chown', cat: 'perm', desc: '修改文件所有者',
        params: [['-R', '递归修改']],
        examples: [['chown user:group f.txt', '修改属主属组']] },
    { cmd: 'sudo', cat: 'perm', desc: '以管理员权限执行',
        examples: [['sudo apt update', '以root权限执行']] },
    { cmd: 'umask', cat: 'perm', desc: '设置默认权限掩码' },

    // ===== 压缩归档 =====
    { cmd: 'tar', cat: 'arch', desc: '打包/解包归档',
        params: [['-c', '创建'], ['-x', '解包'], ['-z', 'gzip'], ['-v', '显示过程'], ['-f', '指定文件']],
        examples: [['tar -czvf a.tar.gz dir/', '压缩为tar.gz'], ['tar -xzvf a.tar.gz', '解压tar.gz']] },
    { cmd: 'gzip', cat: 'arch', desc: 'gzip 压缩/解压',
        examples: [['gzip -d f.gz', '解压']] },
    { cmd: 'zip', cat: 'arch', desc: '压缩为 zip',
        examples: [['zip -r a.zip dir/', '递归压缩目录']] },
    { cmd: 'unzip', cat: 'arch', desc: '解压 zip',
        examples: [['unzip a.zip -d /tmp', '解压到指定目录']] },

    // ===== 系统信息 =====
    { cmd: 'uname', cat: 'sys', desc: '查看系统/内核信息',
        examples: [['uname -a', '显示全部系统信息']] },
    { cmd: 'hostname', cat: 'sys', desc: '查看/设置主机名' },
    { cmd: 'uptime', cat: 'sys', desc: '查看运行时间与负载' },
    { cmd: 'free', cat: 'sys', desc: '查看内存使用',
        examples: [['free -h', '人类可读内存信息']] },
    { cmd: 'lscpu', cat: 'sys', desc: '查看 CPU 信息' },
    { cmd: 'date', cat: 'sys', desc: '查看/设置系统时间',
        examples: [['date "+%Y-%m-%d %H:%M"', '格式化输出时间']] },
    { cmd: 'whoami', cat: 'sys', desc: '显示当前用户名' },
    { cmd: 'env', cat: 'sys', desc: '查看环境变量' },
    { cmd: 'export', cat: 'sys', desc: '设置环境变量',
        examples: [['export PATH=$PATH:/opt/bin', '追加PATH']] },
    { cmd: 'alias', cat: 'sys', desc: '设置命令别名',
        examples: [['alias ll="ls -lah"', '设置ll别名']] },
    { cmd: 'history', cat: 'sys', desc: '查看命令历史' },
    { cmd: 'systemctl', cat: 'sys', desc: '管理 systemd 服务',
        examples: [['systemctl status nginx', '查看服务状态'], ['systemctl restart nginx', '重启服务'], ['systemctl enable nginx', '开机自启']] },

    // ===== 包管理 =====
    { cmd: 'apt', cat: 'pkg', desc: 'Debian/Ubuntu 包管理',
        examples: [['sudo apt update', '更新源'], ['sudo apt install nginx', '安装'], ['sudo apt remove nginx', '卸载']] },
    { cmd: 'yum', cat: 'pkg', desc: 'CentOS/RHEL 包管理（旧）',
        examples: [['sudo yum install httpd', '安装']] },
    { cmd: 'dnf', cat: 'pkg', desc: 'Fedora/CentOS8+ 包管理' },
    { cmd: 'pacman', cat: 'pkg', desc: 'Arch Linux 包管理',
        examples: [['sudo pacman -S vim', '安装']] },

    // ===== 用户 =====
    { cmd: 'useradd', cat: 'user', desc: '添加用户',
        examples: [['useradd -m -s /bin/bash tom', '创建用户并建主目录']] },
    { cmd: 'usermod', cat: 'user', desc: '修改用户属性',
        examples: [['usermod -aG docker tom', '追加到docker组']] },
    { cmd: 'passwd', cat: 'user', desc: '修改用户密码',
        examples: [['passwd tom', '修改tom密码']] },
    { cmd: 'su', cat: 'user', desc: '切换用户',
        examples: [['su - root', '切换到root并加载环境']] }
];

const linuxcmdTools = {
    _cat: 'all',

    init() {
        this.renderCats();
        this.filter();

        // 事件委托：点击示例代码复制其文本（避免内联拼接引号注入）
        document.getElementById('linuxcmdList').addEventListener('click', (e) => {
            const code = e.target.closest('.linuxcmd-ex-code');
            if (code) this.copyText(code.textContent);
        });
    },

    renderCats() {
        const wrap = document.getElementById('linuxcmdCats');
        const cats = [{ key: 'all', label: '🌟 全部' }, ...LINUX_CMD_CATS];
        wrap.innerHTML = cats.map(c =>
            `<button class="linuxcmd-cat ${c.key === 'all' ? 'active' : ''}" data-cat="${c.key}" onclick="linuxcmdTools.selectCat('${c.key}')">${c.label}</button>`
        ).join('');
    },

    selectCat(key) {
        this._cat = key;
        document.querySelectorAll('.linuxcmd-cat').forEach(b => {
            b.classList.toggle('active', b.dataset.cat === key);
        });
        this.filter();
    },

    filter() {
        const q = document.getElementById('linuxcmdSearch').value.trim().toLowerCase();
        const list = LINUX_CMDS.filter(c => {
            const catOk = this._cat === 'all' || c.cat === this._cat;
            if (!catOk) return false;
            if (!q) return true;
            const hay = (c.cmd + ' ' + c.desc + ' ' + (c.examples || []).flat().join(' ')).toLowerCase();
            return hay.includes(q);
        });

        document.getElementById('linuxcmdCount').textContent = `${list.length} / ${LINUX_CMDS.length} 条`;
        document.getElementById('linuxcmdList').innerHTML = list.length
            ? list.map(c => this.renderCard(c)).join('')
            : '<div class="linuxcmd-empty">未找到匹配的命令</div>';
    },

    renderCard(c) {
        const catLabel = (LINUX_CMD_CATS.find(x => x.key === c.cat) || {}).label || '';
        let params = '';
        if (c.params && c.params.length) {
            params = '<div class="linuxcmd-params">' +
                c.params.map(p => `<span class="linuxcmd-param"><code>${this.esc(p[0])}</code>${this.esc(p[1])}</span>`).join('') +
                '</div>';
        }
        let ex = '';
        if (c.examples && c.examples.length) {
            ex = '<div class="linuxcmd-examples">' +
                c.examples.map(e => `
                    <div class="linuxcmd-ex">
                        <code class="linuxcmd-ex-code" title="点击复制">${this.esc(e[0])}</code>
                        <span class="linuxcmd-ex-desc">${this.esc(e[1])}</span>
                    </div>`).join('') +
                '</div>';
        }
        return `
            <div class="linuxcmd-card">
                <div class="linuxcmd-top">
                    <code class="linuxcmd-name">${this.esc(c.cmd)}</code>
                    <span class="linuxcmd-tag">${catLabel}</span>
                </div>
                <div class="linuxcmd-desc">${this.esc(c.desc)}</div>
                ${params}${ex}
            </div>
        `;
    },

    copyText(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制：' + text);
        }).catch(() => showToast('复制失败'));
    },

    esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};

document.addEventListener('DOMContentLoaded', () => linuxcmdTools.init());
