# 員工管理系統使用說明

## 🎯 功能概述

本系統實現了您要求的所有功能：

### 1. 員工登入後可看到：
- ✅ **員工列表**：顯示所有員工的基本資訊
- ✅ **員工打卡時間**：顯示今日上下班時間
- ✅ **出勤狀態**：支持四種工作狀態
  - 🏢 辦公室
  - 🏠 遠距工作  
  - ✈️ 公出
  - 🌴 休假

### 2. 員工可進行：
- ✅ **打卡功能**：上班/下班打卡
- ✅ **填寫出勤狀態**：可編輯工作狀態
- ✅ **查看出勤記錄**：個人出勤歷史
- ✅ **生成出勤報告**：月度統計報告

### 3. 管理員權限功能：
- ✅ **新增員工**：包含姓名、信箱、密碼、職位、部門、角色
- ✅ **編輯員工**：修改員工資訊
- ✅ **刪除員工**：移除員工記錄
- ✅ **查看所有員工出勤狀態**

## 🚀 系統架構

### 後端 (AWS Lambda)
- **API Gateway**: `https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev`
- **Authentication**: AWS Cognito User Pools
- **Database**: DynamoDB (Employees + CheckIns tables)
- **Functions**:
  - `createEmployee` - 新增員工 (管理員限定)
  - `getEmployees` - 獲取員工列表
  - `getEmployee` - 獲取單一員工資料
  - `updateEmployee` - 更新員工資料
  - `deleteEmployee` - 刪除員工 (管理員限定)
  - `checkIn` - 上下班打卡
  - `getAttendance` - 獲取出勤記錄
  - `generateReport` - 生成出勤報告

### 前端 (React)
- **URL**: `http://localhost:3000`
- **Authentication**: React OIDC Context
- **Components**:
  - `EmployeeList` - 員工管理界面
  - `AttendanceSystem` - 出勤打卡系統

## 🔐 權限控制

### 管理員 (Admin)
- 可新增、編輯、刪除所有員工
- 可查看所有員工的完整資訊
- 可修改員工角色和權限
- 擁有所有出勤管理功能

### 一般員工 (Employee)
- 只能查看自己的完整資料
- 可查看其他員工的基本資訊（姓名、職位、部門）
- 可進行自己的打卡操作
- 可修改自己的工作狀態
- 可查看自己的出勤記錄和報告

## 💡 主要特色

1. **智能權限控制**：根據用戶角色自動顯示對應功能
2. **即時狀態更新**：工作狀態變更立即生效
3. **豐富的出勤選項**：支持多種工作模式
4. **自動時間計算**：系統自動計算工作時長
5. **視覺化界面**：直觀的狀態顯示和操作按鈕
6. **安全認證**：基於 AWS Cognito 的企業級認證

## 🔧 技術特點

- **Serverless 架構**：高可用性和自動擴展
- **RESTful API**：標準化的 API 設計
- **Real-time Updates**：即時數據同步
- **Mobile Responsive**：支持手機和桌面訪問
- **Security First**：多層安全防護

## 📱 使用流程

1. **登入系統**：使用 Cognito 認證
2. **查看員工列表**：瀏覽所有員工和出勤狀態
3. **進行打卡**：選擇工作狀態並打卡
4. **管理員工** (僅管理員)：新增、編輯、刪除員工
5. **查看報告**：生成和查看出勤統計

系統現已完全部署並可正常使用！🎉
