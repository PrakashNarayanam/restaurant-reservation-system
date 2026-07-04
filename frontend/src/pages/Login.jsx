import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, KeyRound, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res?.success) {
      // Fetch latest profile or navigate based on role
      // Simple decode or we can check the state since login returns user
      // Let's redirect based on role
      const token = localStorage.getItem('token');
      // AuthProvider useEffect will trigger, but let's read the user object from localStorage/context
      // We can just navigate to '/' and let routing redirect
      navigate('/');
    } else {
      setError(res?.message || 'Invalid username or password');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem 1.5rem',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p>Login to manage your table reservations</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            <AlertCircle style={{ flexShrink: 0, width: '20px', height: '20px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px', height: '18px' }} />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '18px', height: '18px' }} />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', gap: '0.75rem', padding: '0.85rem' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : (
              <>
                <LogIn style={{ width: '18px', height: '18px' }} />
                Log In
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.5rem' }}>Quick Demo Accounts:</strong>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>👤 Customer: <code style={{ color: 'var(--success)' }}>customer</code> / <code style={{ color: 'var(--success)' }}>customerpassword123</code></li>
            <li>🔑 Admin: <code style={{ color: 'var(--success)' }}>admin</code> / <code style={{ color: 'var(--success)' }}>adminpassword123</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
