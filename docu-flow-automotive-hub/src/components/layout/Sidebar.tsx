import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckCircle,
  ClipboardList,
  Settings,
  Users,
  BarChart3,
  Archive,
  Upload,
  Wrench,
  Cog,
  FileSpreadsheet,
  Shield,
  LogOut,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator', 'Auditor']
  },
  {
    title: 'Forms',
    href: '/forms',
    icon: FileText,
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator', 'Auditor']
  },
  {
    title: 'Form Builder',
    href: '/form-builder',
    icon: PlusCircle,
    roles: ['Admin', 'Supervisor']
  },
  {
    title: 'Form Approval',
    href: '/form-approval',
    icon: CheckCircle,
    roles: ['Admin', 'Supervisor']
  },
  {
    title: 'Form Submissions',
    href: '/form-submissions',
    icon: FolderOpen,
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Operator', 'Auditor']
  },
  {
    title: 'Analytics Dashboard',
    href: '/analytics',
    icon: BarChart3,
    roles: ['Admin', 'Supervisor', 'Line Incharge']
  },
  {
    title: 'Data Visualization',
    href: '/data-visualization',
    icon: FileSpreadsheet,
    roles: ['Admin', 'Supervisor', 'Line Incharge']
  },
  {
    title: 'Job Verification',
    href: '/job-verification',
    icon: ClipboardList,
    roles: ['Admin', 'Line Incharge']
  },
  {
    title: 'My Submissions',
    href: '/my-submissions',
    icon: Archive,
    roles: ['Operator', 'Line Incharge']
  },
  {
    title: 'PDF Versions',
    href: '/pdf-versions',
    icon: FileSpreadsheet,
    roles: ['Admin', 'Supervisor', 'Line Incharge', 'Auditor']
  },
  {
    title: 'Excel Upload',
    href: '/excel-upload',
    icon: Upload,
    roles: ['Admin', 'Supervisor']
  },
  {
    title: 'Machine Setup',
    href: '/machine-setup',
    icon: Cog,
    roles: ['Admin', 'Supervisor']
  },
  {
    title: 'Tool Setup',
    href: '/tool-setup',
    icon: Wrench,
    roles: ['Admin', 'Supervisor']
  },
  {
    title: 'Audit Log',
    href: '/audit-log',
    icon: Shield,
    roles: ['Admin', 'Auditor']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['Admin']
  }
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <h1 className="font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent text-xl tracking-wider">SAKTHI</h1>
          <h2 className="font-light bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent text-xl tracking-widest -mt-1">AUTO</h2>
          <p className="text-gray-600 text-sm mt-2">Digital Documentation</p>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium text-sm truncate">{user.name}</p>
              <p className="text-gray-600 text-xs">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'nav-active bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-blue-100 hover:text-blue-800'
                }
              `}
            >
              <Icon size={18} />
              <span className="font-medium">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-800 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;