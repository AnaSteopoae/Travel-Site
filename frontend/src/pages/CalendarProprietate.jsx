import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Form,
  ListGroup,
  Modal,
  Navbar,
  Nav
} from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getCookie } from '../utils/cookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


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
  available: '#e8f5e9',
  availableText: '#2e7d32',
  blocked: '#ffcccc',
  blockedText: '#cc0000',
  booked: '#fff0e0',
  bookedText: '#e65100'
};


const CalendarCSS = `
  .react-calendar {
    border: none;
    border-radius: 12px;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
    padding: 16px;
    font-family: 'Open Sans', sans-serif;
  }
  
  .react-calendar__navigation {
    margin-bottom: 16px;
  }
  
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    border-radius: 8px;
    color: ${colors.text};
  }
  
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: ${colors.lightPurple};
  }
  
  .react-calendar__month-view__weekdays {
    text-align: center;
    font-weight: bold;
    font-size: 0.9em;
    color: ${colors.text};
    text-decoration: none;
    margin-bottom: 8px;
  }
  
  .react-calendar__month-view__weekdays__weekday {
    padding: 10px;
  }
  
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }
  
  .react-calendar__tile {
    padding: 12px 6px;
    border-radius: 8px;
    font-weight: 500;
  }
  
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f0f0f0;
    border-radius: 8px;
  }
  
  .blocked-date {
    background-color: ${colors.blocked} !important;
    color: ${colors.blockedText} !important;
    border-radius: 8px !important;
  }
  
  .booked-date {
    background-color: ${colors.booked} !important;
    color: ${colors.bookedText} !important;
    border-radius: 8px !important;
  }
  
  .available-date {
    background-color: ${colors.available} !important;
    color: ${colors.availableText} !important;
    border-radius: 8px !important;
  }
  
  .react-calendar__tile--active {
    background: ${colors.primary} !important;
    color: white !important;
    border-radius: 8px !important;
  }
  
  .react-calendar__tile--now {
    background: ${colors.lightPurple} !important;
    color: ${colors.text} !important;
    border-radius: 8px !important;
  }
`;

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
  calendar: {
    width: '100%',
    maxWidth: '100%',
    background: 'white',
    border: 'none',
    borderRadius: '15px',
    fontFamily: 'inherit',
    lineHeight: '1.125em',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)'
  },
  blockedDate: {
    backgroundColor: colors.blocked,
    color: colors.blockedText
  },
  bookedDate: {
    backgroundColor: colors.booked,
    color: colors.bookedText
  },
  availableDate: {
    backgroundColor: colors.available,
    color: colors.availableText
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    margin: '20px 0'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '15px'
  },
  colorBox: {
    width: '24px',
    height: '24px',
    marginRight: '8px',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  cardHeader: {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0,0,0,0.05)'
  },
  cardHeaderPrimary: {
    background: colors.gradientPrimary,
    color: 'white',
    fontWeight: 'bold',
    padding: '15px 20px',
    borderBottom: 'none'
  },
  listItem: {
    borderLeft: 'none',
    borderRight: 'none',
    borderTop: 'none',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    padding: '12px 16px'
  },
  actionButton: {
    borderRadius: '20px',
    padding: '0.5rem 1rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s ease'
  },
  tipsIcon: {
    fontSize: '1.2rem',
    color: '#FFB100',
    marginRight: '8px'
  }
};

const CalendarProprietate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState({
    blocked: [],
    booked: []
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState(null);
  const [success, setSuccess] = useState('');
  const [proprietarId, setProprietarId] = useState('');
  const [useRange, setUseRange] = useState(false);
  
  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        const currentProprietarId = getCookie('proprietarId');
        if (!currentProprietarId) {
          navigate('/login');
          return;
        }
        
        setProprietarId(currentProprietarId);
        
        const response = await fetch(`/api/proprietati/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Nu s-au putut încărca datele proprietății');
        }
        
        const data = await response.json();
        if (data.owner.toString() !== currentProprietarId) {
          throw new Error('Nu aveți permisiunea de a vedea acest calendar');
        }
        
        setProperty(data);
        
        const availabilityResponse = await fetch(`/api/proprietati/${id}/disponibilitate`, {
          credentials: 'include'
        });
        
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json();
          console.log('Date disponibilitate primite de la server:', availabilityData);
          
          const blockedDates = availabilityData.blockedDates?.map(dateStr => new Date(dateStr)) || [];
          const bookedDates = availabilityData.bookedDates?.map(dateStr => new Date(dateStr)) || [];
          
          console.log('Date blocate procesate:', blockedDates);
          console.log('Date rezervate procesate:', bookedDates);
          
          setDates({
            blocked: blockedDates,
            booked: bookedDates
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchPropertyData();
  }, [id, navigate]);
  
  const isDateBooked = (date) => {
    if (!dates.booked || !dates.booked.length) return false;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const isBooked = dates.booked.some(bookedDate => 
      bookedDate.getFullYear() === year && 
      bookedDate.getMonth() === month && 
      bookedDate.getDate() === day
    );
    
    if (isBooked) {
      console.log(`Data ${date.toLocaleDateString()} este rezervată`);
    }
    
    return isBooked;
  };
  
  const isDateBlocked = (date) => {
    if (!dates.blocked || !dates.blocked.length) return false;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return dates.blocked.some(blockedDate => 
      blockedDate.getFullYear() === year && 
      blockedDate.getMonth() === month && 
      blockedDate.getDate() === day
    );
  };
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setDateRangeEnd(null);
    setUseRange(false);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setDateRangeEnd(null);
    setActionType('');
    setUseRange(false);
  };
  
  const handleAction = async () => {
    try {
      const dateRange = [];
      
      if (useRange && dateRangeEnd) {
        let currentDate = new Date(selectedDate);
        const endDate = new Date(dateRangeEnd);
        
        while (currentDate <= endDate) {
          dateRange.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        dateRange.push(new Date(selectedDate));
      }
      
      const dateStrings = dateRange.map(date => date.toISOString());
      
      const response = await fetch(`/api/proprietati/${id}/disponibilitate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          action: actionType,
          dates: dateStrings
        })
      });
      
      if (!response.ok) {
        throw new Error('Nu s-a putut actualiza disponibilitatea');
      }
      
      if (actionType === 'block') {
        setDates(prev => ({
          ...prev,
          blocked: [...prev.blocked, ...dateRange]
        }));
        setSuccess('Datele au fost blocate cu succes!');
      } else if (actionType === 'unblock') {
        setDates(prev => ({
          ...prev,
          blocked: prev.blocked.filter(blocked => 
            !dateRange.some(date => 
              date.getDate() === blocked.getDate() && 
              date.getMonth() === blocked.getMonth() && 
              date.getFullYear() === blocked.getFullYear()
            )
          )
        }));
        setSuccess('Datele au fost deblocate cu succes!');
      }
      
      handleCloseModal();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;
    
    if (isDateBlocked(date)) {
      return 'blocked-date';
    }
    
    if (isDateBooked(date)) {
      return 'booked-date';
    }
    
    return 'available-date';
  };
  
  const handleLogout = () => {
    document.cookie = 'proprietarId=; Max-Age=0; path=/;';
    navigate('/');
  };
  
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
        <Alert variant="danger" style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none' 
        }}>
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
  
  if (!property) {
    return (
      <Container className="mt-5">
        <Alert variant="warning" style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: 'none' 
        }}>
          <Alert.Heading>
            <i className="bi bi-question-circle-fill me-2"></i>
            Proprietatea nu a fost găsită
          </Alert.Heading>
          <p>Nu am putut găsi datele pentru această proprietate.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-warning" 
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
      <style>{CalendarCSS}</style>
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
            <i className="bi bi-calendar3 text-white fs-4"></i>
          </div>
          <div>
            <h2 className="mb-0 fw-bold" style={{ color: colors.text }}>Calendar Disponibilitate</h2>
            <p className="mb-0 text-muted">{property.name}</p>
          </div>
        </div>

        <Row className="g-4">
          <Col lg={8}>
            <Card style={styles.card} className="mb-4">
              <Card.Header style={styles.cardHeader}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0" style={{ color: colors.text }}>
                    <i className="bi bi-calendar-week me-2"></i>
                    Calendar - {property.name}
                  </h5>
                  <Link 
                    to={`/editare-proprietate/${id}`} 
                    className="btn btn-sm rounded-pill px-3"
                    style={{ 
                      background: colors.buttonGradient, 
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Editează
                  </Link>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="mb-4">
                  <p className="mb-3 text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Faceți click pe o dată pentru a o bloca sau debloca
                  </p>
                
                  <div style={styles.legend}>
                    <div style={styles.legendItem}>
                      <div style={{...styles.colorBox, ...styles.availableDate}}></div>
                      <span>Disponibil</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{...styles.colorBox, ...styles.blockedDate}}></div>
                      <span>Blocat</span>
                    </div>
                    <div style={styles.legendItem}>
                      <div style={{...styles.colorBox, ...styles.bookedDate}}></div>
                      <span>Rezervat</span>
                    </div>
                  </div>
                </div>
                
                <Calendar
                  onChange={handleDateClick}
                  value={new Date()}
                  tileClassName={tileClassName}
                  className="mb-4"
                  style={styles.calendar}
                  minDate={new Date()}
                />
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <div className="d-flex flex-column mb-4" style={{ gap: '12px' }}>
              <Card style={styles.card}>
                <Card.Header style={{...styles.cardHeaderPrimary, padding: '10px 15px'}}>
                  <h5 className="mb-0 fs-6">
                    <i className="bi bi-house me-2"></i>
                    Informații proprietate
                  </h5>
                </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item style={{...styles.listItem, padding: '8px 12px'}} className="py-1">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-building me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                      <div>
                        <div className="text-muted small">Nume proprietate</div>
                        <div className="small fw-medium">{property.name}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={{...styles.listItem, padding: '8px 12px'}} className="py-1">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                      <div>
                        <div className="text-muted small">Locație</div>
                        <div className="small fw-medium">{property.location?.city}, {property.location?.country}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={{...styles.listItem, padding: '8px 12px'}} className="py-1">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-house-door me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                      <div>
                        <div className="text-muted small">Tip proprietate</div>
                        <div className="small fw-medium">{property.type}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={{...styles.listItem, padding: '8px 12px'}} className="py-1">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-cash-coin me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                      <div>
                        <div className="text-muted small">Preț pe noapte</div>
                        <div className="small fw-medium">{property.pricing?.basePrice} RON</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            
            <Card style={styles.card}>
              <Card.Header style={{...styles.cardHeader, padding: '10px 15px'}}>
                <h5 className="mb-0 fs-6" style={{ color: colors.text }}>
                  <i className="bi bi-lightning-charge me-2"></i>
                  Acțiuni rapide
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item 
                    action 
                    as={Link} 
                    to={`/rezervari-proprietate/${id}`}
                    className="d-flex align-items-center py-1"
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '8px 12px'
                    }}
                  >
                    <i className="bi bi-calendar-check me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                    <span className="small">Gestionează rezervările</span>
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action 
                    as={Link} 
                    to={`/editare-proprietate/${id}`}
                    className="d-flex align-items-center py-1"
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '8px 12px'
                    }}
                  >
                    <i className="bi bi-pencil-square me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                    <span className="small">Editează proprietatea</span>
                  </ListGroup.Item>
                  <ListGroup.Item 
                    action 
                    as={Link} 
                    to={`/proprietar/${proprietarId}`}
                    className="d-flex align-items-center py-1"
                    style={{
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderTop: 'none',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      padding: '8px 12px'
                    }}
                  >
                    <i className="bi bi-arrow-left me-2" style={{ color: colors.primary, fontSize: '1rem' }}></i>
                    <span className="small">Înapoi la Tabloul de bord</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
            
            <Card style={styles.card}>
              <Card.Header style={{...styles.cardHeader, padding: '10px 15px'}}>
                <h5 className="mb-0 fs-6" style={{ color: colors.text }}>
                  <i className="bi bi-lightbulb me-2"></i>
                  Sfaturi
                </h5>
              </Card.Header>
              <Card.Body className="p-2">
                <div className="d-flex align-items-start mb-1">
                  <div style={{ color: '#FFB100', fontSize: '1rem', marginRight: '8px', marginTop: '2px' }}>
                    <i className="bi bi-lightbulb-fill"></i>
                  </div>
                  <p className="mb-0 small" style={{fontSize: "0.75rem", lineHeight: "1.2"}}>
                    Blocați datele în care proprietatea nu este disponibilă.
                  </p>
                </div>
                <div className="d-flex align-items-start mb-1">
                  <div style={{ color: '#FFB100', fontSize: '1rem', marginRight: '8px', marginTop: '2px' }}>
                    <i className="bi bi-lightbulb-fill"></i>
                  </div>
                  <p className="mb-0 small" style={{fontSize: "0.75rem", lineHeight: "1.2"}}>
                    Datele rezervate nu pot fi modificate din această interfață.
                  </p>
                </div>
                <div className="d-flex align-items-start">
                  <div style={{ color: '#FFB100', fontSize: '1rem', marginRight: '8px', marginTop: '2px' }}>
                    <i className="bi bi-lightbulb-fill"></i>
                  </div>
                  <p className="mb-0 small" style={{fontSize: "0.75rem", lineHeight: "1.2"}}>
                    Folosiți selecția de perioadă pentru intervale mai lungi.
                  </p>
                </div>
              </Card.Body>
            </Card>
            </div>
          </Col>
        </Row>
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
            <i className="bi bi-calendar-range me-2"></i>
            Gestionare disponibilitate
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div 
            className="d-flex align-items-center p-3 mb-3 rounded-3"
            style={{ 
              background: colors.lightPurple,
              border: `1px solid ${colors.primary}20`
            }}
          >
            <i className="bi bi-calendar-event me-3 fs-4" style={{ color: colors.primary }}></i>
            <div>
              <div className="text-muted small">Data selectată</div>
              <div className="fw-bold">{selectedDate?.toLocaleDateString('ro-RO')}</div>
            </div>
          </div>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="date-range"
              label="Aplică pentru o perioadă (interval de date)"
              checked={useRange}
              onChange={(e) => {
                setUseRange(e.target.checked);
                if (!e.target.checked) {
                  setDateRangeEnd(null);
                }
              }}
              style={{ 
                color: colors.text,
                fontWeight: '500'
              }}
            />
          </Form.Group>
          
          {useRange && (
            <Form.Group className="mb-4">
              <Form.Label className="mb-2">Data de final:</Form.Label>
              <Form.Control
                type="date"
                value={dateRangeEnd ? new Date(dateRangeEnd).toISOString().split('T')[0] : ''}
                min={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRangeEnd(new Date(e.target.value))}
                style={{
                  backgroundColor: colors.lightPurple,
                  border: `1px solid ${colors.primary}40`,
                  borderRadius: '8px',
                  padding: '10px 15px'
                }}
              />
              {dateRangeEnd && (
                <div className="mt-2 text-muted small">
                  <i className="bi bi-info-circle me-1"></i>
                  Acțiunea se va aplica pentru perioada {selectedDate?.toLocaleDateString('ro-RO')} - {new Date(dateRangeEnd).toLocaleDateString('ro-RO')}
                </div>
              )}
            </Form.Group>
          )}
          
          {selectedDate && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold mb-2" style={{ color: colors.text }}>
                Selectați acțiunea:
              </Form.Label>
              <div 
                className="p-3 rounded-3"
                style={{ 
                  background: '#f8f9fa',
                  border: '1px solid #eee' 
                }}
              >
                <Form.Check
                  className="mb-2"
                  type="radio"
                  name="action-type"
                  id="block"
                  label={
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle me-2"
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          background: colors.blocked,
                          border: `1px solid ${colors.blockedText}` 
                        }}
                      ></div>
                      <span style={{ fontWeight: '500' }}>Blochează data</span>
                    </div>
                  }
                  onChange={() => setActionType('block')}
                  checked={actionType === 'block'}
                />
                <Form.Check
                  type="radio"
                  name="action-type"
                  id="unblock"
                  label={
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle me-2"
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          background: colors.available,
                          border: `1px solid ${colors.availableText}` 
                        }}
                      ></div>
                      <span style={{ fontWeight: '500' }}>Deblochează data</span>
                    </div>
                  }
                  onChange={() => setActionType('unblock')}
                  checked={actionType === 'unblock'}
                />
              </div>
            </Form.Group>
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
            variant="primary" 
            onClick={handleAction}
            disabled={!actionType}
            className="rounded-pill px-4"
            style={{ 
              background: colors.buttonGradient,
              border: 'none',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="bi bi-check2 me-2"></i>
            Aplică
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CalendarProprietate;