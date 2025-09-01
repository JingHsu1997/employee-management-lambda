// 臨時管理員配置文件 - 生產環境應該使用 Cognito Groups 或數據庫
const ADMIN_EMAILS = [
    'admin@company.com',
    'manager@company.com',
    // 在這裡添加您的管理員 email
];

// 檢查用戶是否為管理員
const isAdmin = (userClaims) => {
    // 方法 1: 檢查 Cognito Groups
    const groups = userClaims['cognito:groups'] || [];
    if (groups.includes('Admins')) {
        return true;
    }
    
    // 方法 2: 檢查自定義 role 屬性
    if (userClaims['custom:role'] === 'admin') {
        return true;
    }
    
    // 方法 3: 臨時解決方案 - 檢查 email (僅用於測試)
    const userEmail = userClaims.email;
    if (ADMIN_EMAILS.includes(userEmail)) {
        return true;
    }
    
    // 方法 4: 檢查數據庫中的用戶角色
    // 這個可以在後續實現，查詢 Employees 表中的 role 欄位
    
    return false;
};

module.exports = {
    isAdmin,
    ADMIN_EMAILS
};
