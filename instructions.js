/**
 * 使用说明页脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    initAccordion();
    initScrollAnimations();
});

/**
 * 初始化折叠面板 (Accordion)
 */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // 先关闭所有面板
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            // 如果点击的是之前关闭的，则打开它
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * 初始化简单的滚动入场动画
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(section);
    });
}
