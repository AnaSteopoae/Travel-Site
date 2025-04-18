import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PropertyGallery from '../components/PropertyGallery';
import PropertyMap from '../components/PropertyMap';
import ReviewForm from '../components/ReviewForm';
import { getCookie } from '../utils/cookies';
import { Container, Row, Col, Card, Alert, Spinner, Button, Badge, Navbar } from 'react-bootstrap';


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

const PropertyPage = () => {
  const { id } = useParams();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userId, setUserId] = useState(null);

  const defaultCenter = {
    lat: 44.4268,
    lng: 26.1025 // București
  };

  // Stiluri pentru componente
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
    card: {
      border: 'none',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)',
      marginBottom: '24px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    cardHeader: {
      background: colors.lightPurple,
      color: colors.text,
      fontWeight: 'bold',
      border: 'none',
      padding: '15px 20px'
    },
    cardHeaderPrimary: {
      background: colors.gradientPrimary,
      color: 'white',
      fontWeight: 'bold',
      border: 'none',
      padding: '15px 20px'
    },
    reviewItem: {
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      marginBottom: '20px',
      paddingBottom: '20px'
    },
    amenityIcon: {
      color: colors.primary,
      marginRight: '10px',
      fontSize: '1.1rem'
    }
  };

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
        )}&key=${PropertyMap.GOOGLE_MAPS_API_KEY}`
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
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error(`Nu s-a putut prelua proprietatea: ${errorData.message || response.statusText}`);
        }
        const propertyData = await response.json();
        
        const fullAddress = `${propertyData.location.street} ${propertyData.location.number}, ${propertyData.location.city}, ${propertyData.location.county}, Romania`;
        
        const transformedProperty = {
          ...propertyData,
          location: `${propertyData.location.city}, ${propertyData.location.county}`,
          fullAddress: fullAddress,
          price: propertyData.pricing.basePrice,
          facilities: propertyData.details.amenities.map((amenity, index) => ({
            id: index + 1,
            name: amenity,
            icon: getIconForAmenity(amenity)
          })),
          reviews: propertyData.reviews.map((review, index) => ({
            id: index + 1,
            user: review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : "Utilizator anonim",
            date: new Date(review.date).toLocaleDateString('ro-RO'),
            rating: review.rating,
            comment: review.comment
          })),
          images: propertyData.images.map(img => img.url),
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
        } else {
          setCoordinates(defaultCenter);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError(err.message || 'A apărut o eroare la obținerea datelor proprietății');
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id]);

  useEffect(() => {
    const checkReviewEligibility = async () => {
      const userId = getCookie('userId');
      if (!userId || !id) return;

      try {
        const response = await fetch(`/api/proprietati/${id}/can-review`, {
          credentials: 'include'
        });
        if (response.ok) {
          const { canReview } = await response.json();
          setCanReview(canReview);
        }
      } catch (error) {
        console.error('Eroare la verificarea eligibilității pentru recenzie:', error);
      }
    };

    checkReviewEligibility();
  }, [id]);

  useEffect(() => {
    const checkAuth = () => {
      const clientId = getCookie('userId');
      const proprietarId = getCookie('proprietarId');
      
      if (clientId) {
        setIsAuthenticated(true);
        setUserType('client');
        setUserId(clientId);
      } else if (proprietarId) {
        setIsAuthenticated(true);
        setUserType('proprietar');
        setUserId(proprietarId);
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        setUserId(null);
      }
    };
    
    checkAuth();
  }, []);

  const handleReviewSubmitted = (newReview) => {
    setProperty(prev => ({
      ...prev,
      reviews: [
        {
          id: newReview.id,
          user: newReview.user,
          rating: newReview.rating,
          comment: newReview.comment,
          date: newReview.date
        },
        ...prev.reviews
      ],
      rating: {
        ...prev.rating,
        average: newReview.newAverageRating,
        totalReviews: prev.rating.totalReviews + 1
      }
    }));
    setShowReviewForm(false);
  };
  const getIconForAmenity = (amenity) => {
    const iconMap = {
      'wifi': 'wifi',
      'wi-fi': 'wifi',
      'parcare': 'p-square-fill',
      'aer condiționat': 'thermometer-snow',
      'încălzire': 'thermometer-high',
      'piscină': 'water',
      'tv': 'tv',
      'bucătărie': 'cup-hot',
      'mașină de spălat': 'water',
      'uscător': 'tornado',
      'grătar': 'fire',
      'terasă': 'house',
      'vedere la mare': 'binoculars-fill',
      'vedere la munte': 'binoculars-fill',
      'mic dejun': 'egg-fried',
      'animale': 'emoji-smile',
      'recepție': 'clock',
      'room service': 'bell',
      'saună': 'droplet-half',
      'jacuzzi': 'water',
      'fitness': 'bicycle',
      'persoane cu dizabilități': 'person-badge',
      'curățenie': 'brush',
      'balcon': 'door-open',
      'bar': 'cup-straw',
      'restaurant': 'shop',
      'copii': 'emoji-laughing',
      'șemineu': 'fire',
      'seif': 'safe',
      'frigider': 'archive',
      'cafea': 'cup'
    };
    
    const lowerAmenity = amenity.toLowerCase();
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerAmenity.includes(key)) {
        return icon;
      }
    }
    
    return 'check-circle';
  };

  if (loading) {
    return (
      <>
        <Navbar style={styles.header} expand="lg">
          <Container>
            {isAuthenticated && userType === 'client' ? (
              <Navbar.Brand as={Link} to={`/user/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
            ) : isAuthenticated && userType === 'proprietar' ? (
              <Navbar.Brand as={Link} to={`/proprietar/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
            ) : (
              <Navbar.Brand as={Link} to="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
            )}
          </Container>
        </Navbar>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar style={styles.header} expand="lg">
          <Container>
            {isAuthenticated && userType === 'client' ? (
              <Navbar.Brand as={Link} to={`/user/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
            ) : isAuthenticated && userType === 'proprietar' ? (
              <Navbar.Brand as={Link} to={`/proprietar/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
            ) : (
              <Navbar.Brand as={Link} to="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
            )}
          </Container>
        </Navbar>
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Eroare!</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </>
    );
  }

  if (!property) {
    return (
      <Container className="py-5">
        <Alert 
          variant="warning" 
          style={{ 
            borderRadius: '12px', 
            border: 'none', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-question-circle-fill me-3 fs-3"></i>
            <div>
              <Alert.Heading>Proprietate negăsită</Alert.Heading>
              <p className="mb-0">Nu am putut găsi proprietatea căutată.</p>
            </div>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Navbar style={styles.header} expand="lg">
        <Container>
          {isAuthenticated && userType === 'client' ? (
            <Navbar.Brand as={Link} to={`/user/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
          ) : isAuthenticated && userType === 'proprietar' ? (
            <Navbar.Brand as={Link} to={`/proprietar/${userId}`} style={styles.logo}>HaiHui.ro</Navbar.Brand>
          ) : (
            <Navbar.Brand as={Link} to="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          )}
        </Container>
      </Navbar>

      <div style={{ background: colors.lightPurple, minHeight: '100vh', paddingBottom: '40px' }}>
        <div 
          style={{ 
            background: colors.gradientPrimary,
            padding: '60px 0 30px 0',
            color: 'white',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Container>
            <h1 className="mb-2 fw-bold">{property.name}</h1>
            <p className="mb-0 fs-5 d-flex align-items-center">
              <i className="bi bi-geo-alt me-2"></i> {property.location}
            </p>
            {property.rating && property.rating.totalReviews > 0 && (
              <div className="d-flex align-items-center mt-3">
                <Badge 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.3)', 
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontWeight: '500'
                  }}
                >
                  <i className="bi bi-star-fill me-1 text-warning"></i>
                  <span>{property.rating.average.toFixed(1)}</span>
                </Badge>
                <span className="ms-2 text-white">
                  ({property.rating.totalReviews} {property.rating.totalReviews === 1 ? 'recenzie' : 'recenzii'})
                </span>
              </div>
            )}
          </Container>
        </div>
        
        <Container>
          <Row className="mb-4">
            <Col>
              <Card style={styles.card}>
                <Card.Body className="p-0">
                  <PropertyGallery property={property} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col lg={8}>
              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader}>
                  <h4 className="mb-0">
                    <i className="bi bi-info-circle me-2"></i> Despre această proprietate
                  </h4>
                </Card.Header>
                <Card.Body className="p-4">
                  <div className="mb-4">
                    <p style={{ fontSize: '1.1rem' }}>{property.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <h5 className="mb-0 fw-bold" style={{ color: colors.text }}>
                        <i className="bi bi-stars me-2" style={{ color: colors.primary }}></i> Facilități
                      </h5>
                    </div>
                    <Row className="g-2">
                      {property.facilities.map((amenity, index) => (
                        <Col key={index} md={6} lg={4} className="mb-2">
                          <div 
                            className="d-flex align-items-center p-2 rounded"
                            style={{ 
                              background: `${colors.primary}08`,
                              border: `1px solid ${colors.primary}15`
                            }}
                          >
                            <i className={`bi bi-${amenity.icon}`} style={styles.amenityIcon}></i>
                            <span>{amenity.name}</span>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Card.Body>
              </Card>

              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader}>
                  <h4 className="mb-0">
                    <i className="bi bi-geo-alt me-2"></i> Locație
                  </h4>
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ height: '400px', overflow: 'hidden' }}>
                    <PropertyMap 
                      coordinates={coordinates || defaultCenter} 
                      propertyName={property.name}
                    />
                  </div>
                  <div className="p-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-pin-map-fill me-2" style={{ color: colors.primary }}></i>
                      <span>{property.fullAddress}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 className="mb-0">
                      <i className="bi bi-star me-2"></i> Recenzii ({property.rating.totalReviews})
                    </h4>
                    {property.rating.average > 0 && (
                      <div className="text-muted small mt-1">
                        Rating mediu: 
                        <span className="fw-bold ms-1" style={{ color: colors.text }}>
                          {property.rating.average.toFixed(1)}
                        </span> 
                        <span className="text-warning ms-1">
                          {[...Array(Math.round(property.rating.average))].map((_, i) => (
                            <i key={i} className="bi bi-star-fill" style={{ fontSize: '0.8rem' }}></i>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                  {canReview && !showReviewForm && (
                    <Button 
                      className="rounded-pill px-3"
                      style={{ 
                        background: colors.buttonGradient,
                        border: 'none',
                        fontWeight: '500',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={() => setShowReviewForm(true)}
                    >
                      <i className="bi bi-plus-circle me-2"></i> Adaugă o recenzie
                    </Button>
                  )}
                </Card.Header>
                <Card.Body className="p-4">
                  {showReviewForm && (
                    <div className="mb-4 p-3 rounded" style={{ background: colors.lightPurple, border: `1px solid ${colors.primary}15` }}>
                      <h5 className="mb-3" style={{ color: colors.text }}>Spune-ți părerea</h5>
                      <ReviewForm 
                        propertyId={id} 
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    </div>
                  )}

                  {property.reviews && property.reviews.length > 0 ? (
                    <div className="reviews-list">
                      {property.reviews.map((review) => (
                        <div key={review.id} style={styles.reviewItem} className="review-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center">
                              <div 
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: colors.gradientSecondary,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '1.2rem'
                                }}
                              >
                                {review.user.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="mb-1" style={{ color: colors.text }}>{review.user}</h5>
                                <div className="text-muted small">{review.date}</div>
                              </div>
                            </div>
                            <div className="text-warning">
                              {[...Array(5)].map((_, index) => (
                                <i 
                                  key={index}
                                  className={`bi ${index < review.rating ? 'bi-star-fill' : 'bi-star'}`}
                                  style={{ fontSize: '1rem', marginLeft: '2px' }}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 mb-0">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <i className="bi bi-chat" style={{ fontSize: '3rem', color: colors.secondary, opacity: 0.3 }}></i>
                      <p className="text-muted mt-3 mb-0">
                        Această proprietate nu are încă recenzii.
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <div style={{ position: 'sticky', top: '20px' }}>
                <Card style={styles.card}>
                  <Card.Header style={styles.cardHeaderPrimary}>
                    <h4 className="mb-0">
                      <i className="bi bi-currency-exchange me-2"></i> Preț și disponibilitate
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="price-info mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fs-5 fw-bold" style={{ color: colors.text }}>
                            {property.price} RON
                          </span>
                          <span className="text-muted ms-2">/ noapte</span>
                        </div>
                        <Badge 
                          style={{ 
                            background: '#4CAF5020',
                            color: '#2E7D32',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}
                        >
                          <i className="bi bi-check-circle me-1"></i> Disponibil
                        </Badge>
                      </div>
                      <div className="mt-2 text-muted small">
                        <i className="bi bi-info-circle me-1"></i> Include toate taxele și comisioanele
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button 
                        className="w-100 py-3 rounded-pill fw-bold"
                        style={{ 
                          background: colors.buttonGradient,
                          border: 'none',
                          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <i className="bi bi-calendar-check me-2"></i> Rezervă acum
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
                
                <Card style={styles.card} className="mt-4">
                  <Card.Body className="p-4">
                    <h5 className="mb-3" style={{ color: colors.text }}>
                      <i className="bi bi-lightning me-2" style={{ color: colors.primary }}></i> Informații rapide
                    </h5>
                    <div className="mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-people me-2" style={{ color: colors.primary }}></i>
                        <div>
                          <span>Capacitate maximă</span>
                          <div className="fw-bold">{property.details?.maxGuests || 'N/A'} persoane</div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 pb-3 border-bottom">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-house-door me-2" style={{ color: colors.primary }}></i>
                        <div>
                          <span>Tip proprietate</span>
                          <div className="fw-bold text-capitalize">{property.type || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    {property.details?.numberOfRooms && (
                      <div className="mb-3 pb-3 border-bottom">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-door-closed me-2" style={{ color: colors.primary }}></i>
                          <div>
                            <span>Camere</span>
                            <div className="fw-bold">{property.details.numberOfRooms}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {property.details?.surfaceArea && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-rulers me-2" style={{ color: colors.primary }}></i>
                          <div>
                            <span>Suprafață</span>
                            <div className="fw-bold">{property.details.surfaceArea} m²</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default PropertyPage;