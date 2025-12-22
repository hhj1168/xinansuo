// ==================== 分类详情页逻辑 ====================

document.addEventListener('DOMContentLoaded', () => {
    initCategoryPage();
});

function initCategoryPage() {
    // 1. 获取URL参数
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('type') || params.get('id');

    if (!categoryId) {
        console.error('未指定分类ID');
        showEmptyState();
        return;
    }

    // 2. 获取数据
    const category = dataManager.getCategoryById(categoryId);
    if (!category) {
        console.error('分类不存在:', categoryId);
        showEmptyState();
        return;
    }

    // 3. 渲染页面内容
    renderCategoryHero(category);
    renderDeityList(category);
}

// 渲染分类顶部区域
function renderCategoryHero(category) {
    const titleEl = document.getElementById('categoryTitle');
    const heroTitleEl = document.getElementById('heroTitle');
    const heroDescEl = document.getElementById('heroDesc');
    const heroIconEl = document.getElementById('heroIcon');
    const heroSection = document.getElementById('categoryHero');

    titleEl.textContent = category.name;
    heroTitleEl.textContent = category.fullDescription.split(',')[0] || category.name; // 用说明的一半作为标题
    heroDescEl.textContent = category.fullDescription;
    heroIconEl.textContent = category.icon;

    // 设置动态背景色
    heroSection.style.setProperty('--category-bg', category.gradient || '#fff');
    heroSection.style.setProperty('--category-text', category.color || '#333');
}

// 渲染神明列表
function renderDeityList(category) {
    const listContainer = document.getElementById('deityList');
    const deities = dataManager.getDeitiesByCategory(category.id);

    if (!deities || deities.length === 0) {
        showEmptyState();
        return;
    }

    listContainer.innerHTML = ''; // 清空加载中提示

    deities.forEach(deity => {
        const card = createDeityCard(deity, category);
        listContainer.appendChild(card);
    });

    // 智能预加载：在用户浏览列表时，后台静默加载高清大图
    preloadDeityFullImages(deities);
}

/**
 * 预加载神明高清大图 (WebP)
 * 利用浏览器空闲时间，确保跳转到仪式页时立绘秒开
 */
function preloadDeityFullImages(deities) {
    deities.forEach(deity => {
        if (deity.image) {
            const img = new Image();
            img.src = deity.image;
        }
    });
}

// 创建神明卡片
function createDeityCard(deity, category) {
    const card = document.createElement('article');
    card.className = 'deity-card';
    card.dataset.id = deity.id;

    // 适配场景显示
    const scenariosHtml = deity.scenarios ?
        `<div class="deity-scenarios"><span class="scenarios-label">适用:</span>${deity.scenarios.slice(0, 2).join(' · ')}</div>` :
        '';

    card.innerHTML = `
        <div class="deity-avatar-wrapper">
            <img src="${deity.avatar}" alt="${deity.name}" class="deity-avatar" loading="lazy" onerror="this.src='new_images/placeholder_avatar.png'">
        </div>
        <div class="deity-info">
            <h4 class="deity-name">${deity.name}</h4>
            <p class="deity-description">${deity.description}</p>
            ${scenariosHtml}
        </div>
        <div class="go-ritual-btn">去祈愿 →</div>
    `;

    // 绑定点击事件
    card.addEventListener('click', () => {
        const url = `ritual.html?deity=${deity.id}&category=${category.id}`;
        window.location.href = url;
    });

    return card;
}

function showEmptyState() {
    document.getElementById('categoryHero').classList.add('hidden');
    document.querySelector('.deity-list-section').classList.add('hidden');
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('categoryTitle').textContent = '分类详情';
}

function goToHome() {
    window.location.href = 'index.html';
}

// 获取分类相关主题色(如果data-manager没提供)
function getCategoryColor(categoryId) {
    const colors = {
        'fertility': '#E8B4B8',
        'love': '#F4C2C2',
        'career': '#B8D4E8',
        'wealth': '#F4E4C1',
        'health': '#C8E6C9',
        'safety': '#D1C4E9'
    };
    return colors[categoryId] || '#D4AF37';
}
