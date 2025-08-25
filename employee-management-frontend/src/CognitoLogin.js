import React, { useState } from 'react';
import { signIn } from '@aws-amplify/auth';

function CognitoLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
  const user = await signIn(username, password);
      // handle NEW_PASSWORD_REQUIRED challenge
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        setChallenge(user);
        setError('此帳號需要設定新密碼，請在 Cognito 控制台或使用 CLI 將密碼設為 permanent。');
        return;
      }
      const idToken = user.signInUserSession.idToken.jwtToken;
      onLogin(idToken);
    } catch (err) {
      setError(err.message || '登入失敗');
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '40px auto' }}>
      <h3>員工登入</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="帳號"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="密碼"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">登入</button>
      </form>
      {challenge && (
        <div style={{ maxWidth: 300, margin: '20px auto' }}>
          <h4>帳號需更改密碼</h4>
          <p>此帳號目前狀態要求設定新密碼。請在 AWS Cognito 控制台為該使用者設定永久密碼（或使用 CLI 的 admin-set-user-password --permanent），再回到此處登入。</p>
        </div>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default CognitoLogin;