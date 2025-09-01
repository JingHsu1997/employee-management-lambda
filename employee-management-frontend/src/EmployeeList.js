import React, { useEffect, useState } from 'react';
import api from './api';

// 工作狀態選項
const WORK_STATUS_OPTIONS = [
  { value: 'idle', label: '待機', color: '#gray' },
  { value: 'office', label: '辦公室', color: '#4CAF50' },
  { value: 'remote', label: '遠距', color: '#2196F3' },
  { value: 'business_trip', label: '公出', color: '#FF9800' },
  { value: 'vacation', label: '休假', color: '#9C27B0' }
];

// 員工角色選項
const ROLE_OPTIONS = [
  { value: 'employee', label: '員工' },
  { value: 'admin', label: '管理員' }
];

function EmployeeForm({ onSave, editing, onCancel, isAdmin }) {
  const [form, setForm] = useState(editing || { 
    name: '', 
    position: '', 
    department: '', 
    email: '', 
    password: '',
    role: 'employee',
    workStatus: 'idle'
  });

  useEffect(() => {
    setForm(editing || { 
      name: '', 
      position: '', 
      department: '', 
      email: '', 
      password: '',
      role: 'employee',
      workStatus: 'idle'
    });
  }, [editing]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
    setForm({ 
      name: '', 
      position: '', 
      department: '', 
      email: '', 
      password: '',
      role: 'employee',
      workStatus: 'idle'
    });
  };

  if (!isAdmin) {
    return <div style={{ color: '#666', fontStyle: 'italic' }}>僅管理員可新增/編輯員工</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ 
      marginBottom: 20, 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h4>{editing ? '編輯員工' : '新增員工'}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <input 
          name="name" 
          placeholder="姓名" 
          value={form.name} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          name="email" 
          placeholder="Email" 
          type="email"
          value={form.email} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          name="position" 
          placeholder="職位" 
          value={form.position} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          name="department" 
          placeholder="部門" 
          value={form.department} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {!editing && (
          <input 
            name="password" 
            placeholder="密碼" 
            type="password"
            value={form.password} 
            onChange={handleChange} 
            required 
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        )}
        <select 
          name="role" 
          value={form.role} 
          onChange={handleChange}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {ROLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          type="submit"
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {editing ? '更新' : '新增'}
        </button>
        {editing && (
          <button 
            type="button" 
            onClick={onCancel}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}

function WorkStatusSelector({ employee, onStatusChange, disabled }) {
  const currentStatus = WORK_STATUS_OPTIONS.find(option => option.value === employee.workStatus) || WORK_STATUS_OPTIONS[0];
  
  return (
    <select 
      value={employee.workStatus || 'idle'}
      onChange={(e) => onStatusChange(employee.id, e.target.value)}
      disabled={disabled}
      style={{ 
        padding: '4px 8px', 
        borderRadius: '4px',
        backgroundColor: currentStatus.color,
        color: 'white',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {WORK_STATUS_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data.employees || res.data);
      setIsAdmin(res.data.isAdmin || false);
      setCurrentUser(res.data.currentUser || '');
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('獲取員工列表失敗：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (data) => {
    try {
      setLoading(true);
      if (editing) {
        await api.put(`/employees/${editing.id}`, data);
        alert('員工資料更新成功！');
      } else {
        await api.post('/employees', data);
        alert('員工新增成功！');
      }
      setEditing(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('操作失敗：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`確定要刪除員工 ${name} 嗎？`)) {
      return;
    }
    
    try {
      setLoading(true);
      await api.delete(`/employees/${id}`);
      alert('員工刪除成功！');
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('刪除失敗：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      await api.put(`/employees/${employeeId}`, { workStatus: newStatus });
      // 立即更新本地狀態
      setEmployees(employees.map(emp => 
        emp.id === employeeId ? { ...emp, workStatus: newStatus } : emp
      ));
      // alert(`工作狀態已更新為：${WORK_STATUS_OPTIONS.find(opt => opt.value === newStatus)?.label}`);
    } catch (error) {
      console.error('Error updating work status:', error);
      alert('更新工作狀態失敗：' + (error.response?.data?.error || error.message));
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) return { text: '未打卡', color: '#ccc' };
    
    if (attendance.checkInTime && attendance.checkOutTime) {
      return { text: '已下班', color: '#4CAF50' };
    } else if (attendance.checkInTime) {
      return { text: '已上班', color: '#2196F3' };
    }
    return { text: '未打卡', color: '#ccc' };
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>載入中...</div>;
  }

  return (
    <div>
      <h2>👥 員工管理系統</h2>
      
      {isAdmin && (
        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
          <strong>🛡️ 管理員權限</strong> - 您可以新增、編輯、刪除員工
        </div>
      )}
      
      <EmployeeForm 
        onSave={handleSave} 
        editing={editing} 
        onCancel={() => setEditing(null)} 
        isAdmin={isAdmin}
      />
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          border: '1px solid #ddd',
          marginTop: '20px'
        }}>
          <thead style={{ backgroundColor: '#f5f5f5' }}>
            <tr>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>姓名</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>職位</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>部門</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>角色</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>工作狀態</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>今日出勤</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>上班時間</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>下班時間</th>
              {isAdmin && <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>操作</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => {
              const attendanceStatus = getAttendanceStatus(emp.todayAttendance);
              const isCurrentUser = emp.email === currentUser;
              
              return (
                <tr key={emp.id} style={{ 
                  backgroundColor: isCurrentUser ? '#f0f8ff' : (emp.id === editing?.id ? '#fff3cd' : 'white')
                }}>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {emp.name}
                    {isCurrentUser && <span style={{ color: '#2196F3', fontSize: '12px' }}> (您)</span>}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.position}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.department}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.email}</td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: emp.role === 'admin' ? '#ff9800' : '#4CAF50',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {emp.role === 'admin' ? '管理員' : '員工'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <WorkStatusSelector 
                      employee={emp}
                      onStatusChange={handleStatusChange}
                      disabled={!isAdmin && !isCurrentUser}
                    />
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    <span style={{ color: attendanceStatus.color, fontWeight: 'bold' }}>
                      {attendanceStatus.text}
                    </span>
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {formatTime(emp.todayAttendance?.checkInTime)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                    {formatTime(emp.todayAttendance?.checkOutTime)}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => setEditing(emp)}
                          style={{ 
                            padding: '5px 10px', 
                            backgroundColor: '#2196F3', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          編輯
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id, emp.name)}
                          style={{ 
                            padding: '5px 10px', 
                            backgroundColor: '#f44336', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {employees.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          目前沒有員工資料
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
