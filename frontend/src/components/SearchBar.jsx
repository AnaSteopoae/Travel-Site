import React , {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import RoomSelector from './RoomSelector';
import { useNavigate } from 'react-router-dom';

const romanianCities = [
  'București', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 
  'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea', 
  'Brăila', 'Arad', 'Pitești', 'Sibiu', 'Bacău', 
  'Târgu Mureș', 'Baia Mare', 'Alba Iulia', 'Satu Mare', 'Râmnicu Vâlcea',
  'Suceava', 'Piatra Neamț', 'Drobeta-Turnu Severin', 'Târgu Jiu', 'Focșani'
];

function SearchBar(){
  const navigate = useNavigate();
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  const handleLocationChange = (e) => {
    const inputValue = e.target.value;
    setLocation(inputValue);

    if (inputValue.length > 0) {
      const filteredCities = romanianCities.filter(city => 
        city.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredCities);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (city) => {
    setLocation(city);
    setSuggestions([]);
  };

  const handleCheckInChange = (e) => {
    const selectedDate = e.target.value;
    setCheckInDate(selectedDate);
    if (checkOutDate && new Date(selectedDate) >= new Date(checkOutDate)) {
      setCheckOutDate('');
    }
  };

  const handleCheckOutChange = (e) => {
    setCheckOutDate(e.target.value);
  };

  const handleGuestsAndRoomsChange = (totalGuests, totalRooms) => {
    setGuests(totalGuests);
    setRooms(totalRooms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.append('destination', location);
    if (checkInDate) searchParams.append('checkIn', checkInDate);
    if (checkOutDate) searchParams.append('checkOut', checkOutDate);
    if (guests) searchParams.append('guests', guests);
    if (rooms) searchParams.append('rooms', rooms);

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <Form className="mt-5 mb-5 p-4 shadow-lg rounded position-relative" onSubmit={handleSubmit}>
      <Form.Group className="mb-4" controlId="formLocation">
        <Form.Label className="fs-4">Locație</Form.Label>
        <div className="position-relative">
          <Form.Control 
            size="lg" 
            type="text" 
            placeholder="Introduceți destinația" 
            className="py-3"
            value={location}
            onChange={handleLocationChange}
            required
          />
          {suggestions.length > 0 && (
            <div 
              className="position-absolute border rounded shadow-sm" 
              style={{
                maxHeight: '200px', 
                overflowY: 'auto', 
                width: '100%', 
                zIndex: 1000,
                backgroundColor: 'white',
                top: '100%',
                left: 0
              }}
            >
              {suggestions.map((city, index) => (
                <div 
                  key={index}
                  className="p-2"
                  style={{
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #e0e0e0' : 'none'
                  }}
                  onClick={() => handleSuggestionClick(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>
      </Form.Group>
    
      <div className="row mb-4">
        <div className="col-md-6">
          <Form.Group controlId="formCheckIn">
            <Form.Label className="fs-4">Data check-in</Form.Label>
            <Form.Control 
              size="lg" 
              type="date" 
              className="py-3"
              min={getCurrentDate()}
              value={checkInDate}
              onChange={handleCheckInChange}
              required
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="formCheckOut">
            <Form.Label className="fs-4">Data check-out</Form.Label>
            <Form.Control 
              size="lg" 
              type="date" 
              className="py-3"
              min={checkInDate || getCurrentDate()}
              value={checkOutDate}
              onChange={handleCheckOutChange}
              required
              disabled={!checkInDate}
            />
          </Form.Group>
        </div>
      </div>
    
      <Form.Group className="mb-4">
        <Form.Label className="fs-4">Oaspeți și camere</Form.Label>
        <RoomSelector onGuestsAndRoomsChange={handleGuestsAndRoomsChange} />
      </Form.Group>
    
      <Button 
        size="lg" 
        type="submit" 
        className="px-5 py-3 fw-bold fs-5 w-100" 
        style={{ backgroundColor: '#a265f0', borderColor: '#6a11cb'}}
      >
        Caută
      </Button>
    </Form>
  );
}

export default SearchBar;