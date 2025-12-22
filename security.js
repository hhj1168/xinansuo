/**
 * 心安所寄 - 核心安全与防剽窃模块
 * 
 * 功能：域名校验、反调试、品牌强制锁定
 */
(function () {
    // 1. 授权配置 (请在部署后将您的 GitHub 域名填入此处)
    const AUTHORIZED_DOMAINS = [
        'localhost',
        '127.0.0.1',
        'yourusername.github.io' // 替换为您的 GitHub Pages 地址
    ];

    // 2. 检查运行环境
    function checkSecurity() {
        const currentHost = window.location.hostname;
        const isAuthorized = AUTHORIZED_DOMAINS.some(domain => currentHost.includes(domain));

        if (!isAuthorized) {
            // 发现盗版：执行干扰
            document.documentElement.innerHTML = `
                <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1a0f0a; color:#E8D082; text-align:center; padding:20px; font-family:serif;">
                    <h1 style="font-size:40px;">⚠️ 发现非授权镜像</h1>
                    <p style="font-size:18px; line-height:1.8;">您正在访问的项目「心安所寄」为非授权克隆版本。<br>为了您的数据安全与祈愿灵验，请访问原作者唯一正版地址：</p>
                    <a href="https://yourusername.github.io" style="color:#FFF; background:#B8860B; padding:10px 20px; border-radius:5px; text-decoration:none; margin-top:20px;">点击访问正版项目</a>
                    <p style="margin-top:50px; opacity:0.5; font-size:12px;">© 2025 心安所寄 版权所有。禁止一切非法克隆行为。</p>
                </div>
            `;
            throw new Error("Unauthorized Domain Access");
        }
    }

    // 3. 屏蔽初级调试行为 (可选，增加扒皮难度)
    function disableEasyStealing() {
        // 屏蔽右键
        document.addEventListener('contextmenu', e => e.preventDefault());

        // 屏蔽常用快捷键 (F12, Ctrl+Shift+I等)
        document.addEventListener('keydown', e => {
            if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && e.keyCode === 73)) {
                e.preventDefault();
                console.log("%c🏮 心安所寄：尊重原创，谢绝剽窃", "color: #E8D082; font-size: 20px; font-weight: bold;");
            }
        });
    }

    // 4. 品牌水印强制检查
    function brandInsurance() {
        setInterval(() => {
            const footer = document.querySelector('.brand-footer'); // 如果有这个类
            if (footer && (getComputedStyle(footer).display === 'none' || getComputedStyle(footer).visibility === 'hidden')) {
                alert("检测到品牌标识被恶意隐藏，页面功能已锁定。");
                window.location.reload();
            }
        }, 3000);
    }

    // 执行安全逻辑
    try {
        checkSecurity();
        disableEasyStealing();
        // brandInsurance(); // 视需求开启
    } catch (e) {
        console.error("Security Halt!");
    }
})();
