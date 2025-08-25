import axios from 'axios';

// 設定 API Gateway baseURL
const api = axios.create({
  baseURL: 'https://6zrtt3kdc8.execute-api.ap-southeast-2.amazonaws.com/dev',
});

export default api;
