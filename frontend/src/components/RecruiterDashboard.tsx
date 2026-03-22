import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';

const RecruiterDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 data-testid="dashboard-title">Recruiter Dashboard</h1>
        </Col>
      </Row>
      <Row>
        <Col md={6} lg={4}>
          <Card className="text-center p-4">
            <Card.Body>
              <Card.Title>Candidates</Card.Title>
              <Card.Text>Manage your candidate pipeline</Card.Text>
              <Button
                variant="primary"
                size="lg"
                data-testid="add-candidate-btn"
                aria-label="Add a new candidate"
                onClick={() => navigate('/candidates/add')}
              >
                <PlusCircle className="me-2" />
                Add Candidate
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RecruiterDashboard;
