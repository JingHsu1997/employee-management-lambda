import { Amplify } from 'aws-amplify';
import './App.css';
import EmployeeList from './EmployeeList';
import CognitoLogin from './CognitoLogin';
import api from './api';
import { useState } from 'react';

// Configure Amplify (Auth) once for the app
Amplify.configure({
  Auth: {
    region: 'ap-southeast-2',
    userPoolId: 'ap-southeast-2_aDll8F8yq',
    userPoolWebClientId: '6ktcfi5mi15ktlafc0cq562rfj',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
    // Ensure the Cognito.loginWith structure exists so Amplify doesn't try to read
    // `.loginWith` on an undefined Cognito object (avoids runtime TypeError).
    Cognito: {
      loginWith: { oauth: false }
    }
  }
});
function App() {
  const [idToken, setIdToken] = useState(localStorage.getItem('idToken') || '');

  const handleLogin = (token) => {
    setIdToken(token);
    localStorage.setItem('idToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // 若已登入則自動設 header
  if (idToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
  }

  return (
    <div className="App">
      {idToken ? <EmployeeList /> : <CognitoLogin onLogin={handleLogin} />}
    </div>
  );
}

export default App;
