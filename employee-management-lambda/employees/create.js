const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');
const { isAdmin } = require('../utils/permissions');

exports.handler = async (event) => {
    try {
        // 從 Cognito authorizer 獲取用戶信息
        const userClaims = event.requestContext.authorizer.claims;
        
        // 檢查管理員權限
        if (!isAdmin(userClaims)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ 
                    error: 'Access denied. Admin privileges required.',
                    userEmail: userClaims.email,
                    message: '請聯繫管理員獲取權限或檢查您的帳戶設定'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        const { name, position, department, email, password, role = 'employee' } = JSON.parse(event.body);
        if (!name || !position || !department || !email) {
            throw new Error('Missing required fields');
        }

        const params = {
            TableName: 'Employees',
            Item: {
                id: uuidv4(),
                name,
                position,
                department,
                email,
                password, // 在實際應用中應該加密
                role, // 'admin' 或 'employee'
                status: 'active', // 員工狀態: active, inactive
                workStatus: 'idle', // 工作狀態: idle, remote, office, business_trip, vacation
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.put(params).promise();

        // 不返回密碼
        const { password: _, ...safeEmployee } = params.Item;

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Employee created', employee: safeEmployee }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error creating employee:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};