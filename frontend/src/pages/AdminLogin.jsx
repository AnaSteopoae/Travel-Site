import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { getCookie } from '../utils/cookies';
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
};

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors ? data.errors[0].message : 'Eroare la autentificare administrator');
      }

      const adminId = getCookie('adminId');
      if (adminId) {
        navigate(`/admin/dashboard`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardStyle = {
    border: 'none',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  return (
    <div style={{ backgroundColor: colors.lightPurple, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Container>
        <Row className="justify-content-md-center">
          <Col xs={12} md={5}>
            <div className="text-center mb-4">
              <h1 style={{ 
                color: colors.text, 
                marginBottom: '10px',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}>
                <i className="bi bi-shield-lock me-2"></i>
                Admin
              </h1>
              <p style={{ color: colors.secondary, fontSize: '1.1rem' }}>
                Autentificare în panoul de administrare
              </p>
            </div>
            
            <Card style={cardStyle}>
              <Card.Body className="p-4 p-md-5">
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
                        <Alert.Heading style={{ fontSize: '1rem', fontWeight: 'bold' }}>Autentificare eșuată</Alert.Heading>
                        <p className="mb-0" style={{ fontSize: '0.95rem' }}>{error}</p>
                      </div>
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="formBasicEmail">
                    <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                      Adresa de email
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderRight: 'none'
                      }}>
                        <i className="bi bi-envelope" style={{ color: colors.primary }}></i>
                      </InputGroup.Text>
                      <Form.Control 
                        type="email" 
                        placeholder="Introduceți email-ul administratorului" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          borderLeft: 'none',
                          padding: '12px 16px'
                        }}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label style={{ fontWeight: '500', color: colors.text }}>
                      Parola
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text style={{ 
                        backgroundColor: colors.lightPurple,
                        border: `1px solid ${colors.primary}30`,
                        borderRight: 'none'
                      }}>
                        <i className="bi bi-lock" style={{ color: colors.primary }}></i>
                      </InputGroup.Text>
                      <Form.Control 
                        type="password" 
                        placeholder="Parola" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        style={{ 
                          backgroundColor: colors.lightPurple,
                          border: `1px solid ${colors.primary}30`,
                          borderLeft: 'none',
                          padding: '12px 16px'
                        }}
                      />
                    </InputGroup>
                  </Form.Group>

                  <Button 
                    type="submit" 
                    className="w-100 py-3 rounded-pill fw-bold mt-4" 
                    style={{ 
                      background: colors.buttonGradient,
                      border: 'none',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Autentificare...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Autentificare Administrator
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4">
              <Link to="/" style={{ color: colors.text, textDecoration: 'none' }}>
                <i className="bi bi-arrow-left me-2"></i>
                Înapoi la pagina principală
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminLogin;