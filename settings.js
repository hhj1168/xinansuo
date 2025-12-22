/**
 * 设置页逻辑脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initEventListeners();
});

/**
 * 从localStorage加载设置
 */
function loadSettings() {
    let settings = {
        musicEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        reminderEnabled: false,
        reminderTime: '08:00'
    };

    try {
        const stored = localStorage.getItem('appSettings');
        if (stored) {
            settings = JSON.parse(stored);
        }
    } catch (e) {
        console.error('加载设置失败:', e);
    }

    document.getElementById('musicToggle').checked = settings.musicEnabled;
    document.getElementById('soundToggle').checked = settings.soundEnabled;
    document.getElementById('vibrateToggle').checked = settings.vibrationEnabled;
    document.getElementById('reminderToggle').checked = settings.reminderEnabled;
    document.getElementById('reminderTime').value = settings.reminderTime;

    // 更新提醒时间盒的可见性
    updateReminderVisibility(settings.reminderEnabled);
}

/**
 * 初始化事件监听
 */
function initEventListeners() {
    // 基础开关
    const toggles = ['musicToggle', 'soundToggle', 'vibrateToggle', 'reminderToggle'];
    toggles.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            saveAllSettings();
            if (id === 'reminderToggle') {
                updateReminderVisibility(document.getElementById(id).checked);
            }
        });
    });

    // 提醒时间改变
    document.getElementById('reminderTime').addEventListener('change', saveAllSettings);

    // 导出数据
    document.getElementById('exportData').addEventListener('click', exportUserData);

    // 清空数据流程
    const clearBtn = document.getElementById('clearData');
    const modal = document.getElementById('clearModal');
    const cancelBtn = modal.querySelector('.modal-btn-cancel');
    const confirmBtn = modal.querySelector('.modal-btn-confirm');

    clearBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    confirmBtn.addEventListener('click', () => {
        try {
            if (typeof dataManager !== 'undefined') {
                dataManager.clearAllData();
            }
            // 物理兜底清空
            localStorage.removeItem('prayer_records');
            localStorage.removeItem('appSettings');
            localStorage.removeItem('app_settings');

            modal.classList.add('hidden');
            showToast('数据已清空');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            console.error('清空失败:', error);
            alert('操作失败, 请刷新重试');
        }
    });
}

/**
 * 保存所有设置到localStorage
 */
function saveAllSettings() {
    const settings = {
        musicEnabled: document.getElementById('musicToggle').checked,
        soundEnabled: document.getElementById('soundToggle').checked,
        vibrationEnabled: document.getElementById('vibrateToggle').checked,
        reminderEnabled: document.getElementById('reminderToggle').checked,
        reminderTime: document.getElementById('reminderTime').value
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
}

/**
 * 更新提醒时间盒的显示状态
 */
function updateReminderVisibility(visible) {
    const box = document.getElementById('reminderTimeBox');
    if (visible) {
        box.classList.remove('hidden');
    } else {
        box.classList.add('hidden');
    }
}

/**
 * 导出用户记录为JSON文件
 */
function exportUserData() {
    const records = dataManager.getAllRecords();
    if (records.length === 0) {
        showToast('暂无记录可导出');
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "xinansuo_backup_" + new Date().toLocaleDateString() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast('备份已导出');
}

/**
 * Toast提示
 */
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
