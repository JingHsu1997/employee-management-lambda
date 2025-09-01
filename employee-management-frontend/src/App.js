// App.js

import "./App.css";
import { useAuth } from "react-oidc-context";
import EmployeeList from "./EmployeeList";
import AttendanceSystem from "./AttendanceSystem";
import PermissionDiagnostic from "./PermissionDiagnostic";
import { setAuthContext } from "./api";
import { useEffect } from "react";

function App() {
  const auth = useAuth();

  // 設置 auth context 到 API 模組
  useEffect(() => {
    setAuthContext(auth);
    // 調試：檢查token
    if (auth.user) {
      console.log('Auth user:', auth.user);
      console.log('Access token:', auth.user.access_token?.substring(0, 50) + '...');
    }
  }, [auth]);

  const signOutRedirect = () => {
    const clientId = "6ktcfi5mi15ktlafc0cq562rfj";
    const logoutUri = "http://localhost:3000";
    const cognitoDomain = "https://ap-southeast-2adll8f8yq.auth.ap-southeast-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <h3>歡迎, {auth.user?.profile.email}</h3>
          <button onClick={() => auth.removeUser()} style={{ marginRight: '10px' }}>Sign out</button>
          <button onClick={signOutRedirect}>Sign out (Redirect)</button>
        </div>

        <PermissionDiagnostic />

        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <EmployeeList />
          </div>
          <div style={{ flex: 1 }}>
            <AttendanceSystem currentUser={auth.user} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>員工管理系統</h1>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
    </div>
  );
}

export default App;