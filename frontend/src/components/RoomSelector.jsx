import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const RoomSelector = ({ onGuestsAndRoomsChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const dropdownRef = useRef(null);

  const selectionText = `${adults} adulți · ${children} copii · ${rooms} ${rooms === 1 ? 'cameră' : 'camere'}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (onGuestsAndRoomsChange) {
      onGuestsAndRoomsChange(adults + children, rooms);
    }
  }, [adults, children, rooms, onGuestsAndRoomsChange]);

  const increment = (setter, value, min, max) => {
    if (value < max) {
      setter(value + 1);
    }
  };

  const decrement = (setter, value, min) => {
    if (value > min) {
      setter(value - 1);
    }
  };

  return (
    <div className="room-selector position-relative" ref={dropdownRef}>
      <Button
        variant="outline-secondary"
        className="d-flex align-items-center justify-content-between w-100"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-person me-2"></i>
          <span>{selectionText}</span>
        </div>
        <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'}`}></i>
      </Button>

      {showDropdown && (
        <div className="dropdown-menu show position-absolute w-100 p-3 shadow-sm border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>Adulți</span>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => decrement(setAdults, adults, 1)}
                disabled={adults <= 1}
              >
                −
              </Button>
              <span className="mx-3">{adults}</span>
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => increment(setAdults, adults, 1, 30)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <span>Copii</span>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => decrement(setChildren, children, 0)}
                disabled={children <= 0}
              >
                −
              </Button>
              <span className="mx-3">{children}</span>
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => increment(setChildren, children, 0, 10)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span>Camere</span>
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => decrement(setRooms, rooms, 1)}
                disabled={rooms <= 1}
              >
                −
              </Button>
              <span className="mx-3">{rooms}</span>
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={() => increment(setRooms, rooms, 1, 10)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="d-grid gap-2 mt-3">
            <Button 
              variant="primary" 
              onClick={() => setShowDropdown(false)}
              className="w-100"
            >
              Gata
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSelector;