// TestApp.js - 簡化的測試應用
import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🎯 員工管理系統 - 測試頁面</h1>
      <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <h2>✅ React 應用程式正常運行</h2>
        <p>如果您看到這個頁面，表示前端應用程式已成功啟動。</p>
      </div>
      
      <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <h3>🔗 系統資訊</h3>
        <ul>
          <li>前端伺服器：http://localhost:3000</li>
          <li>API 端點：https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev</li>
          <li>Cognito User Pool：ap-southeast-2_aDll8F8yq</li>
        </ul>
      </div>

      <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <h3>🚀 下一步</h3>
        <p>點擊下方按鈕返回完整的員工管理系統：</p>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ 
            padding: '10px 20px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          載入完整系統
        </button>
      </div>

      <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <h3>🔧 如果遇到問題</h3>
        <ol>
          <li>清除瀏覽器快取 (Ctrl+F5)</li>
          <li>開啟開發者工具 (F12) 檢查 Console 錯誤</li>
          <li>確認網路連線正常</li>
          <li>檢查 API 端點是否可存取</li>
        </ol>
      </div>
    </div>
  );
}

export default TestApp;
