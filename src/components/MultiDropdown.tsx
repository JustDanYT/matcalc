import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from './Icon';

interface MultiDropdownOption {
  id: string;
  name: string;
  icon?: string;
  prerelease?: boolean;
  rarity?: number;
}

interface MultiDropdownProps {
  label: string;
  options: MultiDropdownOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
}

export const MultiDropdown: React.FC<MultiDropdownProps> = ({
  label,
  options,
  selectedIds,
  onToggle,
  placeholder = "-- Select --",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(o => selectedIds.includes(o.id));

  const filteredOptions = options
    .filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleToggle = (optionId: string) => {
    onToggle(optionId);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const getRarityGlowClass = (rarity?: number) => {
    switch (rarity) {
      case 1:
        return 'border-2 border-gray-400 shadow-[0_0_8px_rgba(156,163,175,0.7)]';
      case 2:
        return 'border-2 border-green-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';
      case 3:
        return 'border-2 border-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]';
      case 4:
        return 'border-2 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]';
      case 5:
        return 'border-2 border-yellow-400 shadow-[0_0_8px_rgba(252,211,77,0.7)]';
      default:
        return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <h2 className="text-xl font-semibold mb-3 text-gray-300">{label}</h2>
      <button
        type="button"
        className="w-full h-14 py-2 px-3 rounded-xl bg-gray-800 text-gray-100 border border-gray-700 flex items-center justify-between focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          {selectedIds.length > 0 ? (
            <span className="text-gray-100">{selectedIds.length} selected</span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <svg className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-xl shadow-lg border border-gray-700 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul role="listbox" className="py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <li
                    key={option.id}
                    id={`option-${option.id}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 transition-colors duration-150 ${
                      isSelected ? 'bg-purple-700 text-white' : 'text-gray-200'
                    }`}
                    onClick={() => handleToggle(option.id)}
                  >
                    {option.icon && (
                      <Icon
                        src={option.icon}
                        alt={option.name}
                        className={`w-10 h-10 mr-3 rounded-full ${getRarityGlowClass(option.rarity)}`}
                      />
                    )}
                    <span className="flex-grow">{option.name}</span>
                    {isSelected && (
                      <svg className="h-5 w-5 text-purple-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-2 text-gray-400 text-center">No results found</li>
            )}
          </ul>
        </div>
      )}

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedOptions.map(opt => (
            <span
              key={opt.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 rounded-lg text-sm text-gray-200"
            >
              {opt.icon && (
                <Icon src={opt.icon} alt={opt.name} className={`w-6 h-6 rounded-full ${getRarityGlowClass(opt.rarity)}`} />
              )}
              <span className="max-w-[120px] truncate">{opt.name}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(opt.id); }}
                className="ml-1 hover:text-red-400 transition-colors"
                title={`Remove ${opt.name}`}
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
