// 应用状态
const state = {
    currentPage: 'home',
    newsList: [],
    sidebarOpen: false
};

// DOM元素
const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    pageTitle: document.getElementById('page-title'),
    menuToggle: document.getElementById('menu-toggle'),
    sidebar: document.querySelector('.sidebar'),
    toast: document.getElementById('toast'),
    currentTime: document.getElementById('current-time'),
    currentDate: document.getElementById('current-date'),
    newsModal: document.getElementById('news-modal'),
    newsIframe: document.getElementById('news-iframe'),
    modalTitle: document.getElementById('modal-title'),
    modalGithub: document.getElementById('modal-github')
};

// 初始化
function init() {
    updateTime();
    setInterval(updateTime, 1000);
    loadNewsList();
    setupEventListeners();
    setupNavigation();
}

// 更新时间
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    if (elements.currentTime) {
        elements.currentTime.textContent = timeStr;
    }
    if (elements.currentDate) {
        elements.currentDate.textContent = dateStr;
    }
}

// 加载简报列表
async function loadNewsList() {
    // 预定义的简报列表
    const newsFiles = [
        { date: '2026-02-17', title: '2026年2月17日 每日简报' },
        { date: '2026-02-16', title: '2026年2月16日 每日简报' }
    ];
    
    state.newsList = newsFiles;
    
    // 更新统计
    document.getElementById('total-news').textContent = newsFiles.length;
    document.getElementById('news-count').textContent = newsFiles.length;
    
    // 渲染最近更新
    renderRecentUpdates();
    
    // 渲染简报浏览器
    renderNewsBrowser();
}

// 渲染最近更新
function renderRecentUpdates() {
    const container = document.getElementById('recent-news-list');
    if (!container) return;
    
    const recentNews = state.newsList.slice(0, 5);
    
    container.innerHTML = recentNews.map(news => `
        <a href="#" class="update-item" onclick="openNewsModal('${news.date}'); return false;">
            <span class="update-date">${formatDate(news.date)}</span>
            <span class="update-title">${news.title}</span>
            <span class="update-arrow">→</span>
        </a>
    `).join('');
}

// 渲染简报浏览器
function renderNewsBrowser() {
    const container = document.getElementById('news-browser');
    if (!container) return;
    
    const latestNews = state.newsList[0];
    
    container.innerHTML = `
        <div class="news-list">
            <div class="news-list-header">历史简报</div>
            <div class="news-items">
                ${state.newsList.map((news, index) => `
                    <div class="news-item ${index === 0 ? 'active' : ''}" onclick="selectNews('${news.date}')">
                        <span class="news-item-date">${formatDateShort(news.date)}</span>
                        <span class="news-item-title">${news.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="news-preview">
            <iframe src="../daily-news/${latestNews.date}.html" id="news-preview-frame"></iframe>
        </div>
    `;
}

// 选择简报
function selectNews(date) {
    const frame = document.getElementById('news-preview-frame');
    if (frame) {
        frame.src = `../daily-news/${date}.html`;
    }
    
    // 更新选中状态
    document.querySelectorAll('.news-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// 打开简报模态框
function openNewsModal(date) {
    const news = state.newsList.find(n => n.date === date);
    if (!news) return;
    
    elements.modalTitle.textContent = news.title;
    elements.newsIframe.src = `../daily-news/${date}.html`;
    elements.modalGithub.href = `https://github.com/Miraikuru/KimiClawPrj1StockData/blob/main/${date}.html`;
    
    elements.newsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal() {
    elements.newsModal.classList.remove('active');
    elements.newsIframe.src = '';
    document.body.style.overflow = '';
}

// 格式化日期
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateShort(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 设置事件监听
function setupEventListeners() {
    // 菜单切换
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('open');
        });
    }
    
    // 点击外部关闭侧边栏
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!elements.sidebar.contains(e.target) && !elements.menuToggle.contains(e.target)) {
                elements.sidebar.classList.remove('open');
            }
        }
    });
    
    // ESC关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// 设置导航
function setupNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // 处理页面内链接
    document.querySelectorAll('[data-page]').forEach(link => {
        if (!link.classList.contains('nav-item')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                navigateTo(page);
            });
        }
    });
}

// 页面导航
function navigateTo(page) {
    state.currentPage = page;
    
    // 更新导航状态
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    // 更新页面显示
    elements.pages.forEach(p => {
        p.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新页面标题
    const titles = {
        'home': '首页',
        'daily-news': '每日简报',
        'tools': '工具箱',
        'archives': '资料库'
    };
    elements.pageTitle.textContent = titles[page] || '首页';
    
    // 关闭侧边栏（移动端）
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('open');
    }
    
    // 滚动到顶部
    window.scrollTo(0, 0);
}

// Toast提示
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);