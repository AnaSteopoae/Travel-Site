import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import PropertyGallery from '../components/PropertyGallery';
import { getCookie } from '../utils/cookies';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import BookingStepper from '../components/BookingStepper';
import PropertyMap from '../components/PropertyMap';


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
  container: {
    padding: '30px 0'
  },
  pageTitle: {
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: '25px'
  },
  cardHeader: {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  bookingCard: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.15)',
    position: 'sticky',
    top: '2rem',
    background: 'white'
  },
  locationIcon: {
    color: colors.secondary,
    marginRight: '5px'
  },
  facilitiesIcon: {
    color: colors.primary,
    marginRight: '10px',
    fontSize: '1.2rem'
  },
  ratingBadge: {
    background: colors.gradientSecondary,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  priceInfo: {
    background: colors.lightPurple,
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px'
  },
  priceText: {
    color: colors.text,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  button: {
    background: colors.buttonGradient,
    border: 'none',
    borderRadius: '30px',
    padding: '12px',
    fontWeight: 'medium',
    boxShadow: '0 4px 10px rgba(106, 17, 203, 0.2)'
  },
  mapContainer: {
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: '1.3rem',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center'
  },
  reviewCard: {
    border: 'none',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '15px',
    background: colors.lightPurple,
    position: 'relative'
  },
  reviewRating: {
    background: colors.gradientSecondary,
    color: 'white',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: colors.lightPurple
  }
};

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 44.4268,
  lng: 26.1025 // București
};

const PropertyHome = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [ showAuthModal, setShowAuthModal ] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests')) || 2,
    rooms: parseInt(searchParams.get('rooms')) || 1
  });

  const getCoordinatesFromAddress = async (address) => {
    if (!address) {
      console.log("Adresa lipsă pentru geocoding");
      return null;
    }
    
    try {
      console.log("Obținere coordonate pentru adresa:", address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${PropertyMap.GOOGLE_MAPS_API_KEY || 'AIzaSyB4r7MBKgs3VeklQfF7ZYVqjIxlb3BK8nM'}`
      );
      
      if (!response.ok) {
        console.error("Eroare geocoding - răspuns invalid:", response.status);
        return null;
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log("Coordonate obținute:", { lat, lng });
        return { lat, lng };
      } else {
        console.error("Geocoding nereușit:", data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error('Eroare la obținerea coordonatelor:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/proprietati/${id}`);
        if (!response.ok) {
          throw new Error('Nu s-a putut prelua proprietatea');
        }
        const propertyData = await response.json();
        
        
        const transformedProperty = {
          ...propertyData,
          facilities: propertyData.details?.amenities?.map((amenity, index) => ({
            id: index + 1,
            name: amenity,
            icon: getIconForAmenity(amenity)
          })) || [],
          reviews: propertyData.reviews?.map((review, index) => ({
            id: index + 1,
            user: review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : "Utilizator anonim",
            date: new Date(review.date).toLocaleDateString('ro-RO'),
            rating: review.rating,
            comment: review.comment
          })) || [],
          fullAddress: `${propertyData.location?.street} ${propertyData.location?.number}, ${propertyData.location?.city}, ${propertyData.location?.county}, Romania`,
          location: `${propertyData.location?.city}, ${propertyData.location?.county}`,
          price: propertyData.pricing?.basePrice || 0,
          rating: propertyData.rating?.average || 0,
          reviewCount: propertyData.rating?.totalReviews || 0,
          images: propertyData.images?.map(img => img.url) || []
        };
        
        setProperty(transformedProperty);
        
        if (transformedProperty.fullAddress) {
          try {
            const coords = await getCoordinatesFromAddress(transformedProperty.fullAddress);
            if (coords) {
              setCoordinates(coords);
            } else {
              console.log("Nu s-au putut obține coordonatele, se folosesc coordonate default");
              setCoordinates(defaultCenter);
            }
          } catch (geoError) {
            console.error("Eroare la geocoding:", geoError);
            setCoordinates(defaultCenter);
          }
        }
      } catch (error) {
        console.error('Eroare la obținerea proprietății:', error);
        setError('Nu s-a putut încărca proprietatea. Vă rugăm încercați din nou.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyData();
    }
  }, [id]);

 
  const getIconForAmenity = (amenity) => {
    const iconMap = {
      'wifi': 'wifi',
      'parcare': 'p-square',
      'piscină': 'water',
      'aer condiționat': 'thermometer-snow',
      'restaurant': 'cup-hot',
      'spa': 'emoji-smile',
      'fitness': 'activity',
      'room service': 'bell',
      'tv': 'tv',
      'bucătărie': 'cup-straw',
      'mașină': 'car-front',
      'grătar': 'fire',
      'terasă': 'flower1',
      'vedere': 'binoculars',
      'mic dejun': 'egg-fried',
      'animale': 'trophy',
      'recepție': 'person-badge',
      'saună': 'droplet-half',
      'jacuzzi': 'water',
      'acces': 'person-wheelchair',
      'curățenie': 'brush'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (amenity.toLowerCase().includes(key)) {
        return icon;
      }
    }
    
    return 'check-circle';
  };

  
  const displayedFacilities = property && showAllFacilities 
    ? property.facilities 
    : property?.facilities?.slice(0, 6) || [];

  const calculateTotalPrice = () => {
    if (!property || !bookingDetails.checkIn || !bookingDetails.checkOut) {
      return 0;
    }

    const checkIn = new Date(bookingDetails.checkIn);
    const checkOut = new Date(bookingDetails.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return property.price * nights * bookingDetails.rooms;
  };

  const handleBooking = () => {
    const userId = getCookie('userId');
    if (!userId) {
      setShowAuthModal(true);
      return;
    }

    const totalPrice = calculateTotalPrice();
    const bookingParams = new URLSearchParams({
      propertyId: id,
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      guests: bookingDetails.guests,
      rooms: bookingDetails.rooms,
      totalPrice: totalPrice,
      basePrice: property.price
    });

    navigate(`/booking/details?${bookingParams.toString()}`);
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excepțional';
    if (rating >= 4) return 'Foarte bun';
    if (rating >= 3.5) return 'Bun';
    if (rating >= 3) return 'Satisfăcător';
    return 'Acceptabil';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" style={{ color: colors.primary, width: '3rem', height: '3rem' }} />
        <p className="mt-4" style={{ color: colors.text, fontWeight: 'medium' }}>
          Se încarcă detaliile proprietății...
        </p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert variant="warning" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)' }}>
          <Alert.Heading>
            <i className="bi bi-question-circle-fill me-2"></i>
            Proprietate negăsită
          </Alert.Heading>
          <p>Nu am putut găsi proprietatea căutată.</p>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-warning" 
              onClick={() => navigate('/')}
              className="rounded-pill px-4"
            >
              <i className="bi bi-house me-2"></i>
              Înapoi la pagina principală
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <BookingStepper currentStep={1} />
      <Container style={styles.container}>
        <Row>
          <Col md={8}>
            <h1 style={styles.pageTitle}>{property.name}</h1>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-geo-alt" style={styles.locationIcon}></i>
                <span className="text-muted">{property.location}</span>
              </div>
              <div style={styles.ratingBadge}>
                <i className="bi bi-star-fill me-1"></i>
                <span>{property.rating.toFixed(1)}</span>
              </div>
            </div>
            
            
            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '25px' }}>
              <PropertyGallery property={property} />
            </div>

           
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-info-circle me-2" style={{ color: colors.secondary }}></i>
                  Despre această proprietate
                </h2>
              </Card.Header>
              <Card.Body>
                <p>{property.description}</p>
              </Card.Body>
            </Card>
            
            
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-stars me-2" style={{ color: colors.secondary }}></i>
                  Facilități
                </h2>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {displayedFacilities.map((amenity, index) => (
                    <Col key={index} md={6} className="d-flex align-items-center">
                      <i className={`bi bi-${amenity.icon}`} style={styles.facilitiesIcon}></i>
                      <span>{amenity.name}</span>
                    </Col>
                  ))}
                </Row>
                {property.facilities.length > 6 && (
                  <div className="text-center mt-4">
                    <Button 
                      variant="outline-primary"
                      onClick={() => setShowAllFacilities(!showAllFacilities)}
                      className="rounded-pill"
                      style={{ 
                        borderColor: colors.primary,
                        color: colors.primary
                      }}
                    >
                      {showAllFacilities ? (
                        <>
                          <i className="bi bi-arrow-up-circle me-2"></i>
                          Arată mai puține
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-down-circle me-2"></i>
                          Arată toate facilitățile ({property.facilities.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>

            
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <div className="d-flex align-items-center justify-content-between">
                  <h2 style={styles.sectionTitle} className="mb-0">
                    <i className="bi bi-chat-dots me-2" style={{ color: colors.secondary }}></i>
                    Recenzii
                  </h2>
                  <div className="d-flex align-items-center">
                    <Badge style={styles.ratingBadge}>
                      <i className="bi bi-star-fill me-1"></i>
                      {property.rating.toFixed(1)}
                    </Badge>
                    <span className="text-muted ms-2">{property.reviewCount} recenzii</span>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {property.reviews && property.reviews.length > 0 ? (
                  <div>
                    {property.reviews.slice(0, 3).map(review => (
                      <div key={review.id} style={{
                        ...styles.reviewCard,
                        marginBottom: '15px'
                      }}>
                        <div className="d-flex justify-content-between mb-1">
                          <div className="fw-medium">{review.user}</div>
                          <div className="small text-muted">{review.date}</div>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <Badge style={styles.reviewRating}>
                            <i className="bi bi-star-fill me-1"></i>
                            {review.rating}
                          </Badge>
                          <span className="small text-muted ms-2">
                            {getRatingText(review.rating)}
                          </span>
                        </div>
                        <p className="mb-0">{review.comment}</p>
                      </div>
                    ))}
                  
                    {property.reviewCount > 3 && (
                      <div className="text-center mt-3">
                        <Button 
                          variant="outline-primary"
                          className="rounded-pill"
                          style={{ 
                            borderColor: colors.primary,
                            color: colors.primary
                          }}
                        >
                          <i className="bi bi-chat-text me-2"></i>
                          Vezi toate recenziile ({property.reviewCount})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-chat" style={{ fontSize: '2rem', color: colors.secondary }}></i>
                    <p className="text-muted mt-3">Încă nu există recenzii pentru această proprietate</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            
            <Card style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-geo-alt me-2" style={{ color: colors.secondary }}></i>
                  Locație
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={styles.mapContainer}>
                  <PropertyMap 
                    coordinates={coordinates || defaultCenter} 
                    propertyName={property?.name}
                  />
                </div>
                <div className="p-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-geo-alt me-2" style={{ color: colors.primary }}></i>
                    <span>{property?.fullAddress}</span>
                  </div>
                  {property?.details?.distanceFromCenter && (
                    <div className="mt-2 text-muted">
                      <i className="bi bi-info-circle me-2"></i>
                      La {property.details.distanceFromCenter} km de centru
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          
          <Col md={4}>
            <Card style={styles.bookingCard}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-calendar-check me-2" style={{ color: colors.secondary }}></i>
                  Rezervă acum
                </h2>
              </Card.Header>
              <Card.Body>
                <div style={styles.priceInfo}>
                  <div style={styles.priceText}>{property.price} RON / noapte</div>
                  <div className="d-flex align-items-center mt-1">
                    <Badge bg="success" className="rounded-pill me-2" style={{ background: colors.primary, border: 'none' }}>
                      <i className="bi bi-p-circle me-1"></i>
                      Preț bun
                    </Badge>
                    <span className="small text-muted">
                      Comparat cu alte oferte similare din zonă
                    </span>
                  </div>
                </div>

                {bookingDetails.checkIn && bookingDetails.checkOut && (
                  <div style={{
                    background: colors.lightPurple,
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Total pentru sejur:</span>
                      <strong style={{ color: colors.text, fontSize: '1.2rem' }}>{calculateTotalPrice()} RON</strong>
                    </div>
                    <small className="text-muted">Include toate taxele și comisioanele</small>
                  </div>
                )}

                <div className="mb-4">
                  <Card style={{ border: 'none', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
                    <Card.Body>
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-calendar-plus me-2" style={{ color: colors.primary }}></i>
                          <strong>Check-in:</strong>
                        </div>
                        <div className="ms-4">
                          {bookingDetails.checkIn ? (
                            <Badge style={{
                              background: colors.gradientSecondary,
                              padding: '5px 10px',
                              borderRadius: '10px'
                            }}>
                              {new Date(bookingDetails.checkIn).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </Badge>
                          ) : (
                            <span className="text-muted">Nespecificat</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-calendar-minus me-2" style={{ color: colors.primary }}></i>
                          <strong>Check-out:</strong>
                        </div>
                        <div className="ms-4">
                          {bookingDetails.checkOut ? (
                            <Badge style={{
                              background: colors.gradientSecondary,
                              padding: '5px 10px',
                              borderRadius: '10px'
                            }}>
                              {new Date(bookingDetails.checkOut).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </Badge>
                          ) : (
                            <span className="text-muted">Nespecificat</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-people me-2" style={{ color: colors.primary }}></i>
                          <strong>Oaspeți:</strong>
                        </div>
                        <div className="ms-4">
                          <Badge style={{
                            background: '#e6e6fa',
                            color: colors.text,
                            padding: '5px 10px',
                            borderRadius: '10px'
                          }}>
                            {bookingDetails.guests} persoane
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <div className="d-flex align-items-center mb-1">
                          <i className="bi bi-door-open me-2" style={{ color: colors.primary }}></i>
                          <strong>Camere:</strong>
                        </div>
                        <div className="ms-4">
                          <Badge style={{
                            background: '#e6e6fa',
                            color: colors.text,
                            padding: '5px 10px',
                            borderRadius: '10px'
                          }}>
                            {bookingDetails.rooms} {bookingDetails.rooms === 1 ? 'cameră' : 'camere'}
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>

                <Button 
                  size="lg" 
                  className="w-100"
                  onClick={handleBooking}
                  disabled={!bookingDetails.checkIn || !bookingDetails.checkOut}
                  style={styles.button}
                >
                  {(!bookingDetails.checkIn || !bookingDetails.checkOut) ? (
                    <>
                      <i className="bi bi-calendar2-x me-2"></i>
                      Selectează datele de sejur
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar2-check me-2"></i>
                      Rezervă acum
                    </>
                  )}
                </Button>

                {(!bookingDetails.checkIn || !bookingDetails.checkOut) && (
                  <Alert variant="warning" className="mt-3" style={{ borderRadius: '10px', border: 'none' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      <small>Selectați datele de check-in și check-out pentru a continua cu rezervarea</small>
                    </div>
                  </Alert>
                )}
                
                {!getCookie('userId') && (
                  <Alert variant="info" className="mt-3" style={{ borderRadius: '10px', border: 'none', background: 'rgba(126, 114, 242, 0.1)' }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-lock me-2" style={{ color: colors.primary }}></i>
                      <small>Trebuie să fiți <a href="/login" style={{ color: colors.text }}>autentificat</a> pentru a putea face o rezervare</small>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
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
          <p>Trebuie să fiți autentificat pentru a face o rezervare.</p>
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

export default PropertyHome;