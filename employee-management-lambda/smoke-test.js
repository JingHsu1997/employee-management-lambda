// Smoke test runner for local lambda functions.
// Ensure AWS region is set and preload the local aws-sdk stub so lambdas pick it up.
process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
// Require AWS SDK and replace DocumentClient with an in-memory stub so handlers don't call real AWS.
const AWS = require('aws-sdk');

class DocumentClientStub {
  constructor() { this.tables = {}; }
  put(params) { return { promise: async () => { const t = params.TableName; this.tables[t]=this.tables[t]||[]; this.tables[t].push(params.Item||{}); return {}; } }; }
  scan(params) { return { promise: async () => ({ Items: this.tables[params.TableName] || [] }) }; }
  update(params) { return { promise: async () => ({ Attributes: params.ExpressionAttributeValues || {} }) }; }
  delete(params) { return { promise: async () => { const t=params.TableName; if(this.tables[t]) this.tables[t]=this.tables[t].filter(i=>i.id!== (params.Key && params.Key.id)); return {}; } }; }
}

AWS.DynamoDB = AWS.DynamoDB || {};
AWS.DynamoDB.DocumentClient = DocumentClientStub;
const path = require('path');

const handlers = {
  create: require('./employees/create').handler,
  getEmployees: require('./employees/getEmployees').handler,
  update: require('./employees/update').handler,
  delete: require('./employees/delete').handler,
  checkIn: require('./checkin/checkIn').handler,
  updateStatus: require('./status/updateStatus').handler
};

async function run() {
  console.log('Running smoke tests...');

  const results = [];

  // create
  results.push(await handlers.create({ body: JSON.stringify({ name: 'Alice', position: 'Dev', department: 'Eng', email: 'alice@example.com' }) }));

  // getEmployees
  results.push(await handlers.getEmployees({}));

  // update (we fake pathParameters id)
  results.push(await handlers.update({ pathParameters: { id: 'fake-id' }, body: JSON.stringify({ name: 'Alice Updated' }) }));

  // delete
  results.push(await handlers.delete({ pathParameters: { id: 'fake-id' } }));

  // checkIn
  results.push(await handlers.checkIn({ body: JSON.stringify({ employeeId: 'fake-id' }) }));

  // updateStatus
  results.push(await handlers.updateStatus({ body: JSON.stringify({ id: 'fake-id', status: 'available' }) }));

  console.log('Smoke test results:');
  results.forEach((r, i) => {
    console.log(`--- Handler ${i + 1} ---`);
    console.log('statusCode:', r.statusCode);
    console.log('body:', r.body);
  });
}

run().catch(err => {
  console.error('Smoke tests failed:', err);
  process.exit(1);
});
