// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('正在初始化首页功能...');
        initAlmanac(); // 初始化黄历
        initLunarReminder(); // 初始化时令提醒
        initCategoryCards();
        initBottomNav();
        initSettingsButton();
        initAnimations();
        console.log('所有功能初始化成功');
    } catch (error) {
        console.error('初始化过程中出现错误:', error);
    }
});

// ==================== 黄历动态加载 ====================
// ==================== 黄历与日期动态加载 ====================
function initAlmanac() {
    updateDateDisplay(); // 更新日期显示 (万年历)

    const suitEl = document.getElementById('todaySuit');
    const avoidEl = document.getElementById('todayAvoid');

    if (!suitEl || !avoidEl) return;

    // 事项库
    const suitItems = ['祈福', '纳采', '祭祀', '开光', '求嗣', '出行', '安床', '修造', '入宅', '动土'];
    const avoidItems = ['忧虑', '动土', '修造', '词讼', '安葬', '破土', '伐木', '行丧', '挂匾', '纳畜'];

    const now = new Date();
    const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

    // 使用日期种子生成固定但随日期变化的随机数
    const getIndex = (items, seed) => {
        let s = seed;
        for (let i = 0; i < 3; i++) s = (s * 9301 + 49297) % 233280;
        return Math.floor((s / 233280.0) * items.length);
    };

    const sIndex = getIndex(suitItems, daySeed);
    const aIndex = getIndex(avoidItems, daySeed + 1);

    suitEl.textContent = `宜: ${suitItems[sIndex]}`;
    avoidEl.textContent = `忌: ${avoidItems[aIndex]}`;
}

// 更新万年历显示
function updateDateDisplay() {
    const now = new Date();
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

    // 1. 更新公历
    document.getElementById('solarYear').textContent = now.getFullYear();
    document.getElementById('solarDate').textContent = `${now.getMonth() + 1}/${now.getDate()}`;
    document.getElementById('solarWeek').textContent = weekDays[now.getDay()];

    // 2. 更新农历 (依赖 lunar-calendar.js)
    if (window.LunarCalendar) {
        const lunarData = window.LunarCalendar.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());

        // 显示农历年 (如: 癸卯年)
        document.getElementById('lunarYear').textContent = `${lunarData.gzYear}年`;

        // 显示农历日期 (如: 冬月十一)
        document.getElementById('lunarDate').textContent = `${lunarData.IMonthCn}${lunarData.IDayCn}`;

        // 显示节气 (如果有，否则显示生肖)
        if (lunarData.Term) {
            document.getElementById('lunarTerm').textContent = lunarData.Term;
            document.getElementById('lunarTerm').style.color = '#c44536'; // 节气高亮
        } else {
            document.getElementById('lunarTerm').textContent = `生肖:${lunarData.Animal}`;
            document.getElementById('lunarTerm').style.color = '#888';
        }
    }
}

// ==================== 时令提醒 (初一/十五) ====================
function initLunarReminder() {
    let settings = { reminderEnabled: false };
    try {
        const stored = localStorage.getItem('appSettings');
        if (stored) {
            settings = JSON.parse(stored);
        }
    } catch (e) {
        console.warn('读取设置失败, 使用默认值', e);
    }

    if (!settings || !settings.reminderEnabled) return;

    // 简易农历日期计算 (近似逻辑)
    // 实际生产环境应使用完整的库，此处为演示逻辑
    const getLunarDay = () => {
        const now = new Date();
        const start = new Date(2025, 0, 29); // 2025年春节(正月初一)
        const diff = Math.floor((now - start) / (24 * 3600 * 1000));
        const lunarDay = (diff % 29.5); // 近似月相周期
        return Math.floor(lunarDay) + 1;
    };

    const lunarDay = getLunarDay();
    const isSpecialDay = (lunarDay === 1 || lunarDay === 15);

    // 为了演示效果：如果今天是公历1号或15号也视为特殊日子
    const solarDay = new Date().getDate();
    const shouldShow = isSpecialDay || solarDay === 1 || solarDay === 15;

    if (shouldShow) {
        const modal = document.getElementById('lunarReminderModal');
        const dayText = document.getElementById('lunarDateText');
        const closeBtn = document.getElementById('closeReminder');
        const goBtn = document.getElementById('goToRitual');

        dayText.textContent = lunarDay === 15 ? '十五' : '初一';

        // 延迟显示，等待转场动画
        setTimeout(() => {
            modal.classList.remove('hidden');
        }, 1500);

        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        goBtn.addEventListener('click', () => {
            // 跳转到默认推荐分类 (姻缘与情感)
            window.location.href = 'category.html?type=love';
        });
    }
}

// ==================== 分类卡片交互 ====================
function initCategoryCards() {
    const cards = document.querySelectorAll('.category-card');

    cards.forEach(card => {
        // 点击事件
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            handleCategoryClick(category);
        });

        // 鼠标移动效果(仅桌面端)
        if (window.innerWidth > 768) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `
                    translateY(-4px) 
                    scale(1.02) 
                    perspective(1000px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        }

        // 触摸反馈(移动端)
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.98)';
        });

        card.addEventListener('touchend', () => {
            card.style.transform = '';
        });
    });
}

// ==================== 处理分类点击 ====================
function handleCategoryClick(category) {
    console.log(`选择分类: ${category}`);

    // 添加点击动画
    const clickedCard = document.querySelector(`[data-category="${category}"]`);
    clickedCard.style.animation = 'none';
    setTimeout(() => {
        clickedCard.style.animation = '';
    }, 10);

    // 跳转到分类详情页
    setTimeout(() => {
        window.location.href = `category.html?type=${category}`;
    }, 500);
}

// ==================== 获取分类名称 ====================
function getCategoryName(category) {
    const names = {
        'fertility': '生育与家庭',
        'love': '姻缘与情感',
        'career': '学业与事业',
        'wealth': '财富与商业',
        'health': '健康与长寿',
        'safety': '出行与平安'
    };
    return names[category] || category;
}

// ==================== 底部导航交互 ====================
function initBottomNav() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // 移除所有active状态
            navItems.forEach(nav => nav.classList.remove('active'));
            // 添加当前active状态
            item.classList.add('active');

            // 处理导航点击
            handleNavClick(index);
        });
    });
}

// ==================== 处理导航点击 ====================
function handleNavClick(index) {
    const pages = ['首页', '记录', '说明'];
    console.log(`导航到: ${pages[index]}`);

    if (index === 1) {
        window.location.href = 'records.html';
    } else if (index === 2) {
        window.location.href = 'instructions.html';
    }
}

// ==================== 设置按钮 ====================
function initSettingsButton() {
    const settingsBtn = document.querySelector('.settings-btn');

    settingsBtn.addEventListener('click', () => {
        window.location.href = 'settings.html';
    });
}

// ==================== 初始化动画 ====================
function initAnimations() {
    // 页面加载动画
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // 添加飘落花瓣效果(可选)
    if (window.innerWidth > 768) {
        createFloatingPetals();
    }
}

// ==================== 高级落花特效 (V2.0) ====================
function createFloatingPetals() {
    const petalsCount = 12; // 增加心领神会的落花数量
    const container = document.querySelector('.background-decoration');
    if (!container) return;

    for (let i = 0; i < petalsCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal-advanced';

        // 随机属性
        const size = 10 + Math.random() * 15;
        const drift = (Math.random() - 0.5) * 400; // 横向漂移范围
        const rotation = 360 + Math.random() * 720; // 旋转角度
        const duration = 15 + Math.random() * 15; // 持续时间
        const delay = Math.random() * 20;

        petal.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size * 0.8}px;
            --drift: ${drift}px;
            --rotation: ${rotation}deg;
            animation-duration: ${duration}s;
            animation-delay: -${delay}s;
        `;

        container.appendChild(petal);

        // 动画循环处理 (可选，CSS forwards 已处理单次，此处保持常驻渲染)
    }
}

// ==================== Toast提示 ====================
function showToast(message) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建新toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: toastFadeIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    // 添加动画
    if (!document.querySelector('#toast-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = `
            @keyframes toastFadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            @keyframes toastFadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 2秒后移除
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

// ==================== 响应式处理 ====================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 重新初始化需要响应式调整的功能
        console.log('窗口大小改变');
    }, 250);
});

// ==================== 性能优化 ====================
// 使用Intersection Observer优化动画
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });

    // 观察所有卡片
    document.querySelectorAll('.category-card').forEach(card => {
        observer.observe(card);
    });
}

// ==================== 调试信息 ====================
console.log('心安所寄 - 首页已加载');
console.log('当前屏幕宽度:', window.innerWidth);
console.log('当前屏幕高度:', window.innerHeight);
