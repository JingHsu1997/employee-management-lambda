const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { isAdmin } = require('../utils/permissions');

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const userClaims = event.requestContext.authorizer.claims;
        const isUserAdmin = isAdmin(userClaims);

        if (!id) {
            throw new Error('Missing employee ID');
        }

        const params = {
            TableName: 'Employees',
            Key: { id }
        };

        const data = await dynamoDB.get(params).promise();

        if (!data.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Employee not found' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        const employee = data.Item;

        // 權限檢查：非管理員只能查看自己的完整資料
        if (!isUserAdmin && employee.email !== userClaims.email) {
            // 返回有限的公開資料
            const publicData = {
                id: employee.id,
                name: employee.name,
                position: employee.position,
                department: employee.department,
                workStatus: employee.workStatus || 'idle'
            };

            return {
                statusCode: 200,
                body: JSON.stringify(publicData),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // 移除密碼等敏感資料
        const { password, ...safeEmployee } = employee;

        // 獲取最近的出勤記錄
        const attendanceParams = {
            TableName: 'CheckIns',
            IndexName: 'TimestampIndex',
            KeyConditionExpression: 'employeeId = :empId',
            ExpressionAttributeValues: {
                ':empId': id
            },
            ScanIndexForward: false, // 降序排列
            Limit: 10
        };

        const attendanceData = await dynamoDB.query(attendanceParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                employee: safeEmployee,
                recentAttendance: attendanceData.Items,
                isAdmin: isUserAdmin
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error fetching employee:', error);
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
