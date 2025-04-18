import React, { useState, useEffect } from 'react';
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
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { getCookie } from '../utils/cookies';
import SearchBar from '../components/SearchBar';


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
  propertyCard: {
    marginBottom: '15px',
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  propertyImage: {
    height: '150px',
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
  searchForm: {
    backgroundColor: colors.lightPurple,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.05)'
  },
  card: {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  cardHeader: {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold'
  },
  listItem: {
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    padding: '10px 0'
  },
  statusBadge: {
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '0.8rem'
  },
  dropdownMenu: {
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    border: 'none',
    padding: '8px',
    marginTop: '10px'
  },
  dropdownItem: {
    borderRadius: '8px',
    padding: '8px 16px',
    margin: '2px 0',
    transition: 'background-color 0.2s ease'
  }
};

const romanianCities = [
  'București', 'Cluj-Napoca', 'Alba Iulia', 'Iași', 'Constanța', 
  'Craiova', 'Brașov', 'Galați', 'Ploiești', 'Oradea', 
  'Brăila', 'Arad', 'Pitești', 'Sibiu', 'Bacău', 
  'Târgu Mureș', 'Baia Mare', 'Buzău', 'Satu Mare', 'Râmnicu Vâlcea',
  'Suceava', 'Piatra Neamț', 'Drobeta-Turnu Severin', 'Târgu Jiu', 'Focșani'
];

const User = () => {
  const [user, setUser] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditBooking, setShowEditBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editBookingData, setEditBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: {
      adults: 1,
      children: 0
    }
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [searchData, setSearchData] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = getCookie('userId');
        console.log('Id ul clientului:', userId);
        if (!userId) {
          navigate('/login');
          return;
        }

        const userResponse = await fetch(`/api/users/${userId}`, {
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error('Nu s-au putut încărca datele utilizatorului');
        }

        const userData = await userResponse.json();
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || ''
        });

       
        const favoritesResponse = await fetch(`/api/users/${userId}/favorites`, {
          credentials: 'include'
        });
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          setFavorites(favoritesData);
        }

        
        const bookingsResponse = await fetch(`/api/users/${userId}/bookings`, {
          credentials: 'include'
        });
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
        }

      } catch (error) {
        console.error('Eroare:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Eroare la deconectare');
      }
      return response.json();
    })
    .then(() => {
      document.cookie = 'userId=; Max-Age=0; path=/;';
      navigate('/');
    })
    .catch(error => {
      console.error('Eroare la deconectare:', error);
      document.cookie = 'userId=; Max-Age=0; path=/;';
      navigate('/');
    });
  };

  const handleShowEditProfile = () => {
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

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData({
      ...searchData,
      [name]: value
    });
  };

  const handleLocationChange = (e) => {
    const inputValue = e.target.value;
    setSearchData({
      ...searchData,
      destination: inputValue
    });
    
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
    setSearchData({
      ...searchData,
      destination: city
    });
    setSuggestions([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?destination=${searchData.destination}&checkIn=${searchData.checkIn}&checkOut=${searchData.checkOut}&guests=${searchData.guests}`);
  };


  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la actualizarea profilului');
      }

      setUser(prevUser => ({
        ...prevUser,
        ...data.user
      }));

      setSuccess('Profilul a fost actualizat cu succes!');
      setTimeout(() => {
        setShowEditProfile(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      const response = await fetch('/api/users/change-password', {
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

      const data = await response.json();

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
      setError(error.message);
    }
  };

  const handleShowEditBooking = (booking) => {
    if (!booking.property || !booking.property._id) {
      setError('Proprietatea asociată acestei rezervări nu mai este disponibilă. Nu puteți edita rezervarea.');
      return;
    }
    
    setSelectedBooking(booking);
    setEditBookingData({
      checkIn: booking.dates.checkIn.split('T')[0],
      checkOut: booking.dates.checkOut.split('T')[0],
      guests: {
        adults: booking.guests.adults,
        children: booking.guests.children
      }
    });
    setShowEditBooking(true);
  };

  const handleCloseEditBooking = () => {
    setShowEditBooking(false);
    setSelectedBooking(null);
    setEditBookingData({
      checkIn: '',
      checkOut: '',
      guests: {
        adults: 2,
        children: 0
      }
    });
  };

  const handleEditBookingChange = (e) => {
    const { name, value } = e.target;
    if (name === 'adults' || name === 'children') {
      setEditBookingData(prev => ({
        ...prev,
        guests: {
          ...prev.guests,
          [name]: parseInt(value)
        }
      }));
    } else {
      setEditBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!selectedBooking.property || !selectedBooking.property._id) {
        throw new Error('Proprietatea asociată rezervării nu mai este disponibilă');
      }
      
      const availabilityResponse = await fetch(`/api/proprietati/${selectedBooking.property._id}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          checkIn: editBookingData.checkIn,
          checkOut: editBookingData.checkOut,
          excludeBookingId: selectedBooking._id
        })
      });

      const availabilityData = await availabilityResponse.json();

      if (!availabilityResponse.ok || !availabilityData.available) {
        throw new Error(availabilityData.message || 'Proprietatea nu este disponibilă în perioada selectată');
      }

      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          dates: {
            checkIn: editBookingData.checkIn,
            checkOut: editBookingData.checkOut
          },
          guests: editBookingData.guests
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la actualizarea rezervării');
      }

      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, 
                dates: { 
                  checkIn: editBookingData.checkIn, 
                  checkOut: editBookingData.checkOut 
                },
                guests: editBookingData.guests
              }
            : booking
        )
      );

      setSuccess('Rezervarea a fost actualizată cu succes!');
      setTimeout(() => {
        handleCloseEditBooking();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Sunteți sigur că doriți să anulați această rezervare?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Eroare la anularea rezervării');
      }

      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'anulată' }
            : booking
        )
      );

      setSuccess('Rezervarea a fost anulată cu succes!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', background: colors.lightPurple }}>
        <Spinner animation="border" style={{ color: colors.primary }} />
      </div>
    );
  }

  const userInitials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const futureBookings = bookings.filter(booking => 
    new Date(booking.dates.checkIn) >= new Date() && booking.status !== 'anulată'
  );
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.dates.checkIn) < new Date()
  );

  return (
    <>
      <Navbar style={styles.header} expand="lg">
        <Container>
          <Navbar.Brand href="#" style={styles.logo}>HaiHui.ro</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="link" 
                  id="dropdown-basic" 
                  className="d-flex align-items-center" 
                  style={{ textDecoration: 'none', color: 'white' }}
                >
                  <div style={styles.avatar}>{userInitials}</div>
                  <div className="ms-2">{user.firstName} {user.lastName}</div>
                </Dropdown.Toggle>

                <Dropdown.Menu style={styles.dropdownMenu}>
                  <Dropdown.Item href="#profile" style={styles.dropdownItem}>
                    <i className="bi bi-person-circle me-2" style={{ color: colors.primary }}></i>
                    Profilul meu
                  </Dropdown.Item>
                  <Dropdown.Item onClick={handleShowChangePassword} style={styles.dropdownItem}>
                    <i className="bi bi-key me-2" style={{ color: colors.primary }}></i>
                    Schimbă parola
                  </Dropdown.Item>
                  <Dropdown.Divider style={{ margin: '8px 0' }} />
                  <Dropdown.Item onClick={handleLogout} style={styles.dropdownItem}>
                    <i className="bi bi-box-arrow-right me-2" style={{ color: colors.primary }}></i>
                    Deconectare
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={styles.welcomeSection}>
        <Container>
          <div className="d-flex align-items-center">
            <div style={styles.avatarLarge}>{userInitials}</div>
            <div className="ms-3">
              <h1>Care este următoarea destinație, {user.firstName}?</h1>
              <p className="mb-0">Găsește rapid locuri incredibile pentru următoarea ta aventură</p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        {error && (
          <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4" style={{ borderRadius: '10px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <i className="bi bi-check-circle-fill me-2"></i> {success}
          </Alert>
        )}

        <Row>
          <Col md={8}>
            <Card className="mb-4" style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-search me-2"></i> Caută cazare
                </h2>
              </Card.Header>
              <Card.Body>
                <SearchBar />
                
                <h2 style={styles.sectionTitle} className="mt-4">
                  <i className="bi bi-heart-fill me-2" style={{ color: colors.secondary }}></i> Cazări favorite
                </h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-4" style={{ background: colors.lightPurple, borderRadius: '12px' }}>
                    <i className="bi bi-heart" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                    <p className="mt-3 mb-0">Nu aveți încă cazări favorite.</p>
                    <Link to="/search" className="btn mt-3 rounded-pill px-4" style={{ background: colors.buttonGradient, border: 'none', color: 'white' }}>
                      <i className="bi bi-search me-2"></i> Descoperă cazări
                    </Link>
                  </div>
                ) : (
                  <Row className="g-3">
                    {favorites.map((property) => (
                      <Col md={6} key={property._id}>
                        <Card 
                          style={styles.propertyCard}
                          className="h-100 hover-shadow"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                          }}
                        >
                          <div style={{ height: '160px', overflow: 'hidden' }}>
                            <Card.Img 
                              variant="top" 
                              src={property.images && property.images[0]?.url || '/placeholder-property.jpg'} 
                              style={styles.propertyImage}
                            />
                          </div>
                          <Card.Body className="d-flex flex-column">
                            <Card.Title style={{ color: colors.text, fontWeight: 'bold' }}>{property.name}</Card.Title>
                            <Card.Text>
                              <small className="text-muted d-flex align-items-center">
                                <i className="bi bi-geo-alt" style={{ color: colors.secondary, marginRight: '5px' }}></i> 
                                {property.location.city}
                              </small>
                            </Card.Text>
                            <div className="mt-auto pt-2">
                              <Button 
                                variant="outline-primary" 
                                as={Link} 
                                to={property && property._id ? `/proprietati/${property._id}` : '#'}
                                className="w-100 rounded-pill"
                                style={{ 
                                  borderColor: colors.primary,
                                  color: colors.primary
                                }}
                              >
                                <i className="bi bi-eye me-2"></i> Vezi detalii
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}

                <h2 style={styles.sectionTitle} className="mt-4">
                  <i className="bi bi-calendar-check me-2" style={{ color: colors.secondary }}></i> Rezervări viitoare
                </h2>
                {futureBookings.length === 0 ? (
                  <div className="text-center py-4" style={{ background: colors.lightPurple, borderRadius: '12px' }}>
                    <i className="bi bi-calendar" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                    <p className="mt-3 mb-0">Nu aveți rezervări viitoare.</p>
                    <Link to="/search" className="btn mt-3 rounded-pill px-4" style={{ background: colors.buttonGradient, border: 'none', color: 'white' }}>
                      <i className="bi bi-search me-2"></i> Caută cazare
                    </Link>
                  </div>
                ) : (
                  <div className="mb-4">
                    {futureBookings.map((booking) => (
                      <Card key={booking._id} className="mb-3" style={styles.propertyCard}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div>
                              <h5 style={{ color: colors.text, fontWeight: 'bold' }}>
                                {booking.property && booking.property.name ? booking.property.name : 'Proprietate indisponibilă'}
                              </h5>
                              <div className="d-flex align-items-center mb-2">
                                <Badge 
                                  style={{ 
                                    background: colors.buttonGradient,
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '5px 10px',
                                    marginRight: '10px'
                                  }}
                                >
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {new Date(booking.dates.checkIn).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Badge>
                                <i className="bi bi-arrow-right mx-2" style={{ color: colors.primary }}></i>
                                <Badge 
                                  bg="secondary"
                                  style={{ 
                                    background: colors.buttonGradient,
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '5px 10px'
                                  }}
                                >
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {new Date(booking.dates.checkOut).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Badge>
                              </div>
                              <p className="mb-0 small" style={{ color: colors.text }}>
                                <i className="bi bi-people me-1"></i>
                                {booking.guests.adults} adulți, {booking.guests.children} copii
                              </p>
                            </div>
                            <div className="d-flex gap-2 mt-md-0 mt-3">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                as={Link}
                                to={booking.property && booking.property._id ? `/proprietati/${booking.property._id}` : '#'}
                                className="rounded-pill"
                                style={{ 
                                  borderColor: colors.primary,
                                  color: colors.primary
                                }}
                              >
                                <i className="bi bi-house-door me-1"></i> Vezi cazare
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="rounded-pill"
                                onClick={() => handleShowEditBooking(booking)}
                                disabled={!booking.property || !booking.property._id}
                                style={{ 
                                  borderColor: colors.secondary,
                                  color: colors.secondary
                                }}
                              >
                                <i className="bi bi-pencil me-1"></i> Modifică
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="rounded-pill"
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                <i className="bi bi-x-circle me-1"></i> Anulează
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                <h2 style={styles.sectionTitle} className="mt-4">
                  <i className="bi bi-clock-history me-2" style={{ color: colors.secondary }}></i> Rezervări trecute
                </h2>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-4" style={{ background: colors.lightPurple, borderRadius: '12px' }}>
                    <i className="bi bi-hourglass" style={{ fontSize: '3rem', color: colors.secondary }}></i>
                    <p className="mt-3 mb-0">Nu aveți rezervări trecute.</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    {pastBookings.map((booking) => (
                      <Card key={booking._id} className="mb-3" style={{
                        ...styles.propertyCard,
                        opacity: '0.85'
                      }}>
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div>
                              <h5 style={{ color: colors.text, fontWeight: 'bold' }}>
                                {booking.property && booking.property.name ? booking.property.name : 'Proprietate indisponibilă'}
                              </h5>
                              <div className="d-flex align-items-center mb-2">
                                <Badge 
                                  bg="secondary"
                                  style={{ 
                                    borderRadius: '12px',
                                    padding: '5px 10px',
                                    marginRight: '10px'
                                  }}
                                >
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {new Date(booking.dates.checkIn).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Badge>
                                <i className="bi bi-arrow-right mx-2" style={{ color: colors.primary }}></i>
                                <Badge 
                                  bg="secondary"
                                  style={{ 
                                    borderRadius: '12px',
                                    padding: '5px 10px'
                                  }}
                                >
                                  <i className="bi bi-calendar-event me-1"></i>
                                  {new Date(booking.dates.checkOut).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </Badge>
                              </div>
                              <p className="mb-0 small" style={{ color: colors.text }}>
                                <i className="bi bi-people me-1"></i>
                                {booking.guests.adults} adulți, {booking.guests.children} copii
                              </p>
                            </div>
                            <div className="mt-md-0 mt-3">
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                as={Link}
                                to={booking.property && booking.property._id ? `/proprietati/${booking.property._id}` : '#'}
                                className="rounded-pill"
                                style={{ 
                                  borderColor: colors.secondary,
                                  color: colors.secondary
                                }}
                              >
                                <i className="bi bi-house-door me-1"></i> Vezi cazare
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="mb-4" id="profile" style={styles.card}>
              <Card.Header style={styles.cardHeader}>
                <h2 style={styles.sectionTitle} className="mb-0">
                  <i className="bi bi-person-circle me-2"></i> Profilul meu
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <ListGroup variant="flush">
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Nume complet</div>
                        <div className="fw-medium">{user.firstName} {user.lastName}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-envelope-at me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Email</div>
                        <div className="fw-medium">{user.email}</div>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item style={styles.listItem} className="py-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone me-3" style={{ color: colors.primary, fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="text-muted small">Telefon</div>
                        <div className="fw-medium">{user.phoneNumber || 'Nespecificat'}</div>
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
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleProfileSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Prenume</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-person" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nume</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-person" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
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
              <Form.Label>Telefon</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-telephone" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
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
                    Se salvează...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-2"></i> Salvează
                  </>
                )}
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

      
      <Modal 
        show={showEditBooking} 
        onHide={handleCloseEditBooking}
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
            <i className="bi bi-calendar-check me-2"></i> Modifică rezervarea
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleEditBookingSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Data check-in</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-calendar-event" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  name="checkIn"
                  value={editBookingData.checkIn}
                  onChange={handleEditBookingChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data check-out</Form.Label>
              <InputGroup>
                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                  <i className="bi bi-calendar-event" style={{color: colors.primary}}></i>
                </InputGroup.Text>
                <Form.Control
                  type="date"
                  name="checkOut"
                  value={editBookingData.checkOut}
                  onChange={handleEditBookingChange}
                  min={editBookingData.checkIn}
                  required
                  style={{backgroundColor: colors.lightPurple}}
                />
              </InputGroup>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Număr adulți</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                      <i className="bi bi-person" style={{color: colors.primary}}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="adults"
                      value={editBookingData.guests.adults}
                      onChange={handleEditBookingChange}
                      min="1"
                      required
                      style={{backgroundColor: colors.lightPurple}}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Număr copii</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                      <i className="bi bi-person-heart" style={{color: colors.primary}}></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="children"
                      value={editBookingData.guests.children}
                      onChange={handleEditBookingChange}
                      min="0"
                      style={{backgroundColor: colors.lightPurple}}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="light" 
                onClick={handleCloseEditBooking}
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
                    Se salvează...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2 me-2"></i> Salvează modificările
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default User;