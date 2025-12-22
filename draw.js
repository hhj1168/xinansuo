// ==================== 抽签结果页面脚本 ====================

// 全局变量
let currentFortune = null;
let currentDeity = null;
let currentCategory = null;
let currentWish = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
});

// 初始化页面
function initializePage() {
    // 从URL参数获取数据
    const params = new URLSearchParams(window.location.search);
    const deityId = params.get('deity');
    const categoryId = params.get('category');
    const wish = params.get('wish') || '';
    const recordId = params.get('id'); // 获取可能的记录ID
    const viewMode = params.get('viewMode'); // 获取视图模式

    // 如果指定了记录ID,则加载历史记录
    if (recordId) {
        loadHistoryRecord(recordId);
    } else if (!deityId) {
        // 如果没有参数,尝试从sessionStorage获取
        const savedData = sessionStorage.getItem('drawData');
        if (savedData) {
            const data = JSON.parse(savedData);
            loadFortuneData(data.deityId, data.categoryId, data.wish);
        } else {
            showError('缺少必要参数,即将返回首页');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } else {
        loadFortuneData(deityId, categoryId, wish);
    }

    // 绑定按钮事件
    bindEvents();
    // 初始化音频
    initMusic();
    // 激活音频自动播放监听
    initAudioActivation();
}

// 物理图片转Base64 (增强容错)
async function getBase64Image(imgUrl) {
    if (!imgUrl) return "";
    try {
        const resp = await fetch(imgUrl);
        const blob = await resp.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Base64转换退避:', imgUrl);
        return imgUrl; // 退回到原始路径
    }
}

// 全局点击激活音频 (解锁浏览器限制)
function initAudioActivation() {
    const handleInteraction = () => {
        const bgMusic = document.getElementById('bgMusic');
        const settings = JSON.parse(localStorage.getItem('appSettings')) || { musicEnabled: true };
        if (bgMusic && settings.musicEnabled && bgMusic.paused) {
            bgMusic.play().catch(() => { });
        }
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
    };
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
}

// 初始化音频
function initMusic() {
    const bgMusic = document.getElementById('bgMusic');
    if (!bgMusic) return;

    const deity = currentDeity || {};
    const DEFAULT_MUSIC = "https://www.chosic.com/wp-content/uploads/2021/07/The-Zen-Way.mp3";
    bgMusic.src = deity.musicUrl || DEFAULT_MUSIC;

    const settings = JSON.parse(localStorage.getItem('appSettings')) || { musicEnabled: true };
    if (settings.musicEnabled) {
        // 尝试自动播放
        bgMusic.play().catch(() => {
            console.log("等待用户交互后播放音乐");
            // 可以在用户第一次点击页面时播放
            document.addEventListener('click', () => {
                if (bgMusic.paused) bgMusic.play();
            }, { once: true });
        });
    }
}

// 加载历史记录
function loadHistoryRecord(id) {
    try {
        const records = dataManager.getAllRecords();
        const record = records.find(r => r.id === id);
        if (!record) {
            throw new Error('找不到该笔记录');
        }

        currentDeity = dataManager.getDeityById(record.deityId);
        currentCategory = dataManager.getCategoryById(record.categoryId);
        currentFortune = record.fortune;
        currentWish = record.wish;

        // 历史模式不需要开场动画
        document.getElementById('animationContainer').style.display = 'none';
        document.getElementById('fortuneContent').style.display = 'block';
        document.getElementById('actionButtons').style.display = 'flex';

        displayFortune();

        // 标记为已保存状态
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '✓ 已存档';
        }

        // 修改时间显示为记录时间
        const fortuneTime = document.getElementById('fortuneTime');
        if (fortuneTime) {
            fortuneTime.textContent = `祈愿时间: ${formatDateTime(new Date(record.timestamp))}`;
        }

    } catch (error) {
        console.error('加载历史记录失败:', error);
        showError('加载历史失败: ' + error.message);
    }
}

// 加载签文数据
function loadFortuneData(deityId, categoryId, wish) {
    try {
        // 获取神明信息
        currentDeity = dataManager.getDeityById(deityId);
        if (!currentDeity) {
            throw new Error('神明不存在');
        }

        // 获取分类信息
        if (categoryId) {
            currentCategory = dataManager.getCategoryById(categoryId);
        }

        // 保存心愿
        currentWish = decodeURIComponent(wish || '');

        // 检查是否有签文
        if (!dataManager.hasFortunesForDeity(deityId)) {
            throw new Error('该神明暂无签文');
        }

        // 抽取签文
        currentFortune = dataManager.drawFortune(deityId);

        // 开始动画流程
        startDrawAnimation();

    } catch (error) {
        console.error('加载签文失败:', error);
        showError('加载失败: ' + error.message);
        setTimeout(() => {
            history.back();
        }, 2000);
    }
}

// 开始抽签动画
function startDrawAnimation() {
    const animationContainer = document.getElementById('animationContainer');
    const fortuneContent = document.getElementById('fortuneContent');
    const actionButtons = document.getElementById('actionButtons');
    const stickText = document.getElementById('stickText');

    // 播放摇签音效
    const drawSound = document.getElementById('drawSound');
    if (drawSound) {
        drawSound.currentTime = 0;
        drawSound.play().catch(e => console.log('音效播放受阻'));
    }

    // 显示签号在签条上
    setTimeout(() => {
        stickText.textContent = currentFortune.number.replace('第', '').replace('签', '');
    }, 1500);

    // 2.5秒后隐藏动画,显示签文
    setTimeout(() => {
        animationContainer.style.display = 'none';
        fortuneContent.style.display = 'block';
        actionButtons.style.display = 'flex';
        displayFortune();
    }, 2500);
}

// 显示签文内容
function displayFortune() {
    // 显示神明信息
    const deityAvatar = document.getElementById('deityAvatar');
    const deityName = document.getElementById('deityName');

    deityAvatar.src = currentDeity.avatar || currentDeity.image;
    deityAvatar.alt = currentDeity.name;
    deityName.textContent = currentDeity.name;

    // 显示签号和签级
    const fortuneNumber = document.getElementById('fortuneNumber');
    const fortuneLevel = document.getElementById('fortuneLevel');

    fortuneNumber.textContent = currentFortune.number;
    fortuneLevel.textContent = currentFortune.level;

    // 设置签级样式
    fortuneLevel.className = 'fortune-level ' + getLevelClass(currentFortune.level);

    // 显示签诗
    const poemContent = document.getElementById('poemContent');
    poemContent.innerHTML = currentFortune.poem
        .map(line => `<p>${line}</p>`)
        .join('');

    // 显示白话解读
    const interpretationText = document.getElementById('interpretationText');
    interpretationText.textContent = currentFortune.interpretation;

    // 显示行动建议
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = currentFortune.suggestions
        .map(suggestion => `<li>${suggestion}</li>`)
        .join('');

    // 显示时间戳
    const fortuneTime = document.getElementById('fortuneTime');
    const now = new Date();
    fortuneTime.textContent = `抽签时间: ${formatDateTime(now)}`;
}

// 获取签级对应的CSS类
function getLevelClass(level) {
    const classMap = {
        '上上签': 'top',
        '上签': 'good',
        '中签': 'medium',
        '下签': 'low'
    };
    return classMap[level] || 'medium';
}

// 格式化日期时间
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

// 绑定事件
function bindEvents() {
    // 返回首页
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // 保存到记录
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveFortune);
    }

    // 再抽一次
    const drawAgainBtn = document.getElementById('drawAgainBtn');
    if (drawAgainBtn) {
        drawAgainBtn.addEventListener('click', drawAgain);
    }

    // 生成海报
    const savePosterBtn = document.getElementById('savePosterBtn');
    if (savePosterBtn) {
        savePosterBtn.addEventListener('click', savePoster);
    }
}

// 生成海报并预览下载 (高兼容性版本)
async function savePoster() {
    const posterContent = document.getElementById('fortuneContent');
    if (!posterContent) return;

    showToast('正在锦绣排版, 稍候...');

    if (typeof html2canvas === 'undefined') {
        showToast('组件加载中, 请刷新重试', 'error');
        return;
    }

    // 1. 资源预热: 尝试转Base64解决跨域污染
    const deityAvatar = document.getElementById('deityAvatar');
    if (deityAvatar && deityAvatar.src && !deityAvatar.src.startsWith('data:')) {
        const base64 = await getBase64Image(deityAvatar.src);
        if (base64 && base64.startsWith('data:')) deityAvatar.src = base64;
    }

    // 2. 渲染流程
    html2canvas(posterContent, {
        backgroundColor: '#FFF8E1',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
            const clonedContent = clonedDoc.getElementById('fortuneContent');
            if (clonedContent) {
                clonedContent.style.display = 'block';
                clonedContent.style.opacity = '1';
                clonedContent.style.visibility = 'visible';
                clonedContent.style.animation = 'none';
                clonedContent.style.transform = 'none';
                clonedContent.style.padding = '40px';
                clonedContent.style.boxShadow = 'none';

                clonedContent.querySelectorAll('*').forEach(el => {
                    el.style.opacity = '1';
                    el.style.animation = 'none';
                    el.style.visibility = 'visible';
                    el.style.transition = 'none';
                });

                // 品牌页脚注入
                const footer = clonedDoc.createElement('div');
                footer.style.cssText = 'margin-top:40px; text-align:center; color:#B8860B; font-family:serif; border-top:1px solid rgba(184,134,11,0.2); padding-top:20px;';
                footer.innerHTML = `
                    <div style="font-size:22px; font-weight:bold;">🏮 心安所寄</div>
                    <div style="font-size:12px; margin-top:5px; opacity:0.7;">— 愿你心安, 所寄有应 —</div>
                `;
                clonedContent.appendChild(footer);
            }
        }
    }).then(canvas => {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `灵签海报_${currentDeity.name}_${currentFortune.number}.png`;
            link.href = dataUrl;
            link.click();
            showToast('海报已保存到相册');
        } catch (exportError) {
            console.warn('Canvas导出受控:', exportError);
            showToast('受安全限制, 请长按屏幕保存截图', 'error');
        }
    }).catch(err => {
        console.error('Html2Canvas渲染故障:', err);
        showToast('生成受阻, 请手动截图', 'error');
    });
}

// 保存签文到记录
function saveFortune() {
    try {
        const record = dataManager.savePrayerRecord({
            categoryId: currentCategory?.id || '',
            categoryName: currentCategory?.name || '',
            deityId: currentDeity.id,
            deityName: currentDeity.name,
            wish: currentWish,
            fortune: currentFortune
        });

        console.log('记录已保存:', record);
        showToast('已保存到记录');

        // 禁用保存按钮,避免重复保存
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '✓ 已保存';
            saveBtn.style.opacity = '0.6';
        }

    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败,请重试', 'error');
    }
}

// 再抽一次
function drawAgain() {
    // 重新加载当前页面
    location.reload();
}

// 显示Toast提示
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = toast.querySelector('.toast-text');
    const toastIcon = toast.querySelector('.toast-icon');

    toastText.textContent = message;

    if (type === 'error') {
        toastIcon.textContent = '✗';
        toastIcon.style.color = '#f44336';
    } else {
        toastIcon.textContent = '✓';
        toastIcon.style.color = '#4CAF50';
    }

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 显示错误信息
function showError(message) {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 18px; color: #666; margin-bottom: 30px;">${message}</div>
            <button onclick="history.back()" style="
                padding: 12px 32px;
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                color: #fff;
                border: none;
                border-radius: 24px;
                font-size: 16px;
                cursor: pointer;
            ">返回</button>
        </div>
    `;
}

// ==================== 工具函数 ====================

// 分享功能(预留)
function shareFortune() {
    const shareText = `
我在「心安所寄」向${currentDeity.name}祈愿
抽到了${currentFortune.level} - ${currentFortune.number}

${currentFortune.poem.join('\n')}

${currentFortune.interpretation}
    `.trim();

    if (navigator.share) {
        navigator.share({
            title: '我的签文',
            text: shareText
        }).catch(err => console.log('分享取消'));
    } else {
        navigator.clipboard.writeText(shareText)
            .then(() => showToast('签文已复制到剪贴板'))
            .catch(() => showToast('复制失败', 'error'));
    }
}

// 打印签文
function printFortune() {
    window.print();
}

// ==================== 调试功能 ====================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('=== 抽签结果页面调试信息 ===');
    console.log('当前神明:', currentDeity);
    console.log('当前分类:', currentCategory);
    console.log('当前签文:', currentFortune);
    console.log('心愿内容:', currentWish);
    window.debugDraw = {
        deity: currentDeity,
        category: currentCategory,
        fortune: currentFortune,
        wish: currentWish,
        dataManager: dataManager
    };
}
