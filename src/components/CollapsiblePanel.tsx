import React, { useState, ReactNode } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

interface CollapsiblePanelProps {
  title: string | ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  panelClassName?: string;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = false,
  panelClassName,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`bg-gray-700 rounded-lg shadow-md mb-4 ${panelClassName}`}>
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={togglePanel}
      >

        {typeof title === 'string' ? (
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        ) : (
          <div className="flex-grow">{title}</div>
        )}
        {isOpen ? (
          <IoIosArrowUp className="text-white text-2xl" />
        ) : (
          <IoIosArrowDown className="text-white text-2xl" />
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'max-h-[9999px] opacity-100 p-4' : 'max-h-0 opacity-0 p-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};