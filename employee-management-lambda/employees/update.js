const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const { name, position, department, email, status } = JSON.parse(event.body);

        if (!id) {
            throw new Error('Missing employee ID');
        }

        const params = {
            TableName: 'Employees',
            Key: { id },
            UpdateExpression: 'SET #name = :name, #position = :position, #department = :department, #email = :email, #status = :status',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#position': 'position',
                '#department': 'department',
                '#email': 'email',
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':name': name || null,
                ':position': position || null,
                ':department': department || null,
                ':email': email || null,
                ':status': status || 'idle'
            },
            ReturnValues: 'UPDATED_NEW'
        };

        const result = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Employee updated', updatedAttributes: result.Attributes }),
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