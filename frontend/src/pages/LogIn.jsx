import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, InputGroup, Alert } from 'react-bootstrap';
import { getCookie } from '../utils/cookies';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const colors = {
    gradient: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 25%, #a265f0 50%, #c16ecf 75%, #9370DB 100%)',
    primary: '#8075ff',
    secondary: '#c16ecf',
    buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)',
    text: '#6a11cb',
    lightPurple: '#f0e7ff',
    accentColor: '#9370DB'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors ? data.errors[0].message : 'Eroare la autentificare');
      }
      
      const userId = getCookie('userId');
      if (userId) {
        navigate(`/user/${userId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div 
      style={{
        position: 'relative',
        background: colors.gradient,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '40px 0'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6}>
            <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
              <Row className="g-0">
                <Col lg={5} className="d-none d-lg-block">
                  <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white p-4" 
                    style={{ 
                      background: colors.gradient,
                      backgroundSize: 'cover'
                    }}>
                    <div className="text-center py-5">
                      <h2 className="fw-bold mb-4">Bun revenit!</h2>
                      <i className="bi bi-person-circle" style={{fontSize: '60px'}}></i>
                      <p className="mt-4 mb-5">Autentifică-te pentru a accesa contul tău și a descoperi cele mai bune oferte de călătorie!</p>
                      <p className="mb-3">Nu ai un cont încă?</p>
                      <Link to="/signup">
                        <Button 
                          variant="outline-light" 
                          className="fw-bold px-4 rounded-pill"
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          Creează cont
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Col>
                <Col lg={7}>
                  <Card.Body className="p-4 p-lg-5">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold" style={{color: colors.text}}>Autentificare</h2>
                      <p className="text-muted">Intră în contul tău HaiHui.ro</p>
                    </div>
                    
                    {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Adresa de email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-envelope" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="email"
                            placeholder="Introduceți email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <div className="d-flex justify-content-between">
                          <Form.Label className="small fw-bold">Parola</Form.Label>
                        </div>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-lock" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type={showPassword ? "text" : "password"}
                            placeholder="Introduceți parola"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                          <Button 
                            variant="light" 
                            onClick={togglePasswordVisibility}
                            className="border"
                            style={{backgroundColor: colors.lightPurple}}
                          >
                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{color: colors.primary}}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>

                      <div className="d-grid">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="fw-bold py-3 rounded-pill"
                          style={{ background: colors.buttonGradient, borderColor: colors.secondary }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Se încarcă...
                            </>
                          ) : (
                            <>
                              Autentificare <i className="bi bi-box-arrow-in-right ms-2"></i>
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                    
                    <div className="text-center mt-4 d-lg-none">
                      <p className="mb-2">Nu ai un cont încă?</p>
                      <Link to="/signup" className="fw-bold text-decoration-none" style={{color: colors.accentColor}}>
                        Creează cont nou
                      </Link>
                    </div>

                    <div className="text-center mt-5 pt-3 border-top">
                      <p className="text-muted small mb-0">
                        &copy; {new Date().getFullYear()} HaiHui.ro. Toate drepturile rezervate.
                      </p>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;