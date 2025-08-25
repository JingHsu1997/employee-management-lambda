const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const params = {
            TableName: 'Employees'
        };
        
        const data = await dynamoDB.scan(params).promise();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // 允許CORS
            }
        };
    } catch (error) {
        console.error('Error fetching employees:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not fetch employees' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};