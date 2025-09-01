const AWS = require('aws-sdk');

// 檢查當前用戶的權限設定
exports.handler = async (event) => {
    try {
        const userClaims = event.requestContext.authorizer.claims;
        
        console.log('=== 用戶 Claims 詳細信息 ===');
        console.log('User Sub:', userClaims.sub);
        console.log('Email:', userClaims.email);
        console.log('Cognito Groups:', userClaims['cognito:groups']);
        console.log('Custom Role:', userClaims['custom:role']);
        console.log('All Claims:', JSON.stringify(userClaims, null, 2));
        
        // 檢查管理員權限
        const groups = userClaims['cognito:groups'] || [];
        const isAdminByGroup = groups.includes('Admins');
        const isAdminByRole = userClaims['custom:role'] === 'admin';
        const isAdmin = isAdminByGroup || isAdminByRole;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                userInfo: {
                    sub: userClaims.sub,
                    email: userClaims.email,
                    groups: userClaims['cognito:groups'] || [],
                    customRole: userClaims['custom:role'] || null
                },
                permissions: {
                    isAdminByGroup,
                    isAdminByRole,
                    isAdmin,
                    canManageEmployees: isAdmin,
                    canCreateEmployees: isAdmin,
                    canDeleteEmployees: isAdmin
                },
                recommendations: isAdmin ? 
                    ['您已具備管理員權限'] : 
                    [
                        '要獲得管理員權限，請執行以下其中一項：',
                        '1. 在 Cognito Console 中將用戶加入 "Admins" 群組',
                        '2. 設定用戶的 custom:role 屬性為 "admin"'
                    ]
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    } catch (error) {
        console.error('Error checking user permissions:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Could not check user permissions',
                details: error.message 
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    }
};
