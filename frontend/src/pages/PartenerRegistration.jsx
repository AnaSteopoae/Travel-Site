import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert } from 'react-bootstrap';

const PartnerRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  
  const colors = {
    gradient: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 25%, #a265f0 50%, #c16ecf 75%, #9370DB 100%)',
    primary: '#8075ff',
    secondary: '#c16ecf',
    buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)',
    text: '#6a11cb',
    lightPurple: '#f5f0ff',
    accentColor: '#9370DB'
  };
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    companyName: '',
    fiscalCode: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [propertyData, setPropertyData] = useState({
    propertyName: '',
    propertyType: '',
    address: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try{
      if (!loginData.email || !loginData.password) {
        throw new Error('Vă rugăm introduceți email și parolă');
      }
      const response = await fetch('/api/proprietari/login', {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify({
          email:loginData.email,
          password:loginData.password
        })
      });
      const data = await response.json();
      if(!response.ok)
      {
        throw new Error(data.message || 'Eroare la autentificare');
      }
      const proprietarId = getCookie('proprietarId');
      if(proprietarId){
        navigate(`/proprietar/${proprietarId}`);
      }
      
    } catch (error) {
      setError(error.message);
      console.error('Eroare la autentificare:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Parolele nu coincid!');
      setIsLoading(false);
      return;
    }
    try{
      const proprietarData={
        companyName:registerData.companyName,
        fiscalCode:registerData.fiscalCode,
        email: registerData.email,
        phoneNumber: registerData.phone,
        password: registerData.password
      };

      const response = await fetch('/api/proprietari/register', {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(proprietarData)
      });

      const data = await response.json();
      if(!response.ok)
      {
        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors[0].message);
        } else {
          throw new Error(data.message || 'A apărut o eroare la înregistrare. Încercați din nou.');
        }
      }
      const proprietarId = getCookie('proprietarId');
      if(proprietarId){
        navigate(`/proprietar/${proprietarId}`);
      }
    } catch (error) {
      if (error.message.includes('Proprietarul deja este inregistrat')) {
        setError('Acest email este deja înregistrat. Vă rugăm să folosiți alt email sau să vă autentificați.');
      } else if (error.message.includes('fiscal')) {
        setError('Acest cod fiscal este deja înregistrat în sistem. Vă rugăm să verificați datele introduse.');
      } else {
        setError(error.message);
      }
      console.error('Eroare la înregistrare:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRegisterPasswordVisibility = () => {
    setShowRegisterPassword(!showRegisterPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const renderLoginForm = () => (
    <div 
      style={{
        position: 'relative',
        background: colors.gradient,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '40px 0',
        backgroundImage: `
          ${colors.gradient},
          repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px)
        `
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
                      <h2 className="fw-bold mb-4">Portal Parteneri</h2>
                      <i className="bi bi-buildings-fill" style={{fontSize: '60px'}}></i>
                      <p className="mt-4 mb-5">Administrați-vă proprietățile și rezervările într-un singur loc!</p>
                      <p className="mb-3">Nu aveți un cont încă?</p>
                      <Button 
                        variant="outline-light" 
                        className="fw-bold px-4 rounded-pill"
                        onClick={() => setStep('register')}
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        Creează cont partener
                      </Button>
                    </div>
                  </div>
                </Col>
                <Col lg={7}>
                  <Card.Body className="p-4 p-lg-5">
                    <div className="text-center mb-4">
                      <h2 className="fw-bold" style={{color: colors.text}}>Autentificare Parteneri</h2>
                      <p className="text-muted">Intră în contul tău de partener HaiHui.ro</p>
                    </div>
                    
                    {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}
                    
                    <Form onSubmit={handleLogin}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold">Email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-envelope" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="email"
                            name="email"
                            placeholder="Introduceți email"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-lock" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Introduceți parola"
                            value={loginData.password}
                            onChange={handleLoginChange}
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

                      <div className="d-grid mt-4">
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
                      <p className="mb-2">Nu aveți un cont încă?</p>
                      <Button 
                        variant="link" 
                        className="fw-bold text-decoration-none p-0" 
                        style={{color: colors.accentColor}}
                        onClick={() => setStep('register')}
                      >
                        Creează cont partener
                      </Button>
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

  const renderRegisterForm = () => (
    <div 
      style={{
        position: 'relative',
        background: colors.gradient,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '40px 0',
        backgroundImage: `
          ${colors.gradient},
          repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px)
        `
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={9}>
            <Card className="shadow-lg border-0" style={{ borderRadius: '20px' }}>
              <Card.Header className="text-white text-center py-3" style={{ background: colors.gradient }}>
                <h2 className="mb-0">Înregistrare Cont Partener</h2>
              </Card.Header>
              <Card.Body className="p-4 p-lg-5">
                <p className="text-center text-muted mb-4">Completați detaliile pentru a înregistra un cont de partener HaiHui.ro</p>
                
                {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}
                
                <Form onSubmit={handleRegister}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Nume Companie</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-building" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="text"
                            name="companyName"
                            placeholder="Introduceti numele companiei"
                            value={registerData.companyName}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Cod Fiscal</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-file-earmark-text" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="text"
                            name="fiscalCode"
                            placeholder="Introduceti codul fiscal"
                            value={registerData.fiscalCode}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-envelope" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="email"
                            name="email"
                            placeholder="email@companie.ro"
                            value={registerData.email}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Telefon</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-telephone" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type="tel"
                            name="phone"
                            placeholder="07xxxxxxxx"
                            value={registerData.phone}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Parolă</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-lock" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type={showRegisterPassword ? "text" : "password"}
                            name="password"
                            placeholder="Minim 8 caractere"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                            minLength={8}
                          />
                          <Button 
                            variant="light" 
                            onClick={toggleRegisterPasswordVisibility}
                            className="border"
                            style={{backgroundColor: colors.lightPurple}}
                          >
                            <i className={`bi ${showRegisterPassword ? "bi-eye-slash" : "bi-eye"}`} style={{color: colors.primary}}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group>
                        <Form.Label className="small fw-bold">Confirmă Parolă</Form.Label>
                        <InputGroup>
                          <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                            <i className="bi bi-lock-fill" style={{color: colors.primary}}></i>
                          </InputGroup.Text>
                          <Form.Control
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Repetați parola"
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
                            style={{backgroundColor: colors.lightPurple}}
                          />
                          <Button 
                            variant="light" 
                            onClick={toggleConfirmPasswordVisibility}
                            className="border"
                            style={{backgroundColor: colors.lightPurple}}
                          >
                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} style={{color: colors.primary}}></i>
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
                    <Button 
                      type="submit" 
                      className="fw-bold py-2 px-4 rounded-pill"
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
                          Înregistrare <i className="bi bi-check2-circle ms-2"></i>
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      className="rounded-pill"
                      onClick={() => setStep('login')}
                    >
                      <i className="bi bi-arrow-left me-2"></i> Înapoi la Autentificare
                    </Button>
                  </div>
                </Form>
                
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    &copy; {new Date().getFullYear()} HaiHui.ro. Toate drepturile rezervate.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );

  return (
    <div>
      {step === 'login' && renderLoginForm()}
      {step === 'register' && renderRegisterForm()}
    </div>
  );
};

export default PartnerRegistration;