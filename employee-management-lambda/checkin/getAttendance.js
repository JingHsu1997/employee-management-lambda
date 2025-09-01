const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { employeeId, startDate, endDate } = event.queryStringParameters || {};

        let params = {
            TableName: 'CheckIns'
        };

        // 如果指定了員工ID，查詢特定員工的記錄
        if (employeeId) {
            params.FilterExpression = 'employeeId = :empId';
            params.ExpressionAttributeValues = { ':empId': employeeId };
        }

        // 如果指定了日期範圍
        if (startDate && endDate) {
            if (employeeId) {
                params.FilterExpression += ' AND #date BETWEEN :start AND :end';
            } else {
                params.FilterExpression = '#date BETWEEN :start AND :end';
                params.ExpressionAttributeValues = {};
            }
            params.ExpressionAttributeNames = { '#date': 'date' };
            params.ExpressionAttributeValues[':start'] = startDate;
            params.ExpressionAttributeValues[':end'] = endDate;
        }

        const data = await dynamoDB.scan(params).promise();

        // 計算工作時長
        const attendanceRecords = data.Items.map(record => {
            let workHours = null;
            if (record.checkInTime && record.checkOutTime) {
                const checkIn = new Date(record.checkInTime);
                const checkOut = new Date(record.checkOutTime);
                workHours = (checkOut - checkIn) / (1000 * 60 * 60); // 轉換為小時
            }

            return {
                ...record,
                workHours: workHours ? Math.round(workHours * 100) / 100 : null
            };
        });

        return {
            statusCode: 200,
            body: JSON.stringify(attendanceRecords),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not fetch attendance records' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Methods': 'GET,OPTIONS,POST,PUT,DELETE'
            }
        };
    }
};
