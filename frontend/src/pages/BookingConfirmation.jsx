import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import BookingStepper from '../components/BookingStepper';
import { getCookie } from '../utils/cookies';


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
  success: 'linear-gradient(135deg, #4CAF50, #8BC34A)'
};

const styles = {
  container: {
    padding: '30px 0'
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
  successIcon: {
    width: '90px',
    height: '90px',
    margin: '0 auto 20px auto',
    background: colors.success,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)'
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center'
  },
  infoSection: {
    marginBottom: '20px',
    padding: '0 0 15px 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  infoLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center'
  },
  badge: {
    background: colors.gradientSecondary,
    color: 'white',
    padding: '6px 12px',
    borderRadius: '10px',
    display: 'inline-block',
    marginBottom: '5px',
    fontWeight: '500'
  },
  button: {
    borderRadius: '30px',
    padding: '10px 20px',
    fontWeight: 'medium'
  },
  primaryButton: {
    background: colors.buttonGradient,
    border: 'none',
    boxShadow: '0 4px 10px rgba(106, 17, 203, 0.2)'
  },
  outlineButton: {
    borderColor: colors.primary,
    color: colors.primary,
    backgroundColor: 'transparent',
    fontWeight: '500',
    '&:hover': {
      backgroundColor: colors.lightPurple,
      color: colors.text
    }
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

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        console.log('Fetching booking details for ID:', id);
        const response = await fetch(`/api/bookings/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca detaliile rezervării');
        }

        const data = await response.json();
        console.log('Booking details:', data);
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    } else {
      setError('ID-ul rezervării lipsește');
      setLoading(false);
    }
  }, [id]);

  const handleViewBookings = () => {
    const userId = getCookie('userId');
    navigate(`/user/${userId}`);
  };

  const calculateNights = () => {
    if (!booking || !booking.dates?.checkIn || !booking.dates?.checkOut) return 0;
    
    const checkIn = new Date(booking.dates.checkIn);
    const checkOut = new Date(booking.dates.checkOut);
    return Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <>
        <BookingStepper currentStep={3} />
        <div style={styles.loadingContainer}>
          <Spinner animation="border" style={{ color: colors.primary, width: '3rem', height: '3rem' }} />
          <p className="mt-4" style={{ color: colors.text, fontWeight: 'medium' }}>
            Se încarcă detaliile rezervării...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <BookingStepper currentStep={3} />
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

  if (!booking) {
    return (
      <>
        <BookingStepper currentStep={3} />
        <Container className="py-5">
          <Alert variant="warning" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)' }}>
            <Alert.Heading>
              <i className="bi bi-question-circle-fill me-2"></i>
              Rezervare negăsită
            </Alert.Heading>
            <p>Nu am putut găsi detaliile rezervării.</p>
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
      </>
    );
  }

  const nights = calculateNights();

  return (
    <>
      <BookingStepper currentStep={3} />
      <Container style={styles.container}>
        <Card className="text-center mb-4" style={styles.card}>
          <Card.Body className="py-5">
            <div style={styles.successIcon}>
              <i className="bi bi-check-lg text-white" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <Card.Title className="mb-4" style={{ fontSize: '1.8rem', color: colors.text, fontWeight: 'bold' }}>
              Rezervarea a fost confirmată!
            </Card.Title>
            <Card.Text style={{ fontSize: '1.1rem' }}>
              Numărul rezervării: 
              <Badge 
                style={{
                  background: colors.gradientSecondary, 
                  color: 'white',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  marginLeft: '10px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
              >
                {booking._id}
              </Badge>
            </Card.Text>
            {booking.guestDetails?.email && (
              <Card.Text className="mb-0">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-envelope me-2" style={{ color: colors.secondary }}></i>
                  Am trimis un email de confirmare la adresa: 
                  <strong className="ms-2" style={{ color: colors.text }}>
                    {booking.guestDetails.email}
                  </strong>
                </div>
              </Card.Text>
            )}
          </Card.Body>
        </Card>

        <Card style={styles.card}>
          <Card.Header style={styles.cardHeader}>
            <h2 style={styles.sectionTitle} className="mb-0">
              <i className="bi bi-journal-check me-2" style={{ color: colors.secondary }}></i>
              Detalii rezervare
            </h2>
          </Card.Header>
          <Card.Body style={{ padding: '20px' }}>
            {booking.property && (
              <div style={styles.infoSection}>
                <h3 style={styles.infoLabel}>
                  <i className="bi bi-building me-2" style={{ color: colors.primary }}></i>
                  Proprietate
                </h3>
                <div className="d-flex">
                  {booking.property.images && booking.property.images[0]?.url && (
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      marginRight: '15px' 
                    }}>
                      <img 
                        src={booking.property.images[0].url} 
                        alt={booking.property.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: colors.text }}>
                      {booking.property.name}
                    </div>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt me-1" style={{ color: colors.secondary }}></i> 
                      {booking.property.location?.city}, {booking.property.location?.street} {booking.property.location?.number}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.infoSection}>
              <h3 style={styles.infoLabel}>
                <i className="bi bi-calendar-event me-2" style={{ color: colors.primary }}></i>
                Perioada sejurului
              </h3>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Badge 
                        style={{
                          background: colors.gradientSecondary,
                          color: 'white',
                          borderRadius: '20px',
                          padding: '5px 10px',
                          marginRight: '10px'
                        }}
                      >
                        <i className="bi bi-box-arrow-in-down-right me-1"></i>
                        Check-in
                      </Badge>
                    </div>
                    <div className="ps-3">
                      <div style={{ fontWeight: '500' }}>
                        {new Date(booking.dates?.checkIn).toLocaleDateString('ro-RO', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-muted small">
                        După ora <strong>{booking.arrivalTime || '14:00'}</strong>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Badge 
                        style={{
                          background: colors.gradientSecondary,
                          color: 'white',
                          borderRadius: '20px',
                          padding: '5px 10px',
                          marginRight: '10px'
                        }}
                      >
                        <i className="bi bi-box-arrow-up-right me-1"></i>
                        Check-out
                      </Badge>
                    </div>
                    <div className="ps-3">
                      <div style={{ fontWeight: '500' }}>
                        {new Date(booking.dates?.checkOut).toLocaleDateString('ro-RO', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-muted small">
                        Până la ora <strong>12:00</strong>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="text-center mt-2">
                <Badge bg="secondary" style={{ borderRadius: '20px', background: '#e6e6fa', color: colors.text }}>
                  <i className="bi bi-moon-stars me-1"></i>
                  {nights} {nights === 1 ? 'noapte' : 'nopți'}
                </Badge>
              </div>
            </div>

            <div style={styles.infoSection}>
              <h3 style={styles.infoLabel}>
                <i className="bi bi-people me-2" style={{ color: colors.primary }}></i>
                Detalii cazare
              </h3>
              <Row>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-door-open me-2" style={{ color: colors.secondary }}></i>
                    <span>Număr camere:</span>
                    <Badge 
                      style={{
                        background: colors.lightPurple,
                        color: colors.text,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        marginLeft: '8px'
                      }}
                    >
                      {booking.rooms} {booking.rooms === 1 ? 'cameră' : 'camere'}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-person me-2" style={{ color: colors.secondary }}></i>
                    <span>Număr oaspeți:</span>
                    <Badge 
                      style={{
                        background: colors.lightPurple,
                        color: colors.text,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        marginLeft: '8px'
                      }}
                    >
                      {booking.guests?.adults} {booking.guests?.adults === 1 ? 'adult' : 'adulți'}
                      {booking.guests?.children > 0 && `, ${booking.guests.children} ${booking.guests.children === 1 ? 'copil' : 'copii'}`}
                    </Badge>
                  </div>
                </Col>
              </Row>
            </div>

            <div style={styles.infoSection}>
              <h3 style={styles.infoLabel}>
                <i className="bi bi-credit-card me-2" style={{ color: colors.primary }}></i>
                Informații plată
              </h3>
              <div style={{ 
                background: colors.lightPurple, 
                borderRadius: '10px', 
                padding: '15px'
              }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cash-coin me-2" style={{ color: colors.secondary }}></i>
                    <span>Total plătit:</span>
                  </div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: colors.text,
                    fontSize: '1.2rem'
                  }}>
                    {booking.pricing?.totalPrice} RON
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-wallet me-2" style={{ color: colors.secondary }}></i>
                    <span>Metodă de plată:</span>
                  </div>
                  <Badge 
                    style={{
                      background: booking.payment?.method === 'card' ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' : colors.gradientSecondary,
                      color: 'white',
                      borderRadius: '20px',
                      padding: '5px 10px'
                    }}
                  >
                    {booking.payment?.method === 'card' ? (
                      <>
                        <i className="bi bi-credit-card me-1"></i>
                        Card de credit/debit
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cash me-1"></i>
                        Plata la proprietate
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div>
                <h3 style={styles.infoLabel}>
                  <i className="bi bi-chat-left-text me-2" style={{ color: colors.primary }}></i>
                  Cereri speciale
                </h3>
                <div 
                  style={{ 
                    background: colors.lightPurple, 
                    borderRadius: '10px', 
                    padding: '15px',
                    fontStyle: 'italic',
                    color: colors.darkPurple
                  }}
                >
                  "{booking.specialRequests}"
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Button 
            variant="outline-primary"
            onClick={handleViewBookings}
            style={{ 
              borderRadius: '30px',
              borderColor: colors.primary,
              color: colors.primary,
              padding: '10px 20px'
            }}
          >
            <i className="bi bi-list-check me-2"></i>
            Vezi toate rezervările
          </Button>
          <Button 
            onClick={() => navigate('/')}
            style={{
              background: colors.buttonGradient,
              border: 'none',
              borderRadius: '30px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(106, 17, 203, 0.2)'
            }}
          >
            <i className="bi bi-house me-2"></i>
            Înapoi la pagina principală
          </Button>
        </div>
      </Container>
    </>
  );
};

export default BookingConfirmation;