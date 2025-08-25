const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;

        if (!id) {
            throw new Error('Missing employee ID');
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