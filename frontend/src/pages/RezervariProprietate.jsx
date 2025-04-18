import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form, Navbar, Nav, InputGroup} from 'react-bootstrap';
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

const statusColors = {
  'confirmată': {
    bg: '#4CAF50',
    text: 'white',
    gradient: 'linear-gradient(to right, #43A047, #66BB6A)'
  },
  'în așteptare': {
    bg: '#FF9800',
    text: 'white',
    gradient: 'linear-gradient(to right, #FB8C00, #FFA726)'
  },
  'anulată': {
    bg: '#F44336',
    text: 'white',
    gradient: 'linear-gradient(to right, #E53935, #EF5350)'
  },
  'finalizată': {
    bg: '#2196F3',
    text: 'white',
    gradient: 'linear-gradient(to right, #1E88E5, #42A5F5)'
  }
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
  badge: {
    fontSize: '0.85rem',
    padding: '0.4em 0.8em',
    borderRadius: '30px'
  },
  cardHeader: {
    backgroundColor: colors.lightPurple,
    borderBottom: `1px solid ${colors.primary}20`,
    color: colors.text
  },
  filterDropdown: {
    marginBottom: '15px'
  },
  searchInput: {
    maxWidth: '300px',
    borderColor: `${colors.primary}40`,
    backgroundColor: 'white'
  },
  reservationCard: {
    marginBottom: '20px',
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  reservationHeader: {
    backgroundColor: colors.lightPurple,
    padding: '14px 20px',
    borderBottom: `1px solid ${colors.primary}15`
  },
  statusBadge: {
    fontSize: '0.85rem',
    padding: '0.4em 0.8em',
    borderRadius: '30px',
    fontWeight: '500'
  },
  detailRow: {
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  userInfo: {
    backgroundColor: colors.lightPurple,
    padding: '16px',
    borderRadius: '12px',
    marginTop: '15px',
    border: `1px solid ${colors.primary}15`,
  },
  actionButton: {
    borderRadius: '20px',
    padding: '0.4rem 0.8rem',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    border: 'none'
  },
  tabItem: {
    color: colors.text,
    fontWeight: '500',
    borderRadius: '20px',
    padding: '8px 16px',
    margin: '0 4px',
    border: 'none'
  },
  activeTabItem: {
    background: colors.gradientPrimary,
    color: 'white',
    borderRadius: '20px',
    padding: '8px 16px',
    margin: '0 4px',
    border: 'none'
  },
  modalHeader: {
    background: colors.gradientPrimary,
    color: 'white',
    border: 'none'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  }
};


const formatDate = (dateString) => {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('ro-RO', options);
};


const getStatusBadgeClass = (status) => {
  switch(status.toLowerCase()) {
    case 'confirmată':
      return 'success';
    case 'în așteptare':
      return 'warning';
    case 'anulată':
      return 'danger';
    case 'finalizată':
      return 'info';
    default:
      return 'secondary';
  }
};

const RezervariProprietate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('toate');
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [proprietarId, setProprietarId] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchPropertyAndReservations = async () => {
      try {
        setLoading(true);
        const currentProprietarId = getCookie('proprietarId');
        if (!currentProprietarId) {
          navigate('/login');
          return;
        }
        
        setProprietarId(currentProprietarId);
        
        const propertyResponse = await fetch(`/api/proprietati/${id}`, {
          credentials: 'include'
        });
        
        if (!propertyResponse.ok) {
          throw new Error('Nu s-au putut încărca datele proprietății');
        }
        
        const propertyData = await propertyResponse.json();
        
        if (propertyData.owner.toString() !== currentProprietarId) {
          throw new Error('Nu aveți permisiunea de a vedea rezervările acestei proprietăți');
        }
        
        setProperty(propertyData);
        
        const reservationsResponse = await fetch(`/api/proprietati/${id}/rezervari`, {
          credentials: 'include'
        });
        
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          console.log('Rezervări primite:', reservationsData);
          setReservations(reservationsData);
        } else {
          throw new Error('Nu s-au putut încărca rezervările');
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchPropertyAndReservations();
  }, [id, navigate]);
  
  const handleLogout = () => {
    document.cookie = 'proprietarId=; Max-Age=0; path=/;';
    navigate('/');
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  const handleShowModal = (reservation) => {
    if (!reservation._id || reservation._id.includes('fake_')) {
      setError('ID-ul rezervării nu este valid pentru a actualiza statusul.');
      return;
    }
    
    setSelectedReservation(reservation);
    setStatusUpdate(reservation.status);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
    setStatusUpdate('');
  };
  
  const handleStatusChange = async () => {
    try {
      if (!selectedReservation || !statusUpdate) return;
    
      const response = await fetch(`/api/bookings/${selectedReservation._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          status: statusUpdate
        })
      });
      
      if (!response.ok) {
        let errorMessage = 'Nu s-a putut actualiza statusul rezervării';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
  
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res._id === selectedReservation._id 
            ? { ...res, status: statusUpdate } 
            : res
        )
      );
      
      setSuccess(`Statusul rezervării a fost actualizat la "${statusUpdate}"`);
      handleCloseModal();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Eroare completă:', err);
      setError(err.message);
    }
  };
  

  const filteredReservations = reservations.filter(res => {
    if (activeTab === 'toate') return true;
    return res.status.toLowerCase() === activeTab;
  });
  

  const searchedReservations = filteredReservations.filter(res => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const guestName = `${res.user?.firstName || ''} ${res.user?.lastName || ''}`.toLowerCase();
    
    return (
      guestName.includes(searchLower) ||
      (res.user?.email && res.user.email.toLowerCase().includes(searchLower)) ||
      (res._id && res._id.toLowerCase().includes(searchLower))
    );
  });
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: colors.lightPurple }}>
        <Spinner animation="border" style={{ color: colors.primary }} />
      </div>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-5">
        <Alert 
          variant="danger" 
          style={{ 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: 'none' 
          }}
        >
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Eroare
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-danger" 
              onClick={() => navigate(`/proprietar/${proprietarId}`)}
              className="rounded-pill px-4"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Înapoi la pagina principală
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
  
  return (
    <>
      <Navbar style={styles.header} expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Link 
                to={`/proprietar/${proprietarId}`} 
                className="btn me-2 rounded-pill px-3 text-white"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <i className="bi bi-house-door me-2"></i>
                Dashboard
              </Link>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={handleLogout}
                className="rounded-pill px-3"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Deconectare
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="py-4 mb-5">
        {success && (
          <Alert 
            variant="success" 
            dismissible 
            onClose={() => setSuccess('')}
            style={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
              color: 'white'
            }}
            className="d-flex align-items-center mb-4"
          >
            <i className="bi bi-check-circle-fill me-2 fs-4"></i>
            <div>{success}</div>
          </Alert>
        )}
        
        <div className="d-flex align-items-center mb-4">
          <div 
            style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '12px', 
              background: colors.gradientPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              marginRight: '15px'
            }}
          >
            <i className="bi bi-journal-check text-white fs-4"></i>
          </div>
          <div>
            <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>Rezervări</h2>
            <p className="mb-0 text-muted">{property?.name}</p>
          </div>
          
          <div className="ms-auto">
            <Link 
              to={`/calendar-proprietate/${id}`} 
              className="btn me-2 rounded-pill"
              style={{ 
                background: 'rgba(106, 17, 203, 0.1)',
                color: colors.text,
                border: `1px solid ${colors.primary}30`,
                fontWeight: '500'
              }}
            >
              <i className="bi bi-calendar me-2"></i>
              Calendar
            </Link>
            <Link 
              to={`/editare-proprietate/${id}`} 
              className="btn rounded-pill"
              style={{ 
                background: colors.buttonGradient,
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-pencil me-2"></i>
              Editează
            </Link>
          </div>
        </div>
        
        <Card className="mb-4" style={styles.card}>
          <Card.Header style={styles.cardHeader} className="py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div className="d-flex flex-wrap gap-2">
                <Button 
                  variant={activeTab === 'toate' ? 'primary' : 'light'}
                  onClick={() => handleTabChange('toate')}
                  className="rounded-pill fw-medium"
                  style={activeTab === 'toate' ? 
                    { background: colors.buttonGradient, border: 'none', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' } : 
                    { color: colors.text, borderColor: `${colors.primary}30` }
                  }
                >
                  <i className="bi bi-grid me-2"></i>
                  Toate
                </Button>
                
                <Button 
                  variant={activeTab === 'confirmată' ? 'success' : 'light'}
                  onClick={() => handleTabChange('confirmată')}
                  className="rounded-pill fw-medium"
                  style={activeTab === 'confirmată' ? 
                    { background: statusColors['confirmată'].gradient, border: 'none' } : 
                    { color: colors.text, borderColor: `${colors.primary}30` }
                  }
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Confirmate
                </Button>
                
                <Button 
                  variant={activeTab === 'în așteptare' ? 'warning' : 'light'}
                  onClick={() => handleTabChange('în așteptare')}
                  className="rounded-pill fw-medium"
                  style={activeTab === 'în așteptare' ? 
                    { background: statusColors['în așteptare'].gradient, border: 'none', color: 'white' } : 
                    { color: colors.text, borderColor: `${colors.primary}30` }
                  }
                >
                  <i className="bi bi-hourglass-split me-2"></i>
                  În așteptare
                </Button>
                
                <Button 
                  variant={activeTab === 'anulată' ? 'danger' : 'light'}
                  onClick={() => handleTabChange('anulată')}
                  className="rounded-pill fw-medium"
                  style={activeTab === 'anulată' ? 
                    { background: statusColors['anulată'].gradient, border: 'none' } : 
                    { color: colors.text, borderColor: `${colors.primary}30` }
                  }
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Anulate
                </Button>
                
                <Button 
                  variant={activeTab === 'finalizată' ? 'info' : 'light'}
                  onClick={() => handleTabChange('finalizată')}
                  className="rounded-pill fw-medium"
                  style={activeTab === 'finalizată' ? 
                    { background: statusColors['finalizată'].gradient, border: 'none' } : 
                    { color: colors.text, borderColor: `${colors.primary}30` }
                  }
                >
                  <i className="bi bi-check2-all me-2"></i>
                  Finalizate
                </Button>
              </div>
              
              <InputGroup className="mt-3 mt-md-0" style={{ maxWidth: '320px' }}>
                <InputGroup.Text style={{ background: colors.lightPurple, borderColor: `${colors.primary}30` }}>
                  <i className="bi bi-search" style={{ color: colors.primary }}></i>
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Caută după nume, email, ID..."
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {searchedReservations.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search" style={{ fontSize: '2.5rem', color: colors.secondary, opacity: 0.5 }}></i>
                <h5 className="mt-3" style={{ color: colors.text }}>Nu există rezervări care să corespundă criteriilor selectate</h5>
                <p className="text-muted">Încercați să modificați filtrele sau să ștergeți termenul de căutare</p>
              </div>
            ) : (
              searchedReservations.map(reservation => (
                <Card key={reservation._id} style={styles.reservationCard} className="hover-shadow">
                  <div style={styles.reservationHeader} className="d-flex justify-content-between align-items-center flex-wrap">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0" style={{ color: colors.text }}>
                        <i className="bi bi-bookmark me-2" style={{ color: colors.primary }}></i>
                        Rezervare #{reservation._id?.substring(0, 8)}
                      </h5>
                      <Badge 
                        style={{
                          ...styles.statusBadge,
                          background: statusColors[reservation.status]?.gradient || '#6c757d',
                          marginLeft: '12px'
                        }}
                      >
                        {reservation.status}
                      </Badge>
                    </div>
                    <div>
                      <Button 
                        style={{
                          ...styles.actionButton,
                          background: colors.buttonGradient,
                          color: 'white'
                        }}
                        onClick={() => handleShowModal(reservation)}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Modifică status
                      </Button>
                    </div>
                  </div>
                  <Card.Body className="p-4">
                    <Row>
                      <Col md={4}>
                        <h6 className="mb-3 fw-bold" style={{ color: colors.text }}>
                          <i className="bi bi-calendar-range me-2" style={{ color: colors.primary }}></i>
                          Detalii rezervare
                        </h6>
                        <div style={styles.detailRow}>
                          <strong>Check-in:</strong> {formatDate(reservation.dates?.checkIn)}
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Check-out:</strong> {formatDate(reservation.dates?.checkOut)}
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Număr nopți:</strong> {
                            Math.ceil(
                              (new Date(reservation.dates?.checkOut) - new Date(reservation.dates?.checkIn)) 
                              / (1000 * 60 * 60 * 24)
                            )
                          }
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Oaspeți:</strong> {reservation.guests?.adults || 1} adulți, {reservation.guests?.children || 0} copii
                        </div>
                        {reservation.specialRequests && (
                          <div style={styles.detailRow}>
                            <strong>Cereri speciale:</strong> {reservation.specialRequests}
                          </div>
                        )}
                      </Col>
                      
                      <Col md={4}>
                        <h6 className="mb-3 fw-bold" style={{ color: colors.text }}>
                          <i className="bi bi-cash-coin me-2" style={{ color: colors.primary }}></i>
                          Informații plată
                        </h6>
                        <div style={styles.detailRow}>
                          <strong>Preț total:</strong> {reservation.pricing?.totalPrice || 0} RON
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Taxe:</strong> {reservation.pricing?.taxes || 0} RON
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Metodă plată:</strong> {reservation.payment?.method || 'Nespecificat'}
                        </div>
                        <div style={styles.detailRow}>
                          <strong>Status plată:</strong> {' '}
                          <Badge 
                            style={{
                              background: reservation.payment?.status === 'reușită' ? statusColors['confirmată'].gradient : 
                                        reservation.payment?.status === 'eșuată' ? statusColors['anulată'].gradient : 
                                        statusColors['în așteptare'].gradient,
                              borderRadius: '20px',
                              padding: '0.25em 0.6em',
                              fontSize: '0.85em'
                            }}
                          >
                            {reservation.payment?.status || 'Necunoscut'}
                          </Badge>
                        </div>
                        {reservation.payment?.transactionId && (
                          <div style={styles.detailRow}>
                            <strong>ID Tranzacție:</strong> {reservation.payment.transactionId}
                          </div>
                        )}
                      </Col>
                      
                      <Col md={4}>
                        <h6 className="mb-3 fw-bold" style={{ color: colors.text }}>
                          <i className="bi bi-person me-2" style={{ color: colors.primary }}></i>
                          Informații client
                        </h6>
                        <div style={styles.userInfo}>
                          <div className="d-flex align-items-center mb-3">
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
                              {reservation.user && reservation.user.firstName ? 
                                reservation.user.firstName.charAt(0).toUpperCase() : 'G'}
                            </div>
                            <div>
                              <h6 className="mb-0" style={{ color: colors.text }}>
                                {reservation.user ? 
                                  `${reservation.user.firstName || ''} ${reservation.user.lastName || ''}` 
                                  : 'Informații indisponibile'}
                              </h6>
                              <small className="text-muted">
                                {reservation.user?.email || 'Email indisponibil'}
                              </small>
                            </div>
                          </div>
                          
                          {reservation.user?.phoneNumber && (
                            <div style={styles.detailRow} className="d-flex align-items-center">
                              <i className="bi bi-telephone me-2" style={{ color: colors.primary }}></i>
                              <span>
                                <strong>Telefon:</strong> {reservation.user.phoneNumber}
                              </span>
                            </div>
                          )}
                          
                          {reservation.user?.country && (
                            <div style={styles.detailRow} className="d-flex align-items-center">
                              <i className="bi bi-geo-alt me-2" style={{ color: colors.primary }}></i>
                              <span>
                                <strong>Țară:</strong> {reservation.user.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            )}
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-between">
          <Link 
            to={`/proprietar/${proprietarId}`} 
            className="btn rounded-pill px-4"
            style={{
              borderColor: `${colors.primary}30`,
              color: colors.text,
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Înapoi la Tabloul de bord
          </Link>
        </div>
      </Container>
      
      
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        centered
        backdrop="static"
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
            <i className="bi bi-pencil-square me-2"></i>
            Modifică status rezervare
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedReservation && (
            <>
              <div 
                className="mb-4 p-3 rounded-3"
                style={{ 
                  background: colors.lightPurple,
                  border: `1px solid ${colors.primary}20`
                }}
              >
                <div className="d-flex align-items-center mb-3">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: colors.gradientSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      color: 'white'
                    }}
                  >
                    <i className="bi bi-bookmark"></i>
                  </div>
                  <div>
                    <div className="text-muted small">ID Rezervare</div>
                    <div className="fw-bold">{selectedReservation._id?.substring(0, 8)}</div>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: colors.gradientSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      color: 'white'
                    }}
                  >
                    <i className="bi bi-person"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Client</div>
                    <div className="fw-bold">
                      {selectedReservation.user 
                        ? `${selectedReservation.user.firstName || ''} ${selectedReservation.user.lastName || ''}` 
                        : 'Informații indisponibile'}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: colors.gradientSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px',
                      color: 'white'
                    }}
                  >
                    <i className="bi bi-calendar-range"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Perioada</div>
                    <div className="fw-bold">
                      {formatDate(selectedReservation.dates?.checkIn)} - {formatDate(selectedReservation.dates?.checkOut)}
                    </div>
                  </div>
                </div>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold" style={{ color: colors.text }}>
                  Selectați noul status:
                </Form.Label>
                <div className="p-1 bg-light rounded-3 border">
                  {['confirmată', 'în așteptare', 'anulată', 'finalizată'].map(status => (
                    <Form.Check
                      key={status}
                      type="radio"
                      id={`status-${status}`}
                      label={
                        <div className="d-flex align-items-center">
                          <div 
                            className="me-2 rounded-pill"
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              background: statusColors[status].bg
                            }}
                          ></div>
                          <span style={{ textTransform: 'capitalize' }}>{status}</span>
                        </div>
                      }
                      name="status"
                      value={status}
                      checked={statusUpdate === status}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="p-2"
                    />
                  ))}
                </div>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none', padding: '0 24px 24px 24px' }}>
          <Button 
            variant="outline-secondary" 
            onClick={handleCloseModal}
            className="rounded-pill px-4"
          >
            Anulează
          </Button>
          <Button 
            onClick={handleStatusChange}
            className="rounded-pill px-4"
            style={{ 
              background: colors.buttonGradient,
              border: 'none',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="bi bi-check2 me-2"></i>
            Salvează modificările
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RezervariProprietate;