import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { ArrowLeft, PlusCircle, Trash, CheckCircle } from 'react-bootstrap-icons';
import { candidateService } from '../services/candidateService';
import {
  CandidateFormData,
  EducationEntry,
  WorkExperienceEntry,
  ValidationErrors,
  ApiErrorResponse,
} from '../types/candidate';

const INITIAL_FORM_DATA: CandidateFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  educations: [],
  workExperiences: [],
  cv: null,
};

const MAX_EDUCATIONS = 3;

const AddCandidateForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CandidateFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Education handlers ---
  const addEducation = () => {
    if (formData.educations.length >= MAX_EDUCATIONS) return;
    const entry: EducationEntry = { institution: '', title: '', startDate: '', endDate: '' };
    setFormData((prev) => ({ ...prev, educations: [...prev.educations, entry] }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index: number, field: keyof EducationEntry, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.educations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, educations: updated };
    });
  };

  // --- Work Experience handlers ---
  const addExperience = () => {
    const entry: WorkExperienceEntry = {
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
    };
    setFormData((prev) => ({ ...prev, workExperiences: [...prev.workExperiences, entry] }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((_, i) => i !== index),
    }));
  };

  const handleExperienceChange = (
    index: number,
    field: keyof WorkExperienceEntry,
    value: string
  ) => {
    setFormData((prev) => {
      const updated = [...prev.workExperiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workExperiences: updated };
    });
  };

  // --- File Upload ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      setValidationErrors((prev) => ({ ...prev, cv: 'File type must be PDF or DOCX' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors((prev) => ({ ...prev, cv: 'File size must not exceed 10MB' }));
      return;
    }

    try {
      const result = await candidateService.uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        cv: { filePath: result.filePath, fileType: result.fileType },
      }));
      setValidationErrors((prev) => ({ ...prev, cv: undefined }));
    } catch {
      setValidationErrors((prev) => ({
        ...prev,
        cv: 'Failed to upload file. Please try again.',
      }));
    }
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.firstName || formData.firstName.trim().length < 2 || formData.firstName.trim().length > 100) {
      errors.firstName = 'First name is required (2-100 characters)';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name must contain only letters';
    }

    if (!formData.lastName || formData.lastName.trim().length < 2 || formData.lastName.trim().length > 100) {
      errors.lastName = 'Last name is required (2-100 characters)';
    } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.lastName.trim())) {
      errors.lastName = 'Last name must contain only letters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'A valid email address is required';
    }

    if (formData.phone && !/^[679]\d{8}$/.test(formData.phone)) {
      errors.phone = 'Phone must follow format: 6XXXXXXXX, 7XXXXXXXX, or 9XXXXXXXX';
    }

    if (formData.address && formData.address.length > 100) {
      errors.address = 'Address cannot exceed 100 characters';
    }

    const educationErrors: string[] = [];
    formData.educations.forEach((edu, i) => {
      const missing: string[] = [];
      if (!edu.institution.trim()) missing.push('Institution');
      if (!edu.title.trim()) missing.push('Title');
      if (!edu.startDate) missing.push('Start date');
      if (missing.length > 0) {
        educationErrors[i] = `${missing.join(', ')} required`;
      } else if (edu.endDate && edu.startDate && new Date(edu.endDate) < new Date(edu.startDate)) {
        educationErrors[i] = 'End date must be after start date';
      }
    });
    if (educationErrors.length > 0) errors.educations = educationErrors;

    const workErrors: string[] = [];
    formData.workExperiences.forEach((exp, i) => {
      const missing: string[] = [];
      if (!exp.company.trim()) missing.push('Company');
      if (!exp.position.trim()) missing.push('Position');
      if (!exp.startDate) missing.push('Start date');
      if (missing.length > 0) {
        workErrors[i] = `${missing.join(', ')} required`;
      } else if (exp.endDate && exp.startDate && new Date(exp.endDate) < new Date(exp.startDate)) {
        workErrors[i] = 'End date must be after start date';
      }
    });
    if (workErrors.length > 0) errors.workExperiences = workErrors;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await candidateService.createCandidate(formData);
      setSuccess('Candidate created successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: ApiErrorResponse } };
      const errorMessage =
        apiError.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Button
        variant="link"
        className="mb-3 p-0"
        onClick={() => navigate('/')}
        aria-label="Back to recruiter dashboard"
      >
        <ArrowLeft className="me-1" /> Back to Dashboard
      </Button>

      <h2 className="mb-4">Add New Candidate</h2>

      {success && (
        <Alert variant="success" data-testid="success-alert" role="alert">
          {success}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" data-testid="error-alert" role="alert">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>
        {/* --- Personal Information --- */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>Personal Information</Card.Title>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.firstName}
                    maxLength={100}
                    aria-label="First name"
                    aria-required="true"
                    data-testid="firstName"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.lastName}
                    maxLength={100}
                    aria-label="Last name"
                    aria-required="true"
                    data-testid="lastName"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                isInvalid={!!validationErrors.email}
                aria-label="Email address"
                aria-required="true"
                data-testid="email"
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.phone}
                    placeholder="612345678"
                    aria-label="Phone number"
                    data-testid="phone"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!validationErrors.address}
                    maxLength={100}
                    aria-label="Address"
                    data-testid="address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* --- Education --- */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">
                Education{' '}
                <small className="text-muted">
                  ({formData.educations.length}/{MAX_EDUCATIONS} records)
                </small>
              </Card.Title>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addEducation}
                disabled={formData.educations.length >= MAX_EDUCATIONS}
                data-testid="add-education-btn"
                aria-label="Add education entry"
              >
                <PlusCircle className="me-1" /> Add Education
              </Button>
            </div>

            {formData.educations.map((edu, index) => (
              <Card key={index} className="mb-3 border-secondary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong>Education #{index + 1}</strong>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      data-testid={`remove-education-${index}`}
                      aria-label={`Remove education entry ${index + 1}`}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <Row className="mb-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Institution *</Form.Label>
                        <Form.Control
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          maxLength={100}
                          isInvalid={!!validationErrors.educations?.[index]}
                          data-testid={`education-institution-${index}`}
                          aria-label={`Education institution ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Title / Degree *</Form.Label>
                        <Form.Control
                          type="text"
                          value={edu.title}
                          onChange={(e) => handleEducationChange(index, 'title', e.target.value)}
                          maxLength={250}
                          data-testid={`education-title-${index}`}
                          aria-label={`Education title ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Start Date *</Form.Label>
                        <Form.Control
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                          data-testid={`education-startDate-${index}`}
                          aria-label={`Education start date ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          data-testid={`education-endDate-${index}`}
                          aria-label={`Education end date ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {validationErrors.educations?.[index] && (
                    <div className="text-danger mt-2 small">
                      {validationErrors.educations[index]}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}

            {formData.educations.length === 0 && (
              <p className="text-muted">No education entries yet. Click "Add Education" to begin.</p>
            )}
          </Card.Body>
        </Card>

        {/* --- Work Experience --- */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title className="mb-0">Work Experience</Card.Title>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={addExperience}
                data-testid="add-experience-btn"
                aria-label="Add work experience entry"
              >
                <PlusCircle className="me-1" /> Add Work Experience
              </Button>
            </div>

            {formData.workExperiences.map((exp, index) => (
              <Card key={index} className="mb-3 border-secondary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <strong>Experience #{index + 1}</strong>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      data-testid={`remove-experience-${index}`}
                      aria-label={`Remove work experience entry ${index + 1}`}
                    >
                      <Trash />
                    </Button>
                  </div>
                  <Row className="mb-2">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Company *</Form.Label>
                        <Form.Control
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          maxLength={100}
                          isInvalid={!!validationErrors.workExperiences?.[index]}
                          data-testid={`experience-company-${index}`}
                          aria-label={`Experience company ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Position *</Form.Label>
                        <Form.Control
                          type="text"
                          value={exp.position}
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          maxLength={100}
                          data-testid={`experience-position-${index}`}
                          aria-label={`Experience position ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      maxLength={200}
                      data-testid={`experience-description-${index}`}
                      aria-label={`Experience description ${index + 1}`}
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Start Date *</Form.Label>
                        <Form.Control
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                          data-testid={`experience-startDate-${index}`}
                          aria-label={`Experience start date ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          data-testid={`experience-endDate-${index}`}
                          aria-label={`Experience end date ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  {validationErrors.workExperiences?.[index] && (
                    <div className="text-danger mt-2 small">
                      {validationErrors.workExperiences[index]}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}

            {formData.workExperiences.length === 0 && (
              <p className="text-muted">
                No work experience entries yet. Click "Add Work Experience" to begin.
              </p>
            )}
          </Card.Body>
        </Card>

        {/* --- CV Upload --- */}
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>CV / Resume (Optional)</Card.Title>
            <Form.Group>
              <Form.Control
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                isInvalid={!!validationErrors.cv}
                data-testid="cv-upload"
                aria-label="Upload CV in PDF or DOCX format"
              />
              <Form.Text className="text-muted">
                Accepted formats: PDF, DOCX. Maximum size: 10MB
              </Form.Text>
              <Form.Control.Feedback type="invalid">
                {validationErrors.cv}
              </Form.Control.Feedback>
            </Form.Group>
            {formData.cv && (
              <div className="mt-2 text-success">
                <CheckCircle className="me-1" />
                File uploaded successfully
              </div>
            )}
          </Card.Body>
        </Card>

        {/* --- Submit --- */}
        <div className="d-grid d-md-flex justify-content-md-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            data-testid="submit-btn"
            aria-label="Save candidate"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" /> Saving...
              </>
            ) : (
              'Save Candidate'
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddCandidateForm;
