const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 假資料庫
let employees = [
  { id: uuidv4(), name: '王小明', position: '工程師', department: '研發', email: 'ming@example.com', status: 'available' },
  { id: uuidv4(), name: '李小華', position: '設計師', department: '設計', email: 'hua@example.com', status: 'busy' },
];

// 取得所有員工
app.get('/dev/employees', (req, res) => {
  res.json(employees);
});

// 新增員工
app.post('/dev/employees', (req, res) => {
  const { name, position, department, email } = req.body;
  if (!name || !position || !department || !email) {
    return res.status(400).json({ error: '缺少欄位' });
  }
  const emp = { id: uuidv4(), name, position, department, email, status: 'idle' };
  employees.push(emp);
  res.status(201).json({ message: 'Employee created', id: emp.id });
});

// 更新員工
app.put('/dev/employees/:id', (req, res) => {
  const { id } = req.params;
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: '找不到員工' });
  const { name, position, department, email, status } = req.body;
  employees[idx] = { ...employees[idx], name, position, department, email, status };
  res.json({ message: 'Employee updated', updatedAttributes: req.body });
});

// 刪除員工
app.delete('/dev/employees/:id', (req, res) => {
  const { id } = req.params;
  const idx = employees.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).json({ error: '找不到員工' });
  employees.splice(idx, 1);
  res.json({ message: 'Employee deleted', id });
});

// 狀態更新
app.put('/dev/status', (req, res) => {
  const { id, status } = req.body;
  const emp = employees.find(e => e.id === id);
  if (!emp) return res.status(404).json({ error: '找不到員工' });
  emp.status = status;
  res.json({ message: 'Status updated', status });
});

// 打卡
app.post('/dev/checkin', (req, res) => {
  const { employeeId } = req.body;
  if (!employeeId) return res.status(400).json({ error: '缺少 employeeId' });
  res.status(201).json({ message: 'Check-in recorded', employeeId, date: new Date().toISOString().split('T')[0] });
});

const port = 5001;
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});

