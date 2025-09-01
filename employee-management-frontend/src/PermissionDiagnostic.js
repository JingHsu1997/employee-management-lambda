import React, { useState } from 'react';
import { checkUserPermissions } from './api';

function PermissionDiagnostic() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkPermissions = async () => {
    setLoading(true);
    try {
      const result = await checkUserPermissions();
      setPermissions(result);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions({
        error: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      border: '2px solid #2196F3', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h4 style={{ color: '#2196F3' }}>🔍 權限診斷工具</h4>
      
      <button
        onClick={checkPermissions}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '檢查中...' : '檢查我的權限'}
      </button>

      {permissions && (
        <div style={{ marginTop: '20px' }}>
          {permissions.error ? (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#ffebee', 
              border: '1px solid #f44336',
              borderRadius: '4px',
              color: '#c62828'
            }}>
              <strong>❌ 權限檢查失敗：</strong>
              <div>{permissions.error}</div>
            </div>
          ) : (
            <div>
              {/* 用戶資訊 */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#e3f2fd', 
                border: '1px solid #2196F3',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <h5>👤 用戶資訊</h5>
                <p><strong>Email:</strong> {permissions.userInfo.email}</p>
                <p><strong>User ID:</strong> {permissions.userInfo.sub}</p>
                <p><strong>Cognito Groups:</strong> {
                  permissions.userInfo.groups.length > 0 
                    ? permissions.userInfo.groups.join(', ')
                    : '無群組'
                }</p>
                <p><strong>自定義角色:</strong> {permissions.userInfo.customRole || '未設定'}</p>
              </div>

              {/* 權限狀態 */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: permissions.permissions.isAdmin ? '#e8f5e8' : '#fff3e0',
                border: `1px solid ${permissions.permissions.isAdmin ? '#4CAF50' : '#FF9800'}`,
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <h5 style={{ color: permissions.permissions.isAdmin ? '#2e7d32' : '#f57c00' }}>
                  {permissions.permissions.isAdmin ? '✅ 管理員權限' : '⚠️ 一般用戶權限'}
                </h5>
                <p><strong>透過群組獲得管理員權限:</strong> {permissions.permissions.isAdminByGroup ? '是' : '否'}</p>
                <p><strong>透過角色獲得管理員權限:</strong> {permissions.permissions.isAdminByRole ? '是' : '否'}</p>
                <p><strong>可管理員工:</strong> {permissions.permissions.canManageEmployees ? '是' : '否'}</p>
                <p><strong>可新增員工:</strong> {permissions.permissions.canCreateEmployees ? '是' : '否'}</p>
                <p><strong>可刪除員工:</strong> {permissions.permissions.canDeleteEmployees ? '是' : '否'}</p>
              </div>

              {/* 建議 */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#f5f5f5', 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}>
                <h5>💡 建議</h5>
                <ul>
                  {permissions.recommendations.map((rec, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PermissionDiagnostic;
