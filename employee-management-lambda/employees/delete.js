const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { isAdmin } = require('../utils/permissions');

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const userClaims = event.requestContext.authorizer.claims;
        
        // 檢查管理員權限
        if (!isAdmin(userClaims)) {
            return {
                statusCode: 403,
                body: JSON.stringify({ 
                    error: 'Access denied. Admin privileges required.',
                    userEmail: userClaims.email,
                    message: '只有管理員可以刪除員工'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        if (!id) {
            throw new Error('Missing employee ID');
        }

        // 先檢查員工是否存在
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

        const params = {
            TableName: 'Employees',
            Key: { id }
        };

        await dynamoDB.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Employee deleted', id }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error deleting employee:', error);
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