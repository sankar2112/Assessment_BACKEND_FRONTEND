import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="auth-logo" style={{ width: '2rem', height: '2rem', marginBottom: 0 }}>
          <ShieldCheck size={20} />
        </div>
        <span>AuthPOC</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-primary" onClick={logout} style={{ backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'none' }}>
          <LogOut size={18} style={{ marginRight: '0.5rem' }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
