# 管理員權限設定指南

## 方法一：使用 Cognito Groups (推薦)

### 1. 在 AWS Console 中設定 Cognito Groups

1. 登入 AWS Console，前往 Amazon Cognito
2. 選擇您的 User Pool: `ap-southeast-2_aDll8F8yq`
3. 在左側選單點選 "Groups"
4. 點選 "Create group"
5. 輸入以下資訊：
   - Group name: `Admins`
   - Description: `Administrators with full access to employee management`
   - Precedence: `1` (數字越小優先級越高)
6. 點選 "Create group"

### 2. 將使用者加入 Admins 群組

1. 在 Cognito User Pool 中，選擇 "Users"
2. 找到要設為管理員的使用者
3. 點選使用者名稱進入詳細頁面
4. 點選 "Groups" 標籤
5. 點選 "Add user to group"
6. 選擇 "Admins" 群組
7. 點選 "Add to group"

## 方法二：使用 Custom Attributes

### 1. 設定 Custom Attribute

1. 在 Cognito User Pool 中，選擇 "Attributes"
2. 找到 "Custom attributes" 區段
3. 如果還沒有 `role` 屬性，點選 "Add custom attribute"
4. 輸入：
   - Name: `role`
   - Type: String
   - Mutable: Yes
5. 點選 "Add attribute"

### 2. 設定使用者的 role 屬性

1. 選擇 "Users"，找到要設為管理員的使用者
2. 點選使用者名稱
3. 點選 "Edit" (在 Attributes 區段)
4. 在 custom:role 欄位輸入 `admin`
5. 點選 "Save changes"

## 方法三：Email 白名單 (快速測試)

直接在程式碼中設定管理員 email：

```javascript
// 在 utils/permissions.js 中修改
const adminEmails = [
    'admin@company.com',
    'manager@company.com',
    // 加入您的管理員 email
];
```

## 測試權限設定

1. 前往 http://localhost:3000
2. 登入系統
3. 查看是否有管理員功能（新增、編輯、刪除員工）
4. 可以使用權限診斷工具檢查設定

## 權限診斷

我們提供了權限診斷工具，可以幫您檢查當前使用者的權限狀態：

1. 在前端應用中會顯示權限診斷資訊
2. 也可以直接呼叫 API：
   ```
   GET https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev/auth/check-permissions
   ```

## 故障排除

### 問題：使用者無法看到管理員功能
1. 確認使用者已登入
2. 檢查使用者是否在 Admins 群組中
3. 檢查 custom:role 是否設為 'admin'
4. 確認 JWT token 包含正確的群組或屬性資訊

### 問題：API 回傳 403 Forbidden
1. 檢查 Authorization header 是否正確
2. 確認 JWT token 尚未過期
3. 檢查 Cognito 設定是否正確

### 問題：無法建立或編輯員工
1. 確認使用者有管理員權限
2. 檢查 API Gateway 和 Lambda 的 IAM 權限
3. 查看 CloudWatch Logs 中的錯誤訊息

## 安全建議

1. **最小權限原則**：只給必要的使用者管理員權限
2. **定期審查**：定期檢查管理員清單
3. **多因素驗證**：為管理員帳戶啟用 MFA
4. **監控日誌**：監控管理員操作的日誌

## API 端點

所有 API 端點都已部署並可使用：

- 員工管理：`https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev/employees`
- 打卡功能：`https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev/checkin`
- 權限檢查：`https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev/auth/check-permissions`
