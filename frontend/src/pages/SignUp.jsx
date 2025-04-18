import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookies';
import TermsModal from '../components/TermsModal';
import 'bootstrap-icons/font/bootstrap-icons.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
  

    const colors = {
      gradient: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 25%, #a265f0 50%, #c16ecf 75%, #9370DB 100%)',
      primary: '#8075ff',
      secondary: '#c16ecf',
      buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)',
      text: '#6a11cb',
      lightPurple: '#f5f0ff',
      accentColor: '#9370DB'
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    };
  
    const handleSubmit = async(e) => {
      e.preventDefault();
      const form = e.currentTarget;
      
      
      setError('');
      setSuccess(false);
      
      if (form.checkValidity() === false) {
        e.stopPropagation();
        setValidated(true);
        return;
      }
  
     
      if (formData.password !== formData.confirmPassword) {
        setError('Parolele nu se potrivesc.');
        setValidated(true);
        return;
      }
  
      try{
        const response = await fetch('/api/users/register',{
          method: 'POST',
          headers:{
            'Content-Type' : 'application/json',
          },
          body:JSON.stringify(formData),
        });
        const data = await response.json();
        if(response.ok){
          setSuccess(true);
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false
          });
          setValidated(false);
          const userId = getCookie('userId');
          if(userId){
            navigate(`/user/${userId}`);
          }
        } else{
          setError(data.message || 'Eroare la crearea contului.');
        }
      }catch (err) {
        console.error(err);
        setError('Eroare la comunicarea cu serverul.');
      }
    };

    const handleCloseTermsModal = () => setShowTermsModal(false);
    const handleShowTermsModal = (e) => {
      e.preventDefault();
      setShowTermsModal(true);
    };
  
    
    const handleAcceptTerms = () => {
      setFormData(prevState => ({
        ...prevState,
        agreeTerms: true
      }));
      handleCloseTermsModal();
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
      setShowConfirmPassword(!showConfirmPassword);
    };
  
    return (
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
            <Col lg={8} xl={7}>
              <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                <Row className="g-0">
                  <Col lg={5} className="d-none d-lg-block">
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center text-white p-4" 
                      style={{ 
                        background: colors.gradient,
                        backgroundSize: 'cover'
                      }}>
                      <div className="text-center py-5">
                        <h2 className="fw-bold mb-4">Bine ai venit!</h2>
                        <i className="bi bi-person-plus-fill" style={{fontSize: '60px'}}></i>
                        <p className="mt-4 mb-5">Creează un cont pentru a descoperi cele mai bune oferte de călătorie în România!</p>
                        <div className="d-flex justify-content-center">
                          <div className="px-2">
                            <i className="bi bi-geo-alt-fill fs-4"></i>
                          </div>
                          <div className="px-2">
                            <i className="bi bi-building fs-4"></i>
                          </div>
                          <div className="px-2">
                            <i className="bi bi-house-door fs-4"></i>
                          </div>
                          <div className="px-2">
                            <i className="bi bi-award fs-4"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={7}>
                    <Card.Body className="p-4 p-lg-5">
                      <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{color: colors.text}}>Creează cont nou</h2>
                        <p className="text-muted">Completează informațiile pentru a crea un cont</p>
                      </div>
                      
                      {error && <Alert variant="danger" className="mb-4 text-center">{error}</Alert>}
                      {success && <Alert variant="success" className="mb-4 text-center">Cont creat cu succes! Te poți autentifica acum.</Alert>}
                      
                      <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold">Prenume</Form.Label>
                              <InputGroup>
                                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                                  <i className="bi bi-person" style={{color: colors.primary}}></i>
                                </InputGroup.Text>
                                <Form.Control
                                  required
                                  type="text"
                                  name="firstName"
                                  value={formData.firstName}
                                  onChange={handleChange}
                                  placeholder="Prenume"
                                  style={{backgroundColor: colors.lightPurple}}
                                />
                              </InputGroup>
                              <Form.Control.Feedback type="invalid">
                                Introduceți prenumele.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="small fw-bold">Nume</Form.Label>
                              <InputGroup>
                                <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                                  <i className="bi bi-person-fill" style={{color: colors.primary}}></i>
                                </InputGroup.Text>
                                <Form.Control
                                  required
                                  type="text"
                                  name="lastName"
                                  value={formData.lastName}
                                  onChange={handleChange}
                                  placeholder="Nume"
                                  style={{backgroundColor: colors.lightPurple}}
                                />
                              </InputGroup>
                              <Form.Control.Feedback type="invalid">
                                Introduceți numele.
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Email</Form.Label>
                          <InputGroup>
                            <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                              <i className="bi bi-envelope" style={{color: colors.primary}}></i>
                            </InputGroup.Text>
                            <Form.Control
                              required
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="nume@exemplu.com"
                              style={{backgroundColor: colors.lightPurple}}
                            />
                          </InputGroup>
                          <Form.Control.Feedback type="invalid">
                            Introduceți un email valid.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Număr de telefon</Form.Label>
                          <InputGroup>
                            <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                              <i className="bi bi-telephone" style={{color: colors.primary}}></i>
                            </InputGroup.Text>
                            <Form.Control
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="07xxxxxxxx"
                              pattern="[0-9]{10}"
                              style={{backgroundColor: colors.lightPurple}}
                            />
                          </InputGroup>
                          <Form.Control.Feedback type="invalid">
                            Introduceți un număr de telefon valid (10 cifre).
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label className="small fw-bold">Parolă</Form.Label>
                          <InputGroup>
                            <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                              <i className="bi bi-lock" style={{color: colors.primary}}></i>
                            </InputGroup.Text>
                            <Form.Control
                              required
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              placeholder="Minim 8 caractere"
                              minLength={8}
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
                          <Form.Control.Feedback type="invalid">
                            Parola trebuie să aibă minim 8 caractere.
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                          <Form.Label className="small fw-bold">Confirmă parola</Form.Label>
                          <InputGroup>
                            <InputGroup.Text style={{backgroundColor: colors.lightPurple}}>
                              <i className="bi bi-lock-fill" style={{color: colors.primary}}></i>
                            </InputGroup.Text>
                            <Form.Control
                              required
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder="Repetați parola"
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
                          <Form.Control.Feedback type="invalid">
                            Confirmați parola.
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                          <Form.Check
                            required
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            label={
                              <span>
                                Sunt de acord cu <a href="#" onClick={handleShowTermsModal} className="text-decoration-none" style={{color: colors.accentColor}}>termenii și condițiile</a>
                              </span>
                            }
                            feedback="Trebuie să fiți de acord înainte de a vă înregistra."
                            feedbackType="invalid"
                          />
                        </Form.Group>

                        <TermsModal 
                          show={showTermsModal} 
                          onHide={handleCloseTermsModal} 
                          onAccept={handleAcceptTerms} 
                        />

                        <div className="d-grid">
                          <Button 
                            type="submit" 
                            size="lg" 
                            className="fw-bold py-3 rounded-pill"
                            style={{ background: colors.buttonGradient, borderColor: colors.secondary }}
                          >
                            Creează cont <i className="bi bi-arrow-right ms-2"></i>
                          </Button>
                        </div>
                      </Form>
                      
                      <div className="text-center mt-4">
                        <p className="mb-0">
                          Ai deja un cont? <Link to="/login" className="fw-bold text-decoration-none" style={{color: colors.accentColor}}>Autentifică-te aici</Link>
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
  };
  
  export default SignUp;