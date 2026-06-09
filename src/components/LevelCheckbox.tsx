import React from 'react';

interface LevelCheckboxProps {
  label: string;
  isL1Checked: boolean;
  isL2Checked: boolean;
  onL1Change: (checked: boolean) => void;
  onL2Change: (checked: boolean) => void;
}

export const LevelCheckbox: React.FC<LevelCheckboxProps> = ({
  label,
  isL1Checked,
  isL2Checked,
  onL1Change,
  onL2Change,
}) => {
  return (
    <div className="bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center text-sm space-y-3 shadow-xl">
      <span className="font-semibold text-gray-300 text-center">{label}</span>
      <div className="flex flex-col space-y-3 w-full px-1">
        <div className="flex items-center justify-center space-x-2">
          <label htmlFor={`${label}-l1`} className="text-gray-400 text-sm cursor-pointer">
            L2
          </label>
          <div className="relative flex items-center justify-center">
            <input
              id={`${label}-l1`}
              type="checkbox"
              checked={isL2Checked}
              onChange={(e) => onL2Change(e.target.checked)}
              className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 transition-all
                         checked:bg-purple-600 checked:border-purple-600"
            />
            <svg
              className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <label htmlFor={`${label}-l2`} className="text-gray-400 text-sm cursor-pointer">
            L1
          </label>
          <div className="relative flex items-center justify-center">
            <input
              id={`${label}-l2`}
              type="checkbox"
              checked={isL1Checked}
              onChange={(e) => onL1Change(e.target.checked)}
              className="peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-700 transition-all
                         checked:bg-cyan-500 checked:border-cyan-500"
            />
            <svg
              className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
