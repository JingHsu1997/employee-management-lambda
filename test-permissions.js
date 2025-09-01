// 權限測試腳本
// 使用方式：在瀏覽器 Console 中執行

async function testPermissions() {
    const apiBaseUrl = 'https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev';
    
    // 獲取當前使用者的 token
    const token = localStorage.getItem('idToken') || sessionStorage.getItem('idToken');
    
    if (!token) {
        console.error('❌ 未找到 JWT token，請先登入');
        return;
    }
    
    console.log('🔍 開始權限測試...');
    
    try {
        // 1. 檢查權限診斷
        console.log('\n1. 檢查權限診斷：');
        const permissionResponse = await fetch(`${apiBaseUrl}/auth/check-permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (permissionResponse.ok) {
            const permissionData = await permissionResponse.json();
            console.log('✅ 權限診斷成功：', permissionData);
            
            if (permissionData.isAdmin) {
                console.log('🎉 恭喜！您有管理員權限');
            } else {
                console.log('ℹ️ 您目前沒有管理員權限');
                console.log('📋 權限檢查詳情：', permissionData.checks);
            }
        } else {
            console.error('❌ 權限診斷失敗：', await permissionResponse.text());
        }
        
        // 2. 測試獲取員工列表
        console.log('\n2. 測試獲取員工列表：');
        const employeesResponse = await fetch(`${apiBaseUrl}/employees`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (employeesResponse.ok) {
            const employeesData = await employeesResponse.json();
            console.log('✅ 獲取員工列表成功');
            console.log(`📊 共有 ${employeesData.employees.length} 名員工`);
            console.log(`👤 您的管理員狀態：${employeesData.isAdmin ? '是' : '否'}`);
        } else {
            console.error('❌ 獲取員工列表失敗：', await employeesResponse.text());
        }
        
        // 3. 測試管理員功能（如果有權限）
        console.log('\n3. 測試管理員功能：');
        const testEmployee = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'TempPassword123!',
            position: 'Test Position',
            department: 'Test Department',
            role: 'employee'
        };
        
        const createResponse = await fetch(`${apiBaseUrl}/employees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testEmployee)
        });
        
        if (createResponse.ok) {
            const createData = await createResponse.json();
            console.log('✅ 測試員工建立成功（管理員權限確認）');
            
            // 清理測試資料
            const deleteResponse = await fetch(`${apiBaseUrl}/employees/${createData.employee.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (deleteResponse.ok) {
                console.log('🧹 測試資料已清理');
            }
        } else {
            const errorText = await createResponse.text();
            if (createResponse.status === 403) {
                console.log('ℹ️ 無管理員權限（這是正常的，如果您不是管理員）');
            } else {
                console.error('❌ 建立員工失敗：', errorText);
            }
        }
        
    } catch (error) {
        console.error('❌ 測試過程發生錯誤：', error);
    }
    
    console.log('\n🏁 權限測試完成');
}

// 執行測試
console.log('👋 歡迎使用員工管理系統權限測試工具');
console.log('📝 請確保您已經登入系統');
console.log('🚀 開始執行測試...');
testPermissions();
