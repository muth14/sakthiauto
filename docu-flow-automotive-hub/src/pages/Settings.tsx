import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Users, Shield, Database, Bell, Palette, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Sakthi Auto',
    companyAddress: '123 Industrial Avenue, Chennai, Tamil Nadu',
    timeZone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
    enableNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  // User Management Settings
  const [userSettings, setUserSettings] = useState({
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 480, // minutes
    maxLoginAttempts: 3,
    accountLockoutDuration: 30, // minutes
    requireTwoFactor: false
  });

  // Form Settings
  const [formSettings, setFormSettings] = useState({
    autoSaveInterval: 5, // minutes
    maxFileUploadSize: 10, // MB
    allowedFileTypes: 'pdf,jpg,jpeg,png,xlsx,docx',
    requireApprovalForSubmission: true,
    enableDigitalSignatures: true,
    pdfWatermark: 'Digitally Verified by Sakthi Auto'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    formSubmissionAlerts: true,
    approvalReminders: true,
    maintenanceAlerts: true,
    systemUpdates: false,
    weeklyReports: true
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'forms', label: 'Forms & Documents', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const saveSettings = (settingsType: string) => {
    // In a real app, this would save to backend
    toast({
      title: "Settings Saved",
      description: `${settingsType} settings have been updated successfully.`
    });
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={generalSettings.companyName}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Time Zone
            </label>
            <select
              value={generalSettings.timeZone}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, timeZone: e.target.value }))}
              className="form-input"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Company Address
          </label>
          <textarea
            value={generalSettings.companyAddress}
            onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
            rows={3}
            className="form-input resize-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date Format
            </label>
            <select
              value={generalSettings.dateFormat}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
              className="form-input"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Language
            </label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
              className="form-input"
            >
              <option value="en">English</option>
              <option value="ta">Tamil</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">System Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Enable Notifications</label>
              <p className="text-xs text-muted-foreground">Receive system and form notifications</p>
            </div>
            <input
              type="checkbox"
              checked={generalSettings.enableNotifications}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Auto Backup</label>
              <p className="text-xs text-muted-foreground">Automatically backup system data</p>
            </div>
            <input
              type="checkbox"
              checked={generalSettings.autoBackup}
              onChange={(e) => setGeneralSettings(prev => ({ ...prev, autoBackup: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={() => saveSettings('General')}
        className="btn-primary flex items-center space-x-2"
      >
        <Save size={16} />
        <span>Save General Settings</span>
      </button>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Password Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Minimum Password Length
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={userSettings.passwordMinLength}
              onChange={(e) => setUserSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={userSettings.maxLoginAttempts}
              onChange={(e) => setUserSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Session Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              min="30"
              max="1440"
              value={userSettings.sessionTimeout}
              onChange={(e) => setUserSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={userSettings.accountLockoutDuration}
              onChange={(e) => setUserSettings(prev => ({ ...prev, accountLockoutDuration: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Security Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Require Special Characters</label>
              <p className="text-xs text-muted-foreground">Passwords must contain special characters</p>
            </div>
            <input
              type="checkbox"
              checked={userSettings.passwordRequireSpecialChars}
              onChange={(e) => setUserSettings(prev => ({ ...prev, passwordRequireSpecialChars: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Require Two-Factor Authentication</label>
              <p className="text-xs text-muted-foreground">Enable 2FA for all users</p>
            </div>
            <input
              type="checkbox"
              checked={userSettings.requireTwoFactor}
              onChange={(e) => setUserSettings(prev => ({ ...prev, requireTwoFactor: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={() => saveSettings('User Management')}
        className="btn-primary flex items-center space-x-2"
      >
        <Save size={16} />
        <span>Save User Settings</span>
      </button>
    </div>
  );

  const renderFormSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Form Behavior</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Auto-save Interval (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formSettings.autoSaveInterval}
              onChange={(e) => setFormSettings(prev => ({ ...prev, autoSaveInterval: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Max File Upload Size (MB)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formSettings.maxFileUploadSize}
              onChange={(e) => setFormSettings(prev => ({ ...prev, maxFileUploadSize: parseInt(e.target.value) }))}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Allowed File Types
        </label>
        <input
          type="text"
          value={formSettings.allowedFileTypes}
          onChange={(e) => setFormSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
          placeholder="pdf,jpg,jpeg,png,xlsx,docx"
          className="form-input"
        />
        <p className="text-xs text-muted-foreground mt-1">Comma-separated list of file extensions</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          PDF Watermark Text
        </label>
        <input
          type="text"
          value={formSettings.pdfWatermark}
          onChange={(e) => setFormSettings(prev => ({ ...prev, pdfWatermark: e.target.value }))}
          className="form-input"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Approval Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Require Approval for Submission</label>
              <p className="text-xs text-muted-foreground">All forms must be approved before finalization</p>
            </div>
            <input
              type="checkbox"
              checked={formSettings.requireApprovalForSubmission}
              onChange={(e) => setFormSettings(prev => ({ ...prev, requireApprovalForSubmission: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Enable Digital Signatures</label>
              <p className="text-xs text-muted-foreground">Allow digital signatures on forms</p>
            </div>
            <input
              type="checkbox"
              checked={formSettings.enableDigitalSignatures}
              onChange={(e) => setFormSettings(prev => ({ ...prev, enableDigitalSignatures: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={() => saveSettings('Form')}
        className="btn-primary flex items-center space-x-2"
      >
        <Save size={16} />
        <span>Save Form Settings</span>
      </button>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Enable Email Notifications</label>
              <p className="text-xs text-muted-foreground">Send notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Types</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Form Submission Alerts</label>
              <p className="text-xs text-muted-foreground">Notify when forms are submitted</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.formSubmissionAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, formSubmissionAlerts: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Approval Reminders</label>
              <p className="text-xs text-muted-foreground">Remind supervisors of pending approvals</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.approvalReminders}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, approvalReminders: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Maintenance Alerts</label>
              <p className="text-xs text-muted-foreground">Notify about scheduled maintenance</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.maintenanceAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, maintenanceAlerts: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">System Updates</label>
              <p className="text-xs text-muted-foreground">Notify about system updates and downtime</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.systemUpdates}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemUpdates: e.target.checked }))}
              className="rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Weekly Reports</label>
              <p className="text-xs text-muted-foreground">Send weekly activity summaries</p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.weeklyReports}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyReports: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={() => saveSettings('Notification')}
        className="btn-primary flex items-center space-x-2"
      >
        <Save size={16} />
        <span>Save Notification Settings</span>
      </button>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h3 className="text-lg font-semibold text-destructive mb-2">Security Settings</h3>
        <p className="text-sm text-destructive/80">
          These settings affect system security. Changes should be made carefully and with proper authorization.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">System Security</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Encryption Key Rotation
            </label>
            <button className="btn-secondary">
              Rotate Encryption Keys
            </button>
            <p className="text-xs text-muted-foreground mt-1">Last rotated: January 1, 2024</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Security Audit
            </label>
            <button className="btn-secondary">
              Run Security Scan
            </button>
            <p className="text-xs text-muted-foreground mt-1">Last scan: January 15, 2024</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Protection</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Enable Data Encryption</label>
              <p className="text-xs text-muted-foreground">Encrypt sensitive data at rest</p>
            </div>
            <input
              type="checkbox"
              checked={true}
              disabled
              className="rounded opacity-50"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">Audit Trail Logging</label>
              <p className="text-xs text-muted-foreground">Log all user actions and system events</p>
            </div>
            <input
              type="checkbox"
              checked={true}
              disabled
              className="rounded opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <p className="text-sm text-warning">
          <strong>Note:</strong> Some security settings are managed automatically and cannot be modified through this interface.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and administrative options
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="professional-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="professional-card">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'users' && renderUserSettings()}
            {activeTab === 'forms' && renderFormSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;