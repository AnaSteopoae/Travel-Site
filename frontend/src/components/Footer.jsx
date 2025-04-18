import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="text-white py-5" style={{ backgroundColor: '#9370DB' }}>
      <Container>
        <Row className="mb-5">
          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2">HaiHui.ro</h5>
            <p className="text-muted">
              Descoperă cele mai bune oferte pentru călătoriile tale în România 
              cu servicii de cazare premium la prețuri accesibile.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-white fs-4">
                <i className="bi bi-facebook transition"></i>
              </a>
              <a href="#" className="text-white fs-4">
                <i className="bi bi-twitter transition"></i>
              </a>
              <a href="#" className="text-white fs-4">
                <i className="bi bi-instagram transition"></i>
              </a>
              <a href="#" className="text-white fs-4">
                <i className="bi bi-linkedin transition"></i>
              </a>
              <a href="#" className="text-white fs-4">
                <i className="bi bi-youtube transition"></i>
              </a>
            </div>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2">Destinații populare</h5>
            <Nav className="flex-column">
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>București
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Brașov
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Cluj-Napoca
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Constanța
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Sibiu
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-geo-alt-fill me-2 text-primary"></i>Timișoara
              </Nav.Link>
            </Nav>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2">Tipuri de cazare</h5>
            <Nav className="flex-column">
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-building me-2 text-primary"></i>Hoteluri
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-house-door me-2 text-primary"></i>Apartamente
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-house me-2 text-primary"></i>Vile
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-house-heart me-2 text-primary"></i>Bungalow
              </Nav.Link>
              <Nav.Link href="#" className="text-light p-0 mb-2">
                <i className="bi bi-houses me-2 text-primary"></i>Case de vacanță
              </Nav.Link>
            </Nav>
          </Col>

          <Col lg={3} md={6} sm={12} className="mb-4">
            <h5 className="fw-bold mb-4 border-bottom pb-2">Contact rapid</h5>
            <div className="mb-3">
              <p className="mb-1"><i className="bi bi-telephone-fill me-2 text-primary"></i> +40 721 234 567</p>
              <p className="mb-1"><i className="bi bi-envelope-fill me-2 text-primary"></i> contact@haihui.ro</p>
              <p className="mb-1"><i className="bi bi-geo me-2 text-primary"></i> Str. Victoriei 25, București</p>
            </div>

            <div className="d-flex gap-2 mt-4">
              <Button variant="primary" size="sm" className="rounded shadow-sm">
                <i className="bi bi-apple me-2"></i>App Store
              </Button>
              <Button variant="primary" size="sm" className="rounded shadow-sm">
                <i className="bi bi-google-play me-2"></i>Google Play
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;