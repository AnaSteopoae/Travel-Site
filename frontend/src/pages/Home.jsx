import React from 'react';
import SearchBar from '../components/SearchBar';
import NavBar from '../components/NavBar';
import PopularCitiesList from "../components/PopularCitiesList";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../images/logo.jpeg'; 
import { Container, Row, Col, Card } from 'react-bootstrap';

function Home() {
  return (
    <>
    <NavBar/>
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #6a11cb 0%, #8075ff 25%, #a265f0 50%, #c16ecf 75%, #9370DB 100%)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        backgroundImage: `
          linear-gradient(135deg, #6a11cb 0%, #8075ff 25%, #a265f0 50%, #c16ecf 75%, #9370DB 100%),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 4px)
        `
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.07,
          backgroundImage: 'url("https://cdn.jsdelivr.net/gh/lipis/flag-icons@6.11.0/svg/ro.svg")',
          backgroundSize: '600px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'grayscale(0.5)',
          mixBlendMode: 'multiply',
        }}
      />

      <Card 
        className="border-0 shadow-lg p-0 overflow-hidden"
        style={{
          width: '90%',
          maxWidth: '1200px',
          borderRadius: '30px',
        }}
      >
        <Row className="g-0">
          <Col lg={5} md={5} className="d-flex p-0">
            <div 
              style={{
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '25px',
              }}
            >
              <div
                style={{
                  width: '90%',
                  maxWidth: '400px',
                }}
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </div>
            </div>
          </Col>
          
          <Col lg={7} md={7} className="p-0">
            <div 
              style={{
                backgroundColor: 'rgba(245, 240, 255, 0.95)',
                height: '100%',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <h2 style={{color: '#6a11cb', marginBottom: '25px'}} className="fw-bold">Locație</h2>
              
              <SearchBar />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  
    <div style={{ 
      backgroundColor: '#f5f0ff', 
      minHeight: '55vh',
      padding: '40px 0'
    }}>
      <Container>
        <h1 className="text-center mb-5" style={{color: '#8075ff'}}>Destinații populare</h1>
        <PopularCitiesList/>
      </Container>
    </div>
    </>
  );
}

export default Home;