const API_URL = Cypress.env('API_URL');

describe('Add Candidate Feature', () => {
  describe('Dashboard - Navigation', () => {
    beforeEach(() => {
      cy.visit('/');
    });

    it('should display the recruiter dashboard with Add Candidate button', () => {
      cy.get('[data-testid="dashboard-title"]').should('be.visible');
      cy.get('[data-testid="add-candidate-btn"]').should('be.visible');
    });

    it('should navigate to add candidate form when button is clicked', () => {
      cy.get('[data-testid="add-candidate-btn"]').click();
      cy.url().should('include', '/candidates/add');
    });
  });

  describe('Add Candidate Form - Layout', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should display the form with all sections', () => {
      cy.get('[data-testid="firstName"]').should('be.visible');
      cy.get('[data-testid="lastName"]').should('be.visible');
      cy.get('[data-testid="email"]').should('be.visible');
      cy.get('[data-testid="phone"]').should('be.visible');
      cy.get('[data-testid="address"]').should('be.visible');
      cy.get('[data-testid="add-education-btn"]').should('be.visible');
      cy.get('[data-testid="add-experience-btn"]').should('be.visible');
      cy.get('[data-testid="cv-upload"]').should('be.visible');
      cy.get('[data-testid="submit-btn"]').should('be.visible');
    });

    it('should navigate back to dashboard when back button is clicked', () => {
      cy.contains('Back to Dashboard').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  describe('Add Candidate Form - Validation', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should show validation errors when submitting empty required fields', () => {
      cy.get('[data-testid="submit-btn"]').click();
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('email').should('be.visible');
    });

    it('should show error for invalid email format', () => {
      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('invalid-email');
      cy.get('[data-testid="submit-btn"]').click();
      cy.contains('valid email').should('be.visible');
    });

    it('should show error for invalid phone format', () => {
      cy.get('[data-testid="phone"]').type('12345');
      cy.get('[data-testid="submit-btn"]').click();
      cy.contains('Phone must follow format').should('be.visible');
    });
  });

  describe('Add Candidate Form - Education Management', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should add an education entry when Add Education is clicked', () => {
      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="education-institution-0"]').should('be.visible');
      cy.get('[data-testid="education-title-0"]').should('be.visible');
    });

    it('should remove an education entry when Remove is clicked', () => {
      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="education-institution-0"]').should('be.visible');
      cy.get('[data-testid="remove-education-0"]').click();
      cy.get('[data-testid="education-institution-0"]').should('not.exist');
    });

    it('should disable Add Education button when 3 entries exist', () => {
      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="add-education-btn"]').should('be.disabled');
    });
  });

  describe('Add Candidate Form - Work Experience Management', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should add a work experience entry', () => {
      cy.get('[data-testid="add-experience-btn"]').click();
      cy.get('[data-testid="experience-company-0"]').should('be.visible');
      cy.get('[data-testid="experience-position-0"]').should('be.visible');
    });

    it('should remove a work experience entry', () => {
      cy.get('[data-testid="add-experience-btn"]').click();
      cy.get('[data-testid="experience-company-0"]').should('be.visible');
      cy.get('[data-testid="remove-experience-0"]').click();
      cy.get('[data-testid="experience-company-0"]').should('not.exist');
    });
  });

  describe('Add Candidate Form - Successful Submission', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should create candidate with required fields only and show success message', () => {
      cy.intercept('POST', `${API_URL}/candidates`, {
        statusCode: 201,
        body: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('john@example.com');
      cy.get('[data-testid="submit-btn"]').click();

      cy.wait('@createCandidate');
      cy.get('[data-testid="success-alert"]').should('be.visible');
      cy.contains('Candidate created successfully').should('be.visible');
    });

    it('should create candidate with all fields including education and experience', () => {
      cy.intercept('POST', `${API_URL}/candidates`, {
        statusCode: 201,
        body: { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('Jane');
      cy.get('[data-testid="lastName"]').type('Smith');
      cy.get('[data-testid="email"]').type('jane@example.com');
      cy.get('[data-testid="phone"]').type('612345678');
      cy.get('[data-testid="address"]').type('123 Main St, Madrid');

      cy.get('[data-testid="add-education-btn"]').click();
      cy.get('[data-testid="education-institution-0"]').type('MIT');
      cy.get('[data-testid="education-title-0"]').type('Computer Science');
      cy.get('[data-testid="education-startDate-0"]').type('2015-09-01');

      cy.get('[data-testid="add-experience-btn"]').click();
      cy.get('[data-testid="experience-company-0"]').type('Tech Corp');
      cy.get('[data-testid="experience-position-0"]').type('Engineer');
      cy.get('[data-testid="experience-startDate-0"]').type('2019-07-01');

      cy.get('[data-testid="submit-btn"]').click();
      cy.wait('@createCandidate');
      cy.get('[data-testid="success-alert"]').should('be.visible');
    });
  });

  describe('Add Candidate Form - Error Handling', () => {
    beforeEach(() => {
      cy.visit('/candidates/add');
    });

    it('should show error message when API returns 400 (duplicate email)', () => {
      cy.intercept('POST', `${API_URL}/candidates`, {
        statusCode: 400,
        body: { message: 'Validation error', error: 'Email already exists in the system' },
      }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('existing@example.com');
      cy.get('[data-testid="submit-btn"]').click();

      cy.wait('@createCandidate');
      cy.get('[data-testid="error-alert"]').should('be.visible');
      cy.contains('Email already exists').should('be.visible');
    });

    it('should show error message when API returns 500', () => {
      cy.intercept('POST', `${API_URL}/candidates`, {
        statusCode: 500,
        body: { message: 'Error creating candidate', error: 'Internal server error' },
      }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('john@example.com');
      cy.get('[data-testid="submit-btn"]').click();

      cy.wait('@createCandidate');
      cy.get('[data-testid="error-alert"]').should('be.visible');
    });

    it('should preserve form data when submission fails', () => {
      cy.intercept('POST', `${API_URL}/candidates`, { statusCode: 500 }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('john@example.com');
      cy.get('[data-testid="submit-btn"]').click();

      cy.wait('@createCandidate');
      cy.get('[data-testid="firstName"]').should('have.value', 'John');
      cy.get('[data-testid="lastName"]').should('have.value', 'Doe');
      cy.get('[data-testid="email"]').should('have.value', 'john@example.com');
    });

    it('should disable submit button during submission', () => {
      cy.intercept('POST', `${API_URL}/candidates`, {
        delay: 1000,
        statusCode: 201,
        body: { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
      }).as('createCandidate');

      cy.get('[data-testid="firstName"]').type('John');
      cy.get('[data-testid="lastName"]').type('Doe');
      cy.get('[data-testid="email"]').type('john@example.com');
      cy.get('[data-testid="submit-btn"]').click();

      cy.get('[data-testid="submit-btn"]').should('be.disabled');
      cy.contains('Saving').should('be.visible');
    });
  });

  describe('Add Candidate API - Direct', () => {
    it('should create a candidate via API', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/candidates`,
        body: {
          firstName: 'CypressTest',
          lastName: 'User',
          email: `cypress-${Date.now()}@test.com`,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.firstName).to.eq('CypressTest');
        expect(response.body.id).to.be.a('number');
      });
    });

    it('should return 400 for invalid data', () => {
      cy.request({
        method: 'POST',
        url: `${API_URL}/candidates`,
        body: {},
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });
});
