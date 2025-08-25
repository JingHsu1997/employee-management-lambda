const AWS = require('aws-sdk');
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const { v4: uuidv4 } = require('uuid');

  exports.handler = async (event) => {
      try {
          const { employeeId } = JSON.parse(event.body);
          const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

          if (!employeeId) {
              throw new Error('Missing employee ID');
          }

          const params = {
              TableName: 'CheckIns',
              Item: {
                  id: uuidv4(),
                  employeeId,
                  date,
                  timestamp: new Date().toISOString()
              }
          };

          await dynamoDB.put(params).promise();

          return {
              statusCode: 201,
              body: JSON.stringify({ message: 'Check-in recorded', employeeId, date }),
              headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
              }
          };
      } catch (error) {
          console.error('Error recording check-in:', error);
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