const AWS = require('aws-sdk');
     const dynamoDB = new AWS.DynamoDB.DocumentClient();

     exports.handler = async (event) => {
         try {
             const { id, status } = JSON.parse(event.body);
             if (!id || !['busy', 'available', 'idle'].includes(status)) {
                 throw new Error('Invalid id or status');
             }

             const params = {
                 TableName: 'Employees',
                 Key: { id },
                 UpdateExpression: 'SET #status = :status',
                 ExpressionAttributeNames: { '#status': 'status' },
                 ExpressionAttributeValues: { ':status': status },
                 ReturnValues: 'UPDATED_NEW'
             };

             await dynamoDB.update(params).promise();

             return {
                 statusCode: 200,
                 body: JSON.stringify({ message: 'Status updated', status }),
                 headers: {
                     'Content-Type': 'application/json',
                     'Access-Control-Allow-Origin': '*'
                 }
             };
         } catch (error) {
             console.error('Error updating status:', error);
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