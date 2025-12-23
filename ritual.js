// ==================== 仪式状态管理 ====================
const ritualState = {
    wish: '',
    incenseOffered: false,
    bowCount: 0,
    sutraPlayed: false,
    completed: false
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initDeityInfo();
    initNavigation();
    initWishInput();
    initRitualActions();
    initMusicControl();
    initModalEvents();

    // 全局点击监听，解锁音频自动播放限制
    document.addEventListener('click', activateAudio, { once: true });
});

function activateAudio() {
    const bgMusic = document.getElementById('bgMusic');
    const settings = JSON.parse(localStorage.getItem('appSettings')) || { musicEnabled: true };
    if (settings.musicEnabled && bgMusic.paused) {
        bgMusic.play().catch(e => console.log('背景音乐等待激活'));
        const musicIcon = document.querySelector('.music-icon');
        if (musicIcon) musicIcon.classList.add('playing');
    }

    // 针对移动端: 激活语音合成 (播放一个静音片段)
    if (window.speechSynthesis) {
        const dummy = new SpeechSynthesisUtterance('');
        dummy.volume = 0;
        window.speechSynthesis.speak(dummy);
    }
}

// ==================== 加载神明信息 ====================
function initDeityInfo() {
    const params = new URLSearchParams(window.location.search);
    const deityId = params.get('deity') || 'guanyin_songzi';

    const deity = dataManager.getDeityById(deityId);
    if (!deity) {
        console.error('未找到神明数据:', deityId);
        return;
    }

    ritualState.currentDeity = deity;

    // 更新页面标题
    document.title = `${deity.name} - 心安所寄`;

    // 更新名号和简介
    document.getElementById('deityNameDisplay').textContent = deity.name;
    document.getElementById('deityDescDisplay').textContent = deity.description;

    // 更新神明图片
    const container = document.getElementById('deityImageContainer');
    if (deity.image) {
        container.innerHTML = `<img src="${deity.image}" alt="${deity.name}" class="deity-full-img">`;
    }

    // 更新详情弹窗内容
    document.getElementById('modalDeityName').textContent = deity.name;
    document.getElementById('modalDeityBackground').textContent = deity.background;
    document.getElementById('modalDeityIntro').textContent = deity.detailedIntro || deity.background;

    const scenarioList = document.getElementById('modalScenarios');
    scenarioList.innerHTML = deity.scenarios.map(s => `<li>${s}</li>`).join('');

    // 初始化音频路径 (增加默认兜底音乐)
    const DEFAULT_ZEN_MUSIC = "https://www.chosic.com/wp-content/uploads/2021/07/The-Zen-Way.mp3";
    const bgMusic = document.getElementById('bgMusic');

    if (deity.musicUrl) {
        bgMusic.src = deity.musicUrl;
    } else {
        bgMusic.src = DEFAULT_ZEN_MUSIC;
    }

    // 如果设置开启了音乐,则尝试播放
    const settings = JSON.parse(localStorage.getItem('appSettings')) || { musicEnabled: true };
    if (settings.musicEnabled) {
        bgMusic.play().catch(e => console.log('自动播放背景音乐受阻'));
    }
    const sutraAudio = document.getElementById('sutraAudio');
    if (deity.sutraUrl) {
        sutraAudio.src = deity.sutraUrl;
    }
}

// 弹窗控制
function initModalEvents() {
    const showBtn = document.getElementById('showDeityInfo');
    const modal = document.getElementById('deityDetailModal');
    const closeBtn = modal.querySelector('.modal-close');

    showBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// ==================== 导航控制 ====================
function initNavigation() {
    const backBtn = document.querySelector('.back-btn');

    backBtn.addEventListener('click', () => {
        // 返回首页或上一页
        if (confirm('确定要离开仪式吗?')) {
            window.history.back();
        }
    });
}

// ==================== 许愿输入 ====================
function initWishInput() {
    const wishInput = document.querySelector('.wish-input');
    const currentCount = document.querySelector('.current-count');

    wishInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        currentCount.textContent = length;
        ritualState.wish = e.target.value;

        // 输入内容后更新进度
        updateProgress();

        // 字数接近上限时提示
        if (length >= 90) {
            currentCount.style.color = '#FFA500';
        } else {
            currentCount.style.color = '#FFD700';
        }
    });
}

// ==================== 仪式动作 ====================
function initRitualActions() {
    const actionBtns = document.querySelectorAll('.action-btn');

    actionBtns.forEach(btn => {
        const action = btn.dataset.action;

        btn.addEventListener('click', () => {
            handleAction(action, btn);
        });
    });
}

// ==================== 处理仪式动作 ====================
function handleAction(action, btn) {
    switch (action) {
        case 'incense':
            offerIncense(btn);
            break;
        case 'bow':
            performBow(btn);
            break;
        case 'sutra':
            playSutra(btn);
            break;
    }
}

// ==================== 上香 ====================
function offerIncense(btn) {
    if (ritualState.incenseOffered) {
        showToast('已经上过香了');
        return;
    }

    // 显示上香场景
    const overlay = document.querySelector('.incense-overlay');
    overlay.classList.remove('hidden');

    // 播放音效
    const bellSound = document.getElementById('bellSound');
    if (bellSound) {
        bellSound.currentTime = 0;
        bellSound.play().catch(() => console.log('音效激活中'));
    }

    // 展现神明专属话语 (神启)
    setTimeout(() => {
        showDeityVoice();
    }, 1000); // 烟雾升起1秒后显现话语

    // 生成烟雾粒子
    const smokeContainers = overlay.querySelectorAll('.smoke-particles');
    const timers = [];
    smokeContainers.forEach(container => {
        const timer = setInterval(() => {
            const p = document.createElement('div');
            p.className = 'smoke-particle-node';
            p.style.cssText = `
                position: absolute;
                left: ${Math.random() * 20 - 10}px;
                width: ${5 + Math.random() * 10}px;
                height: ${5 + Math.random() * 10}px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                filter: blur(5px);
                animation: smokeRise 3s forwards;
            `;
            container.appendChild(p);
            setTimeout(() => p.remove(), 3000);
        }, 300);
        timers.push(timer);
    });

    // 震动
    if (navigator.vibrate) navigator.vibrate(200);

    // 3秒后隐藏动画
    setTimeout(() => {
        timers.forEach(t => clearInterval(t));
        overlay.classList.add('hidden');
        ritualState.incenseOffered = true;
        btn.classList.add('completed');
        updateProgress();
        showToast('虔诚上香,心怀慈悲');
    }, 4000);
}

// ==================== 叩拜 ====================
function performBow(btn) {
    if (ritualState.bowCount >= 3) {
        showToast('已完成三次叩拜');
        return;
    }

    // 显示叩拜场景 (拱手作揖)
    const overlay = document.querySelector('.bow-overlay');
    overlay.classList.remove('hidden');

    // 播放音效
    const actionSound = document.getElementById('actionSound');
    if (actionSound) {
        actionSound.currentTime = 0;
        actionSound.play().catch(() => console.log('音效激活中'));
    }

    // 增加叩拜次数
    ritualState.bowCount++;

    // 更新显示
    const bowCountSpan = btn.querySelector('.bow-count');
    if (bowCountSpan) bowCountSpan.textContent = `${ritualState.bowCount}/3`;

    // 震动反馈
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    // 1.5秒后自动关闭覆盖层
    setTimeout(() => {
        overlay.classList.add('hidden');

        // 完成三次叩拜
        if (ritualState.bowCount === 3) {
            btn.classList.add('completed');
            if (bowCountSpan) bowCountSpan.style.display = 'none';
            updateProgress();
            showToast('三拜礼成,祈愿上达');
        }
    }, 1500);
}

// ==================== 诵经 ====================
// ==================== 诵经 ====================
function playSutra(btn) {
    if (ritualState.sutraPlayed) {
        showToast('已经诵过经了');
        return;
    }

    // 显示场景及灵光
    const sutraOverlay = document.querySelector('.sutra-overlay');
    const aura = document.getElementById('sutraEffectContainer');
    sutraOverlay.classList.remove('hidden');
    aura.classList.remove('hidden');

    // 动态设置诵经话语
    let mantraText = "南无阿弥陀佛";
    const mantraEl = sutraOverlay.querySelector('.sutra-instruction');
    if (ritualState.currentDeity && ritualState.currentDeity.sutraMantra) {
        mantraText = ritualState.currentDeity.sutraMantra;
        if (mantraEl) mantraEl.textContent = mantraText;
    }

    // 播放音频 (背景梵音)
    const audio = document.getElementById('sutraAudio');
    if (audio.src) {
        audio.play().catch(e => console.log('诵经音频播放受阻'));
    }

    // 朗诵禅语 (TTS)
    speakText(mantraText);

    // 生成经文漂浮动画
    const characters = ["唵", "嘛", "呢", "呗", "美", "吽", "妙", "法", "莲", "华", "福", "寿", "安", "泰"];
    const flowTimer = setInterval(() => {
        const char = document.createElement('div');
        char.className = 'sutra-char';
        char.textContent = characters[Math.floor(Math.random() * characters.length)];
        char.style.left = `${10 + Math.random() * 80}%`;
        char.style.animationDuration = `${3 + Math.random() * 2}s`;
        document.getElementById('sutraFlow').appendChild(char);
        setTimeout(() => char.remove(), 4000);
    }, 300);

    // 4秒后结束
    setTimeout(() => {
        clearInterval(flowTimer);
        sutraOverlay.classList.add('hidden');
        aura.classList.add('hidden');
        ritualState.sutraPlayed = true;
        btn.classList.add('completed');
        updateProgress();
        showToast('经音入耳,万事顺心');
    }, 5000);
}

// 语音朗诵禅语 (TTS) - 针对移动端优化
function speakText(text) {
    if (!window.speechSynthesis) {
        console.log('当前浏览器不支持语音合成');
        return;
    }

    // 取消之前的朗读
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    // 移动端兼容性处理: 确保Voices已加载
    const voices = window.speechSynthesis.getVoices();

    // 如果没有语音包(可能是异步加载中), 等待一下再尝试
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            setBestVoice(utterance, updatedVoices);
            window.speechSynthesis.speak(utterance);
            // 移除监听避免重复
            window.speechSynthesis.onvoiceschanged = null;
        };
        // 如果监听不起作用，直接尝试播放(使用默认语音)
        window.speechSynthesis.speak(utterance);
    } else {
        setBestVoice(utterance, voices);
        window.speechSynthesis.speak(utterance);
    }
}

function setBestVoice(utterance, voices) {
    // 优先寻找中文语音
    const zhVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('CN'));
    if (zhVoice) {
        utterance.voice = zhVoice;
    }
}

// ==================== 更新进度 ====================
function updateProgress() {
    const dots = document.querySelectorAll('.progress-dots .dot');
    const progressText = document.querySelector('.progress-text');
    const drawBtn = document.querySelector('.draw-btn');
    const btnText = drawBtn.querySelector('.btn-text');

    // 计算完成度
    let completedCount = 0;

    if (ritualState.wish.length > 0) completedCount++;
    if (ritualState.incenseOffered) completedCount++;
    if (ritualState.bowCount >= 3) completedCount++;
    if (ritualState.sutraPlayed) completedCount++;

    // 更新进度点
    dots.forEach((dot, index) => {
        if (index < completedCount) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });

    // 更新进度文字
    if (completedCount === 0) {
        progressText.textContent = '诚心初起,请继续仪式...';
    } else if (completedCount < 4) {
        progressText.textContent = `诚心渐显,神明已知... (${completedCount}/4)`;
    } else {
        progressText.textContent = '诚心已达,可抽签问卜';
        ritualState.completed = true;

        // 激活抽签按钮
        drawBtn.disabled = false;
        btnText.textContent = '抽取灵签';

        // 添加点击事件
        drawBtn.addEventListener('click', handleDrawLot);
    }
}

// ==================== 抽签 ====================
function handleDrawLot() {
    if (!ritualState.completed) {
        showToast('请先完成仪式');
        return;
    }

    showToast('即将进入抽签页面...');

    // 从URL获取神明和分类信息
    const params = new URLSearchParams(window.location.search);
    const deityId = params.get('deity') || 'guanyin_songzi';
    const categoryId = params.get('category') || 'fertility';

    // 保存数据到sessionStorage
    const drawData = {
        deityId: deityId,
        categoryId: categoryId,
        wish: ritualState.wish
    };
    sessionStorage.setItem('drawData', JSON.stringify(drawData));

    // 跳转到抽签页面
    setTimeout(() => {
        window.location.href = `draw.html?deity=${deityId}&category=${categoryId}&wish=${encodeURIComponent(ritualState.wish)}`;
    }, 1500);
}

// ==================== 音乐控制 ====================
function initMusicControl() {
    const musicBtn = document.querySelector('.music-btn');
    const musicIcon = musicBtn.querySelector('.music-icon');
    const bgMusic = document.getElementById('bgMusic');

    let isPlaying = false;

    // 初始化状态
    const settings = JSON.parse(localStorage.getItem('appSettings')) || { musicEnabled: true };
    if (!settings.musicEnabled) {
        musicIcon.classList.remove('playing');
        isPlaying = false;
    } else {
        isPlaying = true; // 假设自动播放已触发
    }

    musicBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;

        if (isPlaying) {
            musicIcon.classList.add('playing');
            bgMusic.play().catch(e => showToast('请点击页面激活背景音乐'));
        } else {
            musicIcon.classList.remove('playing');
            bgMusic.pause();
        }
    });
}

// ==================== Toast提示 ====================
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: toastFadeIn 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// ==================== 页面可见性处理 ====================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时暂停音乐
        console.log('页面隐藏,暂停音乐');
    } else {
        // 页面显示时恢复音乐
        console.log('页面显示,恢复音乐');
    }
});

// ==================== 神明专属声音/话语 (神启) ====================
function showDeityVoice() {
    const deity = ritualState.currentDeity;
    if (!deity || !deity.voiceMessage) return;

    const overlay = document.getElementById('deityVoiceOverlay');
    const textEl = document.getElementById('deityVoiceText');
    if (!overlay || !textEl) return;

    // 设置文本
    textEl.textContent = deity.voiceMessage;

    // 显示覆盖层
    overlay.classList.remove('hidden');
    overlay.classList.remove('fade-out');

    // 播放提示音 (可使用actionSound作为神示开启的声音)
    const actionSound = document.getElementById('actionSound');
    if (actionSound) {
        actionSound.currentTime = 0;
        actionSound.play().catch(() => { });
    }

    // 3.5秒后自动关闭
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 500);
    }, 3500);
}

// ==================== 调试信息 ====================
console.log('仪式页面已加载');
if (ritualState.currentDeity) {
    console.log('当前神明:', ritualState.currentDeity.name);
}
