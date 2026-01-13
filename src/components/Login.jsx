import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, isFirstTime }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!password.trim()) {
      setError('Please enter a password');
      setIsLoading(false);
      return;
    }

    if (isFirstTime) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters');
        setIsLoading(false);
        return;
      }
    }

    try {
      const success = onLogin(password);
      if (!success) {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="om-symbol">ॐ</div>
          <h1>HabitGrid</h1>
          <p className="login-subtitle">
            {isFirstTime ? 'Set Your Master Password' : 'Enter Your Password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">
              {isFirstTime ? 'Create Password' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isFirstTime ? 'Enter a secure password' : 'Enter your password'}
              autoFocus
              disabled={isLoading}
            />
          </div>

          {isFirstTime && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isLoading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Please wait...' : isFirstTime ? 'Set Password' : 'Unlock'}
          </button>

          {isFirstTime && (
            <p className="login-note">
              ⚠️ Remember this password! Your data is protected with this password.
            </p>
          )}
        </form>

        <div className="login-footer">
          <p className="radhe-text">राधे राधे 🙏</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
