import axios from 'axios';

// 設定 API Gateway baseURL (production for E2E)
const api = axios.create({
	baseURL: 'https://q24xs6phwi.execute-api.ap-southeast-2.amazonaws.com/dev',
});

// 創建一個函數來獲取當前的access token
let currentAuth = null;
export const setAuthContext = (auth) => {
	currentAuth = auth;
};

// 添加請求攔截器來包含認證token
api.interceptors.request.use(
	(config) => {
		// 從 auth context 獲取 access token
		if (currentAuth?.user?.access_token) {
			// 重新啟用Authorization header
			config.headers.Authorization = `Bearer ${currentAuth.user.access_token}`;
			console.log('Sending token:', currentAuth.user.access_token.substring(0, 50) + '...');
		} else {
			console.log('No token available');
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 添加響應攔截器來處理認證錯誤
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token 過期，清除用戶狀態
			if (currentAuth?.removeUser) {
				currentAuth.removeUser();
			}
		}
		if (error.response?.status === 403) {
			// 授權失敗，提供更清晰的錯誤訊息
			console.error('授權失敗:', error.response.data);
			alert('授權失敗：您沒有權限訪問此資源。請聯繫管理員。');
		}
		return Promise.reject(error);
	}
);

// 打卡相關的API函數
export const checkInOut = async (employeeId, type, workStatus = null) => {
	try {
		const requestData = { employeeId, type };
		if (workStatus) {
			requestData.workStatus = workStatus;
		}
		
		const response = await api.post('/checkin', requestData);
		return response.data;
	} catch (error) {
		console.error('Check-in/out error:', error);
		throw error;
	}
};

export const getAttendanceRecords = async (employeeId = null, startDate = null, endDate = null) => {
	try {
		const params = {};
		if (employeeId) params.employeeId = employeeId;
		if (startDate) params.startDate = startDate;
		if (endDate) params.endDate = endDate;

		const response = await api.get('/attendance', { params });
		return response.data;
	} catch (error) {
		console.error('Get attendance records error:', error);
		throw error;
	}
};

export const generateAttendanceReport = async (month = null, year = null, employeeId = null) => {
	try {
		const params = {};
		if (month) params.month = month;
		if (year) params.year = year;
		if (employeeId) params.employeeId = employeeId;

		const response = await api.get('/attendance/report', { params });
		return response.data;
	} catch (error) {
		console.error('Generate attendance report error:', error);
		throw error;
	}
};

// 檢查用戶權限
export const checkUserPermissions = async () => {
	try {
		const response = await api.get('/auth/check-permissions');
		return response.data;
	} catch (error) {
		console.error('Check permissions error:', error);
		throw error;
	}
};

export default api;
