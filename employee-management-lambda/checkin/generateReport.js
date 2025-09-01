const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { month, year, employeeId } = event.queryStringParameters || {};
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        // 獲取指定月份的所有出勤記錄
        const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
        const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

        let params = {
            TableName: 'CheckIns',
            FilterExpression: '#date BETWEEN :start AND :end',
            ExpressionAttributeNames: { '#date': 'date' },
            ExpressionAttributeValues: {
                ':start': startDate,
                ':end': endDate
            }
        };

        // 如果指定了員工ID，只查詢該員工
        if (employeeId) {
            params.FilterExpression += ' AND employeeId = :empId';
            params.ExpressionAttributeValues[':empId'] = employeeId;
        }

        const data = await dynamoDB.scan(params).promise();

        // 生成報告
        const report = {
            month: targetMonth,
            year: targetYear,
            totalRecords: data.Items.length,
            summary: {}
        };

        // 按員工分組統計
        const employeeStats = {};

        data.Items.forEach(record => {
            const empId = record.employeeId;

            if (!employeeStats[empId]) {
                employeeStats[empId] = {
                    employeeId: empId,
                    totalDays: 0,
                    presentDays: 0,
                    totalHours: 0,
                    records: []
                };
            }

            employeeStats[empId].totalDays++;
            employeeStats[empId].records.push(record);

            // 計算工作時長
            if (record.checkInTime && record.checkOutTime) {
                employeeStats[empId].presentDays++;
                const checkIn = new Date(record.checkInTime);
                const checkOut = new Date(record.checkOutTime);
                const hours = (checkOut - checkIn) / (1000 * 60 * 60);
                employeeStats[empId].totalHours += hours;
            }
        });

        report.summary = Object.values(employeeStats).map(stat => ({
            ...stat,
            totalHours: Math.round(stat.totalHours * 100) / 100,
            attendanceRate: Math.round((stat.presentDays / stat.totalDays) * 100 * 100) / 100
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(report),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    } catch (error) {
        console.error('Error generating attendance report:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not generate attendance report' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};
