import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, Shield, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-card)',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Calendar style={{ color: 'var(--primary)', width: '28px', height: '28px' }} />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          TableEase
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.02)', padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid var(--border-card)' }}>
          {user.role === 'admin' ? (
            <Shield style={{ color: 'var(--accent)', width: '16px', height: '16px' }} />
          ) : (
            <User style={{ color: 'var(--primary)', width: '16px', height: '16px' }} />
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {user.username}
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: user.role === 'admin' ? 'var(--accent)' : 'var(--success)',
            background: user.role === 'admin' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            border: `1px solid ${user.role === 'admin' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}`,
          }}>
            {user.role}
          </span>
        </div>

        <button 
          onClick={logout}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
