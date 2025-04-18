import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card, Table, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
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
  sidebarBg: '#1e0f4d',
  sidebarText: '#ffffff',
  sidebarActiveItem: 'rgba(255, 255, 255, 0.15)',
  cardBorder: 'rgba(130, 130, 255, 0.15)'
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [proprietari, setProprietari] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // State pentru modals proprietari
  const [showModal, setShowModal] = useState(false);
  const [selectedProprietar, setSelectedProprietar] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State pentru modals utilizatori
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showUserDeleteModal, setShowUserDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: ''
  });
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userActionError, setUserActionError] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState('');

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/users/admin/check-auth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Nu sunteți autorizat să accesați această pagină');
        }
        loadData();
      } catch (err) {
        setError(err.message);
        navigate('/admin/login');
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'users') {
          const usersResponse = await fetch('/api/users/admin/all-users');
          if (!usersResponse.ok) {
            throw new Error('Eroare la încărcarea utilizatorilor');
          }
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else if (activeTab === 'properties') {
          const proprietariResponse = await fetch('/api/proprietari/admin/all');
          if (!proprietariResponse.ok) {
            throw new Error('Eroare la încărcarea proprietarilor');
          }
          const proprietariData = await proprietariResponse.json();
          setProprietari(proprietariData);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [activeTab, navigate]);

  const handleLogout = () => {
    document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    navigate('/admin/login');
  };

  // Funcții pentru gestionarea proprietarilor
  const handleStatusUpdate = async () => {
    try {
      if (!selectedProprietar || !newStatus) {
        return;
      }

      const response = await fetch(`/api/proprietari/admin/update-status/${selectedProprietar._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationStatus: newStatus })
      });

      if (!response.ok) {
        throw new Error('Eroare la actualizarea statusului');
      }

      
      const updatedProprietari = proprietari.map(proprietar => {
        if (proprietar._id === selectedProprietar._id) {
          return { ...proprietar, verificationStatus: newStatus };
        }
        return proprietar;
      });

      setProprietari(updatedProprietari);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const openStatusModal = (proprietar) => {
    setSelectedProprietar(proprietar);
    setNewStatus(proprietar.verificationStatus);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge bg="success" pill>Verificat</Badge>;
      case 'rejected':
        return <Badge bg="danger" pill>Respins</Badge>;
      default:
        return <Badge bg="warning" pill>În așteptare</Badge>;
    }
  };

  // Funcții pentru gestionarea utilizatorilor
  const handleShowUserDetails = async (userId) => {
    try {
      setUserDetailsLoading(true);
      setUserActionError('');
      
      const response = await fetch(`/api/users/admin/user/${userId}`);
      if (!response.ok) {
        throw new Error('Eroare la obținerea detaliilor utilizatorului');
      }
      
      const userData = await response.json();
      setSelectedUser(userData);
      setShowUserDetailsModal(true);
      setUserDetailsLoading(false);
    } catch (err) {
      setUserActionError(err.message);
      setUserDetailsLoading(false);
    }
  };
  
  const handleShowUserEdit = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role || 'client'
    });
    setShowUserEditModal(true);
  };
  
  const handleShowUserDelete = (user) => {
    setSelectedUser(user);
    setShowUserDeleteModal(true);
  };
  
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm({
      ...editUserForm,
      [name]: value
    });
  };
  
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setUserActionError('');
      setUserActionSuccess('');
      
      const response = await fetch(`/api/users/admin/update-user/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUserForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la actualizarea utilizatorului');
      }
      
      const data = await response.json();
      
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return { ...user, ...data.user };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setUserActionSuccess('Utilizatorul a fost actualizat cu succes');
      
      setTimeout(() => {
        setShowUserEditModal(false);
        setUserActionSuccess('');
      }, 1500);
    } catch (err) {
      setUserActionError(err.message);
    }
  };
  
  const handleUserDelete = async () => {
    try {
      setUserActionError('');
      
      const response = await fetch(`/api/users/admin/delete-user/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la ștergerea utilizatorului');
      }
      
      setUsers(users.filter(user => user._id !== selectedUser._id));
      setShowUserDeleteModal(false);
      
      setUserActionSuccess('Utilizatorul a fost șters cu succes');
      setTimeout(() => setUserActionSuccess(''), 3000);
    } catch (err) {
      setUserActionError(err.message);
    }
  };

  const cardStyle = {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    marginBottom: '24px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };
  
  const cardHeaderStyle = {
    background: colors.lightPurple,
    color: colors.text,
    fontWeight: 'bold',
    border: 'none',
    padding: '15px 20px'
  };

  return (
    <div style={{ backgroundColor: colors.lightPurple, minHeight: '100vh' }}>
      <Container fluid className="px-0">
        <Row className="g-0">
          <Col md={3} lg={2} className="min-vh-100 d-flex flex-column" style={{ 
            background: colors.sidebarBg,
            boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="p-4 text-center">
              <h3 className="text-white mb-0 d-flex align-items-center justify-content-center">
                <i className="bi bi-shield-lock me-2"></i>
                Admin Panel
              </h3>
            </div>
            <div className="p-3">
              <div className="bg-white bg-opacity-10 rounded-3 p-2 mb-3">
                <div className="text-white-50 small mb-2 ps-2">Gestionare</div>
                <Nav className="flex-column">
                  <Nav.Link 
                    className="rounded-pill mb-1 d-flex align-items-center text-white px-3 py-2"
                    style={{ 
                      background: activeTab === 'users' ? colors.sidebarActiveItem : 'transparent'
                    }}
                    onClick={() => setActiveTab('users')}
                  >
                    <i className="bi bi-people me-2"></i>
                    Utilizatori
                  </Nav.Link>
                  <Nav.Link 
                    className="rounded-pill mb-1 d-flex align-items-center text-white px-3 py-2"
                    style={{ 
                      background: activeTab === 'properties' ? colors.sidebarActiveItem : 'transparent'
                    }}
                    onClick={() => setActiveTab('properties')}
                  >
                    <i className="bi bi-houses me-2"></i>
                    Proprietari și Proprietăți
                  </Nav.Link>
                </Nav>
              </div>
            </div>
            <div className="mt-auto p-4 text-center">
              <Button 
                variant="outline-light" 
                className="w-100 rounded-pill d-flex align-items-center justify-content-center"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-left me-2"></i>
                Deconectare
              </Button>
            </div>
          </Col>
          
          <Col md={9} lg={10}>
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ color: colors.text, fontWeight: 'bold' }}>
                  {activeTab === 'users' ? (
                    <><i className="bi bi-people me-2"></i> Gestionare Utilizatori</>
                  ) : activeTab === 'properties' ? (
                    <><i className="bi bi-houses me-2"></i> Gestionare Proprietari și Proprietăți</>
                  ) : (
                    <><i className="bi bi-calendar-check me-2"></i> Gestionare Rezervări</>
                  )}
                </h2>
              </div>
              
              {error && (
                <Alert 
                  variant="danger" 
                  onClose={() => setError('')} 
                  dismissible
                  style={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    marginBottom: '20px'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
                    <div>
                      <Alert.Heading style={{ fontSize: '1rem', fontWeight: 'bold' }}>Eroare</Alert.Heading>
                      <p className="mb-0">{error}</p>
                    </div>
                  </div>
                </Alert>
              )}
              
              {userActionSuccess && (
                <Alert 
                  variant="success" 
                  onClose={() => setUserActionSuccess('')} 
                  dismissible
                  style={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
                    color: 'white',
                    marginBottom: '20px'
                  }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2 fs-4"></i>
                    <div>
                      <p className="mb-0">{userActionSuccess}</p>
                    </div>
                  </div>
                </Alert>
              )}
              
              {loading ? (
                <div className="text-center py-5">
                  <Spinner 
                    animation="border" 
                    style={{ 
                      color: colors.primary,
                      width: '3rem',
                      height: '3rem'
                    }} 
                  />
                  <p className="mt-3" style={{ color: colors.text }}>Se încarcă datele...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'users' && (
                    <Card style={cardStyle}>
                      <Card.Body className="p-0">
                        <div className="p-4 pb-0">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 style={{ color: colors.text }}>Lista utilizatorilor</h5>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <div className="bg-white rounded-3 overflow-hidden">
                            <Table responsive hover className="mb-0">
                              <thead style={{ background: colors.lightPurple }}>
                                <tr>
                                  <th>ID</th>
                                  <th>Nume</th>
                                  <th>Email</th>
                                  <th>Rol</th>
                                  <th>Data înregistrării</th>
                                  <th>Acțiuni</th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.map(user => (
                                  <tr key={user._id}>
                                    <td>
                                      <span className="text-muted small">{user._id}</span>
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center">
                                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                                          style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            background: colors.lightPurple,
                                            color: colors.primary
                                          }}>
                                          <i className="bi bi-person"></i>
                                        </div>
                                        {user.firstName} {user.lastName}
                                      </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                      <Badge 
                                        pill 
                                        bg={user.role === 'admin' ? 'danger' : 'info'}
                                      >
                                        {user.role}
                                      </Badge>
                                    </td>
                                    <td>{new Date(user.registrationDate).toLocaleDateString()}</td>
                                    <td>
                                      <Button 
                                        size="sm" 
                                        variant="light"
                                        className="me-1 rounded-pill"
                                        style={{ color: colors.primary }}
                                        onClick={() => handleShowUserDetails(user._id)}
                                      >
                                        <i className="bi bi-info-circle"></i>
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="light"
                                        className="me-1 rounded-pill"
                                        style={{ color: '#ffc107' }}
                                        onClick={() => handleShowUserEdit(user)}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="light"
                                        className="rounded-pill"
                                        style={{ color: '#dc3545' }}
                                        onClick={() => handleShowUserDelete(user)}
                                      >
                                        <i className="bi bi-trash"></i>
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                  
                  {activeTab === 'properties' && (
                    <Card style={cardStyle}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 style={{ color: colors.text }}>Proprietari și Proprietățile lor</h5>
                        </div>
                        
                        {proprietari.length === 0 ? (
                          <div className="text-center py-5 text-muted">
                            <i className="bi bi-houses fs-1 mb-3" style={{ color: colors.secondary }}></i>
                            <p>Nu există proprietari înregistrați.</p>
                          </div>
                        ) : (
                          proprietari.map(proprietar => (
                            <Card key={proprietar._id} className="mb-4" style={{
                              border: `1px solid ${colors.cardBorder}`,
                              borderRadius: '12px',
                              overflow: 'hidden'
                            }}>
                              <Card.Header className="d-flex justify-content-between align-items-center" 
                                style={{ 
                                  background: colors.lightPurple,
                                  border: 'none',
                                  padding: '15px 20px'
                                }}
                              >
                                <div>
                                  <h5 style={{ color: colors.text, marginBottom: '5px' }}>
                                    <i className="bi bi-building me-2"></i>
                                    {proprietar.companyName}
                                  </h5>
                                  <div>{getStatusBadge(proprietar.verificationStatus)}</div>
                                </div>
                                <Button 
                                  className="rounded-pill"
                                  style={{ 
                                    background: colors.buttonGradient,
                                    border: 'none',
                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                                  }}
                                  onClick={() => openStatusModal(proprietar)}
                                >
                                  <i className="bi bi-arrow-repeat me-1"></i>
                                  Schimbă Status
                                </Button>
                              </Card.Header>
                              <Card.Body className="p-4">
                                <Row>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <div className="text-muted mb-1 small">Email:</div>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-envelope me-2" style={{ color: colors.primary }}></i>
                                        {proprietar.email}
                                      </div>
                                    </div>
                                    <div className="mb-3">
                                      <div className="text-muted mb-1 small">Telefon:</div>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-telephone me-2" style={{ color: colors.primary }}></i>
                                        {proprietar.phoneNumber}
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={6}>
                                    <div className="mb-3">
                                      <div className="text-muted mb-1 small">Cod Fiscal:</div>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-file-earmark-text me-2" style={{ color: colors.primary }}></i>
                                        {proprietar.fiscalCode}
                                      </div>
                                    </div>
                                    <div className="mb-3">
                                      <div className="text-muted mb-1 small">Data înregistrării:</div>
                                      <div className="d-flex align-items-center">
                                        <i className="bi bi-calendar me-2" style={{ color: colors.primary }}></i>
                                        {new Date(proprietar.createdAt).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>
                                
                                <div className="mt-4">
                                  <h6 style={{ color: colors.text }}>
                                    <i className="bi bi-houses me-2"></i>
                                    Proprietăți ({proprietar.proprietati.length})
                                  </h6>
                                  
                                  {proprietar.proprietati.length > 0 ? (
                                    <div className="bg-white rounded-3 mt-3 overflow-hidden">
                                      <Table responsive hover size="sm" className="mb-0">
                                        <thead style={{ background: colors.lightPurple }}>
                                          <tr>
                                            <th>Nume</th>
                                            <th>Oraș</th>
                                            <th>Tip</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {proprietar.proprietati.map(prop => (
                                            <tr key={prop._id}>
                                              <td className="align-middle">
                                                <div className="d-flex align-items-center">
                                                  <div 
                                                    className="rounded d-flex align-items-center justify-content-center me-2"
                                                    style={{
                                                      width: '28px',
                                                      height: '28px',
                                                      background: colors.lightPurple,
                                                      color: colors.primary
                                                    }}
                                                  >
                                                    <i className={`bi bi-${prop.type === 'apartament' ? 'building' : prop.type === 'casă' || prop.type === 'vilă' ? 'house' : 'house-door'}`}></i>
                                                  </div>
                                                  {prop.name}
                                                </div>
                                              </td>
                                              <td>{prop.location.city}</td>
                                              <td>
                                                <span className="text-capitalize">{prop.type}</span>
                                              </td>
                                              <td>
                                                {prop.isActive ? (
                                                  <Badge bg="success" pill>Activ</Badge>
                                                ) : (
                                                  <Badge bg="secondary" pill>Inactiv</Badge>
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-muted">
                                      <i className="bi bi-houses fs-3 mb-2 d-block"></i>
                                      Nu există proprietăți.
                                    </div>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  )}
                  
                  {activeTab === 'bookings' && (
                    <Card style={cardStyle}>
                      <Card.Body className="p-5 text-center">
                        <i className="bi bi-calendar3 fs-1 mb-3" style={{ color: colors.secondary }}></i>
                        <h5 style={{ color: colors.text }}>Funcționalitate în dezvoltare</h5>
                        <p className="text-muted">Gestionarea rezervărilor va fi disponibilă în curând.</p>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal pentru actualizarea statusului proprietarului */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
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
            <i className="bi bi-arrow-repeat me-2"></i>
            Actualizare Status Proprietar
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProprietar && (
            <>
              <div className="mb-4">
                <div className="text-muted small mb-1">Companie:</div>
                <div className="fs-5 fw-bold">{selectedProprietar.companyName}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-muted small mb-1">Status curent:</div>
                <div>{getStatusBadge(selectedProprietar.verificationStatus)}</div>
              </div>
              
              <Form.Group>
                <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                  Selectați noul status:
                </Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ 
                    backgroundColor: colors.lightPurple,
                    border: `1px solid ${colors.primary}30`,
                    padding: '12px 16px',
                    borderRadius: '8px'
                  }}
                >
                  <option value="pending">În așteptare</option>
                  <option value="verified">Verificat</option>
                  <option value="rejected">Respins</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowModal(false)}
            className="rounded-pill"
          >
            Anulare
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            className="rounded-pill"
            style={{ 
              background: colors.buttonGradient,
              border: 'none',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <i className="bi bi-check2 me-1"></i>
            Salvare
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal pentru detalii utilizator */}
      <Modal 
        show={showUserDetailsModal} 
        onHide={() => setShowUserDetailsModal(false)}
        size="lg"
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
            <i className="bi bi-person-badge me-2"></i>
            Detalii Utilizator
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {userDetailsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" style={{ color: colors.primary }} />
              <p className="mt-3">Se încarcă detaliile...</p>
            </div>
          ) : userActionError ? (
            <Alert 
              variant="danger" 
              className="rounded-3 border-0"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {userActionError}
            </Alert>
          ) : selectedUser && (
            <div>
              <div className="text-center mb-4 pb-3 border-bottom">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: colors.lightPurple,
                    color: colors.primary,
                    fontSize: '2rem'
                  }}
                >
                  <i className="bi bi-person"></i>
                </div>
                <h5 className="mb-1">{selectedUser.firstName} {selectedUser.lastName}</h5>
                <div className="text-muted">{selectedUser.email}</div>
                <Badge 
                  pill 
                  bg={selectedUser.role === 'admin' ? 'danger' : 'info'}
                  className="mt-2"
                >
                  {selectedUser.role}
                </Badge>
              </div>
                
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">ID:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-fingerprint me-2" style={{ color: colors.primary }}></i>
                      <span className="small">{selectedUser._id}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Telefon:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-telephone me-2" style={{ color: colors.primary }}></i>
                      {selectedUser.phoneNumber || 'Nespecificat'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Adresă:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2" style={{ color: colors.primary }}></i>
                      {selectedUser.address || 'Nespecificat'}
                    </div>
                  </div>
                </Col>
                
                <Col md={6}>
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Data înregistrării:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar-date me-2" style={{ color: colors.primary }}></i>
                      {new Date(selectedUser.registrationDate).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Ultima autentificare:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock-history me-2" style={{ color: colors.primary }}></i>
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Niciodată'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-muted small mb-1">Locație:</div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-pin-map me-2" style={{ color: colors.primary }}></i>
                      {selectedUser.city ? `${selectedUser.city}, ${selectedUser.country || 'România'}` : 'Nespecificată'}
                    </div>
                  </div>
                </Col>
              </Row>
              
              {selectedUser.paymentInfo && Object.keys(selectedUser.paymentInfo).length > 0 && (
                <div className="mt-4 p-3 rounded" style={{ background: colors.lightPurple }}>
                  <h6 style={{ color: colors.text }}>
                    <i className="bi bi-credit-card me-2"></i>
                    Informații de plată
                  </h6>
                  <div className="mt-3">
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ width: '120px' }} className="text-muted small">Card:</div>
                      <div>
                        <Badge 
                          bg="light" 
                          text="dark" 
                          className="border"
                        >
                          •••• {selectedUser.paymentInfo.lastFourDigits || '****'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div style={{ width: '120px' }} className="text-muted small">Tip card:</div>
                      <div>{selectedUser.paymentInfo.cardType || 'Nespecificat'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowUserDetailsModal(false)}
            className="rounded-pill"
          >
            Închide
          </Button>
          {selectedUser && (
            <Button 
              className="rounded-pill ms-2"
              style={{ 
                background: colors.buttonGradient,
                border: 'none'
              }}
              onClick={() => {
                setShowUserDetailsModal(false);
                handleShowUserEdit(selectedUser);
              }}
            >
              <i className="bi bi-pencil me-2"></i>
              Editează
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Modal pentru editare utilizator */}
      <Modal 
        show={showUserEditModal} 
        onHide={() => setShowUserEditModal(false)}
        centered
      >
        <Form onSubmit={handleEditUserSubmit}>
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
              Editare Utilizator
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {userActionError && (
              <Alert 
                variant="danger" 
                className="rounded-3 border-0 mb-4"
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {userActionError}
              </Alert>
            )}
            
            {userActionSuccess && (
              <Alert 
                variant="success" 
                className="rounded-3 border-0 mb-4"
                style={{
                  background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
                  color: 'white'
                }}
              >
                <i className="bi bi-check-circle-fill me-2"></i>
                {userActionSuccess}
              </Alert>
            )}
            
            {selectedUser && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>Prenume</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={editUserForm.firstName}
                        onChange={handleEditUserChange}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '500', color: colors.text }}>Nume</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={editUserForm.lastName}
                        onChange={handleEditUserChange}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          padding: '12px 16px',
                          borderRadius: '8px'
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={editUserForm.email}
                    onChange={handleEditUserChange}
                    required
                    style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>Telefon</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={editUserForm.phoneNumber}
                    onChange={handleEditUserChange}
                    style={{ 
                      backgroundColor: colors.lightPurple,
                      border: `1px solid ${colors.primary}30`,
                      padding: '12px 16px',
                      borderRadius: '8px'
                    }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: '500', color: colors.text }}>Rol</Form.Label>
                  <div className="d-flex">
                    <div 
                      className={`flex-grow-1 p-3 rounded-3 me-2 d-flex align-items-center ${editUserForm.role === 'client' ? 'selected-role' : ''}`}
                      style={{
                        backgroundColor: editUserForm.role === 'client' ? `${colors.primary}15` : '#f8f9fa',
                        border: editUserForm.role === 'client' ? `1px solid ${colors.primary}30` : '1px solid #e9ecef',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setEditUserForm({...editUserForm, role: 'client'})}
                    >
                      <Form.Check
                        type="radio"
                        id="roleClient"
                        name="role"
                        value="client"
                        checked={editUserForm.role === 'client'}
                        onChange={() => setEditUserForm({...editUserForm, role: 'client'})}
                        className="me-2"
                      />
                      <div className="d-flex align-items-center">
                        <i className="bi bi-person me-2" style={{ color: colors.primary }}></i>
                        <span>Client</span>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex-grow-1 p-3 rounded-3 d-flex align-items-center ${editUserForm.role === 'admin' ? 'selected-role' : ''}`}
                      style={{
                        backgroundColor: editUserForm.role === 'admin' ? `${colors.primary}15` : '#f8f9fa',
                        border: editUserForm.role === 'admin' ? `1px solid ${colors.primary}30` : '1px solid #e9ecef',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setEditUserForm({...editUserForm, role: 'admin'})}
                    >
                      <Form.Check
                        type="radio"
                        id="roleAdmin"
                        name="role"
                        value="admin"
                        checked={editUserForm.role === 'admin'}
                        onChange={() => setEditUserForm({...editUserForm, role: 'admin'})}
                        className="me-2"
                      />
                      <div className="d-flex align-items-center">
                        <i className="bi bi-shield-lock me-2" style={{ color: '#dc3545' }}></i>
                        <span>Administrator</span>
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ border: 'none' }}>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowUserEditModal(false)}
              className="rounded-pill"
            >
              Anulare
            </Button>
            <Button 
              type="submit"
              className="rounded-pill"
              style={{ 
                background: colors.buttonGradient,
                border: 'none',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <i className="bi bi-check2 me-1"></i>
              Salvare
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Modal pentru ștergere utilizator */}
      <Modal 
        show={showUserDeleteModal} 
        onHide={() => setShowUserDeleteModal(false)}
        centered
      >
        <Modal.Header 
          closeButton
          style={{ 
            background: 'linear-gradient(135deg, #dc3545, #ff6b6b)',
            color: 'white',
            border: 'none'
          }}
        >
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirmare ștergere
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {userActionError && (
            <Alert 
              variant="danger" 
              className="rounded-3 border-0 mb-4"
            >
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {userActionError}
            </Alert>
          )}
          
          {selectedUser && (
            <div className="text-center">
              <div 
                className="mx-auto d-flex align-items-center justify-content-center mb-4"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545'
                }}
              >
                <i className="bi bi-trash fs-1"></i>
              </div>
              
              <h5 className="mb-3">Ștergere utilizator</h5>
              
              <p>Sunteți sigur că doriți să ștergeți utilizatorul <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>?</p>
              <p className="text-danger mb-0">Această acțiune nu poate fi anulată și va marca toate rezervările asociate drept anulate.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowUserDeleteModal(false)}
            className="rounded-pill"
          >
            Anulare
          </Button>
          <Button 
            variant="danger" 
            onClick={handleUserDelete}
            className="rounded-pill"
          >
            <i className="bi bi-trash me-1"></i>
            Ștergere
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminDashboard;