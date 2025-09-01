const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event) => {
    try {
        const { employeeId, type, workStatus } = JSON.parse(event.body); // type: 'checkin' or 'checkout', workStatus: 'office', 'remote', 'business_trip', 'vacation'
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const timestamp = new Date().toISOString();

        if (!employeeId || !type) {
            throw new Error('Missing employee ID or check type');
        }

        if (!['checkin', 'checkout'].includes(type)) {
            throw new Error('Invalid check type. Must be "checkin" or "checkout"');
        }

        // 檢查當天是否已有記錄
        const existingRecord = await dynamoDB.query({
            TableName: 'CheckIns',
            KeyConditionExpression: 'employeeId = :empId AND begins_with(#date, :date)',
            ExpressionAttributeNames: {
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':empId': employeeId,
                ':date': date
            }
        }).promise();

        let record;

        if (existingRecord.Items.length > 0) {
            // 更新現有記錄
            record = existingRecord.Items[0];
            if (type === 'checkin') {
                record.checkInTime = timestamp;
                if (workStatus) record.workStatus = workStatus;
            } else {
                record.checkOutTime = timestamp;
                // 計算工作時長
                if (record.checkInTime) {
                    const checkIn = new Date(record.checkInTime);
                    const checkOut = new Date(timestamp);
                    record.workHours = Math.round((checkOut - checkIn) / (1000 * 60 * 60) * 100) / 100;
                }
            }

            await dynamoDB.put({
                TableName: 'CheckIns',
                Item: record
            }).promise();
        } else {
            // 創建新記錄
            record = {
                id: uuidv4(),
                employeeId,
                date,
                checkInTime: type === 'checkin' ? timestamp : null,
                checkOutTime: type === 'checkout' ? timestamp : null,
                workStatus: workStatus || 'office', // 預設為辦公室
                workHours: null,
                createdAt: timestamp
            };

            await dynamoDB.put({
                TableName: 'CheckIns',
                Item: record
            }).promise();
        }

        // 同時更新員工的工作狀態
        if (workStatus && type === 'checkin') {
            await dynamoDB.update({
                TableName: 'Employees',
                Key: { id: employeeId },
                UpdateExpression: 'SET workStatus = :workStatus, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':workStatus': workStatus,
                    ':updatedAt': timestamp
                }
            }).promise();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `${type === 'checkin' ? 'Check-in' : 'Check-out'} recorded successfully`,
                employeeId,
                date,
                workStatus: workStatus || record.workStatus,
                record
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error recording check:', error);
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