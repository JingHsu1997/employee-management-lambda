import React, { useEffect, useState } from 'react';
import api from './api';

function EmployeeForm({ onSave, editing, onCancel }) {
  const [form, setForm] = useState(editing || { name: '', position: '', department: '', email: '' });

  useEffect(() => {
    setForm(editing || { name: '', position: '', department: '', email: '' });
  }, [editing]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
    setForm({ name: '', position: '', department: '', email: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input name="name" placeholder="姓名" value={form.name} onChange={handleChange} required />
      <input name="position" placeholder="職位" value={form.position} onChange={handleChange} required />
      <input name="department" placeholder="部門" value={form.department} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <button type="submit">{editing ? '更新' : '新增'}</button>
      {editing && <button type="button" onClick={onCancel}>取消</button>}
    </form>
  );
}

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchEmployees = async () => {
    const res = await api.get('/employees');
    setEmployees(res.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (data) => {
    if (editing) {
      await api.put(`/employees/${editing.id}`, data);
    } else {
      await api.post('/employees', data);
    }
    setEditing(null);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    await api.delete(`/employees/${id}`);
    fetchEmployees();
  };

  return (
    <div>
      <h2>員工列表</h2>
      <EmployeeForm onSave={handleSave} editing={editing} onCancel={() => setEditing(null)} />
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>姓名</th><th>職位</th><th>部門</th><th>Email</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.position}</td>
              <td>{emp.department}</td>
              <td>{emp.email}</td>
              <td>
                <button onClick={() => setEditing(emp)}>編輯</button>
                <button onClick={() => handleDelete(emp.id)}>刪除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
