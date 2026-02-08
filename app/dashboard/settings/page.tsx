'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'My Dashboard',
    siteDescription: 'A NextJS dashboard with RTL support',
    language: 'en',
    enableRTL: true,
    itemsPerPage: '10'
  });
  
  const [userSettings, setUserSettings] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Settings saved:', {
        generalSettings,
        userSettings,
        notificationSettings
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-end mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Tab.Group>
          <Tab.List className="flex p-1 space-x-1 bg-gray-100 rtl:space-x-reverse">
            {['General', 'User Profile', 'Notifications'].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full py-2.5 text-sm font-medium leading-5 text-gray-700',
                    'focus:outline-none',
                    selected
                      ? 'bg-white shadow'
                      : 'hover:bg-gray-200'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="p-6">
            <Tab.Panel>
              <form onSubmit={handleSaveSettings} className="space-y-6 text-right">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                
                <div>
                  <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                    Site Description
                  </label>
                  <textarea
                    id="siteDescription"
                    name="siteDescription"
                    rows={3}
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <select
                      id="language"
                      name="language"
                      value={generalSettings.language}
                      onChange={handleGeneralChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    >
                      <option value="en">English</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700">
                      Items Per Page
                    </label>
                    <select
                      id="itemsPerPage"
                      name="itemsPerPage"
                      value={generalSettings.itemsPerPage}
                      onChange={handleGeneralChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center justify-end">
                  <input
                    type="checkbox"
                    id="enableRTL"
                    name="enableRTL"
                    checked={generalSettings.enableRTL}
                    onChange={(e) => handleGeneralChange(e)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
                  />
                  <label htmlFor="enableRTL" className="block text-sm font-medium text-gray-700">
                    Enable RTL
                  </label>
                </div>
                
                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </Tab.Panel>
            
            <Tab.Panel>
              <form onSubmit={handleSaveSettings} className="space-y-6 text-right">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userSettings.name}
                    onChange={handleUserChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userSettings.email}
                    onChange={handleUserChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  
                  <div className="mt-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={userSettings.currentPassword}
                      onChange={handleUserChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={userSettings.newPassword}
                        onChange={handleUserChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={userSettings.confirmPassword}
                        onChange={handleUserChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-right"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </Tab.Panel>
            
            <Tab.Panel>
              <form onSubmit={handleSaveSettings} className="space-y-6 text-right">
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
                    />
                    <label htmlFor="emailNotifications" className="block text-sm font-medium text-gray-700">
                      Email Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <input
                      id="pushNotifications"
                      name="pushNotifications"
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
                    />
                    <label htmlFor="pushNotifications" className="block text-sm font-medium text-gray-700">
                      Push Notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <input
                      id="weeklyDigest"
                      name="weeklyDigest"
                      type="checkbox"
                      checked={notificationSettings.weeklyDigest}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
                    />
                    <label htmlFor="weeklyDigest" className="block text-sm font-medium text-gray-700">
                      Weekly Digest
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <input
                      id="marketingEmails"
                      name="marketingEmails"
                      type="checkbox"
                      checked={notificationSettings.marketingEmails}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-2"
                    />
                    <label htmlFor="marketingEmails" className="block text-sm font-medium text-gray-700">
                      Marketing Emails
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}