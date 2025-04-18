import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import {Link} from 'react-router-dom';

function NavigationBar(){
    return(
        <Navbar bg='light' expand="lg">
            <Container>
            <Navbar.Brand as={Link} to="/">
                <span style={{ marginLeft: '10px' }}>HaiHui.ro</span> 
                </Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/inregistrare-cazari">Inregistrati-va proprietatea</Nav.Link>
                        <Nav.Link as={Link} to="/signup">Inregistrare</Nav.Link>
                        <Nav.Link as={Link} to="/login">Autentificare</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;