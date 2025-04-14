/**
 * LibreTV 身份验证模块
 * 处理用户登录状态检查和会话管理
 */

// 会话有效期（24小时，单位：毫秒）
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// 备用的默认访问密码（仅在无法从配置读取时使用）
const DEFAULT_ACCESS_CODE = 'admin';

/**
 * 检查用户是否已登录
 * @returns {boolean} 用户登录状态
 */
function isLoggedIn() {
    const loggedIn = localStorage.getItem('libreTvLoggedIn');
    const loginTime = localStorage.getItem('libreTvLoginTime');
    
    // 检查登录状态是否存在
    if (!loggedIn || loggedIn !== 'true') {
        return false;
    }
    
    // 检查会话是否过期
    if (loginTime) {
        const now = new Date().getTime();
        const lastLogin = parseInt(loginTime, 10);
        
        // 如果会话已过期，清除登录状态并返回false
        if (now - lastLogin > SESSION_DURATION) {
            logout();
            return false;
        }
    } else {
        // 如果没有登录时间，更新当前时间
        localStorage.setItem('libreTvLoginTime', new Date().getTime().toString());
    }
    
    return true;
}

/**
 * 获取当前的访问密码
 * @returns {string} 当前访问密码
 */
function getAccessCode() {
    // 从配置文件读取访问密码，如果配置不存在则使用默认值
    return (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.accessCode) ? 
        AUTH_CONFIG.accessCode : DEFAULT_ACCESS_CODE;
}

/**
 * 用户登录
 * @param {string} accessCode 访问密码
 * @returns {boolean} 登录成功返回true，否则返回false
 */
function login(accessCode) {
    const correctAccessCode = getAccessCode();
    
    // 验证访问密码
    if (accessCode === correctAccessCode) {
        // 设置登录状态
        localStorage.setItem('libreTvLoggedIn', 'true');
        // 记录登录时间
        localStorage.setItem('libreTvLoginTime', new Date().getTime().toString());
        return true;
    }
    
    return false;
}

/**
 * 用户登出
 */
function logout() {
    // 清除登录状态
    localStorage.removeItem('libreTvLoggedIn');
    localStorage.removeItem('libreTvLoginTime');
    
    // 重定向到登录页面
    window.location.href = 'login.html';
}

/**
 * 检查登录状态并重定向到登录页面（如果未登录）
 * @param {boolean} redirect 是否在未登录时重定向
 * @returns {boolean} 用户登录状态
 */
function requireLogin(redirect = true) {
    const loggedIn = isLoggedIn();
    
    if (!loggedIn && redirect) {
        // 获取当前页面URL作为重定向参数
        const currentPage = window.location.pathname.split('/').pop();
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }
    
    return loggedIn;
}

// 在页面加载时初始化登录时间（如果已登录但没有登录时间）
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('libreTvLoggedIn') === 'true' && !localStorage.getItem('libreTvLoginTime')) {
        localStorage.setItem('libreTvLoginTime', new Date().getTime().toString());
    }
}); 