// ==================== 数据管理器 ====================
// 统一管理所有数据的访问和操作

class DataManager {
    constructor() {
        this.categories = DATABASE.categories;
        this.deities = DATABASE.deities;

        // 合并所有part文件的签文数据
        this.fortunes = this.mergeFortunes();
    }

    // 合并所有签文数据
    mergeFortunes() {
        const merged = {};

        // 合并主文件的签文
        if (typeof FORTUNE_DATABASE !== 'undefined') {
            Object.assign(merged, FORTUNE_DATABASE);
        }

        // 合并part1-6的签文
        const parts = [
            typeof FORTUNE_DATABASE_PART1 !== 'undefined' ? FORTUNE_DATABASE_PART1 : null,
            typeof FORTUNE_DATABASE_PART2 !== 'undefined' ? FORTUNE_DATABASE_PART2 : null,
            typeof FORTUNE_DATABASE_PART3 !== 'undefined' ? FORTUNE_DATABASE_PART3 : null,
            typeof FORTUNE_DATABASE_PART4 !== 'undefined' ? FORTUNE_DATABASE_PART4 : null,
            typeof FORTUNE_DATABASE_PART5 !== 'undefined' ? FORTUNE_DATABASE_PART5 : null,
            typeof FORTUNE_DATABASE_PART6 !== 'undefined' ? FORTUNE_DATABASE_PART6 : null
        ];

        parts.forEach(part => {
            if (part) {
                Object.assign(merged, part);
            }
        });

        return merged;
    }

    // ==================== 分类相关 ====================

    // 获取所有分类
    getAllCategories() {
        return this.categories;
    }

    // 根据ID获取分类
    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId);
    }

    // 获取分类下的所有神明
    getDeitiesByCategory(categoryId) {
        const category = this.getCategoryById(categoryId);
        if (!category) return [];

        return category.deities.map(deityId => this.deities[deityId]);
    }

    // ==================== 神明相关 ====================

    // 获取所有神明
    getAllDeities() {
        return Object.values(this.deities);
    }

    // 根据ID获取神明
    getDeityById(deityId) {
        return this.deities[deityId];
    }

    // 根据分类获取神明数量
    getDeityCountByCategory(categoryId) {
        const category = this.getCategoryById(categoryId);
        return category ? category.deities.length : 0;
    }

    // 搜索神明(按名称)
    searchDeities(keyword) {
        return this.getAllDeities().filter(deity =>
            deity.name.includes(keyword) ||
            deity.description.includes(keyword)
        );
    }

    // ==================== 签文相关 ====================

    // 抽取签文
    drawFortune(deityId) {
        const fortunes = this.fortunes[deityId];
        if (!fortunes || fortunes.length === 0) {
            // 如果该神明没有签文,返回通用签文
            return this.getDefaultFortune();
        }

        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const fortune = fortunes[randomIndex];

        // 添加额外信息
        return {
            ...fortune,
            deityId: deityId,
            deityName: this.deities[deityId]?.name,
            timestamp: new Date().toISOString(),
            color: this.getLevelColor(fortune.level)
        };
    }

    // 获取默认签文(当神明没有签文时使用)
    getDefaultFortune() {
        return {
            number: "第一签",
            level: "中签",
            poem: [
                "诚心所至金石开",
                "神明护佑在身边",
                "保持善念行善事",
                "福报自然会到来"
            ],
            interpretation: "您的诚心已被神明感知。虽然当前可能还没有明显的变化,但只要保持善念,积极行动,好的结果终会到来。建议您保持耐心,继续努力,相信一切都是最好的安排。",
            suggestions: [
                "保持积极乐观的心态",
                "多做善事,积累福报",
                "相信自己,坚持努力",
                "保持耐心,等待时机",
                "感恩当下,珍惜拥有"
            ],
            color: "#87CEEB"
        };
    }

    // 根据签级获取颜色
    getLevelColor(level) {
        const colors = {
            '上上签': '#D4AF37',
            '上签': '#F4A460',
            '中签': '#87CEEB',
            '下签': '#B0C4DE'
        };
        return colors[level] || '#999999';
    }

    // 格式化签诗
    formatPoem(poemArray) {
        return poemArray.join(',\n') + '。';
    }

    // 获取神明的所有签文
    getAllFortunesForDeity(deityId) {
        return this.fortunes[deityId] || [];
    }

    // 按签级筛选签文
    getFortunesByLevel(deityId, level) {
        const fortunes = this.fortunes[deityId] || [];
        return fortunes.filter(f => f.level === level);
    }

    // 获取签文统计信息
    getFortuneStatistics(deityId) {
        const fortunes = this.fortunes[deityId] || [];
        const stats = {
            total: fortunes.length,
            byLevel: {
                '上上签': 0,
                '上签': 0,
                '中签': 0,
                '下签': 0
            }
        };

        fortunes.forEach(f => {
            if (stats.byLevel[f.level] !== undefined) {
                stats.byLevel[f.level]++;
            }
        });

        return stats;
    }

    // 获取所有签文的总数
    getTotalFortuneCount() {
        let total = 0;
        for (const deityId in this.fortunes) {
            total += this.fortunes[deityId].length;
        }
        return total;
    }

    // 获取已加载签文的神明列表
    getLoadedDeityIds() {
        return Object.keys(this.fortunes);
    }

    // 检查神明是否有签文
    hasFortunesForDeity(deityId) {
        return this.fortunes[deityId] && this.fortunes[deityId].length > 0;
    }

    // 抽取特定签级的签文
    drawFortuneByLevel(deityId, level) {
        const fortunes = this.getFortunesByLevel(deityId, level);
        if (fortunes.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        const fortune = fortunes[randomIndex];

        return {
            ...fortune,
            deityId: deityId,
            deityName: this.deities[deityId]?.name,
            timestamp: new Date().toISOString(),
            color: this.getLevelColor(fortune.level)
        };
    }

    // 获取签文的完整信息(包含神明信息)
    getFortuneWithDeityInfo(deityId, fortuneNumber) {
        const fortunes = this.fortunes[deityId] || [];
        const fortune = fortunes.find(f => f.number === fortuneNumber);

        if (!fortune) {
            return null;
        }

        const deity = this.getDeityById(deityId);

        return {
            ...fortune,
            deityId: deityId,
            deityName: deity?.name,
            deityDescription: deity?.description,
            deityImage: deity?.image,
            categoryId: deity?.category,
            color: this.getLevelColor(fortune.level)
        };
    }

    // ==================== 本地存储相关 ====================

    // 保存祈愿记录
    savePrayerRecord(record) {
        const records = this.getPrayerRecords();
        records.unshift({
            ...record,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        });

        // 最多保存100条记录
        if (records.length > 100) {
            records.pop();
        }

        localStorage.setItem('prayer_records', JSON.stringify(records));
        return records[0];
    }

    // 获取祈愿记录
    getPrayerRecords() {
        const records = localStorage.getItem('prayer_records');
        return records ? JSON.parse(records) : [];
    }

    // 删除祈愿记录
    deletePrayerRecord(recordId) {
        const records = this.getPrayerRecords();
        const filtered = records.filter(r => r.id !== recordId);
        localStorage.setItem('prayer_records', JSON.stringify(filtered));
        return filtered;
    }

    // 清空所有记录
    clearAllRecords() {
        localStorage.removeItem('prayer_records');
    }

    // 清空所有数据(包含记录与设置)
    clearAllData() {
        localStorage.removeItem('prayer_records');
        localStorage.removeItem('app_settings');
        localStorage.removeItem('appSettings'); // 兼容两种可能的键名
    }

    // 获取所有记录 (兼容 records.js 调用)
    getAllRecords() {
        return this.getPrayerRecords();
    }

    // 按神明ID筛选记录
    getRecordsByDeity(deityId) {
        const records = this.getPrayerRecords();
        return records.filter(r => r.deityId === deityId);
    }

    // 按分类ID筛选记录
    getRecordsByCategory(categoryId) {
        const records = this.getPrayerRecords();
        return records.filter(r => r.categoryId === categoryId);
    }

    // 获取最近N条记录
    getRecentRecords(count = 10) {
        const records = this.getPrayerRecords();
        return records.slice(0, count);
    }

    // 按日期范围筛选记录
    getRecordsByDateRange(startDate, endDate) {
        const records = this.getPrayerRecords();
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return records.filter(r => {
            const recordTime = new Date(r.timestamp).getTime();
            return recordTime >= start && recordTime <= end;
        });
    }

    // 获取今天的记录
    getTodayRecords() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return this.getRecordsByDateRange(today, tomorrow);
    }

    // 搜索记录(按心愿内容)
    searchRecords(keyword) {
        const records = this.getPrayerRecords();
        return records.filter(r =>
            r.wish && r.wish.includes(keyword)
        );
    }

    // 获取收藏的记录
    getFavoriteRecords() {
        const records = this.getPrayerRecords();
        return records.filter(r => r.isFavorite === true);
    }

    // 切换收藏状态
    toggleFavorite(recordId) {
        const records = this.getPrayerRecords();
        const record = records.find(r => r.id === recordId);

        if (record) {
            record.isFavorite = !record.isFavorite;
            localStorage.setItem('prayer_records', JSON.stringify(records));
            return record;
        }

        return null;
    }

    // 更新记录备注
    updateRecordNote(recordId, note) {
        const records = this.getPrayerRecords();
        const record = records.find(r => r.id === recordId);

        if (record) {
            record.note = note;
            record.updatedAt = new Date().toISOString();
            localStorage.setItem('prayer_records', JSON.stringify(records));
            return record;
        }

        return null;
    }

    // 获取统计信息
    getStatistics() {
        const records = this.getPrayerRecords();

        // 统计各分类的祈愿次数
        const categoryStats = {};
        const deityStats = {};

        records.forEach(record => {
            // 分类统计
            const category = record.categoryId || 'unknown';
            categoryStats[category] = (categoryStats[category] || 0) + 1;

            // 神明统计
            const deity = record.deityId || 'unknown';
            deityStats[deity] = (deityStats[deity] || 0) + 1;
        });

        // 找出最常祈愿的神明
        let mostPrayedDeity = null;
        let maxCount = 0;
        for (const [deityId, count] of Object.entries(deityStats)) {
            if (count > maxCount) {
                maxCount = count;
                mostPrayedDeity = deityId;
            }
        }

        return {
            totalCount: records.length,
            categoryStats,
            deityStats,
            mostPrayedDeity: mostPrayedDeity ? this.deities[mostPrayedDeity]?.name : '无',
            lastPrayTime: records.length > 0 ? records[0].timestamp : null
        };
    }

    // ==================== 设置相关 ====================

    // 获取设置
    getSettings() {
        const settings = localStorage.getItem('app_settings');
        return settings ? JSON.parse(settings) : this.getDefaultSettings();
    }

    // 保存设置
    saveSettings(settings) {
        localStorage.setItem('app_settings', JSON.stringify(settings));
    }

    // 默认设置
    getDefaultSettings() {
        return {
            musicEnabled: true,
            soundEnabled: true,
            vibrationEnabled: true,
            reminderEnabled: false,
            reminderTime: '09:00',
            theme: 'light'
        };
    }

    // ==================== 工具方法 ====================

    // 获取相对时间描述
    getRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        return time.toLocaleDateString('zh-CN');
    }

    // 格式化日期时间
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}.${month}.${day} ${hours}:${minutes}`;
    }

    // 验证数据完整性
    validateData() {
        const issues = [];

        // 检查分类
        this.categories.forEach(category => {
            if (!category.id || !category.name) {
                issues.push(`分类数据不完整: ${category.id}`);
            }

            // 检查分类下的神明是否存在
            category.deities.forEach(deityId => {
                if (!this.deities[deityId]) {
                    issues.push(`神明不存在: ${deityId} (分类: ${category.name})`);
                }
            });
        });

        // 检查神明
        Object.entries(this.deities).forEach(([id, deity]) => {
            if (!deity.name || !deity.category) {
                issues.push(`神明数据不完整: ${id}`);
            }
        });

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // 导出数据(用于备份)
    exportData() {
        return {
            records: this.getPrayerRecords(),
            settings: this.getSettings(),
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
    }

    // 导入数据(用于恢复)
    importData(data) {
        try {
            if (data.records) {
                localStorage.setItem('prayer_records', JSON.stringify(data.records));
            }
            if (data.settings) {
                localStorage.setItem('app_settings', JSON.stringify(data.settings));
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// ==================== 创建全局实例 ====================
const dataManager = new DataManager();

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataManager, dataManager };
}
