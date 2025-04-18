import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Navbar, 
  Nav, 
  Button, 
  Card, 
  ListGroup, 
  Badge, 
  Spinner,
  Modal,
  Form,
  Alert,
  InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
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
};

// Stiluri inline pentru componente specifice
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
  avatar: {
    background: colors.gradientSecondary,
    color: 'white',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginRight: '10px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
  },
  avatarLarge: {
    background: colors.gradientSecondary,
    color: 'white',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '1.5rem',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)'
  },
  welcomeSection: {
    display: 'flex',
    alignItems: 'center',
    padding: '30px 0',
    background: colors.gradientPrimary,
    color: 'white',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  addPropertyBtn: {
    background: colors.gradientSecondary,
    border: 'none',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  },
  propertyCard: {
    marginBottom: '15px',
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  propertyImage: {
    height: '100%',
    objectFit: 'cover'
  },
  actionButton: {
    marginRight: '8px',
    borderRadius: '20px',
    padding: '0.25rem 0.75rem'
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: colors.text
  },
  noPropertiesMessage: {
    textAlign: 'center',
    padding: '30px 0'
  },
  footer: {
    backgroundColor: colors.lightPurple,
    padding: '20px 0',
    marginTop: '40px',
    textAlign: 'center',
    borderTop: '1px solid #e0e0e0'
  },
  menuIcon: {
    marginRight: '10px',
    fontSize: '1.2rem',
    color: colors.primary
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '0.8rem'
  },
  viewReservationsBtn: {
    background: colors.secondary,
    border: 'none',
    borderRadius: '20px',
    padding: '0.25rem 0.75rem',
    color: 'white'
  },
  cardHeader: {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  listItem: {
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    padding: '10px 0'
  },
  statCard: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    height: '100%',
    transition: 'transform 0.3s ease'
  },
  statHeader: {
    background: colors.gradientSecondary,
    color: 'white',
    padding: '15px'
  }
};

const Proprietar = () => {
  const [proprietar, setProprietar] = useState({});
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    fiscalCode: '',
    email: '',
    phoneNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [topReservationsProperty, setTopReservationsProperty] = useState(null);
  const [bestRatedProperty, setBestRatedProperty] = useState(null);
  const [worstRatedProperty, setWorstRatedProperty] = useState(null);
  const statisticsRef = useRef(null); // Referință pentru secțiunea de statistici
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchProprietarData = async () => {
      try {
        setLoading(true);
        const proprietarId = getCookie('proprietarId');
        console.log('ID proprietar din cookie:', proprietarId);
        
        if (!proprietarId) {
          throw new Error('Nu s-a putut găsi ID-ul proprietarului. Te rugăm să te autentifici din nou.');
        }

        const response = await fetch(`/api/proprietari/${proprietarId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca datele proprietarului');
        }
        
        const data = await response.json();
        console.log('Date proprietar primite:', data);
        
        setProprietar(data.proprietar);
        setProperties(data.proprietati);
        setFormData({
          companyName: data.proprietar.companyName || '',
          fiscalCode: data.proprietar.fiscalCode || '',
          email: data.proprietar.email || '',
          phoneNumber: data.proprietar.phoneNumber || ''
        });
        
        if (data.proprietati && data.proprietati.length > 0) {
          await calculatePropertyStatistics(data.proprietati);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProprietarData();
  }, []);

  const calculatePropertyStatistics = async (propertiesList) => {
    try {
      const propertiesWithStats = await Promise.all(propertiesList.map(async (property) => {
        try {
          const reservationsResponse = await fetch(`/api/proprietati/${property._id}/rezervari`, {
            credentials: 'include'
          });
          
          let reservations = [];
          if (reservationsResponse.ok) {
            reservations = await reservationsResponse.json();
          }
          
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth();
          const currentYear = currentDate.getFullYear();
          
          const currentMonthReservations = reservations.filter(reservation => {
            const checkInDate = new Date(reservation.dates?.checkIn);
            return checkInDate.getMonth() === currentMonth && 
                  checkInDate.getFullYear() === currentYear &&
                  reservation.status !== 'anulată';
          });
          
          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
          const occupancyRate = Math.round((currentMonthReservations.length / daysInMonth) * 100);
          
          return {
            ...property,
            bookingCount: currentMonthReservations.length,
            occupancyRate: occupancyRate > 100 ? 100 : occupancyRate
          };
        } catch (error) {
          console.error(`Eroare la obținerea rezervărilor pentru proprietatea ${property._id}:`, error);
          return {
            ...property,
            bookingCount: 0,
            occupancyRate: 0
          };
        }
      }));
      
      const propertyWithMostReservations = [...propertiesWithStats].sort((a, b) => b.bookingCount - a.bookingCount)[0];
      setTopReservationsProperty(propertyWithMostReservations);
      
     
      const propertiesWithRating = propertiesWithStats.filter(property => 
        property.rating && 
        typeof property.rating.average === 'number' && 
        property.rating.average > 0 && 
        property.rating.totalReviews > 0
      );
      
      if (propertiesWithRating.length > 0) {
        const sortedProperties = [...propertiesWithRating].sort((a, b) => b.rating.average - a.rating.average);
        
        setBestRatedProperty(sortedProperties[0]);
        
        if (sortedProperties.length > 1) {
          setWorstRatedProperty(sortedProperties[sortedProperties.length - 1]);
        } else {
          setWorstRatedProperty(null);
        }
      } else {
        setBestRatedProperty(null);
        setWorstRatedProperty(null);
      }
      
    } catch (error) {
      console.error("Eroare la calcularea statisticilor:", error);
    }
  };

  const handleLogout = () => {
    fetch('/api/proprietari/logout', {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      document.cookie = 'proprietarId=; Max-Age=0; path=/;';
      navigate('/');
    });
  };

  const handleShowEditProfile = () => {
    setFormData({
      companyName: proprietar.companyName || '',
      fiscalCode: proprietar.fiscalCode || '',
      email: proprietar.email || '',
      phoneNumber: proprietar.phoneNumber || ''
    });
    setShowEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/proprietari/actualizeaza-profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Actualizarea profilului a eșuat');
      }

      const updatedProprietar = await response.json();
      setProprietar(updatedProprietar);
      setShowEditProfile(false);
      setSuccess('Profilul a fost actualizat cu succes!');
      
      const proprietarId = getCookie('proprietarId');
      const refreshResponse = await fetch(`/api/proprietari/${proprietarId}`, {
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setProprietar(refreshData.proprietar);
      }
    } catch (error) {
      console.error('Eroare la actualizarea profilului:', error);
      setError('Eroare la actualizarea profilului. Încercați din nou.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <Badge bg="success" style={styles.statusBadge}>Verificat</Badge>;
      case 'rejected':
        return <Badge bg="danger" style={styles.statusBadge}>Respins</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning" text="dark" style={styles.statusBadge}>În așteptare</Badge>;
    }
  };

  const handleShowChangePassword = () => {
    setShowChangePassword(true);
    setError('');
    setSuccess('');
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    if (passwordData.newPassword.length < 6) {
      setError('Noua parolă trebuie să aibă cel puțin 6 caractere');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Parolele nu coincid');
      return false;
    }
    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePasswordForm()) {
      return;
    }

    try {
      console.log('Trimit request pentru schimbarea parolei...');
      const response = await fetch('/api/proprietari/schimba-parola', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      console.log('Status răspuns:', response.status);
      const data = await response.json();
      console.log('Răspuns de la server:', data);

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare la schimbarea parolei');
      }

      setSuccess('Parola a fost schimbată cu succes!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        handleCloseChangePassword();
      }, 2000);

    } catch (error) {
      console.error('Eroare completă:', error);
      setError(error.message);
    }
  };

  const scrollToStatistics = () => {
    if (statisticsRef.current) {
      statisticsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: colors.lightPurple }}>
        <Spinner animation="border" style={{ color: colors.primary }} />
      </div>
    );
  }

  const companyInitials = proprietar.companyName 
    ? proprietar.companyName.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
    : 'P';

  return (
    <>
      <Navbar style={styles.header} expand="lg">
        <Container>
          <Navbar.Brand href="#" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <div className="d-flex align-items-center">
                <div style={styles.avatar}>{companyInitials}</div>
                <div className="me-3">
                  <div>{proprietar.companyName || 'Companie'}</div>
                  <small>{getStatusBadge(proprietar.verificationStatus)}</small>
                </div>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleLogout}
                  className="rounded-pill px-3"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Deconectare
                </Button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={styles.welcomeSection}>
        <Container>
          <div className="d-flex align-items-center">
            <div style={styles.avatarLarge}>{companyInitials}</div>
            <div className="ms-3">
              <h1>Bine ați venit, {proprietar.companyName || 'Proprietar'}!</h1>
              <p className="mb-0">
                Status: {getStatusBadge(proprietar.verificationStatus)}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-4">
            <i className="bi bi-check-circle-fill me-2"></i> {success}
          </Alert>
        )}
        
        <Row>
          <Col md={8}>
            <Card className="mb-4" style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <div className="d-flex justify-content-between align-items-center">
                  <h2 style={styles.sectionTitle} className="mb-0">
                    <i className="bi bi-houses me-2"></i> Proprietățile mele
                  </h2>
                  <Link to="/property-registration">
                    <Button 
                      variant="primary" 
                      style={styles.addPropertyBtn}
                      className="rounded-pill"
                    >
                      <i className="bi bi-plus-circle me-2"></i> Adaugă proprietate
                    </Button>
                  </Link>
                </div>
              </Card.Header>
              <Card.Body>
                {properties.length === 0 ? (
                  <div style={styles.noPropertiesMessage}>
                    <i className="bi bi-house-x" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                    <p className="mt-3">Nu aveți încă nicio proprietate adăugată.</p>
                    <Link to="/property-registration">
                      <Button 
                        variant="primary" 
                        style={{ background: colors.buttonGradient, border: 'none' }} 
                        className="mt-2 rounded-pill px-4"
                      >
                        <i className="bi bi-plus-circle me-2"></i> Adaugă prima proprietate
                      </Button>
                    </Link>
                  </div>
                ) : (
                  properties.map((property) => (
                    <Card 
                      key={property._id} 
                      style={styles.propertyCard}
                      className="mb-3 hover-shadow"
                    >
                      <Row className="g-0">
                        <Col md={4}>
                          <div style={{ height: '100%', minHeight: '180px', overflow: 'hidden' }}>
                            <Card.Img 
                              src={(property.images && property.images[0] && property.images[0].url) || '/placeholder-property.jpg'} 
                              alt={property.name}
                              style={styles.propertyImage}
                            />
                          </div>
                        </Col>
                        <Col md={8}>
                          <Card.Body className="py-3">
                            <Card.Title 
                              style={{ color: colors.text, fontWeight: 'bold' }}
                              className="d-flex justify-content-between align-items-center"
                            >
                              {property.name}
                              <Badge 
                                bg={property.isActive ? 'success' : 'secondary'} 
                                className="rounded-pill"
                              >
                                {property.isActive ? 'Activ' : 'Inactiv'}
                              </Badge>
                            </Card.Title>
                            
                            <div className="d-flex align-items-center mb-2 text-muted small">
                              <i className="bi bi-geo-alt-fill me-1" style={{ color: colors.secondary }}></i>
                              {property.location?.city || 'N/A'}
                              <span className="mx-2">•</span>
                              <i className="bi bi-house-door me-1" style={{ color: colors.secondary }}></i>
                              {property.type || 'N/A'}
                            </div>
                            
                            <Card.Text className="d-flex justify-content-between align-items-center mb-2">
                              <span>
                                <strong style={{ color: colors.text }}>Preț/noapte:</strong> {property.pricing?.basePrice || 0} RON
                              </span>
                              
                              {property.rating && property.rating.average > 0 && (
                                <span className="d-flex align-items-center">
                                  <Badge 
                                    bg="info" 
                                    style={{ 
                                      background: colors.gradientSecondary,
                                      borderRadius: '12px',
                                      padding: '0.4rem 0.7rem'
                                    }}
                                  >
                                    <i className="bi bi-star-fill me-1"></i>
                                    {property.rating.average.toFixed(1)}
                                  </Badge>
                                </span>
                              )}
                            </Card.Text>
                            
                            <div className="mt-3 d-flex flex-wrap gap-2">
                              <Link to={`/editare-proprietate/${property._id}`}>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  style={{
                                    ...styles.actionButton,
                                    borderColor: colors.primary,
                                    color: colors.primary
                                  }}
                                >
                                  <i className="bi bi-pencil-square me-1"></i> Editează
                                </Button>
                              </Link>
                              <Link to={`/calendar-proprietate/${property._id}`}>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  style={{
                                    ...styles.actionButton,
                                    borderColor: colors.secondary,
                                    color: colors.secondary
                                  }}
                                >
                                  <i className="bi bi-calendar me-1"></i> Calendar
                                </Button>
                              </Link>
                              <Link to={`/rezervari-proprietate/${property._id}`}>
                                <Button 
                                  variant="primary" 
                                  size="sm" 
                                  style={{
                                    background: colors.buttonGradient,
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '0.25rem 0.75rem'
                                  }}
                                >
                                  <i className="bi bi-journal-check me-1"></i> Rezervări
                                </Button>
                              </Link>
                            </div>
                          </Card.Body>
                        </Col>
                      </Row>
                    </Card>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="mb-4" style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-building me-2"></i> Informații companie
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Nume companie</div>
                        <div className="fw-medium">{proprietar.companyName}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-receipt me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Cod fiscal</div>
                        <div className="fw-medium">{proprietar.fiscalCode}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-envelope-at me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Email</div>
                        <div className="fw-medium">{proprietar.email}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Telefon</div>
                        <div className="fw-medium">{proprietar.phoneNumber}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-shield-check me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Status verificare</div>
                        <div>{getStatusBadge(proprietar.verificationStatus)}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
                <div className="p-3">
                  <Button 
                    variant="primary" 
                    className="w-100 rounded-pill"
                    style={{ background: colors.buttonGradient, border: 'none' }}
                    onClick={handleShowEditProfile}
                  >
                    <i className="bi bi-pencil me-2"></i> Editează profilul
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-4" style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-lightning-charge me-2"></i> Acțiuni rapide
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item 
                    action 
                    as={Link} 
                    to="/property-registration"
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '12px 16px'
                    }}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-plus-circle me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                    <span>Adaugă proprietate nouă</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item 
                    action 
                    onClick={scrollToStatistics}
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '12px 16px'
                    }}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-bar-chart me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                    <span>Vezi statisticile</span>
                  </ListGroup.Item>
                  
                  <ListGroup.Item 
                    action 
                    onClick={handleShowChangePassword}
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '12px 16px'
                    }}
                    className="d-flex align-items-center"
                  >
                    <i className="bi bi-key me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                    <span>Schimbă parola</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <Card ref={statisticsRef} style={styles.card}>
              <Card.Header style={{
                background: colors.gradientPrimary,
                color: 'white',
                fontWeight: 'bold',
                padding: '15px 20px'
              }}>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                  <i className="bi bi-graph-up me-2"></i> Statistici proprietăți
                </h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={4}>
                    <Card style={styles.statCard}>
                      <Card.Header style={{
                        background: colors.gradientSecondary,
                        color: 'white',
                        border: 'none'
                      }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-calendar-check me-2 fs-4"></i> 
                          <div>
                            <div className="fw-bold">Cea mai rezervată proprietate</div>
                            <div className="small mt-1">Luna curentă</div>
                          </div>
                        </div>
                      </Card.Header>
                      {topReservationsProperty ? (
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div style={{ 
                              width: '70px', 
                              height: '70px', 
                              overflow: 'hidden', 
                              borderRadius: '12px', 
                              marginRight: '15px',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                              <img 
                                src={(topReservationsProperty.images && topReservationsProperty.images[0] && topReservationsProperty.images[0].url) || '/placeholder-property.jpg'} 
                                alt={topReservationsProperty.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <h5 className="mb-0" style={{ color: colors.text, fontWeight: 'bold' }}>{topReservationsProperty.name}</h5>
                              <div className="text-muted small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {topReservationsProperty.location?.city}
                              </div>
                            </div>
                          </div>
                          <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2">
                              <strong>Rezervări:</strong>
                              <span className="badge" style={{ 
                                background: colors.primary,
                                fontSize: '0.9rem',
                                borderRadius: '6px',
                                padding: '0.35rem 0.7rem'
                              }}>{topReservationsProperty.bookingCount}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <strong>Rată ocupare:</strong>
                              <span className="badge" style={{ 
                                background: colors.secondary,
                                fontSize: '0.9rem',
                                borderRadius: '6px',
                                padding: '0.35rem 0.7rem'
                              }}>{topReservationsProperty.occupancyRate}%</span>
                            </div>
                          </div>
                          <Link to={`/rezervari-proprietate/${topReservationsProperty._id}`} 
                            className="btn w-100 rounded-pill" 
                            style={{ 
                              background: colors.buttonGradient, 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="bi bi-eye me-2"></i> Vezi rezervările
                          </Link>
                        </Card.Body>
                      ) : (
                        <Card.Body className="text-center text-muted p-4">
                          <i className="bi bi-calendar-x" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                          <p className="mt-3 mb-0">Nu există rezervări în luna curentă</p>
                        </Card.Body>
                      )}
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card style={styles.statCard}>
                      <Card.Header style={{
                        background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                        color: 'white',
                        border: 'none'
                      }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star me-2 fs-4"></i> 
                          <div>
                            <div className="fw-bold">Cea mai bine evaluată</div>
                            <div className="small mt-1">Rating maxim</div>
                          </div>
                        </div>
                      </Card.Header>
                      {bestRatedProperty ? (
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div style={{ 
                              width: '70px', 
                              height: '70px', 
                              overflow: 'hidden', 
                              borderRadius: '12px', 
                              marginRight: '15px',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                              <img 
                                src={(bestRatedProperty.images && bestRatedProperty.images[0] && bestRatedProperty.images[0].url) || '/placeholder-property.jpg'} 
                                alt={bestRatedProperty.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <h5 className="mb-0" style={{ color: colors.text, fontWeight: 'bold' }}>{bestRatedProperty.name}</h5>
                              <div className="text-muted small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {bestRatedProperty.location?.city}
                              </div>
                            </div>
                          </div>
                          <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2">
                              <strong>Rating:</strong>
                              <div className="d-flex align-items-center">
                                <span className="badge me-2" style={{ 
                                  background: '#4CAF50',
                                  fontSize: '0.9rem',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.7rem'
                                }}>{bestRatedProperty.rating?.average.toFixed(1)}</span>
                                <i className="bi bi-star-fill text-warning"></i>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <strong>Nr. recenzii:</strong>
                              <span className="badge bg-secondary">{bestRatedProperty.rating?.totalReviews}</span>
                            </div>
                          </div>
                          <Link to={`/editare-proprietate/${bestRatedProperty._id}`} 
                            className="btn w-100 rounded-pill" 
                            style={{ 
                              background: 'linear-gradient(to right, #4CAF50, #8BC34A)', 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="bi bi-pencil me-2"></i> Administrare
                          </Link>
                        </Card.Body>
                      ) : (
                        <Card.Body className="text-center text-muted p-4">
                          <i className="bi bi-star" style={{ fontSize: '3rem', color: '#8BC34A' }}></i>
                          <p className="mt-3 mb-0">Nu există proprietăți cu recenzii</p>
                        </Card.Body>
                      )}
                    </Card>
                  </Col>
                  
                  <Col md={4}>
                    <Card style={styles.statCard}>
                      <Card.Header style={{
                        background: 'linear-gradient(135deg, #FF9800, #FFC107)',
                        color: 'white',
                        border: 'none'
                      }}>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star-half me-2 fs-4"></i> 
                          <div>
                            <div className="fw-bold">Necesită îmbunătățiri</div>
                            <div className="small mt-1">Rating minim</div>
                          </div>
                        </div>
                      </Card.Header>
                      {worstRatedProperty ? (
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            <div style={{ 
                              width: '70px', 
                              height: '70px', 
                              overflow: 'hidden', 
                              borderRadius: '12px', 
                              marginRight: '15px',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                            }}>
                              <img 
                                src={(worstRatedProperty.images && worstRatedProperty.images[0] && worstRatedProperty.images[0].url) || '/placeholder-property.jpg'} 
                                alt={worstRatedProperty.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <h5 className="mb-0" style={{ color: colors.text, fontWeight: 'bold' }}>{worstRatedProperty.name}</h5>
                              <div className="text-muted small">
                                <i className="bi bi-geo-alt me-1"></i>
                                {worstRatedProperty.location?.city}
                              </div>
                            </div>
                          </div>
                          <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2">
                              <strong>Rating:</strong>
                              <div className="d-flex align-items-center">
                                <span className="badge me-2" style={{ 
                                  background: '#FF9800',
                                  fontSize: '0.9rem',
                                  borderRadius: '6px',
                                  padding: '0.35rem 0.7rem'
                                }}>{worstRatedProperty.rating?.average.toFixed(1)}</span>
                                <i className="bi bi-star-half text-warning"></i>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <strong>Nr. recenzii:</strong>
                              <span className="badge bg-secondary">{worstRatedProperty.rating?.totalReviews}</span>
                            </div>
                          </div>
                          <Link to={`/editare-proprietate/${worstRatedProperty._id}`} 
                            className="btn w-100 rounded-pill" 
                            style={{ 
                              background: 'linear-gradient(to right, #FF9800, #FFC107)', 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            <i className="bi bi-arrow-up-circle me-2"></i> Îmbunătățește
                          </Link>
                        </Card.Body>
                      ) : (
                        <Card.Body className="text-center text-muted p-4">
                          <i className="bi bi-star-half" style={{ fontSize: '3rem', color: '#FF9800' }}></i>
                          <p className="mt-3 mb-0">Nu există suficiente proprietăți evaluate pentru comparație</p>
                        </Card.Body>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal 
        show={showEditProfile} 
        onHide={handleCloseEditProfile}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton
          style={{ 
            background: colors.gradientPrimary,
            color: 'white'
          }}
        >
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i> Editare profil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nume companie</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-building" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cod fiscal</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-receipt" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control 
                  type="text" 
                  name="fiscalCode" 
                  value={formData.fiscalCode} 
                  onChange={handleChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-envelope" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Număr de telefon</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-telephone" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleChange}
                  required
                  pattern="^(\+4|0)[0-9]{9}$"
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Format valid: 07XXXXXXXX
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="light" 
                onClick={handleCloseEditProfile}
                className="rounded-pill px-4"
              >
                Anulează
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="rounded-pill px-4"
                style={{ 
                  background: colors.buttonGradient,
                  border: 'none'
                }}
              >
                <i className="bi bi-check2 me-2"></i> Salvează
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

     
      <Modal 
        show={showChangePassword} 
        onHide={handleCloseChangePassword}
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton
          style={{ 
            background: colors.gradientPrimary,
            color: 'white'
          }}
        >
          <Modal.Title>
            <i className="bi bi-key me-2"></i> Schimbă parola
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Parola curentă</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-lock" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Parolă nouă</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-shield-lock" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
              <Form.Text className="text-muted">
                Parola trebuie să aibă cel puțin 6 caractere
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmă parola nouă</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-shield-check" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="light" 
                onClick={handleCloseChangePassword}
                className="rounded-pill px-4"
              >
                Anulează
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="rounded-pill px-4"
                style={{ 
                  background: colors.buttonGradient,
                  border: 'none'
                }}
              >
                <i className="bi bi-check2 me-2"></i> Schimbă parola
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Proprietar;