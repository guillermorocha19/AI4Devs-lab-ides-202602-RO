# Frontend Implementation Plan: LABIDES-1 Add Candidate

## Overview

Implement the frontend interface for adding candidates to the ATS system. This includes a recruiter dashboard page with an "Add Candidate" button, a multi-section form for candidate data entry (personal info, education, work experience, CV upload), client-side validation, API integration, and Cypress E2E tests.

This is a **greenfield implementation**: the frontend is currently a default Create React App boilerplate with no routing, no UI framework, no service layer, and no custom components. All application structure must be created from scratch.

The implementation follows the project's **frontend standards** defined in `ai-specs/specs/frontend-standards.mdc`: TypeScript functional components with hooks, React Bootstrap for UI, axios for API communication, React Router DOM for navigation, and Cypress for E2E testing. All code must be in **English only** per `base-standards.mdc`.

---

## Architecture Context

### Components Involved

| Component               | File Path                                      | Purpose                                                    |
|--------------------------|------------------------------------------------|------------------------------------------------------------|
| `App`                    | `src/App.tsx`                                  | Root component with React Router configuration             |
| `RecruiterDashboard`     | `src/components/RecruiterDashboard.tsx`         | Dashboard page with "Add Candidate" button                 |
| `AddCandidateForm`       | `src/components/AddCandidateForm.tsx`           | Multi-section form for creating candidates                 |

### Services Involved

| Service              | File Path                                 | Purpose                                              |
|----------------------|-------------------------------------------|------------------------------------------------------|
| `candidateService`   | `src/services/candidateService.ts`        | API calls: `createCandidate`, `uploadFile`           |

### Types

| Type File              | File Path                          | Purpose                                            |
|------------------------|------------------------------------|----------------------------------------------------|
| `candidateTypes`       | `src/types/candidate.ts`          | TypeScript interfaces for all candidate-related data |

### Routing

| Route               | Component              | Description                     |
|----------------------|------------------------|---------------------------------|
| `/`                  | `RecruiterDashboard`   | Recruiter dashboard (home page) |
| `/candidates/add`    | `AddCandidateForm`     | Add candidate form              |

### State Management

- **Local state** with `useState` hooks (no global state needed for this feature)
- **Form state**: Single `formData` object containing personal info, educations array, workExperiences array, and CV data
- **UI state**: `loading`, `error`, `success`, `validationErrors` states
- **Dynamic arrays**: Education and work experience entries managed as arrays with add/remove operations

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action**: Create and switch to a new feature branch following the development workflow
- **Branch Name**: `feature/LABIDES-1-frontend`
- **Implementation Steps**:
  1. Ensure you are on the `main` branch: `git checkout main`
  2. Pull latest changes: `git pull origin main`
  3. Create new branch: `git checkout -b feature/LABIDES-1-frontend`
  4. Verify branch creation: `git branch`
- **Notes**: This MUST be the FIRST step before any code changes. Do NOT keep working on a general `LABIDES-1` branch; always use the `-frontend` suffix to separate frontend and backend concerns per `frontend-standards.mdc` "Development Workflow" section.

---

### Step 1: Install Dependencies

- **File**: `frontend/package.json`
- **Action**: Install all required dependencies missing from the current project
- **Implementation Steps**:
  1. Install production dependencies:
     ```bash
     npm install react-router-dom bootstrap react-bootstrap react-bootstrap-icons react-datepicker axios
     ```
  2. Install dev dependencies:
     ```bash
     npm install --save-dev @types/react-router-dom @types/react-datepicker cypress
     ```
  3. Add Cypress scripts to `package.json`:
     ```json
     "cypress:open": "cypress open",
     "cypress:run": "cypress run"
     ```
- **Dependencies Installed**:

  | Package                | Version  | Purpose                           |
  |------------------------|----------|-----------------------------------|
  | `react-router-dom`     | ^6.x     | Client-side routing               |
  | `bootstrap`            | ^5.3.x   | CSS framework                     |
  | `react-bootstrap`      | ^2.10.x  | React Bootstrap components        |
  | `react-bootstrap-icons`| ^1.11.x  | Icon library                      |
  | `react-datepicker`     | ^6.x     | Date picker input component       |
  | `axios`                | latest   | HTTP client                       |
  | `cypress`              | ^14.x    | E2E testing framework             |

---

### Step 2: Create TypeScript Types

- **File**: `frontend/src/types/candidate.ts`
- **Action**: Define all TypeScript interfaces for candidate-related data
- **Implementation Steps**:
  1. Create `src/types/` directory
  2. Define the following interfaces:

  ```typescript
  export interface EducationEntry {
    institution: string;
    title: string;
    startDate: string;
    endDate: string;
  }

  export interface WorkExperienceEntry {
    company: string;
    position: string;
    description: string;
    startDate: string;
    endDate: string;
  }

  export interface CvData {
    filePath: string;
    fileType: string;
  }

  export interface CandidateFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    educations: EducationEntry[];
    workExperiences: WorkExperienceEntry[];
    cv: CvData | null;
  }

  export interface CandidateResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
  }

  export interface FileUploadResponse {
    filePath: string;
    fileType: string;
  }

  export interface ApiErrorResponse {
    message: string;
    error: string;
  }

  export interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    educations?: string[];
    workExperiences?: string[];
    cv?: string;
    general?: string;
  }
  ```

- **Notes**: These types enforce type safety across services and components. Use `string` for date fields in the form (HTML date inputs produce strings), convert to ISO format before API submission.

---

### Step 3: Create Candidate Service

- **File**: `frontend/src/services/candidateService.ts`
- **Action**: Create the API service layer for candidate operations
- **Function Signatures**:
  ```typescript
  export const candidateService = {
    createCandidate: async (candidateData: CandidateFormData): Promise<CandidateResponse>,
    uploadFile: async (file: File): Promise<FileUploadResponse>,
  };
  ```
- **Implementation Steps**:
  1. Create `src/services/` directory
  2. Define `API_BASE_URL` constant as `http://localhost:3010`
  3. Implement `createCandidate`:
     - Transform `CandidateFormData` before sending:
       - Convert date strings to ISO format (`new Date(dateString).toISOString()`)
       - Convert empty optional strings to `null` (`phone`, `address`, `description`)
       - Filter out empty education/work experience entries (where required fields are blank)
       - Only include `cv` if it has data
     - Send `POST` to `${API_BASE_URL}/candidates` with JSON body
     - Return `response.data` on success
     - Re-throw errors for component-level handling
  4. Implement `uploadFile`:
     - Create `FormData` object, append `file`
     - Send `POST` to `${API_BASE_URL}/upload` with `multipart/form-data`
     - Return `response.data` (`{ filePath, fileType }`)
     - Re-throw errors for component-level handling
- **Dependencies**: `axios`, types from `../types/candidate`
- **Error Handling**: Log errors with `console.error` and re-throw for components to handle. Extract error message from `error.response?.data?.error` or `error.message`.

---

### Step 4: Create RecruiterDashboard Component

- **File**: `frontend/src/components/RecruiterDashboard.tsx`
- **Action**: Create the dashboard page with an "Add Candidate" button
- **Component Signature**:
  ```typescript
  const RecruiterDashboard: React.FC = () => { ... };
  export default RecruiterDashboard;
  ```
- **Implementation Steps**:
  1. Create `src/components/` directory
  2. Create `RecruiterDashboard.tsx` as a TypeScript functional component
  3. Import React Bootstrap components: `Container`, `Row`, `Col`, `Button`, `Card`
  4. Import `useNavigate` from `react-router-dom`
  5. Layout:
     - Page title: "Recruiter Dashboard" in an `<h1>`
     - "Add Candidate" button: React Bootstrap `Button` variant `primary`, with `PlusCircle` icon from `react-bootstrap-icons`
     - On click: navigate to `/candidates/add` using `useNavigate()`
     - Wrap in `Container` with responsive `Row`/`Col` grid
  6. Add `data-testid` attributes for Cypress testing:
     - `data-testid="dashboard-title"` on the heading
     - `data-testid="add-candidate-btn"` on the button
  7. Use `aria-label="Add a new candidate"` on the button for accessibility
- **Dependencies**: `react-router-dom`, `react-bootstrap`, `react-bootstrap-icons`
- **Notes**: Keep this component simple for now. Future enhancements (candidate list, search, filters) are out of scope.

---

### Step 5: Create AddCandidateForm Component

This is the main component. Due to its complexity, break it into logical sub-sections.

- **File**: `frontend/src/components/AddCandidateForm.tsx`
- **Action**: Create the multi-section candidate creation form
- **Component Signature**:
  ```typescript
  const AddCandidateForm: React.FC = () => { ... };
  export default AddCandidateForm;
  ```

#### Step 5a: Component State Setup

- **Implementation Steps**:
  1. Define form state using `useState<CandidateFormData>` with initial values:
     ```typescript
     const initialFormData: CandidateFormData = {
       firstName: '',
       lastName: '',
       email: '',
       phone: '',
       address: '',
       educations: [],
       workExperiences: [],
       cv: null,
     };
     ```
  2. Define UI states:
     ```typescript
     const [formData, setFormData] = useState<CandidateFormData>(initialFormData);
     const [loading, setLoading] = useState<boolean>(false);
     const [error, setError] = useState<string>('');
     const [success, setSuccess] = useState<string>('');
     const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
     const [validated, setValidated] = useState<boolean>(false);
     ```
  3. Import `useNavigate` for post-submission navigation

#### Step 5b: Personal Information Section

- **Implementation Steps**:
  1. Create a React Bootstrap `Card` with title "Personal Information"
  2. Add form fields using `Form.Group`, `Form.Label`, `Form.Control`:
     - **First Name** (`text`, required, `data-testid="firstName"`, `maxLength={100}`, `aria-label="First name"`)
     - **Last Name** (`text`, required, `data-testid="lastName"`, `maxLength={100}`, `aria-label="Last name"`)
     - **Email** (`email`, required, `data-testid="email"`, `aria-label="Email address"`)
     - **Phone** (`tel`, optional, `data-testid="phone"`, `placeholder="612345678"`, `aria-label="Phone number"`)
     - **Address** (`text`, optional, `data-testid="address"`, `maxLength={100}`, `aria-label="Address"`)
  3. Use responsive `Row`/`Col` layout: first name + last name on same row, email full width, phone + address on same row
  4. Display validation feedback with `Form.Control.Feedback type="invalid"` and `isInvalid` prop bound to `validationErrors`
  5. Implement `handleInputChange` for controlled inputs:
     ```typescript
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value } = e.target;
       setFormData(prev => ({ ...prev, [name]: value }));
       if (validationErrors[name as keyof ValidationErrors]) {
         setValidationErrors(prev => ({ ...prev, [name]: undefined }));
       }
     };
     ```

#### Step 5c: Education Section (Dynamic Array)

- **Implementation Steps**:
  1. Create a React Bootstrap `Card` with title "Education" and a sub-heading showing count and limit (e.g., "0/3 records")
  2. "Add Education" button:
     - React Bootstrap `Button` variant `outline-primary`
     - `data-testid="add-education-btn"`
     - Disabled when `formData.educations.length >= 3`
     - On click: append a new empty `EducationEntry` to the array
  3. For each education entry, render a sub-card with:
     - **Institution** (`text`, required, `maxLength={100}`, `data-testid="education-institution-{index}"`)
     - **Title/Degree** (`text`, required, `maxLength={250}`, `data-testid="education-title-{index}"`)
     - **Start Date** (`date`, required, `data-testid="education-startDate-{index}"`)
     - **End Date** (`date`, optional, `data-testid="education-endDate-{index}"`)
     - **Remove** button: `Button` variant `outline-danger`, `data-testid="remove-education-{index}"`
  4. Implement `handleEducationChange(index, field, value)`:
     ```typescript
     const handleEducationChange = (index: number, field: keyof EducationEntry, value: string) => {
       setFormData(prev => {
         const updated = [...prev.educations];
         updated[index] = { ...updated[index], [field]: value };
         return { ...prev, educations: updated };
       });
     };
     ```
  5. Implement `addEducation()` and `removeEducation(index)`
  6. Display validation errors for each education field if present

#### Step 5d: Work Experience Section (Dynamic Array)

- **Implementation Steps**:
  1. Create a React Bootstrap `Card` with title "Work Experience"
  2. "Add Work Experience" button:
     - `Button` variant `outline-primary`
     - `data-testid="add-experience-btn"`
     - On click: append a new empty `WorkExperienceEntry` to the array
  3. For each entry, render a sub-card with:
     - **Company** (`text`, required, `maxLength={100}`, `data-testid="experience-company-{index}"`)
     - **Position** (`text`, required, `maxLength={100}`, `data-testid="experience-position-{index}"`)
     - **Description** (`textarea`, optional, `maxLength={200}`, `data-testid="experience-description-{index}"`)
     - **Start Date** (`date`, required, `data-testid="experience-startDate-{index}"`)
     - **End Date** (`date`, optional, `data-testid="experience-endDate-{index}"`)
     - **Remove** button: `Button` variant `outline-danger`, `data-testid="remove-experience-{index}"`
  4. Implement `handleExperienceChange(index, field, value)`, `addExperience()`, `removeExperience(index)` following the same pattern as education
  5. Display validation errors for each experience field if present

#### Step 5e: CV Upload Section

- **Implementation Steps**:
  1. Create a React Bootstrap `Card` with title "CV / Resume (Optional)"
  2. File input:
     - `Form.Control type="file"` with `accept=".pdf,.docx"`
     - `data-testid="cv-upload"`
     - `aria-label="Upload CV in PDF or DOCX format"`
  3. Display helper text: "Accepted formats: PDF, DOCX. Maximum size: 10MB"
  4. Implement `handleFileChange`:
     ```typescript
     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (!file) return;

       // Client-side validation
       const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
       if (!validTypes.includes(file.type)) {
         setValidationErrors(prev => ({ ...prev, cv: 'File type must be PDF or DOCX' }));
         return;
       }
       if (file.size > 10 * 1024 * 1024) {
         setValidationErrors(prev => ({ ...prev, cv: 'File size must not exceed 10MB' }));
         return;
       }

       try {
         const result = await candidateService.uploadFile(file);
         setFormData(prev => ({ ...prev, cv: { filePath: result.filePath, fileType: result.fileType } }));
         setValidationErrors(prev => ({ ...prev, cv: undefined }));
       } catch (err) {
         setValidationErrors(prev => ({ ...prev, cv: 'Failed to upload file. Please try again.' }));
       }
     };
     ```
  5. Show upload success indicator (file name + checkmark icon) when `formData.cv` is set
  6. Show upload error with `Form.Control.Feedback type="invalid"`

#### Step 5f: Client-Side Validation

- **Implementation Steps**:
  1. Create `validateForm(): boolean` function within the component:
     ```typescript
     const validateForm = (): boolean => {
       const errors: ValidationErrors = {};

       // Personal info
       if (!formData.firstName || formData.firstName.trim().length < 2 || formData.firstName.trim().length > 100) {
         errors.firstName = 'First name is required (2-100 characters)';
       } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(formData.firstName.trim())) {
         errors.firstName = 'First name must contain only letters';
       }
       // Same for lastName...
       if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
         errors.email = 'A valid email address is required';
       }
       if (formData.phone && !/^[679]\d{8}$/.test(formData.phone)) {
         errors.phone = 'Phone must follow format: 6XXXXXXXX, 7XXXXXXXX, or 9XXXXXXXX';
       }
       if (formData.address && formData.address.length > 100) {
         errors.address = 'Address cannot exceed 100 characters';
       }

       // Education validation
       const educationErrors: string[] = [];
       formData.educations.forEach((edu, i) => {
         if (!edu.institution) educationErrors[i] = 'Institution is required';
         if (!edu.title) educationErrors[i] = 'Title is required';
         if (!edu.startDate) educationErrors[i] = 'Start date is required';
         if (edu.endDate && edu.startDate && new Date(edu.endDate) < new Date(edu.startDate)) {
           educationErrors[i] = 'End date must be after start date';
         }
       });
       if (educationErrors.length > 0) errors.educations = educationErrors;

       // Work experience validation (similar pattern)
       // ...

       setValidationErrors(errors);
       return Object.keys(errors).length === 0;
     };
     ```
  2. Call `validateForm()` on form submit before API call
  3. Clear specific field error when user starts typing (in `handleInputChange`)

#### Step 5g: Form Submission

- **Implementation Steps**:
  1. Implement `handleSubmit`:
     ```typescript
     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
       setError('');
       setSuccess('');

       if (!validateForm()) {
         setValidated(true);
         return;
       }

       setLoading(true);
       try {
         await candidateService.createCandidate(formData);
         setSuccess('Candidate created successfully!');
         setTimeout(() => navigate('/'), 2000);
       } catch (err: unknown) {
         const apiError = err as { response?: { data?: ApiErrorResponse } };
         const errorMessage = apiError.response?.data?.error || 'An unexpected error occurred. Please try again.';
         setError(errorMessage);
       } finally {
         setLoading(false);
       }
     };
     ```
  2. On success: show `Alert variant="success"` with message, then navigate to `/` after 2 seconds
  3. On error: show `Alert variant="danger"` with server error message, form data is preserved
  4. During submission: show `Spinner` on the submit button and disable it

#### Step 5h: Component Layout and Navigation

- **Implementation Steps**:
  1. Add "Back to Dashboard" link at the top: `Button variant="link"` with `← Back to Dashboard`, navigating to `/`
  2. Page title: "Add New Candidate" in `<h2>`
  3. Wrap entire form in `Container` with `className="py-4"`
  4. Order sections: Personal Info → Education → Work Experience → CV Upload
  5. Submit button at the bottom: `Button type="submit" variant="primary"` with `data-testid="submit-btn"`
  6. Show `Spinner` inside button when loading: `{loading ? <><Spinner size="sm" /> Saving...</> : 'Save Candidate'}`
  7. Success/Error alerts at the top of the form, with `data-testid="success-alert"` and `data-testid="error-alert"`
  8. Add `aria-label` attributes on all interactive elements

---

### Step 6: Update App Component with Routing

- **File**: `frontend/src/App.tsx`
- **Action**: Replace boilerplate with React Router configuration and Bootstrap CSS import
- **Implementation Steps**:
  1. Remove all existing Create React App boilerplate content
  2. Import Bootstrap CSS: `import 'bootstrap/dist/css/bootstrap.min.css';`
  3. Import React Router: `BrowserRouter`, `Routes`, `Route` from `react-router-dom`
  4. Import components: `RecruiterDashboard`, `AddCandidateForm`
  5. Implement routing:
     ```typescript
     import React from 'react';
     import { BrowserRouter, Routes, Route } from 'react-router-dom';
     import 'bootstrap/dist/css/bootstrap.min.css';
     import RecruiterDashboard from './components/RecruiterDashboard';
     import AddCandidateForm from './components/AddCandidateForm';

     const App: React.FC = () => {
       return (
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<RecruiterDashboard />} />
             <Route path="/candidates/add" element={<AddCandidateForm />} />
           </Routes>
         </BrowserRouter>
       );
     };

     export default App;
     ```
  6. Remove unused `App.css` import and `logo.svg` import
- **Dependencies**: `react-router-dom`, `bootstrap`

---

### Step 7: Configure Cypress

- **Action**: Set up Cypress for E2E testing
- **Implementation Steps**:
  1. Initialize Cypress (if not already): `npx cypress open` (choose E2E testing, this creates the `cypress/` folder structure)
  2. Create `frontend/cypress.config.ts`:
     ```typescript
     import { defineConfig } from 'cypress';

     export default defineConfig({
       e2e: {
         baseUrl: 'http://localhost:3000',
         env: {
           API_URL: 'http://localhost:3010',
         },
         setupNodeEvents(on, config) {},
         supportFile: false,
       },
     });
     ```
  3. Create `frontend/cypress/e2e/` directory for test files
  4. Ensure `tsconfig.json` includes Cypress types (add `"cypress"` to `types` array if needed, or create a separate `cypress/tsconfig.json`)

---

### Step 8: Write Cypress E2E Tests

- **File**: `frontend/cypress/e2e/candidates.cy.ts`
- **Action**: Write comprehensive E2E tests for the add candidate feature
- **Test Structure**:

  ```typescript
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
  ```

- **Notes**: Use `cy.intercept()` for UI tests to mock API responses and avoid dependency on running backend. Include direct API tests at the end for integration verification (require running backend).

---

### Step 9: Update Technical Documentation

- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all frontend code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates:
     - New frontend dependencies installed → Update `ai-specs/specs/frontend-standards.mdc` if any technology stack changes were made
     - New routes added → Ensure routing documentation is accurate
     - New components and patterns → Verify they follow existing patterns in `frontend-standards.mdc`
     - Cypress configuration → Verify test documentation is accurate
  3. **Update Documentation**: For each affected file:
     - Update content in English (as per `documentation-standards.mdc`)
     - Maintain consistency with existing documentation structure
     - Ensure proper formatting
  4. **Verify Documentation**:
     - Confirm all changes are accurately reflected
     - Check that documentation follows established structure
  5. **Report Updates**: Document which files were updated and what changes were made
- **References**:
  - Follow process described in `ai-specs/specs/documentation-standards.mdc`
  - All documentation must be written in English
- **Notes**: This step is MANDATORY before considering the implementation complete. Do not skip documentation updates.

---

## Implementation Order

1. **Step 0**: Create feature branch `feature/LABIDES-1-frontend`
2. **Step 1**: Install dependencies (react-router-dom, bootstrap, react-bootstrap, axios, cypress, etc.)
3. **Step 2**: Create TypeScript types (`src/types/candidate.ts`)
4. **Step 3**: Create candidate service (`src/services/candidateService.ts`)
5. **Step 4**: Create RecruiterDashboard component (`src/components/RecruiterDashboard.tsx`)
6. **Step 5**: Create AddCandidateForm component (`src/components/AddCandidateForm.tsx`)
   - 5a: State setup
   - 5b: Personal information section
   - 5c: Education section (dynamic array)
   - 5d: Work experience section (dynamic array)
   - 5e: CV upload section
   - 5f: Client-side validation
   - 5g: Form submission handler
   - 5h: Layout and navigation
7. **Step 6**: Update App.tsx with routing and Bootstrap CSS
8. **Step 7**: Configure Cypress
9. **Step 8**: Write Cypress E2E tests (`cypress/e2e/candidates.cy.ts`)
10. **Step 9**: Update technical documentation

---

## Testing Checklist

### Cypress E2E Tests

- [ ] Dashboard displays with "Add Candidate" button
- [ ] Navigation from dashboard to add candidate form
- [ ] Form displays all sections (personal info, education, work experience, CV)
- [ ] Back to Dashboard navigation works
- [ ] Validation errors shown for empty required fields
- [ ] Validation error for invalid email format
- [ ] Validation error for invalid phone format
- [ ] Add education entry (up to 3)
- [ ] Remove education entry
- [ ] Add Education button disabled at 3 entries
- [ ] Add work experience entry
- [ ] Remove work experience entry
- [ ] Successful candidate creation with required fields only
- [ ] Successful candidate creation with all fields
- [ ] Error message displayed for duplicate email (400)
- [ ] Error message displayed for server error (500)
- [ ] Form data preserved on submission failure
- [ ] Submit button disabled during submission
- [ ] Direct API test: create candidate (201)
- [ ] Direct API test: invalid data (400)

### Component Functionality

- [ ] All form fields render correctly
- [ ] Controlled inputs update state on change
- [ ] Dynamic education entries add/remove correctly
- [ ] Dynamic work experience entries add/remove correctly
- [ ] File upload validates type (PDF/DOCX only)
- [ ] File upload validates size (max 10MB)
- [ ] File upload calls API and stores result in state
- [ ] Form submission transforms data correctly (dates to ISO, empty strings to null)
- [ ] Success alert appears and auto-navigates after 2 seconds
- [ ] Error alert displays server error message

### Error Handling

- [ ] Client-side validation prevents submission with invalid data
- [ ] Server validation errors (400) display meaningful messages
- [ ] Network errors display generic error message
- [ ] Form data preserved when submission fails
- [ ] File upload errors display appropriate message

---

## Error Handling Patterns

### Service Layer Error Handling

```typescript
// In candidateService.ts
try {
  const response = await axios.post(`${API_BASE_URL}/candidates`, data);
  return response.data;
} catch (error: unknown) {
  const axiosError = error as { response?: { data?: ApiErrorResponse }; message?: string };
  console.error('Error creating candidate:', axiosError.response?.data || axiosError.message);
  throw error;
}
```

### Component Error Handling

```typescript
// In AddCandidateForm.tsx
try {
  setLoading(true);
  setError('');
  await candidateService.createCandidate(formData);
  setSuccess('Candidate created successfully!');
} catch (err: unknown) {
  const apiError = err as { response?: { data?: ApiErrorResponse } };
  setError(apiError.response?.data?.error || 'An unexpected error occurred. Please try again.');
} finally {
  setLoading(false);
}
```

### User-Friendly Error Messages

| API Status | Error Source           | User Message                                                     |
|------------|-----------------------|------------------------------------------------------------------|
| 400        | Validation error      | Display server's specific validation message                     |
| 400        | Duplicate email       | "Email already exists in the system"                             |
| 500        | Server error          | "An unexpected error occurred. Please try again."                |
| Network    | Connection failure    | "Unable to connect to the server. Please check your connection." |
| Client     | Validation failure    | Field-specific validation messages shown inline                  |

---

## UI/UX Considerations

### Bootstrap Component Usage

| Component           | Usage                                                          |
|---------------------|----------------------------------------------------------------|
| `Container`         | Main page wrapper with responsive width                        |
| `Row` / `Col`       | Responsive grid layout for form fields (2 columns on desktop)  |
| `Card`              | Section separators (Personal Info, Education, Experience, CV)  |
| `Form`              | Main form wrapper with `onSubmit` handler                      |
| `Form.Group`        | Field group with label and input                               |
| `Form.Control`      | Input fields with validation states                            |
| `Form.Control.Feedback` | Inline validation error messages                           |
| `Button`            | Submit, Add, Remove actions                                    |
| `Alert`             | Success and error messages                                     |
| `Spinner`           | Loading indicator during submission                            |

### Responsive Design

- Use Bootstrap grid system (`Row`/`Col`) for responsive layouts
- Personal info: 2 columns on `md+`, single column on `sm`
- Education/Experience cards: full width with internal 2-column grid for dates
- Stack sections vertically on mobile
- Submit button full width on mobile, auto-width on desktop

### Accessibility

| Element            | Accessibility Feature                                          |
|--------------------|----------------------------------------------------------------|
| All form inputs    | `aria-label` with descriptive text                             |
| Required fields    | `aria-required="true"` attribute                               |
| Error messages     | `role="alert"` on Alert components                             |
| Submit button      | `aria-label="Save candidate"`, `aria-busy` when loading        |
| File upload        | `aria-label="Upload CV in PDF or DOCX format"`                 |
| Navigation button  | `aria-label="Add a new candidate"`                             |
| Back link          | `aria-label="Back to recruiter dashboard"`                     |

### Loading States

- Submit button: shows `Spinner size="sm"` + "Saving..." text, button disabled
- File upload: could show inline spinner during upload (optional enhancement)
- Dashboard: simple static page, no loading needed for this ticket

---

## Dependencies

### Production Dependencies (to install)

| Package                 | Version  | Purpose                              |
|-------------------------|----------|--------------------------------------|
| `react-router-dom`      | ^6.x     | Client-side routing                  |
| `bootstrap`             | ^5.3.x   | CSS framework                        |
| `react-bootstrap`       | ^2.10.x  | Bootstrap React components           |
| `react-bootstrap-icons` | ^1.11.x  | Icon library                         |
| `react-datepicker`      | ^6.x     | Date picker inputs                   |
| `axios`                 | latest   | HTTP client for API calls            |

### Dev Dependencies (to install)

| Package                     | Purpose                              |
|-----------------------------|--------------------------------------|
| `@types/react-router-dom`   | TypeScript types for React Router    |
| `@types/react-datepicker`   | TypeScript types for date picker     |
| `cypress`                   | E2E testing framework                |

### Existing Dependencies (already installed)

| Package                          | Purpose                          |
|----------------------------------|----------------------------------|
| `react` / `react-dom`           | Core React library               |
| `typescript`                     | TypeScript compiler              |
| `@testing-library/react`        | Unit testing utilities           |
| `@testing-library/jest-dom`     | Jest DOM matchers                |
| `react-scripts`                  | CRA build tooling                |

### React Bootstrap Components Used

`Container`, `Row`, `Col`, `Card`, `Form`, `Form.Group`, `Form.Label`, `Form.Control`, `Form.Control.Feedback`, `Button`, `Alert`, `Spinner`

### React Bootstrap Icons Used

`PlusCircle`, `Trash`, `CheckCircle`, `Upload`, `ArrowLeft`

---

## Notes

### Important Reminders

1. **English Only**: All code, comments, error messages, UI text, test names, and documentation MUST be in English. No Spanish identifiers or user-facing text.
2. **TypeScript**: All new files must be TypeScript (`.tsx` for components, `.ts` for services/types). Follow strict mode typing.
3. **Functional Components**: Use React functional components with hooks. No class components.
4. **Small Steps**: Work through each step one at a time. Verify each step works before proceeding.
5. **Incremental Commits**: Make a git commit after each major step. Use descriptive English commit messages.
6. **data-testid Attributes**: Every interactive element and feedback element MUST have a `data-testid` attribute for Cypress testing reliability.

### Business Rules

1. **Required Fields**: `firstName`, `lastName`, `email` are mandatory for candidate creation.
2. **Unique Email**: Email must be unique. Duplicate email returns 400 error from backend.
3. **Education Limit**: Maximum of 3 education records per candidate.
4. **Phone Format**: Spanish phone format: starts with 6, 7, or 9, followed by exactly 8 digits.
5. **File Upload**: Only PDF and DOCX allowed, max 10MB.
6. **Two-Step Upload**: CV is uploaded first via `POST /upload`, then the returned path is included in the candidate creation request.
7. **Form Preservation**: On submission failure, form data must NOT be cleared.
8. **Auto-Navigate**: After successful creation, navigate to dashboard after 2-second delay.

### TypeScript Considerations

- All new components MUST be TypeScript (`.tsx`)
- All new services/utilities MUST be TypeScript (`.ts`)
- Define explicit types for all props, state, and function parameters
- Avoid `any` type — use `unknown` with type guards when handling errors
- Import and use the types from `src/types/candidate.ts` consistently

---

## Next Steps After Implementation

1. **Code Review**: Submit `feature/LABIDES-1-frontend` branch for code review
2. **Backend Integration Testing**: Once backend branch (`feature/LABIDES-1-backend`) is merged, run full integration tests with both frontend and backend running
3. **Cross-Browser Testing**: Verify form works in Chrome, Firefox, Safari, and Edge
4. **Responsive Testing**: Verify layout on mobile, tablet, and desktop viewports
5. **Merge to Main**: After code review approval and all tests passing, merge into `main`

---

## Implementation Verification

### Final Checklist

**Code Quality:**
- [ ] All code written in English (variables, functions, comments, UI text)
- [ ] TypeScript strict mode — no compilation errors (`npm run build`)
- [ ] No ESLint warnings or errors
- [ ] React Bootstrap components used consistently (no plain HTML Bootstrap)
- [ ] All components are functional with hooks (no class components)
- [ ] `data-testid` attributes on all interactive and feedback elements
- [ ] `aria-label` attributes on all interactive elements

**Functionality:**
- [ ] Dashboard renders with "Add Candidate" button
- [ ] Navigation to `/candidates/add` works
- [ ] Form renders all sections (Personal Info, Education, Work Experience, CV)
- [ ] Personal info fields render and accept input
- [ ] Education entries can be added (up to 3) and removed
- [ ] Work experience entries can be added and removed
- [ ] CV file upload validates type and size
- [ ] Client-side validation catches required fields, email format, phone format
- [ ] Form submission calls API with correctly transformed data
- [ ] Success message appears and auto-navigates to dashboard
- [ ] Error message appears with server error details
- [ ] Form data preserved on failure
- [ ] Back to Dashboard navigation works

**Testing:**
- [ ] Cypress E2E tests pass (`npm run cypress:run`)
- [ ] All test scenarios from the checklist covered
- [ ] API tests pass (with running backend)
- [ ] Manual testing completed across Chrome and at least one other browser

**Integration:**
- [ ] Service layer communicates correctly with backend API
- [ ] CORS does not block requests to `http://localhost:3010`
- [ ] File upload flow works end-to-end (upload → create candidate with CV)
- [ ] React Router navigation works correctly

**Documentation:**
- [ ] `ai-specs/specs/frontend-standards.mdc` reviewed and updated if needed
- [ ] All documentation written in English
