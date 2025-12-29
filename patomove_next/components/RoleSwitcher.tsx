'use client';

import { useState } from 'react';

export type UserRole = 'path-lab' | 'ipc';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export default function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { value: 'path-lab' as UserRole, label: 'Path Lab Staff' },
    { value: 'ipc' as UserRole, label: 'IPC Staff' }
  ];

  const currentRoleLabel = roles.find(role => role.value === currentRole)?.label;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-sm text-gray-600">View as:</span>
        <span className="font-medium">{currentRoleLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => {
                onRoleChange(role.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                currentRole === role.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {role.label}
              {currentRole === role.value && (
                <span className="float-right text-blue-600">●</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}