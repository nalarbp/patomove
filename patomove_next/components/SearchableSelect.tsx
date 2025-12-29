'use client';

import { useState, useRef, useEffect } from 'react';
import ComponentFeedback from './ComponentFeedback';

interface Option {
  id: string;
  name: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  onCreateNew?: () => void;
  createNewLabel?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function SearchableSelect({
  label,
  placeholder = "Search and select...",
  options,
  value,
  onChange,
  onCreateNew,
  createNewLabel = "Create New",
  required = false,
  disabled = false,
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subtitle && option.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Update display value when value prop changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => opt.id === value);
      setDisplayValue(selectedOption?.name || '');
    } else {
      setDisplayValue('');
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setDisplayValue(newValue);
    setIsOpen(true);

    // Clear selection if user is typing something different
    if (value) {
      const selectedOption = options.find(opt => opt.id === value);
      if (selectedOption && newValue !== selectedOption.name) {
        onChange('');
      }
    }
  };

  const handleOptionSelect = (option: Option) => {
    setDisplayValue(option.name);
    setSearchTerm('');
    setIsOpen(false);
    onChange(option.id);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setSearchTerm('');
    if (onCreateNew) {
      onCreateNew();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <ComponentFeedback componentName="SearchableSelect" />
      
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-2"
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Create New Option */}
          {onCreateNew && searchTerm && filteredOptions.length === 0 && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 flex items-center text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {createNewLabel}: "{searchTerm}"
            </button>
          )}

          {/* Create New Option (always visible if provided) */}
          {onCreateNew && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 flex items-center text-blue-600 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {createNewLabel}
            </button>
          )}

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex flex-col ${
                  value === option.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                <span className="font-medium">{option.name}</span>
                {option.subtitle && (
                  <span className="text-xs text-gray-500 mt-1">{option.subtitle}</span>
                )}
              </button>
            ))
          ) : !searchTerm ? (
            <div className="px-3 py-2 text-gray-500 text-sm">No options available</div>
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}