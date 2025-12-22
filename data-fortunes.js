// ==================== 心安所寄 - 完整签文数据库 ====================
// 版本: V3.0 扩充版
// 创建日期: 2025年12月22日
// 总计: 18位神明 × 30条签文 = 540条完整签文
//
// 说明: 
// 1. 为了保证加载性能, 签文数据分布在 data-fortunes-part1.js 至 part6.js 中。
// 2. 本文件保留核心结构和工具函数。
// 3. 所有签文均已扩充至30条, 且新增签文均为正向签文(上上/上/中), 移除了新签文中的下签干扰。

const FORTUNE_DATABASE = {
    // 基础结构占位, 实际数据由 DataManager 合并各 Part 文件获得
};

// ==================== 工具函数 ====================
const FortuneUtils = {
    // 根据签级获取颜色
    getLevelColor(level) {
        const colors = {
            '上上签': '#D4AF37', // 金色
            '上签': '#F4A460',   // 橙色
            '中签': '#87CEEB',   // 天蓝色
            '下签': '#B0C4DE'    // 灰蓝色
        };
        return colors[level] || '#999999';
    },

    // 格式化签诗
    formatPoem(poemArray) {
        if (!poemArray || !Array.isArray(poemArray)) return '';
        return poemArray.join(',\n') + '。';
    }
};

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FORTUNE_DATABASE, FortuneUtils };
}
