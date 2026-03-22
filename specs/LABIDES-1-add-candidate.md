# LABIDES-1: Add Candidate to the System

## [Original]

# Añadir Candidato al Sistema

**Como** reclutador,
**Quiero** tener la capacidad de añadir candidatos al sistema ATS,
**Para que** pueda gestionar sus datos y procesos de selección de manera eficiente.

## Criterios de Aceptación

 1. **Accesibilidad de la función**: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.
 2. **Formulario de ingreso de datos**: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.
 3. **Validación de datos**: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.
 4. **Carga de documentos**: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.
 5. **Confirmación de añadido**: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.
 6. **Errores y manejo de excepciones**: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.
 7. **Accesibilidad y compatibilidad**: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.

## Notas
 
 - La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.
 - Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

## Tareas Técnicas

 - Implementar la interfaz de usuario para el formulario de añadir candidato.
 - Desarrollar el backend necesario para procesar la información ingresada en el formulario.
 - Asegurar la seguridad y privacidad de los datos del candidato.

---

## [Enhanced]

# User Story: Add Candidate Feature

**As a** recruiter,
**I want to** add candidates to the ATS system,
**So that** I can manage their data and selection processes efficiently.

### Description

Recruiters must be able to create new candidate records in the system through a user-friendly form. The form captures personal information (first name, last name, email, phone, address), education history, work experience, and an optional CV upload (PDF or DOCX). The system must validate all inputs, provide clear feedback on success or failure, and persist the data following the existing domain model and architecture patterns.

---

## Technical Specification - Add Candidate Feature

### Overview

The add candidate functionality must be implemented as a REST API endpoint (`POST /candidates`) with a responsive web form. The implementation follows the project's DDD layered architecture: domain models, application services with validators, presentation controllers, and infrastructure (Prisma ORM). Since this is a greenfield feature, all layers need to be created from scratch.

### Prerequisites

Before implementing the candidate feature, the following infrastructure must be set up:

1. **Database schema**: Create Prisma models for `Candidate`, `Education`, `WorkExperience`, and `Resume`
2. **Project structure**: Create the DDD folder structure (`domain/models/`, `application/services/`, `presentation/controllers/`, `routes/`, `infrastructure/`)
3. **File upload middleware**: Configure multer for CV file uploads

---

### Database Models to Create

Based on the data model specification (`ai-specs/specs/data-model.md`), create the following Prisma models:

#### Candidate

| Field       | Type    | Constraints                                  |
|-------------|---------|----------------------------------------------|
| `id`        | Int     | `@id @default(autoincrement())`              |
| `firstName` | String  | Required, max 100 chars                      |
| `lastName`  | String  | Required, max 100 chars                      |
| `email`     | String  | Required, `@unique`, max 255 chars           |
| `phone`     | String? | Optional, max 15 chars                       |
| `address`   | String? | Optional, max 100 chars                      |

**Relations:** `educations Education[]`, `workExperiences WorkExperience[]`, `resumes Resume[]`

#### Education

| Field         | Type      | Constraints                             |
|---------------|-----------|-----------------------------------------|
| `id`          | Int       | `@id @default(autoincrement())`         |
| `institution` | String    | Required, max 100 chars                 |
| `title`       | String    | Required, max 250 chars                 |
| `startDate`   | DateTime  | Required                                |
| `endDate`     | DateTime? | Optional (null if ongoing)              |
| `candidateId` | Int       | FK → Candidate                          |

#### WorkExperience

| Field         | Type      | Constraints                             |
|---------------|-----------|-----------------------------------------|
| `id`          | Int       | `@id @default(autoincrement())`         |
| `company`     | String    | Required, max 100 chars                 |
| `position`    | String    | Required, max 100 chars                 |
| `description` | String?   | Optional, max 200 chars                 |
| `startDate`   | DateTime  | Required                                |
| `endDate`     | DateTime? | Optional (null if current)              |
| `candidateId` | Int       | FK → Candidate                          |

#### Resume

| Field         | Type     | Constraints                              |
|---------------|----------|------------------------------------------|
| `id`          | Int      | `@id @default(autoincrement())`          |
| `filePath`    | String   | Required, max 500 chars                  |
| `fileType`    | String   | Required, max 50 chars                   |
| `uploadDate`  | DateTime | `@default(now())`                        |
| `candidateId` | Int      | FK → Candidate                           |

---

### API Endpoints

#### Primary Endpoint: Create Candidate

```
POST /candidates
```

**Content-Type:** `application/json`

**Request Body Schema:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "612345678",
  "address": "123 Main Street, Madrid",
  "educations": [
    {
      "institution": "MIT",
      "title": "Computer Science BSc",
      "startDate": "2015-09-01T00:00:00.000Z",
      "endDate": "2019-06-30T00:00:00.000Z"
    }
  ],
  "workExperiences": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "description": "Full-stack development",
      "startDate": "2019-07-01T00:00:00.000Z",
      "endDate": null
    }
  ],
  "cv": {
    "filePath": "/uploads/john-doe-cv.pdf",
    "fileType": "application/pdf"
  }
}
```

**Response Codes:**

- `201` - Candidate created successfully
  ```json
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "612345678",
    "address": "123 Main Street, Madrid"
  }
  ```
- `400` - Validation error or duplicate email
  ```json
  {
    "message": "Validation error",
    "error": "Email already exists in the system"
  }
  ```
- `500` - Internal server error
  ```json
  {
    "message": "Error creating candidate",
    "error": "Error details"
  }
  ```

#### Secondary Endpoint: Upload CV File

```
POST /upload
```

**Content-Type:** `multipart/form-data`

**Request Body:** `file` field with PDF or DOCX (max 10MB)

**Response:**
- `200` - File uploaded successfully → `{ "filePath": "/uploads/filename.pdf", "fileType": "application/pdf" }`
- `400` - Invalid file type or file too large
- `500` - Upload error

---

### Files to Create / Modify

#### Backend Files to Create

1. **`backend/src/domain/models/Candidate.ts`**
   - `Candidate` class: aggregate root entity
   - Constructor accepting data object with typed properties
   - `save()` method for Prisma create with nested `educations`, `workExperiences`, and `resumes`
   - `findOne(id: number)` static method
   - `findAll()` static method
   - `findByEmail(email: string)` static method for duplicate checking

2. **`backend/src/domain/models/Education.ts`**
   - `Education` class: value object / child entity
   - Constructor with typed properties (`institution`, `title`, `startDate`, `endDate`)

3. **`backend/src/domain/models/WorkExperience.ts`**
   - `WorkExperience` class: value object / child entity
   - Constructor with typed properties (`company`, `position`, `description`, `startDate`, `endDate`)

4. **`backend/src/domain/models/Resume.ts`**
   - `Resume` class: value object / child entity
   - Constructor with typed properties (`filePath`, `fileType`, `uploadDate`)

5. **`backend/src/application/services/candidateService.ts`**
   - `addCandidate(candidateData)` function:
     - Calls `validateCandidateData()` for input validation
     - Checks for duplicate email using `Candidate.findByEmail()`
     - Creates `Candidate`, `Education[]`, `WorkExperience[]`, `Resume` instances
     - Persists via `candidate.save()`
     - Returns created candidate

6. **`backend/src/application/validator.ts`**
   - `validateCandidateData(data)` function with comprehensive validation rules (see Validation Rules section below)

7. **`backend/src/presentation/controllers/candidateController.ts`**
   - `addCandidateController(req, res, next)`: handles POST /candidates
     - Parses request body
     - Calls `addCandidate` service
     - Returns 201 with created candidate
     - Handles validation errors (400), duplicate emails (400), and server errors (500)

8. **`backend/src/routes/candidateRoutes.ts`**
   - `POST /` → `addCandidateController`

9. **`backend/src/infrastructure/prismaClient.ts`** (if not already present)
   - Singleton PrismaClient instance

10. **`backend/src/infrastructure/logger.ts`** (if not already present)
    - Logger class with `info`, `error`, `warn`, `debug` methods

#### Backend Files to Modify

1. **`backend/prisma/schema.prisma`**
   - Add `Candidate`, `Education`, `WorkExperience`, `Resume` models with all fields and relations

2. **`backend/src/index.ts`**
   - Import and mount `candidateRoutes` at `/candidates`
   - Add CORS configuration
   - Add JSON body parser middleware
   - Add file upload route (multer middleware)

#### Frontend Files to Create

1. **`frontend/src/components/AddCandidateForm.tsx`**
   - TypeScript React functional component
   - Multi-section form: Personal Info, Education (dynamic add/remove), Work Experience (dynamic add/remove), CV Upload
   - Controlled inputs with `useState`
   - Client-side validation before submission
   - Loading state during API call
   - Success/error message display (React Bootstrap Alert)
   - Navigation back to dashboard after successful creation
   - React Bootstrap components (`Form`, `Button`, `Container`, `Row`, `Col`, `Card`, `Alert`, `Spinner`)

2. **`frontend/src/components/RecruiterDashboard.tsx`**
   - Dashboard page with visible "Add Candidate" button
   - Navigation to `/candidates/add`
   - List of existing candidates (future enhancement)

3. **`frontend/src/services/candidateService.ts`**
   - `createCandidate(candidateData)` - POST to `/candidates`
   - `uploadFile(file)` - POST to `/upload` (multipart/form-data)

#### Frontend Files to Modify

1. **`frontend/src/App.tsx`**
   - Add React Router DOM configuration
   - Add routes: `/` → `RecruiterDashboard`, `/candidates/add` → `AddCandidateForm`
   - Import Bootstrap CSS

---

### Validation Rules

#### Server-Side Validation (in `validateCandidateData`)

**Candidate Fields:**

| Field       | Rule                                            | Error Message                                                    |
|-------------|-------------------------------------------------|------------------------------------------------------------------|
| `firstName` | Required, 2-100 chars, letters/spaces only      | `"First name is required and must be 2-100 characters, letters only"` |
| `lastName`  | Required, 2-100 chars, letters/spaces only      | `"Last name is required and must be 2-100 characters, letters only"` |
| `email`     | Required, valid email format, unique             | `"A valid email address is required"` / `"Email already exists in the system"` |
| `phone`     | Optional, if provided: Spanish format `(6\|7\|9)XXXXXXXX` (9 digits) | `"Phone must follow format: 6XXXXXXXX, 7XXXXXXXX, or 9XXXXXXXX"` |
| `address`   | Optional, if provided: max 100 chars            | `"Address cannot exceed 100 characters"` |

**Education Fields (array, max 3 items):**

| Field         | Rule                                         | Error Message                                                |
|---------------|----------------------------------------------|--------------------------------------------------------------|
| `institution` | Required, max 100 chars                      | `"Institution is required and cannot exceed 100 characters"` |
| `title`       | Required, max 250 chars                      | `"Title is required and cannot exceed 250 characters"`       |
| `startDate`   | Required, valid ISO date                     | `"Start date is required and must be a valid date"`          |
| `endDate`     | Optional, valid ISO date, must be >= startDate | `"End date must be a valid date after start date"`         |
| (array)       | Max 3 education records                     | `"Maximum of 3 education records allowed"`                   |

**WorkExperience Fields (array):**

| Field         | Rule                                         | Error Message                                                 |
|---------------|----------------------------------------------|---------------------------------------------------------------|
| `company`     | Required, max 100 chars                      | `"Company is required and cannot exceed 100 characters"`      |
| `position`    | Required, max 100 chars                      | `"Position is required and cannot exceed 100 characters"`     |
| `description` | Optional, max 200 chars                      | `"Description cannot exceed 200 characters"`                  |
| `startDate`   | Required, valid ISO date                     | `"Start date is required and must be a valid date"`           |
| `endDate`     | Optional, valid ISO date, must be >= startDate | `"End date must be a valid date after start date"`          |

**Resume/CV Fields:**

| Field      | Rule                                              | Error Message                                        |
|------------|---------------------------------------------------|------------------------------------------------------|
| `filePath` | Required if CV provided, max 500 chars            | `"File path is required and cannot exceed 500 characters"` |
| `fileType` | Required if CV provided, must be `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `"File type must be PDF or DOCX"` |
| (file)     | Max 10MB                                          | `"File size must not exceed 10MB"`                   |

#### Client-Side Validation

- HTML5 `required` attribute on mandatory fields
- Email format validation with `type="email"`
- Real-time validation feedback with Bootstrap `isInvalid` / `isValid` states
- Dynamic education/work experience sections with add/remove buttons
- File input restricted to `.pdf,.docx` accept types
- Submit button disabled during form submission
- Clear field-level error messages

---

### Security Requirements

**Authentication:**
- Currently no authentication middleware implemented (marked as `@access Public`)
- Future: JWT token validation should be added to protect the endpoint

**Authorization:**
- No authorization checks implemented
- Future: Only users with "recruiter" role should access this endpoint

**Input Sanitization:**
- Prisma ORM handles SQL injection prevention through parameterized queries
- Trim whitespace from string inputs before validation
- Validate and sanitize file uploads (check MIME type, not just extension)

**XSS Prevention:**
- React automatically escapes content in JSX
- Server-side input validation prevents malicious content storage

**File Upload Security:**
- Restrict file types to PDF and DOCX only (validate both extension and MIME type)
- Limit file size to 10MB
- Store files in a dedicated uploads directory outside the web root
- Generate unique file names to prevent path traversal attacks

---

### Performance Requirements

- API response time for candidate creation: < 500ms
- File upload: < 5s for 10MB file on standard connection
- Database transaction: use Prisma nested create for atomic candidate + relations creation
- Loading states: implemented with React Bootstrap Spinner during API calls

---

### Testing Requirements

#### Unit Tests to Implement

1. **`backend/src/application/__tests__/validator.test.ts`** - Validation function tests:
   - **Happy path:** Valid complete candidate data passes validation
   - **Happy path:** Valid candidate with only required fields passes validation
   - **firstName validation:** Empty, too short (<2 chars), too long (>100 chars), with numbers, null
   - **lastName validation:** Same as firstName
   - **email validation:** Empty, invalid format, missing @, missing domain
   - **phone validation:** Invalid format, too short, too long, valid Spanish formats (6xx, 7xx, 9xx)
   - **address validation:** Too long (>100 chars)
   - **educations validation:** Invalid institution (empty, >100 chars), invalid title (>250 chars), missing startDate, endDate before startDate, >3 records
   - **workExperiences validation:** Invalid company, invalid position, description >200 chars, date validation
   - **cv validation:** Invalid filePath, invalid fileType, unsupported file format

2. **`backend/src/application/__tests__/candidateService.test.ts`** - Service layer tests:
   - **Happy path:** Create candidate with all fields
   - **Happy path:** Create candidate with only required fields (no education, no experience, no CV)
   - **Duplicate email:** Reject when email already exists (return appropriate error)
   - **Validation failure:** Propagate validation errors from validator
   - **Database error:** Handle Prisma errors gracefully
   - **Edge cases:** Empty educations array, empty workExperiences array, null optional fields

3. **`backend/src/presentation/controllers/__tests__/candidateController.test.ts`** - Controller tests:
   - **201 responses:** Successful creation with full data, with minimal data
   - **400 responses:** Validation errors, duplicate email, empty body, null body
   - **500 responses:** Unexpected server errors, non-Error exceptions
   - **Edge cases:** Missing content-type header, malformed JSON

4. **`frontend/cypress/e2e/candidates.cy.ts`** - E2E tests:
   - Navigate to add candidate form
   - Submit valid candidate data
   - Validate required fields show errors when empty
   - Validate email format
   - Add and remove education entries
   - Add and remove work experience entries
   - Upload CV file
   - Verify success message after creation
   - Verify error message on server failure

#### Test Coverage Requirements

- **Minimum 90% coverage** for branches, functions, lines, and statements
- Coverage reports generated with `npm run test:coverage`
- Coverage files stored in `coverage/` directory with date format: `YYYYMMDD-backend-coverage.md`

---

### Documentation Updates

1. **`ai-specs/specs/api-spec.yml`**
   - Verify `POST /candidates` endpoint specification is accurate
   - Verify `POST /upload` endpoint specification
   - Add any missing schemas or response codes

2. **`ai-specs/specs/data-model.md`**
   - Verify Candidate, Education, WorkExperience, Resume model documentation matches implementation

3. **`backend/prisma/schema.prisma`**
   - Acts as single source of truth for database structure after migration

---

### Definition of Done

**Development:**
- [ ] Prisma schema updated with Candidate, Education, WorkExperience, Resume models
- [ ] Database migration created and applied (`npx prisma migrate dev --name add_candidate_models`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Domain models implemented (`Candidate.ts`, `Education.ts`, `WorkExperience.ts`, `Resume.ts`)
- [ ] Validation function implemented (`validateCandidateData` in `validator.ts`)
- [ ] Service layer implemented (`candidateService.ts` with `addCandidate`)
- [ ] Controller implemented (`candidateController.ts` with `addCandidateController`)
- [ ] Routes configured (`candidateRoutes.ts` → `POST /candidates`)
- [ ] File upload endpoint implemented (`POST /upload` with multer)
- [ ] Frontend form component created (`AddCandidateForm.tsx`)
- [ ] Frontend service created (`candidateService.ts`)
- [ ] Frontend routing configured (`/candidates/add`)
- [ ] Dashboard with "Add Candidate" button created (`RecruiterDashboard.tsx`)
- [ ] CORS configured for frontend origin
- [ ] Error handling implemented (client & server)

**Testing:**
- [ ] Validator unit tests written and passing (>90% coverage)
- [ ] Service layer unit tests written and passing (>90% coverage)
- [ ] Controller unit tests written and passing (>90% coverage)
- [ ] Cypress E2E tests written and passing
- [ ] Manual testing completed
- [ ] Edge cases tested (validation, duplicate emails, file upload limits)

**Documentation:**
- [ ] API specification reviewed and updated if needed
- [ ] Data model documentation reviewed
- [ ] Code follows English-only language standard

**Quality:**
- [ ] Code review completed
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] All tests passing (`npm test`)
- [ ] Code follows DDD layered architecture
- [ ] SOLID principles applied

**Deployment:**
- [ ] Database migration created and tested
- [ ] Environment configuration documented (`.env.example`)
- [ ] Uploads directory configured and accessible

---

### Acceptance Criteria (Given/When/Then)

**AC1: Recruiter can access the add candidate form**
- Given I am on the recruiter dashboard
- When I click the "Add Candidate" button
- Then I am navigated to the add candidate form at `/candidates/add`

**AC2: Recruiter can submit a complete candidate profile**
- Given I am on the add candidate form
- When I fill in all required fields (first name, last name, email) and optional fields (phone, address, education, work experience, CV) and click "Save"
- Then the candidate is created successfully and I see a success confirmation message

**AC3: System validates required fields**
- Given I am on the add candidate form
- When I attempt to submit the form with empty required fields (firstName, lastName, or email)
- Then the form displays specific validation error messages for each missing field and the form is not submitted

**AC4: System validates email format and uniqueness**
- Given I am on the add candidate form
- When I enter an invalid email format or an email that already exists in the system
- Then I see a clear error message explaining the issue ("A valid email address is required" or "Email already exists in the system")

**AC5: Recruiter can add education records**
- Given I am on the add candidate form
- When I click "Add Education" and fill in institution, title, and start date
- Then the education entry is added to the form and included in the submission (maximum 3 records)

**AC6: Recruiter can add work experience records**
- Given I am on the add candidate form
- When I click "Add Work Experience" and fill in company, position, and start date
- Then the work experience entry is added to the form and included in the submission

**AC7: Recruiter can upload a CV**
- Given I am on the add candidate form
- When I select a PDF or DOCX file (max 10MB) using the file upload input
- Then the file is uploaded and associated with the candidate record

**AC8: System handles errors gracefully**
- Given the system encounters an error during candidate creation (e.g., server failure, network error)
- When the error occurs
- Then a user-friendly error message is displayed and the form data is preserved (not cleared)

**AC9: System validates phone format**
- Given I am on the add candidate form
- When I enter a phone number that doesn't follow the Spanish format (6XXXXXXXX, 7XXXXXXXX, or 9XXXXXXXX)
- Then I see a validation error message explaining the expected format

**AC10: Form is responsive and accessible**
- Given I access the application from any modern browser or device
- When I navigate to the add candidate form
- Then the form is fully functional, responsive, and follows accessibility standards (aria-labels, keyboard navigation)

---

### Non-Functional Requirements

**Usability:**
- Form provides clear, field-level validation messages in real-time
- Loading spinner displayed during form submission
- Success message displayed after successful creation with auto-navigation to dashboard (2s delay)
- Form sections (Personal Info, Education, Work Experience, CV) are clearly separated with cards/panels
- Dynamic add/remove buttons for education and work experience sections

**Performance:**
- Candidate creation API responds within 500ms
- File upload handles up to 10MB files
- Atomic database operations using Prisma nested creates (no partial saves)

**Reliability:**
- Proper error handling at all layers (controller, service, validation)
- Form data preserved on submission failure
- Graceful degradation when file upload fails (candidate still created without CV)

**Security:**
- Input validation on both client and server side
- SQL injection prevention via Prisma parameterized queries
- XSS protection via React JSX escaping
- File upload validation (MIME type + extension + size)
- Unique file names to prevent path traversal

**Maintainability:**
- Clean DDD architecture (domain, application, presentation layers)
- Full TypeScript type safety
- Comprehensive test coverage (>90%)
- English-only codebase (variables, comments, error messages, documentation)

**Scalability:**
- Efficient database queries using Prisma nested creates
- No blocking operations in async handlers

---

### Implementation Notes

**Key Implementation Decisions:**
1. **Nested Create**: Use Prisma's nested `create` to atomically persist candidate with all related entities (educations, work experiences, resume) in a single transaction
2. **File Upload Flow**: CV upload is a two-step process - first upload the file via `POST /upload`, then include the returned `filePath` and `fileType` in the candidate creation request
3. **Dynamic Form Sections**: Education and work experience sections use array state management with add/remove functionality
4. **Error Messages**: All error messages in English per project language standards
5. **Validation Strategy**: Server-side validation is the source of truth; client-side validation provides UX convenience only
6. **Navigation**: After successful creation, redirect to dashboard with a success toast/alert after 2-second delay
7. **Phone Format**: Spanish phone format validation as specified in data model (starts with 6, 7, or 9, followed by 8 digits)
8. **Education Limit**: Maximum of 3 education records per candidate as defined in data model
