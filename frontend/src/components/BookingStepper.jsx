import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const colors = {
  primary: '#8075ff',
  secondary: '#c16ecf',
  text: '#6a11cb',
  accentColor: '#9370DB',
  lightPurple: '#f5f0ff',
  darkPurple: '#5b42a5',
  gradientPrimary: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 100%)',
  gradientSecondary: 'linear-gradient(135deg, #8075ff 25%, #c16ecf 100%)',
  buttonGradient: 'linear-gradient(to right, #8075ff, #c16ecf)'
};

const BookingStepper = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Selectare proprietate', icon: 'house-heart' },
    { number: 2, title: 'Detalii rezervare', icon: 'journal-text' },
    { number: 3, title: 'Finalizare rezervare', icon: 'check-circle' }
  ];

  return (
    <Container fluid style={{ 
      background: colors.gradientPrimary, 
      color: 'white', 
      padding: '15px 0',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <Container>
        <Row className="justify-content-center align-items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <Col xs="auto" className="text-center">
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      background: currentStep >= step.number 
                        ? 'white' 
                        : 'rgba(255,255,255,0.2)',
                      color: currentStep >= step.number 
                        ? colors.text 
                        : 'rgba(255,255,255,0.7)',
                      boxShadow: currentStep >= step.number 
                        ? '0 2px 5px rgba(0, 0, 0, 0.2)' 
                        : 'none',
                      transition: 'all 0.3s ease',
                      fontWeight: 'bold'
                    }}
                  >
                    <i className={`bi bi-${step.icon}`}></i>
                  </div>
                  <div className="ms-2">
                    <div style={{ 
                      fontWeight: currentStep >= step.number ? 'bold' : 'normal',
                      opacity: currentStep >= step.number ? 1 : 0.7
                    }}>
                      {step.title}
                    </div>
                    {currentStep === step.number && (
                      <div style={{ 
                        height: '3px', 
                        width: '100%', 
                        background: 'white',
                        borderRadius: '2px',
                        marginTop: '3px'
                      }}></div>
                    )}
                  </div>
                </div>
              </Col>
              {index < steps.length - 1 && (
                <Col xs="auto" className="px-0 d-none d-md-block">
                  <div 
                    style={{ 
                      height: '2px', 
                      width: '50px',
                      backgroundColor: currentStep > step.number 
                        ? 'white' 
                        : 'rgba(255,255,255,0.3)'
                    }}
                  />
                </Col>
              )}
            </React.Fragment>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default BookingStepper;