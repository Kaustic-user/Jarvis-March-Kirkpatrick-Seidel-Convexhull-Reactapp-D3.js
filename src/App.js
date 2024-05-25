import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router,Routes, Route, NavLink } from 'react-router-dom';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import JarvisMarch from './components/JarvisMarch';
import Krickpat from './components/Krickpat';

function App() {
  return (
    <Router>
      <Container>
        <Row>
          <Col>
            <Nav fill variant="tabs" defaultActiveKey="/jarvis-march">
              <Nav.Item>
                <Nav.Link as={NavLink} to="/jarvis-march" className = "tabs">JarvisMarch</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={NavLink} to="/kirkpatrick-seidel" className = 'tabs'>Kirkpatrick Seidel Algorithm</Nav.Link>
              </Nav.Item>
            </Nav>
            <Routes>
              <Route exact path="/jarvis-march" element={<JarvisMarch/>} />
              <Route exact path="/kirkpatrick-seidel" element={<Krickpat/>} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </Router>
  );
}

export default App;