const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { isAdmin } = require('../utils/permissions');

exports.handler = async (event) => {
    try {
        const userClaims = event.requestContext.authorizer.claims;
        const isUserAdmin = isAdmin(userClaims);
        
        const params = {
            TableName: 'Employees'
        };
        
        const data = await dynamoDB.scan(params).promise();
        
        // 獲取今天的出勤記錄
        const today = new Date().toISOString().split('T')[0];
        const attendanceParams = {
            TableName: 'CheckIns',
            FilterExpression: '#date = :today',
            ExpressionAttributeNames: {
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':today': today
            }
        };
        
        const attendanceData = await dynamoDB.scan(attendanceParams).promise();
        const todayAttendance = {};
        
        attendanceData.Items.forEach(record => {
            todayAttendance[record.employeeId] = {
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                workHours: record.workHours
            };
        });
        
        // 處理員工資料並添加出勤信息
        const employees = data.Items.map(employee => {
            // 移除密碼等敏感資料
            const { password, ...safeEmployee } = employee;
            
            // 添加今日出勤資料
            const attendance = todayAttendance[employee.id] || {
                checkInTime: null,
                checkOutTime: null,
                workHours: null
            };
            
            return {
                ...safeEmployee,
                todayAttendance: attendance,
                // 非管理員只能看到基本資料
                ...(isUserAdmin ? {} : {
                    email: employee.email === userClaims.email ? employee.email : '***',
                    role: employee.role === 'admin' ? 'admin' : 'employee'
                })
            };
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                employees,
                isAdmin: isUserAdmin,
                currentUser: userClaims.email
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    } catch (error) {
        console.error('Error fetching employees:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not fetch employees' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    }
};