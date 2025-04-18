import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { getCookie } from '../utils/cookies';
import BookingStepper from '../components/BookingStepper';

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
    marginBottom: '20px'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '25px'
  },
  cardHeader: {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    color: colors.text,
    fontWeight: '500',
    marginBottom: '8px'
  },
  formControl: {
    borderColor: '#e0d8ff',
    borderRadius: '8px',
    padding: '10px 12px',
    backgroundColor: colors.lightPurple,
    '&:focus': {
      borderColor: colors.primary,
      boxShadow: '0 0 0 0.25rem rgba(126, 114, 242, 0.25)'
    }
  },
  submitButton: {
    background: colors.buttonGradient,
    border: 'none',
    borderRadius: '30px',
    padding: '12px',
    fontWeight: 'medium',
    boxShadow: '0 4px 10px rgba(106, 17, 203, 0.2)'
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  summaryCard: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.15)',
    position: 'sticky',
    top: '2rem'
  },
  summarySection: {
    marginBottom: '20px',
    padding: '0 0 15px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  summaryLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '10px'
  },
  totalRow: {
    borderTop: '1px solid rgba(0,0,0,0.1)',
    paddingTop: '12px',
    marginTop: '12px',
    fontWeight: 'bold'
  },
  radioOption: {
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  radioSelected: {
    backgroundColor: colors.lightPurple,
    borderColor: colors.primary
  },
  periodBadge: {
    background: colors.gradientSecondary,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '10px',
    display: 'inline-block',
    marginBottom: '5px',
    fontWeight: '500'
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: colors.lightPurple
  },
  editLink: {
    color: colors.secondary,
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
};

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  
  const bookingParams = useMemo(() => ({
    propertyId: searchParams.get('propertyId'),
    checkIn: searchParams.get('checkIn'),
    checkOut: searchParams.get('checkOut'),
    guests: parseInt(searchParams.get('guests') || '2'),
    rooms: parseInt(searchParams.get('rooms') || '1'),
    totalPrice: parseFloat(searchParams.get('totalPrice') || '0'),
    basePrice: parseFloat(searchParams.get('basePrice') || '0')
  }), [searchParams]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [property, setProperty] = useState(null);
  const [hasSavedCard, setHasSavedCard] = useState(false);
  const [editCard, setEditCard] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'România',
    cardNumber: '',
    cardExpiryDate: '',
    cardCvv: '',
    specialRequests: '',
    arrivalTime: '',
    paymentMethod: 'card',
    saveInfo: true
  });

  
  const formatCardNumber = (value) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = numericValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formattedValue.slice(0, 19);
  };

  const formatExpiryDate = (value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length >= 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    
    return numericValue;
  };

  const formatCVV = (value) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.slice(0, 4);
  };

  
  useEffect(() => {
    let isMounted = true;
    
    const fetchUserData = async () => {
      try {
        const userId = getCookie('userId');
        if (!userId) {
          navigate('/login');
          return;
        }

        const userResponse = await fetch(`/api/users/${userId}`, {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (isMounted) {
            setFormData(prev => ({
              ...prev,
              firstName: userData.firstName || prev.firstName,
              lastName: userData.lastName || prev.lastName,
              email: userData.email || prev.email,
              phone: userData.phoneNumber || prev.phone,
              address: userData.address || prev.address,
              city: userData.city || prev.city,
              country: userData.country || prev.country,
              cardNumber: userData.paymentInfo?.lastFourDigits ? `**** **** **** ${userData.paymentInfo.lastFourDigits}` : '',
              cardExpiryDate: userData.paymentInfo?.expiryMonth && userData.paymentInfo?.expiryYear
                ? `${userData.paymentInfo.expiryMonth}/${userData.paymentInfo.expiryYear}`
                : '',
            }));
            
            setHasSavedCard(!!userData.paymentInfo?.lastFourDigits);
          }
        } else {
          console.warn('Nu s-au putut încărca datele utilizatorului');
        }
      } catch (error) {
        console.error('Eroare la încărcarea datelor utilizatorului:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  
  useEffect(() => {
    let isMounted = true;
    
    const fetchPropertyDetails = async () => {
      if (property || !bookingParams.propertyId) {
        setLoading(false);
        return;
      }
      
      try {
        const propertyResponse = await fetch(`/api/proprietati/${bookingParams.propertyId}`);
        if (!propertyResponse.ok) {
          throw new Error('Nu s-au putut încărca detaliile proprietății');
        }
        
        const propertyData = await propertyResponse.json();
        if (isMounted) {
          setProperty(propertyData);
        }
      } catch (propertyError) {
        if (isMounted) {
          setError('Nu s-au putut încărca detaliile proprietății');
        }
        console.error('Eroare la încărcarea detaliilor proprietății:', propertyError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPropertyDetails();
    
    return () => {
      isMounted = false;
    };
  }, [bookingParams.propertyId, property]);

  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    
    if (name === 'cardNumber') {
      setFormData(prev => ({
        ...prev,
        cardNumber: formatCardNumber(value)
      }));
    } else if (name === 'cardExpiryDate') {
      setFormData(prev => ({
        ...prev,
        cardExpiryDate: formatExpiryDate(value)
      }));
    } else if (name === 'cardCvv') {
      setFormData(prev => ({
        ...prev,
        cardCvv: formatCVV(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  
  const extractCardData = () => {
    if (!formData.cardNumber || hasSavedCard && !editCard) {
      return { useSavedCard: true };
    }

    
    const cardNumberRaw = formData.cardNumber.replace(/\D/g, '');
    const lastFourDigits = cardNumberRaw.slice(-4);
    
    let expiryMonth, expiryYear;
    if (formData.cardExpiryDate && formData.cardExpiryDate.includes('/')) {
      [expiryMonth, expiryYear] = formData.cardExpiryDate.split('/');
    }

    return {
      cardNumber: cardNumberRaw,
      lastFourDigits,
      expiryMonth,
      expiryYear,
      
    };
  };

  // Funcție pentru salvarea informațiilor utilizatorului
  const saveUserInfo = async () => {
    if (!formData.saveInfo) return;
    
    try {
      let cardData = null;
      if (formData.paymentMethod === 'card') {
        if (hasSavedCard && !editCard) {
          cardData = null;
        } else if (formData.cardNumber && formData.cardExpiryDate) {
          cardData = {
            cardNumber: formData.cardNumber.replace(/\D/g, ''),
            expiryDate: formData.cardExpiryDate
          };
        }
      }
      
      
      const bookingInfo = {
        address: formData.address,
        city: formData.city,
        country: formData.country
      };
      
      if (cardData) {
        bookingInfo.paymentInfo = cardData;
      }
      
      console.log('Informații pentru salvare:', bookingInfo);
      
      const response = await fetch('/api/users/save-booking-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bookingInfo)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la salvarea informațiilor');
      }
      
      console.log('Informațiile au fost salvate cu succes pentru rezervări viitoare');
    } catch (error) {
      console.error('Eroare la salvarea informațiilor:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userId = getCookie('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      
      if (formData.paymentMethod === 'card') {
        if ((!hasSavedCard || editCard) && 
            (!formData.cardNumber || !formData.cardExpiryDate || !formData.cardCvv)) {
          throw new Error('Vă rugăm să completați toate detaliile cardului');
        }
        
        if (formData.cardCvv.length < 3) {
          throw new Error('Codul CVV trebuie să aibă cel puțin 3 cifre');
        }
      }

     
      const cardData = formData.paymentMethod === 'card' ? extractCardData() : null;

      const bookingData = {
        propertyId: bookingParams.propertyId,
        checkIn: bookingParams.checkIn,
        checkOut: bookingParams.checkOut,
        guests: bookingParams.guests,
        rooms: bookingParams.rooms,
        totalPrice: bookingParams.totalPrice,
        basePrice: bookingParams.basePrice,
        guestDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country
        },
        specialRequests: formData.specialRequests,
        arrivalTime: formData.arrivalTime,
        paymentMethod: formData.paymentMethod === 'card' ? 'card' : 'cash',
        paymentDetails: formData.paymentMethod === 'card' ? {
          ...cardData,
          cvv: formData.cardCvv
        } : null
      };

      
      if (formData.paymentMethod === 'card') {
        setShowPaymentModal(true);
        setPaymentStatus('processing');
      }

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Nu s-a putut crea rezervarea');
      }

      const result = await response.json();
      
      
      if (formData.saveInfo) {
        await saveUserInfo();
      }

      
      if (formData.paymentMethod === 'card') {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setPaymentStatus('success');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setShowPaymentModal(false);
      }
      
      navigate(`/booking/confirmation/${result.bookingId}`);
    } catch (err) {
      setError(err.message);
      if (formData.paymentMethod === 'card') {
        setShowPaymentModal(false);
      }
      setLoading(false);
    }
  };

  
  const getNumberOfNights = useMemo(() => {
    if (!bookingParams.checkIn || !bookingParams.checkOut) return 0;
    
    const checkIn = new Date(bookingParams.checkIn);
    const checkOut = new Date(bookingParams.checkOut);
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }, [bookingParams.checkIn, bookingParams.checkOut]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spinner animation="border" style={{ color: colors.primary, width: '3rem', height: '3rem' }} />
        <p className="mt-4" style={{ color: colors.text, fontWeight: 'medium' }}>
          Se încarcă detaliile rezervării...
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
              onClick={() => window.location.reload()}
              className="rounded-pill px-4"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Reîncarcă pagina
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <BookingStepper currentStep={2} />
      <Container style={styles.container}>
        <Row>
          <Col md={8}>
            <h1 style={styles.pageTitle}>
              <i className="bi bi-journal-check me-2" style={{ color: colors.secondary }}></i>
              Detalii rezervare
            </h1>
            
            <Form onSubmit={handleSubmit}>
              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader}>
                  <h2 style={styles.sectionTitle} className="mb-0">
                    <i className="bi bi-person-circle me-2" style={{ color: colors.secondary }}></i>
                    Datele dumneavoastră
                  </h2>
                </Card.Header>
                <Card.Body style={{ padding: '20px' }}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Prenume *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Nume *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Telefon *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          pattern="^(\+4|0)[0-9]{9}$"
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                        <Form.Text className="text-muted">
                          Format valid: 07XXXXXXXX 
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Adresă</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Oraș</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Țară/Regiune *</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          style={{ 
                            backgroundColor: colors.lightPurple,
                            borderColor: '#e0d8ff',
                            borderRadius: '8px'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader}>
                  <h2 style={styles.sectionTitle} className="mb-0">
                    <i className="bi bi-clock me-2" style={{ color: colors.secondary }}></i>
                    Detalii sosire
                  </h2>
                </Card.Header>
                <Card.Body style={{ padding: '20px' }}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Ora estimată de sosire *</Form.Label>
                    <Form.Select
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleInputChange}
                      required
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        borderColor: '#e0d8ff',
                        borderRadius: '8px'
                      }}
                    >
                      <option value="">Selectați ora</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                      <option value="21:00">21:00</option>
                      <option value="22:00">22:00</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Cereri speciale (opțional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      placeholder="Vă rugăm să scrieți solicitările dumneavoastră"
                      style={{ 
                        backgroundColor: colors.lightPurple,
                        borderColor: '#e0d8ff',
                        borderRadius: '8px'
                      }}
                    />
                    <Form.Text className="text-muted">
                      Notă: Cererile speciale nu sunt garantate și pot necesita costuri suplimentare
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card style={styles.card}>
                <Card.Header style={styles.cardHeader}>
                  <h2 style={styles.sectionTitle} className="mb-0">
                    <i className="bi bi-credit-card me-2" style={{ color: colors.secondary }}></i>
                    Metoda de plată
                  </h2>
                </Card.Header>
                <Card.Body style={{ padding: '20px' }}>
                  <div className="mb-3">
                    <div 
                      className={`d-flex align-items-center ${formData.paymentMethod === 'card' ? 'bg-light-purple' : ''}`} 
                      style={{
                        padding: '15px',
                        borderRadius: '10px',
                        border: formData.paymentMethod === 'card' ? `1px solid ${colors.primary}` : '1px solid rgba(0,0,0,0.1)',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: formData.paymentMethod === 'card' ? colors.lightPurple : 'white'
                      }}
                      onClick={() => setFormData({
                        ...formData,
                        paymentMethod: 'card'
                      })}
                    >
                      <Form.Check
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleInputChange}
                        className="me-3"
                      />
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="me-3">
                          <i className="bi bi-credit-card-2-front" style={{ fontSize: '1.5rem', color: colors.primary }}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>Card de credit/debit</div>
                          <small className="text-muted">Plata securizată online</small>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`d-flex align-items-center ${formData.paymentMethod === 'cash' ? 'bg-light-purple' : ''}`} 
                      style={{
                        padding: '15px',
                        borderRadius: '10px',
                        border: formData.paymentMethod === 'cash' ? `1px solid ${colors.primary}` : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: formData.paymentMethod === 'cash' ? colors.lightPurple : 'white'
                      }}
                      onClick={() => setFormData({
                        ...formData,
                        paymentMethod: 'cash'
                      })}
                    >
                      <Form.Check
                        type="radio"
                        id="cash"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === 'cash'}
                        onChange={handleInputChange}
                        className="me-3"
                      />
                      <div className="d-flex align-items-center flex-grow-1">
                        <div className="me-3">
                          <i className="bi bi-cash-coin" style={{ fontSize: '1.5rem', color: colors.primary }}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>Plata la proprietate</div>
                          <small className="text-muted">Plătiți în numerar la check-in</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {formData.paymentMethod === 'card' && (
                <Card style={styles.card}>
                  <Card.Header style={styles.cardHeader}>
                    <h2 style={styles.sectionTitle} className="mb-0">
                      <i className="bi bi-credit-card-2-front me-2" style={{ color: colors.secondary }}></i>
                      Detalii card
                    </h2>
                  </Card.Header>
                  <Card.Body style={{ padding: '20px' }}>
                    {hasSavedCard && !editCard ? (
                      <div>
                        <div 
                          style={{
                            background: colors.lightPurple,
                            padding: '15px',
                            borderRadius: '10px',
                            marginBottom: '15px'
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div style={{ color: colors.text, fontWeight: 'bold' }}>Card salvat</div>
                            <Button
                              variant="link"
                              onClick={() => setEditCard(true)}
                              style={{ color: colors.secondary, padding: '0' }}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Utilizează alt card
                            </Button>
                          </div>
                          
                          <div className="d-flex mb-3">
                            <div style={{ 
                              width: '50px', 
                              height: '30px', 
                              background: colors.gradientSecondary,
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '10px'
                            }}>
                              <i className="bi bi-credit-card text-white"></i>
                            </div>
                            <div>
                              <div style={{ fontWeight: '500' }}>{formData.cardNumber}</div>
                              <small className="text-muted">Expiră: {formData.cardExpiryDate}</small>
                            </div>
                          </div>
                          
                          <div className="row align-items-center">
                            <div className="col-md-6">
                              <Form.Group>
                                <Form.Label style={{ color: colors.text, fontWeight: '500' }}>CVV/CVC *</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="cardCvv"
                                  value={formData.cardCvv}
                                  onChange={handleInputChange}
                                  placeholder="***"
                                  required
                                  maxLength={4}
                                  style={{ 
                                    backgroundColor: 'white',
                                    borderColor: '#e0d8ff',
                                    borderRadius: '8px',
                                    width: '100px'
                                  }}
                                />
                                <Form.Text className="text-muted">
                                  Cod de securitate
                                </Form.Text>
                              </Form.Group>
                            </div>
                            <div className="col-md-6">
                              <div className="text-end d-none d-md-block">
                                <img 
                                  src="/card-brands.png" 
                                  alt="Carduri acceptate" 
                                  style={{ 
                                    maxHeight: '25px',
                                    opacity: '0.7'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <Form.Group className="mb-3">
                            <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Număr card *</Form.Label>
                            <Form.Control
                              type="text"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleInputChange}
                              placeholder="**** **** **** ****"
                              required
                              style={{ 
                                backgroundColor: colors.lightPurple,
                                borderColor: '#e0d8ff',
                                borderRadius: '8px'
                              }}
                            />
                            <Form.Text className="text-muted">
                              Exemplu: 4111 1111 1111 1111
                            </Form.Text>
                          </Form.Group>
                          
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label style={{ color: colors.text, fontWeight: '500' }}>Data expirării *</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="cardExpiryDate"
                                  value={formData.cardExpiryDate}
                                  onChange={handleInputChange}
                                  placeholder="MM/YY"
                                  required
                                  style={{ 
                                    backgroundColor: colors.lightPurple,
                                    borderColor: '#e0d8ff',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Form.Text className="text-muted">
                                  Exemplu: 12/25
                                </Form.Text>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label style={{ color: colors.text, fontWeight: '500' }}>CVV/CVC *</Form.Label>
                                <Form.Control
                                  type="password"
                                  name="cardCvv"
                                  value={formData.cardCvv}
                                  onChange={handleInputChange}
                                  placeholder="***"
                                  required
                                  maxLength={4}
                                  style={{ 
                                    backgroundColor: colors.lightPurple,
                                    borderColor: '#e0d8ff',
                                    borderRadius: '8px'
                                  }}
                                />
                                <Form.Text className="text-muted">
                                  Codul de securitate de pe spatele cardului
                                </Form.Text>
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-shield-lock me-2" style={{ color: colors.primary }}></i>
                            <small className="text-muted">Plată securizată 256-bit SSL</small>
                          </div>
                          
                          <div>
                            <img 
                              src="/card-brands.png" 
                              alt="Carduri acceptate" 
                              style={{ 
                                maxHeight: '25px',
                                opacity: '0.7'
                              }}
                            />
                          </div>
                        </div>
                        
                        {hasSavedCard && (
                          <div className="mt-3 text-end">
                            <Button
                              variant="link"
                              onClick={() => setEditCard(false)}
                              style={{ color: colors.secondary, padding: '0' }}
                            >
                              <i className="bi bi-credit-card me-1"></i>
                              Folosește cardul salvat
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              )}

              <div style={{ 
                background: colors.lightPurple, 
                borderRadius: '10px', 
                padding: '15px',
                marginBottom: '20px'
              }}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    id="saveInfo"
                    name="saveInfo"
                    label={
                      <span>
                        Salvează aceste informații pentru următoarea rezervare
                        <i className="bi bi-info-circle ms-1" style={{ color: colors.secondary }}></i>
                      </span>
                    }
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    style={{ 
                      color: colors.text,
                      fontWeight: '500'
                    }}
                  />
                </Form.Group>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-100"
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Se procesează...
                  </>
                ) : (
                  <>
                    {formData.paymentMethod === 'card' ? (
                      <>
                        <i className="bi bi-credit-card-2-front me-2"></i>
                        Continuă către plată
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Finalizează rezervarea
                      </>
                    )}
                  </>
                )}
              </Button>
            </Form>
          </Col>

          <Col md={4}>
            <Card style={styles.summaryCard}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-receipt me-2" style={{ color: colors.secondary }}></i>
                  Rezumatul rezervării
                </h2>
              </Card.Header>
              <Card.Body style={{ padding: '20px' }}>
                {property && (
                  <div style={styles.summarySection}>
                    <h3 style={styles.summaryLabel}>
                      <i className="bi bi-house-door me-2" style={{ color: colors.primary }}></i>
                      Proprietate
                    </h3>
                    <div className="d-flex">
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        overflow: 'hidden', 
                        borderRadius: '8px',
                        marginRight: '10px'
                      }}>
                        <img 
                          src={property.images && property.images[0]?.url || '/placeholder-property.jpg'} 
                          alt={property.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: colors.text }}>{property.name}</div>
                        <div className="text-muted small">
                          <i className="bi bi-geo-alt me-1"></i>
                          {property.location?.city}, 
                          {property.location?.street} {property.location?.number}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={styles.summarySection}>
                  <h3 style={styles.summaryLabel}>
                    <i className="bi bi-calendar-event me-2" style={{ color: colors.primary }}></i>
                    Perioada sejurului
                  </h3>
                  <div>
                    <Badge 
                      style={{
                        background: colors.gradientSecondary,
                        color: 'white',
                        borderRadius: '20px',
                        padding: '5px 10px',
                        marginBottom: '10px'
                      }}
                    >
                      <i className="bi bi-calendar-plus me-1"></i>
                      Check-in: {bookingParams.checkIn ? new Date(bookingParams.checkIn).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <Badge 
                      style={{
                        background: colors.gradientSecondary,
                        color: 'white',
                        borderRadius: '20px',
                        padding: '5px 10px'
                      }}
                    >
                      <i className="bi bi-calendar-minus me-1"></i>
                      Check-out: {bookingParams.checkOut ? new Date(bookingParams.checkOut).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                    </Badge>
                  </div>
                  {getNumberOfNights > 0 && (
                    <div className="text-center mt-2">
                      <Badge bg="secondary" style={{ borderRadius: '20px', background: '#e6e6fa', color: colors.text }}>
                        <i className="bi bi-moon-stars me-1"></i>
                        {getNumberOfNights} {getNumberOfNights === 1 ? 'noapte' : 'nopți'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div style={styles.summarySection}>
                  <h3 style={styles.summaryLabel}>
                    <i className="bi bi-people me-2" style={{ color: colors.primary }}></i>
                    Detalii cazare
                  </h3>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <i className="bi bi-door-open me-2" style={{ color: colors.secondary }}></i>
                      Camere:
                    </div>
                    <Badge bg="secondary" style={{ borderRadius: '20px', background: '#e6e6fa', color: colors.text }}>
                      {bookingParams.rooms} {bookingParams.rooms === 1 ? 'cameră' : 'camere'}
                    </Badge>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <i className="bi bi-person me-2" style={{ color: colors.secondary }}></i>
                      Oaspeți:
                    </div>
                    <Badge bg="secondary" style={{ borderRadius: '20px', background: '#e6e6fa', color: colors.text }}>
                      {bookingParams.guests} {bookingParams.guests === 1 ? 'oaspete' : 'oaspeți'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 style={styles.summaryLabel}>
                    <i className="bi bi-currency-exchange me-2" style={{ color: colors.primary }}></i>
                    Detalii cost
                  </h3>
                  <div style={{ 
                    background: colors.lightPurple, 
                    borderRadius: '10px', 
                    padding: '15px'
                  }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Preț pe noapte</span>
                      <span style={{ fontWeight: '500' }}>{bookingParams.basePrice} RON</span>
                    </div>
                    {getNumberOfNights > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-muted small">
                        <span>{bookingParams.basePrice} × {getNumberOfNights} {getNumberOfNights === 1 ? 'noapte' : 'nopți'}</span>
                        <span>{bookingParams.basePrice * getNumberOfNights} RON</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between" style={{ 
                      borderTop: '1px solid rgba(0,0,0,0.1)',
                      paddingTop: '12px',
                      marginTop: '12px',
                      fontWeight: 'bold',
                      color: colors.text
                    }}>
                      <span>Total de plată</span>
                      <span>{bookingParams.totalPrice} RON</span>
                    </div>
                    <small className="text-muted d-block text-center mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Include toate taxele și comisioanele
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showPaymentModal}
        backdrop="static"
        keyboard={false}
        centered
        contentClassName="border-0"
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <Modal.Body className="text-center py-5" style={{ 
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          {paymentStatus === 'processing' ? (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                margin: '0 auto 20px auto',
                background: colors.gradientPrimary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Spinner
                  animation="border"
                  variant="light"
                  style={{ width: '40px', height: '40px' }}
                />
              </div>
              <h4 style={{ color: colors.text }}>Se procesează plata</h4>
              <p className="text-muted">Vă rugăm să nu închideți această fereastră</p>
            </>
          ) : (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                margin: '0 auto 20px auto',
                background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-check-lg text-white" style={{ fontSize: '2.5rem' }}></i>
              </div>
              <h4 style={{ color: '#2E7D32' }}>Plată efectuată cu succes!</h4>
              <p className="text-muted">Veți fi redirecționat în curând...</p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BookingDetails;