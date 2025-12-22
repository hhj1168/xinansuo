// ==================== 祈愿记录处理逻辑 ====================

let allRecords = [];
let filteredRecords = [];
let currentCategory = 'all';
let recordToDelete = null;

document.addEventListener('DOMContentLoaded', () => {
    initPage();
});

function initPage() {
    loadData();
    initEventListeners();
    renderRecords();
    updateStats();
}

// ==================== 数据加载 ====================
function loadData() {
    allRecords = dataManager.getAllRecords();
    filteredRecords = [...allRecords];
}

// ==================== 初始化事件监听 ====================
function initEventListeners() {
    // 搜索开关
    document.getElementById('searchToggle').addEventListener('click', () => {
        const bar = document.getElementById('searchBar');
        bar.classList.toggle('hidden');
        if (!bar.classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        }
    });

    // 实时搜索
    document.getElementById('searchInput').addEventListener('input', (e) => {
        handleSearch(e.target.value.trim());
    });

    // 清除搜索
    document.getElementById('clearSearch').addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        input.value = '';
        handleSearch('');
        document.getElementById('searchBar').classList.add('hidden');
    });

    // 分类筛选
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            applyFilters();
        });
    });

    // 取消删除
    document.querySelector('.modal-btn-cancel').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.add('hidden');
        recordToDelete = null;
    });

    // 确认删除
    document.querySelector('.modal-btn-confirm').addEventListener('click', () => {
        if (recordToDelete) {
            confirmDeleteRecord(recordToDelete);
        }
    });
}

// ==================== 渲染记录列表 ====================
function renderRecords() {
    const listContainer = document.getElementById('recordsList');
    const emptyState = document.getElementById('emptyState');

    if (filteredRecords.length === 0) {
        listContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    listContainer.innerHTML = '';

    filteredRecords.forEach((record, index) => {
        const card = createRecordCard(record);
        // 添加交错场动画
        card.style.animation = `slideUp 0.4s ease-out forwards ${index * 0.05}s`;
        card.style.opacity = '0';
        listContainer.appendChild(card);
    });
}

// ==================== 创建单张卡片 ====================
function createRecordCard(record) {
    const categoryInfo = dataManager.getCategoryById(record.categoryId) || { icon: '🙏', color: '#666' };
    const deityInfo = dataManager.getDeityById(record.deityId) || { name: '未知神明' };
    const dateStr = formatDate(record.timestamp);
    const levelColor = dataManager.getLevelColor(record.lotLevel);

    const card = document.createElement('div');
    card.className = 'record-card';
    card.innerHTML = `
        <div class="category-icon-box" style="color: ${categoryInfo.color}">
            ${categoryInfo.icon}
        </div>
        <div class="deity-meta">
            <span class="deity-name">${deityInfo.name}</span>
            <span class="record-date">${dateStr}</span>
        </div>
        <div class="lot-badge" style="background: ${levelColor}22; color: ${levelColor}">
            ${record.lotLevel}
        </div>
        <div class="wish-snippet">
            ${record.wish || '默念祈愿,未录真言'}
        </div>
        <div class="card-footer">
            <div class="lot-summary">${record.lotNumber} · ${record.lotTitle || '灵签'}</div>
            <div class="card-actions">
                <button class="action-btn view" onclick="viewDetail('${record.id}')">
                    查看签详情
                </button>
                <button class="action-btn delete" onclick="handleDeleteClick('${record.id}')">
                    删除
                </button>
            </div>
        </div>
    `;

    return card;
}

// ==================== 交互处理 ====================
function handleSearch(query) {
    applyFilters(query);
}

function applyFilters(searchQuery = '') {
    const query = searchQuery.toLowerCase();

    filteredRecords = allRecords.filter(record => {
        const matchCategory = currentCategory === 'all' || record.categoryId === currentCategory;

        if (!matchCategory) return false;

        if (!query) return true;

        const deity = dataManager.getDeityById(record.deityId);
        const deityName = deity ? deity.name : '';
        const wish = record.wish || '';

        return deityName.toLowerCase().includes(query) || wish.toLowerCase().includes(query);
    });

    renderRecords();
}

function handleDeleteClick(id) {
    recordToDelete = id;
    document.getElementById('deleteModal').classList.remove('hidden');
}

function confirmDeleteRecord(id) {
    const success = dataManager.deletePrayerRecord(id);
    if (success) {
        document.getElementById('deleteModal').classList.add('hidden');
        loadData();
        applyFilters();
        updateStats();
        showToast('已删除记录');
    }
}

function viewDetail(id) {
    // 寻找对应记录
    const record = allRecords.find(r => r.id === id);
    if (record) {
        // 将记录数据暂存到sessionStorage,模拟刚抽完签的状态跳转到抽签页查看
        // 这样可以复用draw.html的展示逻辑,但需要抽签页支持从ID加载
        // 由于当前draw.html是从URL params加载,我们构造一个完整的参数
        const url = `draw.html?deity=${record.deityId}&category=${record.categoryId}&id=${record.id}&viewMode=history`;
        window.location.href = url;
    }
}

function updateStats() {
    const totalCountEl = document.getElementById('totalCount');
    const topCountEl = document.getElementById('topCount');

    totalCountEl.textContent = allRecords.length;

    const topCount = allRecords.filter(r =>
        r.lotLevel.includes('上') || r.lotLevel.includes('吉')
    ).length;

    topCountEl.textContent = topCount;
}

// ==================== 工具函数 ====================
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${y}/${m}/${d} ${hh}:${mm}`;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 0.85rem;
        z-index: 2000;
        animation: fadeIn 0.3s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 添加CSS动画
if (!document.getElementById('records-animation')) {
    const style = document.createElement('style');
    style.id = 'records-animation';
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}
