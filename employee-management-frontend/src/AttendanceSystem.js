import React, { useState, useEffect, useCallback } from 'react';
import { checkInOut, getAttendanceRecords, generateAttendanceReport } from './api';

// 工作狀態選項
const WORK_STATUS_OPTIONS = [
  { value: 'office', label: '🏢 辦公室', color: '#4CAF50' },
  { value: 'remote', label: '🏠 遠距工作', color: '#2196F3' },
  { value: 'business_trip', label: '✈️ 公出', color: '#FF9800' },
  { value: 'vacation', label: '🌴 休假', color: '#9C27B0' }
];

function AttendanceSystem({ currentUser }) {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [selectedWorkStatus, setSelectedWorkStatus] = useState('office');

  const today = new Date().toISOString().split('T')[0];

  // 獲取今天的出勤記錄
  const fetchTodayRecord = useCallback(async () => {
    try {
      const records = await getAttendanceRecords(currentUser?.sub || 'test-user');
      const todayRec = records.find(record => record.date === today);
      setTodayRecord(todayRec);
      setAttendanceRecords(records.slice(0, 10)); // 只顯示最近10條記錄
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  }, [currentUser?.sub, today]);

  // 打卡功能
  const handleCheck = async (type) => {
    setLoading(true);
    try {
      const checkData = {
        employeeId: currentUser?.sub || 'test-user',
        type: type
      };
      
      // 如果是上班打卡，包含工作狀態
      if (type === 'checkin') {
        checkData.workStatus = selectedWorkStatus;
      }

      await checkInOut(checkData.employeeId, checkData.type, checkData.workStatus);

      const statusLabel = WORK_STATUS_OPTIONS.find(opt => opt.value === selectedWorkStatus)?.label || '';
      alert(`${type === 'checkin' ? '上班' : '下班'}打卡成功！${type === 'checkin' ? ` (${statusLabel})` : ''}`);
      fetchTodayRecord(); // 重新獲取記錄
    } catch (error) {
      console.error('Error recording check:', error);
      alert('打卡失敗：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // 生成月度報告
  const generateMonthlyReport = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const reportData = await generateAttendanceReport(currentMonth, currentYear, currentUser?.sub || 'test-user');
      setReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('生成報告失敗：' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTodayRecord();
    }
  }, [currentUser, fetchTodayRecord]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  const getWorkStatusDisplay = (status) => {
    const option = WORK_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.label : '🏢 辦公室';
  };

  const getCurrentStatus = () => {
    if (!todayRecord) return '尚未打卡';
    if (todayRecord.checkInTime && todayRecord.checkOutTime) return '已完成工作';
    if (todayRecord.checkInTime) return `工作中 (${getWorkStatusDisplay(todayRecord.workStatus)})`;
    return '尚未打卡';
  };

  return (
    <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📊 員工出勤系統</h3>

      {/* 打卡區域 */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h4>🕒 今日打卡狀態</h4>

        {/* 工作狀態選擇 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            選擇工作狀態：
          </label>
          <select
            value={selectedWorkStatus}
            onChange={(e) => setSelectedWorkStatus(e.target.value)}
            disabled={todayRecord?.checkInTime}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '16px',
              minWidth: '150px',
              backgroundColor: todayRecord?.checkInTime ? '#f0f0f0' : 'white'
            }}
          >
            {WORK_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {todayRecord?.checkInTime && (
            <div style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
              已打卡後無法更改工作狀態
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <button
            onClick={() => handleCheck('checkin')}
            disabled={loading || todayRecord?.checkInTime}
            style={{
              padding: '12px 24px',
              backgroundColor: todayRecord?.checkInTime ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: todayRecord?.checkInTime ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? '處理中...' : '上班打卡'}
          </button>

          <button
            onClick={() => handleCheck('checkout')}
            disabled={loading || !todayRecord?.checkInTime || todayRecord?.checkOutTime}
            style={{
              padding: '12px 24px',
              backgroundColor: (!todayRecord?.checkInTime || todayRecord?.checkOutTime) ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (!todayRecord?.checkInTime || todayRecord?.checkOutTime) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? '處理中...' : '下班打卡'}
          </button>
        </div>

        {/* 今日狀態顯示 */}
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
          <h5>今日 ({formatDate(today)}) 出勤狀態：</h5>
          <div style={{ marginBottom: '15px' }}>
            <strong>當前狀態：</strong>
            <span style={{ 
              color: todayRecord?.checkOutTime ? '#4CAF50' : (todayRecord?.checkInTime ? '#2196F3' : '#ff9800'),
              fontWeight: 'bold'
            }}>
              {getCurrentStatus()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '30px', marginTop: '10px', flexWrap: 'wrap' }}>
            <div>
              <strong>上班時間：</strong>
              <span style={{ color: todayRecord?.checkInTime ? '#4CAF50' : '#ff9800' }}>
                {formatTime(todayRecord?.checkInTime)}
              </span>
            </div>
            <div>
              <strong>下班時間：</strong>
              <span style={{ color: todayRecord?.checkOutTime ? '#4CAF50' : '#ff9800' }}>
                {formatTime(todayRecord?.checkOutTime)}
              </span>
            </div>
            {todayRecord?.workStatus && (
              <div>
                <strong>工作方式：</strong>
                <span style={{ color: '#9C27B0' }}>
                  {getWorkStatusDisplay(todayRecord.workStatus)}
                </span>
              </div>
            )}
            {todayRecord?.workHours && (
              <div>
                <strong>工作時長：</strong>
                <span style={{ color: '#2196F3' }}>
                  {todayRecord.workHours} 小時
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 出勤記錄 */}
      <div style={{ marginBottom: '30px' }}>
        <h4>📋 最近出勤記錄</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>日期</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>工作方式</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>上班時間</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>下班時間</th>
                <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>工作時長</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formatDate(record.date)}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {getWorkStatusDisplay(record.workStatus)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formatTime(record.checkInTime)}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{formatTime(record.checkOutTime)}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      {record.workHours ? `${record.workHours} 小時` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    尚無出勤記錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 月度報告 */}
      <div>
        <h4>📈 月度出勤報告</h4>
        <button
          onClick={generateMonthlyReport}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '15px'
          }}
        >
          生成本月報告
        </button>

        {report && (
          <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
            <h5>{report.year}年{report.month}月 出勤報告</h5>
            <div style={{ marginTop: '10px' }}>
              <p><strong>總記錄數：</strong>{report.totalRecords}</p>
              <p><strong>出勤天數：</strong>{report.summary[0]?.presentDays || 0}</p>
              <p><strong>總工作時長：</strong>{report.summary[0]?.totalHours || 0} 小時</p>
              <p><strong>出勤率：</strong>{report.summary[0]?.attendanceRate || 0}%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceSystem;
