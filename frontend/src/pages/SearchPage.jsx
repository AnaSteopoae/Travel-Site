import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button, Navbar, Nav, Form, Badge, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getCookie } from '../utils/cookies';

// Noua paletă de culori mov-lila-roz
const colors = {
  primary: '#8075ff',
  secondary: '#c16ecf',
  text: '#6a11cb',
  accentColor: '#9370DB',
  lightPurple: '#f5f0ff',
  darkPurple: '#5b42a5',
  gradientPrimary: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 100%)',
  gradientSecondary: 'linear-gradient(135deg, #8075ff 25%, #c16ecf 100%)',
  buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)',
};

const styles = {
  header: {
    background: colors.gradientPrimary,
    color: 'white',
    padding: '15px 0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  logo: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.8rem',
    textDecoration: 'none'
  },
  propertyCard: {
    marginBottom: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
  },
  propertyImage: {
    height: '200px',
    objectFit: 'cover'
  },
  searchResults: {
    padding: '20px 0'
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 0',
    background: colors.lightPurple,
    borderRadius: '12px',
    marginTop: '20px'
  },
  filterSection: {
    backgroundColor: colors.lightPurple,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    position: 'sticky',
    top: '20px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)'
  },
  filterTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: colors.text
  },
  filterGroup: {
    marginBottom: '20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    paddingBottom: '15px'
  },
  priceRange: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  searchHeader: {
    background: colors.lightPurple,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.05)'
  },
  badge: {
    background: colors.gradientSecondary,
    border: 'none',
    borderRadius: '12px',
    padding: '5px 10px'
  },
  favoriteButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    zIndex: 2
  },
  checkboxIcon: {
    color: colors.primary,
    marginRight: '10px'
  }
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [ showAuthModal, setShowAuthModal ] = useState(false);
  
  // Filter states
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Filter options
  const amenities = [
    { id: 'Wi-Fi', label: 'Wi-Fi' },
    { id: 'Parcare', label: 'Parcare' },
    { id: 'Piscină', label: 'Piscină' },
    { id: 'Aer condiționat', label: 'Aer condiționat' },
    { id: 'TV', label: 'TV' },
    { id: 'Încălzire', label: 'Încălzire' },
    { id: 'Bucătărie', label: 'Bucătărie' },
    { id: 'Mașină de spălat', label: 'Mașină de spălat' },
    { id: 'Uscător', label: 'Uscător' },
    { id: 'Grătar', label: 'Grătar' },
    { id: 'Terasă', label: 'Terasă' },
    { id: 'Vedere la mare/munte', label: 'Vedere la mare/munte' },
    { id: 'Mic dejun inclus', label: 'Mic dejun inclus' },
    { id: 'Animale de companie permise', label: 'Animale de companie permise' },
    { id: 'Recepție 24/7', label: 'Recepție 24/7' },
    { id: 'Room service', label: 'Room service' },
    { id: 'Saună', label: 'Saună' },
    { id: 'Jacuzzi', label: 'Jacuzzi' },
    { id: 'Sală de fitness', label: 'Sală de fitness' },
    { id: 'Acces pentru persoane cu dizabilități', label: 'Acces pentru persoane cu dizabilități' },
    { id: 'Serviciu de curățenie', label: 'Serviciu de curățenie' },
    { id: 'Balcon', label: 'Balcon' },
    { id: 'Bar', label: 'Bar' },
    { id: 'Restaurant', label: 'Restaurant' },
    { id: 'Loc de joacă pentru copii', label: 'Loc de joacă pentru copii' },
    { id: 'Șemineu', label: 'Șemineu' },
    { id: 'Seif', label: 'Seif' },
    { id: 'Mini-frigider', label: 'Mini-frigider' },
    { id: 'Espressor / aparat de cafea', label: 'Espressor / aparat de cafea' }
  ];

  const propertyTypes = [
    { id: 'apartament', label: 'Apartament' },
    { id: 'casă', label: 'Casă' },
    { id: 'vilă', label: 'Vilă' },
    { id: 'cameră de hotel', label: 'Cameră de hotel' },
    { id: 'bungalow', label: 'Bungalow' }
  ];

  const ratings = [
    { id: '1 stea', label: '1 stea' },
    { id: '2 stele', label: '2 stele' },
    { id: '3 stele', label: '3 stele' },
    { id: '4 stele', label: '4 stele' },
    { id: '5 stele', label: '5 stele' }
  ];

  // Filter handlers
  const handleAmenityChange = (amenityId) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handlePropertyTypeChange = (typeId) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleRatingChange = (ratingId) => {
    setSelectedRatings(prev => 
      prev.includes(ratingId)
        ? prev.filter(id => id !== ratingId)
        : [...prev, ratingId]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Apply filters
  useEffect(() => {
    if (properties.length > 0) {
      // Începem cu toate proprietățile
      let filtered = [...properties];
  
      // IMPORTANT: Aplicăm întâi filtrele de bază (acestea trebuie aplicate întotdeauna)
      const guests = parseInt(searchParams.get('guests')) || 0;
      const rooms = parseInt(searchParams.get('rooms')) || 1;
      
      filtered = filtered.filter(property => {
        const propertyGuests = property.details.maxGuests;
        const propertyRooms = property.details.numberOfRooms;
        
        // Allow properties with up to 2 extra guests and 1 extra room
        const guestsMatch = propertyGuests >= guests && propertyGuests <= guests + 2;
        const roomsMatch = propertyRooms >= rooms && propertyRooms <= rooms + 1;
        
        return guestsMatch && roomsMatch;
      });
  
      // Apoi aplicăm filtrele UI opționale
      // Apply amenity filters
      if (selectedAmenities.length > 0) {
        filtered = filtered.filter(property => {
          // Accesăm amenities din obiectul details
          const amenitiesArray = property.details?.amenities;
          
          // Dacă nu există facilități, excludem proprietatea
          if (!amenitiesArray || !Array.isArray(amenitiesArray)) return false;
          
          // Normalizăm facilitățile pentru comparație
          const normalizedAmenities = amenitiesArray.map(amenity => 
            amenity.toLowerCase().trim()
          );
          
          // Verificăm dacă toate facilitățile selectate există în array
          return selectedAmenities.every(selectedAmenity => 
            normalizedAmenities.includes(selectedAmenity.toLowerCase().trim())
          );
        });
      }
      
  
      // Apply property type filters
      if (selectedPropertyTypes.length > 0) {
        filtered = filtered.filter(property => {
          // Corectăm accesarea tipului proprietății
          const propertyType = property.details?.type || property.type;
          return propertyType && selectedPropertyTypes.some(selectedType => 
            selectedType.toLowerCase() === propertyType.toLowerCase()
          );
        });
      }
  
      // Apply rating filters
      if (selectedRatings.length > 0) {
        filtered = filtered.filter(property => {
          const rating = Math.round(property.rating?.average || 0);
          return selectedRatings.some(ratingId => {
            const stars = parseInt(ratingId.split(' ')[0]);
            return rating === stars;
          });
        });
      }
  
      // Apply price range filter
      if (priceRange.min || priceRange.max) {
        filtered = filtered.filter(property => {
          const price = property.pricing?.basePrice;
          const min = priceRange.min ? parseFloat(priceRange.min) : 0;
          const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
          return price >= min && price <= max;
        });
      }
  
      setFilteredProperties(filtered);
    }
  }, [properties, selectedAmenities, selectedPropertyTypes, selectedRatings, priceRange, searchParams]);

  const toggleFavorite = async (propertyId) => {
    try {
      const userId = getCookie('userId');
      if (!userId) {
        setShowAuthModal(true);
        return;
      }

      const isFavorite = favorites.includes(propertyId);
      const endpoint = isFavorite ? 'remove' : 'add';
      
      const response = await fetch(`/api/users/${userId}/favorites/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ propertyId })
      });

      if (!response.ok) {
        throw new Error('Nu s-a putut actualiza lista de favorite');
      }

      setFavorites(prev => 
        isFavorite 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
    } catch (err) {
      console.error('Eroare la actualizarea favoritei:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const destination = searchParams.get('destination');
        const checkIn = searchParams.get('checkIn');
        const checkOut = searchParams.get('checkOut');
        const guests = parseInt(searchParams.get('guests')) || 0;
        const rooms = parseInt(searchParams.get('rooms')) || 1;

        let searchUrl = '/api/proprietati/search?';
        if (destination) searchUrl += `destination=${destination}&`;
        if (checkIn) searchUrl += `checkIn=${checkIn}&`;
        if (checkOut) searchUrl += `checkOut=${checkOut}&`;
        if (guests) searchUrl += `guests=${guests}&`;
        if (rooms) searchUrl += `rooms=${rooms}`;

        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
          throw new Error('Nu s-au putut încărca rezultatele căutării');
        }
        const searchData = await searchResponse.json();
        setProperties(searchData);

        // Verificăm disponibilitatea pentru fiecare proprietate
        const availabilityChecks = await Promise.all(
          searchData.map(async (property) => {
            if (!checkIn || !checkOut) return true; // Dacă nu sunt specificate datele, considerăm proprietatea disponibilă
            
            try {
              const availabilityResponse = await fetch(`/api/proprietati/${property._id}/check-availability`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  checkIn,
                  checkOut
                })
              });
              
              if (!availabilityResponse.ok) return false;
              
              const availabilityData = await availabilityResponse.json();
              return availabilityData.available;
            } catch (error) {
              console.error('Eroare la verificarea disponibilității:', error);
              return false;
            }
          })
        );

        // Filtrăm proprietățile disponibile
        const availableProperties = searchData.filter((_, index) => availabilityChecks[index]);

        // Filter properties based on guests and rooms
        const filtered = availableProperties.filter(property => {
          const propertyGuests = property.details.maxGuests;
          const propertyRooms = property.details.numberOfRooms;
          
          // Allow properties with up to 2 extra guests and 1 extra room
          const guestsMatch = propertyGuests >= guests && propertyGuests <= guests + 2;
          const roomsMatch = propertyRooms >= rooms && propertyRooms <= rooms + 1;
          
          return guestsMatch && roomsMatch;
        });

        setFilteredProperties(filtered);

        const userId = getCookie('userId');
        if (userId) {
          const favoritesResponse = await fetch(`/api/users/${userId}/favorites`, {
            credentials: 'include'
          });
          if (favoritesResponse.ok) {
            const favoritesData = await favoritesResponse.json();
            setFavorites(favoritesData.map(prop => prop._id));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const handlePropertyClick = (propertyId) => {
    const params = new URLSearchParams(searchParams);
    navigate(`/proprietati/rezervare/${propertyId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" 
           style={{ height: '100vh', background: colors.lightPurple }}>
        <Spinner animation="border" style={{ color: colors.primary, width: '3rem', height: '3rem' }} />
        <p className="mt-4" style={{ color: colors.text, fontWeight: 'medium' }}>
          Se încarcă rezultatele căutării...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navbar style={styles.header} expand="lg">
          <Container>
            <Navbar.Brand href="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          </Container>
        </Navbar>
        <Container className="py-5">
          <Alert variant="danger" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)' }}>
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              A apărut o eroare
            </Alert.Heading>
            <p>{error}</p>
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-danger" 
                onClick={() => navigate('/')}
                className="rounded-pill px-4"
              >
                <i className="bi bi-house me-2"></i>
                Înapoi la pagina principală
              </Button>
            </div>
          </Alert>
        </Container>
      </>
    );
  }

  const destination = searchParams.get('destination') || 'Toate destinațiile';
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  const rooms = searchParams.get('rooms');

  return (
    <>
      <Navbar style={styles.header} expand="lg">
        <Container>
          <Navbar.Brand href="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Button 
                variant="outline-light" 
                onClick={() => navigate('/')}
                className="rounded-pill px-4"
              >
                <i className="bi bi-search me-2"></i>
                Căutare nouă
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container style={styles.searchResults}>
        <div style={styles.searchHeader}>
          <h2 style={{ color: colors.text, fontWeight: 'bold' }}>
            <i className="bi bi-search me-2"></i>
            Rezultate căutare pentru: {destination}
          </h2>
          {(checkIn && checkOut) && (
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Badge style={styles.badge}>
                <i className="bi bi-calendar-event me-1"></i> 
                {new Date(checkIn).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {' '}-{' '}
                {new Date(checkOut).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Badge>
              
              {guests && (
                <Badge style={styles.badge}>
                  <i className="bi bi-people me-1"></i> {guests} oaspeți
                </Badge>
              )}
              
              {rooms && (
                <Badge style={styles.badge}>
                  <i className="bi bi-door-closed me-1"></i> {rooms} {parseInt(rooms) === 1 ? 'cameră' : 'camere'}
                </Badge>
              )}
            </div>
          )}
          
        </div>
        
        <Row>
          {/* Filter Sidebar */}
          <Col md={3}>
            <div style={styles.filterSection}>
              <h5 style={{ 
                color: colors.text, 
                borderBottom: `2px solid ${colors.secondary}`,
                paddingBottom: '10px',
                marginBottom: '20px'
              }}>
                <i className="bi bi-funnel me-2"></i>
                Filtrează rezultatele
              </h5>
              
              {/* Price Range Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterTitle}>
                  <i className="bi bi-cash-coin me-2" style={{ color: colors.secondary }}></i>
                  Buget pe noapte
                </div>
                <div style={styles.priceRange}>
                  <Form.Control
                    type="number"
                    placeholder="Min RON"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    size="sm"
                    style={{ background: 'white', borderColor: colors.primary, borderRadius: '8px' }}
                  />
                  <span>-</span>
                  <Form.Control
                    type="number"
                    placeholder="Max RON"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    size="sm"
                    style={{ background: 'white', borderColor: colors.primary, borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Amenities Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterTitle}>
                  <i className="bi bi-stars me-2" style={{ color: colors.secondary }}></i>
                  Facilități
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
                  {amenities.map(amenity => (
                    <Form.Check
                      key={amenity.id}
                      type="checkbox"
                      id={`amenity-${amenity.id}`}
                      label={
                        <span style={{ color: selectedAmenities.includes(amenity.id) ? colors.text : 'inherit' }}>
                          {amenity.label}
                        </span>
                      }
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => handleAmenityChange(amenity.id)}
                      className="mb-2"
                    />
                  ))}
                </div>
              </div>

              {/* Property Type Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterTitle}>
                  <i className="bi bi-house-door me-2" style={{ color: colors.secondary }}></i>
                  Tipul proprietății
                </div>
                {propertyTypes.map(type => (
                  <Form.Check
                    key={type.id}
                    type="checkbox"
                    id={`type-${type.id}`}
                    label={
                      <span style={{ color: selectedPropertyTypes.includes(type.id) ? colors.text : 'inherit' }}>
                        {type.label}
                      </span>
                    }
                    checked={selectedPropertyTypes.includes(type.id)}
                    onChange={() => handlePropertyTypeChange(type.id)}
                    className="mb-2"
                  />
                ))}
              </div>

              {/* Rating Filter */}
              <div style={styles.filterGroup}>
                <div style={styles.filterTitle}>
                  <i className="bi bi-star-half me-2" style={{ color: colors.secondary }}></i>
                  Evaluare proprietate
                </div>
                {ratings.map(rating => (
                  <Form.Check
                    key={rating.id}
                    type="checkbox"
                    id={`rating-${rating.id}`}
                    label={
                      <span style={{ color: selectedRatings.includes(rating.id) ? colors.text : 'inherit' }}>
                        {rating.label} <i className="bi bi-star-fill text-warning"></i>
                      </span>
                    }
                    checked={selectedRatings.includes(rating.id)}
                    onChange={() => handleRatingChange(rating.id)}
                    className="mb-2"
                  />
                ))}
              </div>
            </div>
          </Col>

          {/* Property Results */}
          <Col md={9}>
            {filteredProperties.length === 0 ? (
              <div style={styles.noResults}>
                <i className="bi bi-search" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                <h3 style={{ color: colors.text, marginTop: '20px' }}>
                  Nu s-au găsit proprietăți care să corespundă criteriilor de căutare
                </h3>
                <p className="text-muted">Încercați să modificați criteriile de căutare sau filtrele aplicate</p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/')}
                  className="mt-3 rounded-pill px-4"
                  style={{ background: colors.buttonGradient, border: 'none' }}
                >
                  <i className="bi bi-house me-2"></i>
                  Înapoi la pagina principală
                </Button>
              </div>
            ) : (
              <Row className="g-4">
                {filteredProperties.map((property) => (
                  <Col key={property._id} md={6} lg={4}>
                    <Card 
                      style={styles.propertyCard}
                      onClick={() => handlePropertyClick(property._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Card.Img 
                          variant="top" 
                          src={property.images && property.images[0]?.url || '/placeholder-property.jpg'} 
                          style={styles.propertyImage}
                          className="img-fluid"
                        />
                        <Button
                          variant="light"
                          style={{
                            ...styles.favoriteButton,
                            color: favorites.includes(property._id) ? '#c16ecf' : '#6c757d'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property._id);
                          }}
                          title={!getCookie('userId') ? 'Trebuie să fiți autentificat pentru a adăuga la favorite' : 'Adaugă la favorite'}
                        >
                          <i className={`bi bi-heart${favorites.includes(property._id) ? '-fill' : ''}`} style={{ fontSize: '1.2rem' }}></i>
                        </Button>
                      </div>
                      <Card.Body>
                        <Card.Title style={{ color: colors.text, fontWeight: 'bold' }}>{property.name}</Card.Title>
                        <Card.Text>
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-geo-alt me-1" style={{ color: colors.secondary }}></i> 
                            {property.location.city}
                          </small>
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div>
                            <span className="fw-bold" style={{ color: colors.primary }}>
                              {property.pricing.basePrice} RON
                            </span>
                            <span className="text-muted">/noapte</span>
                            <br />
                            <small className="text-muted d-flex align-items-center mt-1">
                              <i className="bi bi-people me-1"></i>
                              {property.details.maxGuests} oaspeți 
                              <span className="mx-1">•</span> 
                              <i className="bi bi-door-closed me-1"></i>
                              {property.details.numberOfRooms} {property.details.numberOfRooms === 1 ? 'cameră' : 'camere'}
                            </small>
                          </div>
                          <div className="d-flex align-items-center">
                            <Badge 
                              style={{ 
                                background: colors.gradientSecondary,
                                padding: '6px 10px',
                                borderRadius: '12px',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              <i className="bi bi-star-fill me-1"></i> 
                              {property.rating && property.rating.average ? property.rating.average.toFixed(1) : '0.0'}
                            </Badge>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
        {filteredProperties.length > 0 && (
          <div className="text-center mt-4">
            <p className="text-muted">Ați găsit <strong>{filteredProperties.length}</strong> proprietăți</p>
            {selectedAmenities.length > 0 || selectedPropertyTypes.length > 0 || 
             selectedRatings.length > 0 || priceRange.min || priceRange.max ? (
              <Button 
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => {
                  setSelectedAmenities([]);
                  setSelectedPropertyTypes([]);
                  setSelectedRatings([]);
                  setPriceRange({ min: '', max: '' });
                }}
              >
                <i className="bi bi-x-circle me-2"></i>
                Resetează toate filtrele
              </Button>
            ) : null}
          </div>
        )}
      </Container>
      <Modal 
        show={showAuthModal} 
        onHide={() => {
          setShowAuthModal(false);
          navigate('/login');
        }}
        centered
      >
        <Modal.Header 
          closeButton
          style={{ 
            background: colors.gradientPrimary,
            color: 'white',
            border: 'none'
          }}
        >
          <Modal.Title>
            <i className="bi bi-exclamation-circle me-2"></i>
            Autentificare necesară
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>Trebuie să fiți autentificat pentru a alege o cazare pentru Favorite.</p>
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button 
            className="rounded-pill"
            style={{ 
              background: colors.buttonGradient,
              border: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => {
              setShowAuthModal(false);
              navigate('/login');
            }}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>
            Mergi la autentificare
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SearchPage;