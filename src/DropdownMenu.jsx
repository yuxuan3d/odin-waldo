import React, { useEffect, useRef } from 'react';
import './DropdownMenu.css'; // Import your CSS styles for the dropdown

function DropdownMenu({ items, position, onSelect, onClose, triggerRef }) {
  const dropdownRef = useRef(null);

  // Effect to handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close if clicked outside the dropdown and not on the trigger element
       if (
         dropdownRef.current &&
         !dropdownRef.current.contains(event.target) &&
         triggerRef.current && // Check if triggerRef exists
         !triggerRef.current.contains(event.target)
       ) {
         onClose();
       }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, triggerRef]); // Depend on onClose and triggerRef

  const handleItemClick = (item) => {
    onSelect(item);
    onClose(); // Close after selection
  };

  return (
    <ul 
      ref={dropdownRef}
      className="dropdown-menu" 
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {items.map((item) => (
        <li 
          key={item} 
          className="dropdown-item" 
          onClick={() => handleItemClick(item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default DropdownMenu;