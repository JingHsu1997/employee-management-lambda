const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { isAdmin } = require('../utils/permissions');

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const userClaims = event.requestContext.authorizer.claims;
        const currentUserId = userClaims.sub;
        
        // 檢查權限：管理員可以編輯任何員工，一般員工只能編輯自己的資料
        const isUserAdmin = isAdmin(userClaims);
        
        // 獲取現有員工資料
        const getParams = {
            TableName: 'Employees',
            Key: { id }
        };
        
        const existingEmployee = await dynamoDB.get(getParams).promise();
        
        if (!existingEmployee.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Employee not found' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }
        
        // 權限檢查：非管理員只能編輯自己的資料（透過 email 比對）
        if (!isUserAdmin && existingEmployee.Item.email !== userClaims.email) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Access denied. You can only edit your own profile.' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        const { name, position, department, email, status, role, workStatus } = JSON.parse(event.body);

        if (!id) {
            throw new Error('Missing employee ID');
        }

        // 根據用戶權限決定可更新的欄位
        let updateExpression = [];
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};

        if (isUserAdmin) {
            // 管理員可以更新所有欄位
            if (name !== undefined) {
                updateExpression.push('#name = :name');
                expressionAttributeNames['#name'] = 'name';
                expressionAttributeValues[':name'] = name;
            }
            if (position !== undefined) {
                updateExpression.push('#position = :position');
                expressionAttributeNames['#position'] = 'position';
                expressionAttributeValues[':position'] = position;
            }
            if (department !== undefined) {
                updateExpression.push('#department = :department');
                expressionAttributeNames['#department'] = 'department';
                expressionAttributeValues[':department'] = department;
            }
            if (email !== undefined) {
                updateExpression.push('#email = :email');
                expressionAttributeNames['#email'] = 'email';
                expressionAttributeValues[':email'] = email;
            }
            if (status !== undefined) {
                updateExpression.push('#status = :status');
                expressionAttributeNames['#status'] = 'status';
                expressionAttributeValues[':status'] = status;
            }
            if (role !== undefined) {
                updateExpression.push('#role = :role');
                expressionAttributeNames['#role'] = 'role';
                expressionAttributeValues[':role'] = role;
            }
        }
        
        // 所有用戶都可以更新工作狀態
        if (workStatus !== undefined) {
            updateExpression.push('#workStatus = :workStatus');
            expressionAttributeNames['#workStatus'] = 'workStatus';
            expressionAttributeValues[':workStatus'] = workStatus;
        }

        // 添加更新時間
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';
        expressionAttributeValues[':updatedAt'] = new Date().toISOString();

        if (updateExpression.length === 1) { // 只有 updatedAt
            throw new Error('No valid fields to update');
        }

        const params = {
            TableName: 'Employees',
            Key: { id },
            UpdateExpression: 'SET ' + updateExpression.join(', '),
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamoDB.update(params).promise();
        
        // 不返回密碼
        const { password, ...safeEmployee } = result.Attributes;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Employee updated', employee: safeEmployee }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error updating employee:', error);
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