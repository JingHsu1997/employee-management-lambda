const AWS = require('aws-sdk');
     const dynamoDB = new AWS.DynamoDB.DocumentClient();
     const { v4: uuidv4 } = require('uuid');

     exports.handler = async (event) => {
         try {
             const { name, position, department, email } = JSON.parse(event.body);
             if (!name || !position || !department || !email) {
                 throw new Error('Missing required fields');
             }

             const params = {
                 TableName: 'Employees',
                 Item: {
                     id: uuidv4(),
                     name,
                     position,
                     department,
                     email,
                     status: 'idle' // 默認狀態
                 }
             };

             await dynamoDB.put(params).promise();

             return {
                 statusCode: 201,
                 body: JSON.stringify({ message: 'Employee created', id: params.Item.id }),
                 headers: {
                     'Content-Type': 'application/json',
                     'Access-Control-Allow-Origin': '*'
                 }
             };
         } catch (error) {
             console.error('Error creating employee:', error);
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