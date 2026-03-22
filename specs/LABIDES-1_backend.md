# Backend Implementation Plan: LABIDES-1 Add Candidate

## Overview

Implement the `POST /candidates` endpoint and the `POST /upload` endpoint to allow recruiters to create new candidate records in the ATS system. The candidate aggregate includes personal information, education history, work experience, and an optional CV (resume) upload.

This is a **greenfield implementation**: the backend currently has only a minimal Express app (`index.ts`), a basic Prisma schema with a `User` model, and no DDD folder structure. All layers (domain, application, presentation, infrastructure, routes) must be created from scratch.

The implementation follows **Domain-Driven Design (DDD)** with a **layered architecture** as defined in `ai-specs/specs/backend-standards.mdc`, applying **TDD** (write failing tests first), **SOLID principles**, and **English-only** language standards.

---

## Architecture Context

### Layers Involved

| Layer          | Directory                    | Responsibility                                    |
|----------------|------------------------------|---------------------------------------------------|
| Domain         | `src/domain/models/`         | Candidate aggregate root + child entities          |
| Application    | `src/application/`           | Validation (`validator.ts`), service orchestration |
| Presentation   | `src/presentation/controllers/` | HTTP request/response handling                  |
| Infrastructure | `src/infrastructure/`        | PrismaClient singleton, Logger                     |
| Routes         | `src/routes/`                | Express route definitions                          |
| Middleware     | `src/middleware/`            | File upload (multer), error handling               |

### Files to Create

| File Path                                                          | Purpose                                    |
|--------------------------------------------------------------------|--------------------------------------------|
| `src/domain/models/Candidate.ts`                                   | Aggregate root entity                      |
| `src/domain/models/Education.ts`                                   | Child entity                               |
| `src/domain/models/WorkExperience.ts`                              | Child entity                               |
| `src/domain/models/Resume.ts`                                      | Child entity                               |
| `src/application/validator.ts`                                     | Input validation for candidate data        |
| `src/application/services/candidateService.ts`                     | Business logic orchestration               |
| `src/presentation/controllers/candidateController.ts`              | HTTP controller                            |
| `src/routes/candidateRoutes.ts`                                    | Route definitions                          |
| `src/infrastructure/prismaClient.ts`                               | Singleton PrismaClient                     |
| `src/infrastructure/logger.ts`                                     | Centralized logging                        |
| `src/middleware/uploadMiddleware.ts`                                | Multer config for file uploads             |
| `src/middleware/securityMiddleware.ts`                              | Helmet, rate limiting, input sanitization  |
| `src/presentation/controllers/uploadController.ts`                 | File upload HTTP controller                |
| `src/routes/uploadRoutes.ts`                                       | Upload route definition                    |

### Files to Modify

| File Path                     | Changes                                                         |
|-------------------------------|-----------------------------------------------------------------|
| `prisma/schema.prisma`        | Add Candidate, Education, WorkExperience, Resume models         |
| `src/index.ts`                | Add CORS, body parser, routes, error middleware, uploads folder  |
| `jest.config.js`              | Add coverage thresholds, `__tests__` pattern, path mappings     |
| `package.json`                | Add dependencies (cors, multer, uuid) and scripts               |

### Test Files to Create

| File Path                                                                    | Scope                    |
|------------------------------------------------------------------------------|--------------------------|
| `src/application/__tests__/validator.test.ts`                                | Validation logic         |
| `src/application/__tests__/candidateService.test.ts`                         | Service layer            |
| `src/presentation/controllers/__tests__/candidateController.test.ts`         | Controller layer         |
| `src/presentation/controllers/__tests__/uploadController.test.ts`            | Upload controller        |
| `test-utils/builders/candidateBuilder.ts`                                    | Test data factory         |
| `test-utils/mocks/prismaMock.ts`                                             | Prisma mock helper       |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action**: Create and switch to a new feature branch following the development workflow
- **Branch Name**: `feature/LABIDES-1-backend`
- **Implementation Steps**:
  1. Ensure you are on the `main` branch: `git checkout main`
  2. Pull latest changes: `git pull origin main`
  3. Create new branch: `git checkout -b feature/LABIDES-1-backend`
  4. Verify branch creation: `git branch`
- **Notes**: This MUST be the FIRST step before any code changes. If the branch already exists, switch to it. Do NOT keep working on a general `LABIDES-1` branch; always use the `-backend` suffix to separate concerns per `backend-standards.mdc` "Development Workflow" section.

---

### Step 1: Install Dependencies and Configure Project

- **File**: `backend/package.json`
- **Action**: Install required dependencies that are missing from the current project
- **Implementation Steps**:
  1. Install production dependencies:
     ```bash
     npm install cors multer uuid helmet express-rate-limit sanitize-html
     ```
  2. Install dev dependencies:
     ```bash
     npm install --save-dev @types/cors @types/multer @types/uuid @types/sanitize-html
     ```
  3. Add scripts to `package.json`:
     ```json
     "test:coverage": "jest --coverage",
     "lint": "eslint 'src/**/*.ts'"
     ```

- **File**: `backend/jest.config.js`
- **Action**: Update Jest configuration to support `__tests__` directories and coverage thresholds
- **Updated Configuration**:
  ```javascript
  module.exports = {
    roots: ['<rootDir>/src'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    coverageThreshold: {
      global: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/test-utils/',
    ],
  };
  ```

---

### Step 2: Update Prisma Schema and Run Migration

- **File**: `backend/prisma/schema.prisma`
- **Action**: Add Candidate, Education, WorkExperience, and Resume models
- **Implementation Steps**:
  1. Keep existing `User` model unchanged
  2. Add the four new models with all fields, constraints, and relations as defined in the enhanced ticket:

  ```prisma
  model Candidate {
    id              Int              @id @default(autoincrement())
    firstName       String           @db.VarChar(100)
    lastName        String           @db.VarChar(100)
    email           String           @unique @db.VarChar(255)
    phone           String?          @db.VarChar(15)
    address         String?          @db.VarChar(100)
    consentDate     DateTime         @default(now())
    educations      Education[]
    workExperiences WorkExperience[]
    resumes         Resume[]
  }

  model Education {
    id          Int       @id @default(autoincrement())
    institution String    @db.VarChar(100)
    title       String    @db.VarChar(250)
    startDate   DateTime
    endDate     DateTime?
    candidateId Int
    candidate   Candidate @relation(fields: [candidateId], references: [id])
  }

  model WorkExperience {
    id          Int       @id @default(autoincrement())
    company     String    @db.VarChar(100)
    position    String    @db.VarChar(100)
    description String?   @db.VarChar(200)
    startDate   DateTime
    endDate     DateTime?
    candidateId Int
    candidate   Candidate @relation(fields: [candidateId], references: [id])
  }

  model Resume {
    id          Int      @id @default(autoincrement())
    filePath    String   @db.VarChar(500)
    fileType    String   @db.VarChar(50)
    uploadDate  DateTime @default(now())
    candidateId Int
    candidate   Candidate @relation(fields: [candidateId], references: [id])
  }
  ```

  3. Run migration:
     ```bash
     npx prisma migrate dev --name add_candidate_models
     ```
  4. Generate Prisma client:
     ```bash
     npx prisma generate
     ```

- **Verification**: Confirm migration was applied successfully and no errors occurred. Check that the `migrations/` folder contains the new migration file.

---

### Step 3: Create Infrastructure Layer

#### Step 3a: Create PrismaClient Singleton

- **File**: `backend/src/infrastructure/prismaClient.ts`
- **Action**: Extract PrismaClient into a reusable singleton module
- **Function Signature**:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  const prisma: PrismaClient;
  export default prisma;
  ```
- **Implementation Steps**:
  1. Create `src/infrastructure/` directory
  2. Create `prismaClient.ts` that instantiates a single `PrismaClient`
  3. Export the instance as default
- **Notes**: This replaces the `prisma` instance in `index.ts`. After creating this file, update `index.ts` to import from here instead of creating its own instance.

#### Step 3b: Create Logger

- **File**: `backend/src/infrastructure/logger.ts`
- **Action**: Create a centralized logger class with PII masking
- **Function Signature**:
  ```typescript
  export class Logger {
    info(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
    private maskPII(meta: Record<string, unknown>): Record<string, unknown>;
  }
  ```
- **Implementation Steps**:
  1. Create `Logger` class with methods for each log level
  2. Each method should output structured JSON-like logs with timestamp, level, message, and optional metadata
  3. Implement `maskPII()` private method that automatically masks sensitive fields before logging:
     - `email`: `j***@example.com` (show first char + masked + domain)
     - `phone`: `6****5678` (show first and last 4 digits)
     - `firstName`, `lastName`: `J***` (show first char only)
     - `address`: `[REDACTED]`
     - Any field containing `password`, `token`, `secret`: `[REDACTED]`
  4. Apply `maskPII()` to all metadata objects before writing to output
  5. Export the class
- **Security Notes**: Never log raw PII. The masking ensures that if candidate data accidentally ends up in log metadata, sensitive information is not exposed in plain text.

#### Step 3c: Create Security Middleware

- **File**: `backend/src/middleware/securityMiddleware.ts`
- **Action**: Create centralized security middleware for the Express application
- **Implementation Steps**:
  1. **Helmet configuration**: Configure `helmet()` with secure defaults for HTTP headers:
     ```typescript
     import helmet from 'helmet';
     export const helmetMiddleware = helmet();
     ```
  2. **Rate limiting**: Configure `express-rate-limit` to prevent abuse:
     ```typescript
     import rateLimit from 'express-rate-limit';

     export const apiLimiter = rateLimit({
       windowMs: 15 * 60 * 1000, // 15 minutes
       max: 100, // limit each IP to 100 requests per windowMs
       standardHeaders: true,
       legacyHeaders: false,
       message: { message: 'Too many requests', error: 'Please try again later' },
     });

     export const uploadLimiter = rateLimit({
       windowMs: 15 * 60 * 1000,
       max: 20, // stricter limit for file uploads
       standardHeaders: true,
       legacyHeaders: false,
       message: { message: 'Too many upload requests', error: 'Please try again later' },
     });
     ```
  3. **Input sanitization middleware**: Create middleware that sanitizes string fields in `req.body` to prevent XSS:
     ```typescript
     import sanitizeHtml from 'sanitize-html';

     export function sanitizeInputMiddleware(req: Request, _res: Response, next: NextFunction): void {
       if (req.body && typeof req.body === 'object') {
         req.body = sanitizeObject(req.body);
       }
       next();
     }

     function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
       const sanitized: Record<string, unknown> = {};
       for (const [key, value] of Object.entries(obj)) {
         if (typeof value === 'string') {
           sanitized[key] = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
         } else if (Array.isArray(value)) {
           sanitized[key] = value.map(item =>
             typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : item
           );
         } else if (typeof value === 'object' && value !== null) {
           sanitized[key] = sanitizeObject(value as Record<string, unknown>);
         } else {
           sanitized[key] = value;
         }
       }
       return sanitized;
     }
     ```
  4. Export all middleware functions
- **Dependencies**: `helmet`, `express-rate-limit`, `sanitize-html`
- **Security Notes**: 
  - Helmet sets secure HTTP headers (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.)
  - Rate limiting protects against brute-force attacks and API abuse
  - Input sanitization strips HTML/script tags from all text inputs to prevent stored XSS

---

### Step 4: Create Test Utilities

#### Step 4a: Create Prisma Mock Helper

- **File**: `backend/test-utils/mocks/prismaMock.ts`
- **Action**: Create a reusable Prisma mock for unit tests
- **Implementation Steps**:
  1. Create `test-utils/mocks/` directory
  2. Create a mock that provides `jest.fn()` implementations for all Prisma model methods used (`create`, `findUnique`, `findMany`, `findFirst`)
  3. Export the mock object

#### Step 4b: Create Candidate Test Data Builder

- **File**: `backend/test-utils/builders/candidateBuilder.ts`
- **Action**: Create a factory function for generating test candidate data
- **Function Signature**:
  ```typescript
  export function buildCandidateData(overrides?: Partial<CandidateData>): CandidateData;
  export function buildEducationData(overrides?: Partial<EducationData>): EducationData;
  export function buildWorkExperienceData(overrides?: Partial<WorkExperienceData>): WorkExperienceData;
  export function buildResumeData(overrides?: Partial<ResumeData>): ResumeData;
  ```
- **Implementation Steps**:
  1. Create `test-utils/builders/` directory
  2. Define TypeScript interfaces for all data shapes (`CandidateData`, `EducationData`, `WorkExperienceData`, `ResumeData`)
  3. Implement builder functions that return realistic default data
  4. Accept optional `overrides` parameter for customizing specific fields
- **Notes**: Use realistic data (e.g., `firstName: 'John'`, `email: 'john.doe@example.com'`). These builders will be used across all test files.

---

### Step 5: Create Domain Models

**TDD approach**: For domain models, write the model first since they are data structures. Tests for behavior will come at the service layer.

#### Step 5a: Create Education Model

- **File**: `backend/src/domain/models/Education.ts`
- **Action**: Create the Education child entity class
- **Function Signature**:
  ```typescript
  export interface EducationData {
    id?: number;
    institution: string;
    title: string;
    startDate: string | Date;
    endDate?: string | Date | null;
    candidateId?: number;
  }

  export class Education {
    id?: number;
    institution: string;
    title: string;
    startDate: Date;
    endDate?: Date;
    candidateId?: number;

    constructor(data: EducationData);
  }
  ```
- **Implementation Steps**:
  1. Create `src/domain/models/` directory
  2. Define `EducationData` interface with all fields
  3. Implement constructor that maps data properties and converts date strings to `Date` objects
- **Dependencies**: None

#### Step 5b: Create WorkExperience Model

- **File**: `backend/src/domain/models/WorkExperience.ts`
- **Action**: Create the WorkExperience child entity class
- **Function Signature**:
  ```typescript
  export interface WorkExperienceData {
    id?: number;
    company: string;
    position: string;
    description?: string | null;
    startDate: string | Date;
    endDate?: string | Date | null;
    candidateId?: number;
  }

  export class WorkExperience {
    id?: number;
    company: string;
    position: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    candidateId?: number;

    constructor(data: WorkExperienceData);
  }
  ```
- **Implementation Steps**:
  1. Define `WorkExperienceData` interface
  2. Implement constructor with date conversion and optional field handling
- **Dependencies**: None

#### Step 5c: Create Resume Model

- **File**: `backend/src/domain/models/Resume.ts`
- **Action**: Create the Resume child entity class
- **Function Signature**:
  ```typescript
  export interface ResumeData {
    id?: number;
    filePath: string;
    fileType: string;
    uploadDate?: string | Date;
    candidateId?: number;
  }

  export class Resume {
    id?: number;
    filePath: string;
    fileType: string;
    uploadDate: Date;
    candidateId?: number;

    constructor(data: ResumeData);
  }
  ```
- **Implementation Steps**:
  1. Define `ResumeData` interface
  2. Implement constructor; `uploadDate` defaults to `new Date()` if not provided
- **Dependencies**: None

#### Step 5d: Create Candidate Model (Aggregate Root)

- **File**: `backend/src/domain/models/Candidate.ts`
- **Action**: Create the Candidate aggregate root entity with persistence methods
- **Function Signature**:
  ```typescript
  export interface CandidateData {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    consentDate?: string | Date;
    educations?: EducationData[];
    workExperiences?: WorkExperienceData[];
    cv?: ResumeData;
    resumes?: ResumeData[];
  }

  export class Candidate {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    consentDate: Date;
    educations: Education[];
    workExperiences: WorkExperience[];
    resumes: Resume[];

    constructor(data: CandidateData);
    async save(): Promise<Candidate>;
    static async findOne(id: number): Promise<Candidate | null>;
    static async findByEmail(email: string): Promise<Candidate | null>;
  }
  ```
- **Implementation Steps**:
  1. Define `CandidateData` interface
  2. Implement constructor that:
     - Maps primitive properties
     - Creates `Education[]` from `data.educations` using `new Education(edu)`
     - Creates `WorkExperience[]` from `data.workExperiences` using `new WorkExperience(we)`
     - Creates `Resume[]` from `data.resumes` (or from `data.cv` as single item) using `new Resume(r)`
  3. Implement `save()` method:
     - Uses Prisma `candidate.create()` with nested `create` for educations, workExperiences, and resumes
     - Returns a new `Candidate` instance from the created data (including generated `id`)
     - Include relations in the response: `include: { educations: true, workExperiences: true, resumes: true }`
  4. Implement `findOne(id)`:
     - Uses `prisma.candidate.findUnique({ where: { id }, include: { educations: true, workExperiences: true, resumes: true } })`
     - Returns `new Candidate(data)` or `null`
  5. Implement `findByEmail(email)`:
     - Uses `prisma.candidate.findFirst({ where: { email } })`
     - Returns `new Candidate(data)` or `null`
- **Dependencies**: `Education`, `WorkExperience`, `Resume`, `prisma` from infrastructure

---

### Step 6: Create Validation Function (TDD)

- **File**: `backend/src/application/validator.ts`
- **Action**: Implement `validateCandidateData` function with comprehensive validation rules
- **Test File**: `backend/src/application/__tests__/validator.test.ts` (**write tests FIRST**)

#### Step 6a: Write Validator Tests

- **File**: `backend/src/application/__tests__/validator.test.ts`
- **Action**: Write comprehensive tests for `validateCandidateData` BEFORE implementing the function
- **Test Structure**:

  ```typescript
  describe('validateCandidateData', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    describe('should_pass_validation_when_valid_data', () => {
      it('should pass with complete valid candidate data');
      it('should pass with only required fields (no education, no experience, no CV)');
    });

    describe('should_fail_validation_when_invalid_firstName', () => {
      it('should fail when firstName is missing');
      it('should fail when firstName is empty string');
      it('should fail when firstName is shorter than 2 characters');
      it('should fail when firstName exceeds 100 characters');
      it('should fail when firstName contains numbers');
    });

    describe('should_fail_validation_when_invalid_lastName', () => {
      // Same cases as firstName
    });

    describe('should_fail_validation_when_invalid_email', () => {
      it('should fail when email is missing');
      it('should fail when email is empty string');
      it('should fail when email has invalid format (no @)');
      it('should fail when email has invalid format (no domain)');
    });

    describe('should_fail_validation_when_invalid_phone', () => {
      it('should pass when phone is not provided (optional)');
      it('should fail when phone does not start with 6, 7, or 9');
      it('should fail when phone has fewer than 9 digits');
      it('should fail when phone has more than 9 digits');
      it('should pass with valid phone starting with 6');
      it('should pass with valid phone starting with 7');
      it('should pass with valid phone starting with 9');
    });

    describe('should_fail_validation_when_invalid_address', () => {
      it('should pass when address is not provided (optional)');
      it('should fail when address exceeds 100 characters');
    });

    describe('should_fail_validation_when_invalid_educations', () => {
      it('should pass when educations is empty array');
      it('should fail when more than 3 education records');
      it('should fail when institution is missing');
      it('should fail when institution exceeds 100 characters');
      it('should fail when title is missing');
      it('should fail when title exceeds 250 characters');
      it('should fail when startDate is missing');
      it('should fail when startDate is invalid');
      it('should fail when endDate is before startDate');
      it('should pass when endDate is null (ongoing)');
    });

    describe('should_fail_validation_when_invalid_workExperiences', () => {
      it('should pass when workExperiences is empty array');
      it('should fail when company is missing');
      it('should fail when company exceeds 100 characters');
      it('should fail when position is missing');
      it('should fail when position exceeds 100 characters');
      it('should fail when description exceeds 200 characters');
      it('should fail when startDate is missing');
      it('should fail when endDate is before startDate');
    });

    describe('should_fail_validation_when_invalid_cv', () => {
      it('should pass when cv is not provided');
      it('should fail when filePath is missing but cv object is provided');
      it('should fail when filePath exceeds 500 characters');
      it('should fail when fileType is not PDF or DOCX');
      it('should pass with valid PDF fileType');
      it('should pass with valid DOCX fileType');
    });
  });
  ```

- **Notes**: Every test should follow the **Arrange-Act-Assert** pattern. Use the `buildCandidateData()` builder from `test-utils/builders/candidateBuilder.ts` for test data.

#### Step 6b: Implement Validator

- **File**: `backend/src/application/validator.ts`
- **Function Signature**:
  ```typescript
  export function validateCandidateData(data: unknown): CandidateData;
  ```
- **Implementation Steps**:
  1. Validate `firstName`: required, string, 2-100 chars, letters and spaces only (regex: `/^[a-zA-ZÀ-ÿ\s]+$/`)
  2. Validate `lastName`: same rules as firstName
  3. Validate `email`: required, string, valid email format (regex or basic check for `@` and domain)
  4. Validate `phone` (if provided): Spanish format regex `/^[679]\d{8}$/`
  5. Validate `address` (if provided): string, max 100 chars
  6. Validate `educations` array (if provided):
     - Max 3 items
     - Each item: `institution` (required, max 100), `title` (required, max 250), `startDate` (required, valid date), `endDate` (optional, must be >= startDate)
  7. Validate `workExperiences` array (if provided):
     - Each item: `company` (required, max 100), `position` (required, max 100), `description` (optional, max 200), `startDate` (required), `endDate` (optional, >= startDate)
  8. Validate `cv` (if provided):
     - `filePath` (required, max 500), `fileType` (must be `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
  9. Collect ALL errors into an array and throw a single error with all validation messages if any fail
  10. Return validated/typed data if all checks pass
- **Error Format**: Throw an `Error` with message being a JSON-serializable array of error strings, or a single descriptive string. The controller will catch this and return 400.
- **Dependencies**: `CandidateData` interface from domain model

---

### Step 7: Create Candidate Service (TDD)

- **Test File**: `backend/src/application/__tests__/candidateService.test.ts` (**write tests FIRST**)
- **File**: `backend/src/application/services/candidateService.ts`

#### Step 7a: Write Service Tests

- **File**: `backend/src/application/__tests__/candidateService.test.ts`
- **Action**: Write comprehensive tests for `addCandidate` service function
- **Mocking**: Mock `validator.ts` (`validateCandidateData`), mock `Candidate` model (`findByEmail`, `save`, constructor)
- **Test Structure**:

  ```typescript
  import { addCandidate } from '../services/candidateService';

  jest.mock('../../domain/models/Candidate');
  jest.mock('../validator');

  describe('CandidateService - addCandidate', () => {
    beforeEach(() => { jest.clearAllMocks(); });

    describe('should_create_candidate_when_valid_data', () => {
      it('should create candidate with all fields successfully');
      it('should create candidate with only required fields');
      it('should create candidate with empty educations array');
      it('should create candidate with empty workExperiences array');
    });

    describe('should_fail_when_duplicate_email', () => {
      it('should throw generic error when email already exists (no email enumeration)');
    });

    describe('should_fail_when_validation_fails', () => {
      it('should propagate validation error from validateCandidateData');
    });

    describe('should_handle_database_errors', () => {
      it('should throw error when Prisma save fails');
    });

    describe('should_handle_edge_cases', () => {
      it('should handle null optional fields gracefully');
    });
  });
  ```

#### Step 7b: Implement Candidate Service

- **File**: `backend/src/application/services/candidateService.ts`
- **Function Signature**:
  ```typescript
  export async function addCandidate(candidateData: unknown): Promise<Candidate>;
  ```
- **Implementation Steps**:
  1. Call `validateCandidateData(candidateData)` — throws on invalid data
  2. Call `Candidate.findByEmail(validatedData.email)` — if result is not null, throw `new Error('The candidate could not be registered')`
  3. Create `new Candidate(validatedData)`
  4. Call `candidate.save()`
  5. Return the saved candidate
- **Dependencies**: `validateCandidateData` from `../validator`, `Candidate` from `../../domain/models/Candidate`
- **Error Handling**: Let validation errors and duplicate email errors propagate to the controller. Catch and re-throw Prisma errors with a descriptive message.
- **Security Notes**: The duplicate email error uses a generic message (`'The candidate could not be registered'`) instead of revealing whether the email exists in the system. This prevents email enumeration attacks where an attacker could probe the API to discover which emails are registered. The specific reason (duplicate email) should be logged server-side for debugging but not returned to the client.

---

### Step 8: Create Candidate Controller (TDD)

- **Test File**: `backend/src/presentation/controllers/__tests__/candidateController.test.ts` (**write tests FIRST**)
- **File**: `backend/src/presentation/controllers/candidateController.ts`

#### Step 8a: Write Controller Tests

- **File**: `backend/src/presentation/controllers/__tests__/candidateController.test.ts`
- **Action**: Write comprehensive tests for the `addCandidateController` function
- **Mocking**: Mock `candidateService.addCandidate`
- **Mock Setup**: Create mock Express `Request` and `Response` objects with `jest.fn()` for `status`, `json`, and `next`
- **Test Structure**:

  ```typescript
  jest.mock('../../../application/services/candidateService');

  describe('CandidateController - addCandidateController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      jest.clearAllMocks();
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    describe('should_return_201_when_successful', () => {
      it('should return 201 with created candidate data for full request');
      it('should return 201 with created candidate data for minimal request');
    });

    describe('should_return_400_when_validation_error', () => {
      it('should return 400 when validation fails');
      it('should return 400 when email already exists');
      it('should return 400 when request body is empty');
      it('should return 400 when request body is null');
    });

    describe('should_return_500_when_server_error', () => {
      it('should return 500 for unexpected errors');
      it('should return 500 for non-Error exceptions');
    });

    describe('should_handle_edge_cases', () => {
      it('should handle request body with extra unknown fields');
    });
  });
  ```

#### Step 8b: Implement Candidate Controller

- **File**: `backend/src/presentation/controllers/candidateController.ts`
- **Function Signature**:
  ```typescript
  export async function addCandidateController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  ```
- **Implementation Steps**:
  1. Extract `req.body` as candidate data
  2. Validate body is not empty/null — if empty, return 400 with `{ message: 'Validation error', error: 'No data provided' }`
  3. Call `addCandidate(req.body)` from service
  4. On success: return `res.status(201).json(candidate)` with the created candidate data
  5. On error:
     - If error message contains `'Validation'` or `'could not be registered'` or `'required'`: return `res.status(400).json({ message: 'Validation error', error: error.message })`
     - Otherwise: return `res.status(500).json({ message: 'Error creating candidate', error: error.message || 'Internal server error' })`
  6. Log errors using Logger
- **Dependencies**: `addCandidate` from `../../application/services/candidateService`, `Logger` from `../../infrastructure/logger`

---

### Step 9: Create File Upload Middleware and Controller

#### Step 9a: Create Upload Middleware

- **File**: `backend/src/middleware/uploadMiddleware.ts`
- **Action**: Configure multer for secure file uploads with content validation
- **Implementation Steps**:
  1. Configure multer disk storage:
     - `destination`: `uploads/` directory (create if not exists)
     - `filename`: Generate unique name using UUID + original extension (never use the original filename to prevent path traversal)
  2. Configure file filter: only accept `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  3. Set file size limit: 10MB (`10 * 1024 * 1024`)
  4. **Magic bytes validation**: After multer saves the file, verify the file content matches its claimed MIME type by reading the first bytes (magic numbers):
     - PDF: starts with `%PDF` (hex: `25 50 44 46`)
     - DOCX: starts with `PK` (hex: `50 4B 03 04`) — DOCX files are ZIP archives
     - If magic bytes don't match, delete the uploaded file and reject with 400
  5. Export configured multer instance and validation function
- **Dependencies**: `multer`, `uuid`, `path`, `fs`
- **Security Notes**: 
  - The MIME type sent by the client (`req.file.mimetype`) can be spoofed. Magic bytes validation ensures the file content is genuinely a PDF or DOCX.
  - Using UUID filenames prevents path traversal attacks and information disclosure from original filenames.
  - The `uploads/` directory must NOT be served statically to prevent unauthorized access to candidate CVs.

#### Step 9b: Create Upload Controller

- **File**: `backend/src/presentation/controllers/uploadController.ts`
- **Function Signature**:
  ```typescript
  export async function uploadFileController(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  ```
- **Implementation Steps**:
  1. Check if `req.file` exists — if not, return 400 with `{ message: 'No file uploaded' }`
  2. Return 200 with `{ filePath: req.file.path, fileType: req.file.mimetype }`
  3. Handle multer errors (file too large, invalid type) with 400 responses
- **Dependencies**: Express types

#### Step 9c: Write Upload Controller Tests

- **File**: `backend/src/presentation/controllers/__tests__/uploadController.test.ts`
- **Test Structure**:
  ```typescript
  describe('UploadController - uploadFileController', () => {
    it('should return 200 with file path and type on successful upload');
    it('should return 400 when no file is provided');
    it('should return 400 when file has valid MIME but invalid magic bytes');
  });
  ```

---

### Step 10: Create Routes

#### Step 10a: Create Candidate Routes

- **File**: `backend/src/routes/candidateRoutes.ts`
- **Implementation**:
  ```typescript
  import { Router } from 'express';
  import { addCandidateController } from '../presentation/controllers/candidateController';

  const router = Router();

  router.post('/', addCandidateController);

  export default router;
  ```

#### Step 10b: Create Upload Routes

- **File**: `backend/src/routes/uploadRoutes.ts`
- **Implementation**:
  ```typescript
  import { Router } from 'express';
  import { upload } from '../middleware/uploadMiddleware';
  import { uploadFileController } from '../presentation/controllers/uploadController';

  const router = Router();

  router.post('/', upload.single('file'), uploadFileController);

  export default router;
  ```

---

### Step 11: Update Application Entry Point

- **File**: `backend/src/index.ts`
- **Action**: Integrate all new components including security middleware into the Express application
- **Implementation Steps**:
  1. Replace inline `PrismaClient` with import from `./infrastructure/prismaClient`
  2. Add security middleware FIRST (helmet, rate limiting, sanitization) — these must be applied before any route handling
  3. Add `express.json()` middleware for JSON body parsing with body size limit (`limit: '1mb'`)
  4. Add `cors` middleware configured for frontend origin (`http://localhost:3000`)
  5. Apply `sanitizeInputMiddleware` after body parsing to sanitize all incoming text
  6. Import and mount `candidateRoutes` at `/candidates` with `apiLimiter`
  7. Import and mount `uploadRoutes` at `/upload` with `uploadLimiter`
  8. Ensure the `uploads/` directory exists (create with `fs.mkdirSync` if not)
  9. **Do NOT serve `uploads/` as static files** — files should only be accessible through an authenticated endpoint (future implementation)
  10. Move the error handling middleware to the END (after all routes)
  11. Update error middleware to return JSON responses instead of plain text. Never expose stack traces or internal error details in production.
  12. Keep the existing `GET /` route for health check

- **Updated Structure**:
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import candidateRoutes from './routes/candidateRoutes';
  import uploadRoutes from './routes/uploadRoutes';
  import { helmetMiddleware, apiLimiter, uploadLimiter, sanitizeInputMiddleware } from './middleware/securityMiddleware';

  dotenv.config();

  export const app = express();
  const port = 3010;

  // Security middleware (must be first)
  app.use(helmetMiddleware);

  // Standard middleware
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(sanitizeInputMiddleware);

  // Routes with rate limiting
  app.get('/', (req, res) => { res.send('Hola LTI!'); });
  app.use('/candidates', apiLimiter, candidateRoutes);
  app.use('/upload', uploadLimiter, uploadRoutes);

  // Error handling middleware (must be last)
  app.use((err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction ? 'Internal server error' : err.message;
    res.status(500).json({ message: 'Internal server error', error: errorMessage });
  });

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
  ```

---

### Step 12: Run Tests and Verify Coverage

- **Action**: Execute all tests and verify they pass with required coverage
- **Implementation Steps**:
  1. Run all tests: `npm test`
  2. Run with coverage: `npm run test:coverage`
  3. Verify 90%+ coverage for all categories (branches, functions, lines, statements)
  4. Fix any failing tests
  5. Save coverage report to `coverage/YYYYMMDD-backend-coverage.md`
- **Notes**: If coverage is below 90%, identify untested branches/paths and add additional test cases.

---

### Step 13: Manual Integration Testing

- **Action**: Manually test the complete flow
- **Implementation Steps**:
  1. Start PostgreSQL: `docker-compose up -d`
  2. Run migrations: `npx prisma migrate dev`
  3. Start backend: `npm run dev`
  4. Test health check: `GET http://localhost:3010/`
  5. Test candidate creation with full data:
     ```bash
     curl -X POST http://localhost:3010/candidates \
       -H "Content-Type: application/json" \
       -d '{
         "firstName": "John",
         "lastName": "Doe",
         "email": "john.doe@example.com",
         "phone": "612345678",
         "address": "123 Main St, Madrid",
         "educations": [{
           "institution": "MIT",
           "title": "Computer Science BSc",
           "startDate": "2015-09-01T00:00:00.000Z",
           "endDate": "2019-06-30T00:00:00.000Z"
         }],
         "workExperiences": [{
           "company": "Tech Corp",
           "position": "Software Engineer",
           "description": "Full-stack dev",
           "startDate": "2019-07-01T00:00:00.000Z"
         }]
       }'
     ```
  6. Verify 201 response with candidate data
  7. Test validation errors (empty body, invalid email, duplicate email)
  8. Test file upload:
     ```bash
     curl -X POST http://localhost:3010/upload \
       -F "file=@test-cv.pdf"
     ```
  9. Verify all error responses return correct HTTP status codes

---

### Step 14: Update Technical Documentation

- **Action**: Review and update technical documentation according to changes made
- **Implementation Steps**:
  1. **Review Changes**: Analyze all code changes made during implementation
  2. **Identify Documentation Files**: Determine which documentation files need updates:
     - Data model changes → Verify `ai-specs/specs/data-model.md` matches the implemented Prisma schema
     - API endpoint changes → Verify `ai-specs/specs/api-spec.yml` accurately documents `POST /candidates` and `POST /upload` endpoints
     - New dependencies/scripts → Update relevant sections if anything changed from the standards
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

1. **Step 0**: Create feature branch `feature/LABIDES-1-backend`
2. **Step 1**: Install dependencies and configure project (package.json, jest.config.js)
3. **Step 2**: Update Prisma schema and run migration
4. **Step 3**: Create infrastructure layer (PrismaClient singleton, Logger)
5. **Step 4**: Create test utilities (Prisma mock, test data builders)
6. **Step 5**: Create domain models (Education → WorkExperience → Resume → Candidate)
7. **Step 6**: Create validation function (TDD: tests first, then implementation)
8. **Step 7**: Create candidate service (TDD: tests first, then implementation)
9. **Step 8**: Create candidate controller (TDD: tests first, then implementation)
10. **Step 9**: Create file upload middleware and controller
11. **Step 10**: Create routes (candidate routes, upload routes)
12. **Step 11**: Update application entry point (index.ts)
13. **Step 12**: Run tests and verify coverage (90%+)
14. **Step 13**: Manual integration testing
15. **Step 14**: Update technical documentation

---

## Testing Checklist

### Unit Tests

- [ ] **Validator** (`validator.test.ts`):
  - [ ] Valid complete data passes
  - [ ] Valid minimal data passes (required fields only)
  - [ ] firstName validation (empty, short, long, numbers, null)
  - [ ] lastName validation (same as firstName)
  - [ ] email validation (empty, invalid format, missing @, missing domain)
  - [ ] phone validation (optional, invalid format, valid formats 6xx/7xx/9xx)
  - [ ] address validation (optional, too long)
  - [ ] educations validation (>3 records, missing fields, invalid dates, endDate < startDate)
  - [ ] workExperiences validation (missing fields, description too long, invalid dates)
  - [ ] cv validation (missing filePath, invalid fileType, valid PDF, valid DOCX)

- [ ] **Service** (`candidateService.test.ts`):
  - [ ] Create with full data
  - [ ] Create with minimal data
  - [ ] Reject duplicate email
  - [ ] Propagate validation errors
  - [ ] Handle database errors
  - [ ] Handle null optional fields

- [ ] **Controller** (`candidateController.test.ts`):
  - [ ] 201 with full data
  - [ ] 201 with minimal data
  - [ ] 400 for validation errors
  - [ ] 400 for duplicate email
  - [ ] 400 for empty body
  - [ ] 400 for null body
  - [ ] 500 for unexpected errors
  - [ ] 500 for non-Error exceptions

- [ ] **Upload Controller** (`uploadController.test.ts`):
  - [ ] 200 with valid file
  - [ ] 400 when no file provided

### Security Tests

- [ ] **Sanitization**: XSS payload in firstName (`<script>alert(1)</script>`) is stripped before storage
- [ ] **Sanitization**: HTML tags in address and description fields are stripped
- [ ] **Rate limiting**: Requests beyond the limit return 429
- [ ] **Magic bytes**: File with spoofed MIME type but wrong content is rejected
- [ ] **PII masking**: Logger output does not contain raw email, phone, or name values
- [ ] **Generic errors**: Duplicate email returns generic message, not "email exists"
- [ ] **Body size**: Request body larger than 1MB is rejected
- [ ] **No static uploads**: Direct URL access to `uploads/` directory returns 404

### Integration Tests

- [ ] POST /candidates returns 201 with valid data
- [ ] POST /candidates returns 400 with invalid data
- [ ] POST /candidates returns 400 for duplicate email (generic message)
- [ ] POST /upload returns 200 with valid PDF
- [ ] POST /upload returns 400 with invalid file type
- [ ] POST /upload returns 400 with file too large
- [ ] POST /upload returns 400 with spoofed MIME type (wrong magic bytes)
- [ ] Response headers include security headers (X-Content-Type-Options, etc.)

### Manual Tests

- [ ] Complete candidate creation flow (all fields)
- [ ] Minimal candidate creation (required fields only)
- [ ] Duplicate email rejection (verify generic error message)
- [ ] File upload (PDF)
- [ ] File upload (DOCX)
- [ ] Invalid file type rejection
- [ ] Validation error messages are clear and accurate
- [ ] XSS payload in text fields is sanitized (not stored raw)
- [ ] Rate limiting triggers after excessive requests
- [ ] Verify `consentDate` is recorded on created candidate

---

## Error Response Format

All error responses follow the project's standard format:

### HTTP Status Code Mapping

| Scenario                     | HTTP Status | Response Body                                                                                |
|------------------------------|-------------|----------------------------------------------------------------------------------------------|
| Validation error             | `400`       | `{ "message": "Validation error", "error": "<specific validation message(s)>" }`            |
| Duplicate email              | `400`       | `{ "message": "Validation error", "error": "The candidate could not be registered" }`       |
| Empty request body           | `400`       | `{ "message": "Validation error", "error": "No data provided" }`                            |
| Invalid file type            | `400`       | `{ "message": "Invalid file type", "error": "Only PDF and DOCX files are allowed" }`        |
| File too large               | `400`       | `{ "message": "File too large", "error": "File size must not exceed 10MB" }`                 |
| No file provided             | `400`       | `{ "message": "No file uploaded", "error": "A file is required" }`                          |
| Rate limit exceeded          | `429`       | `{ "message": "Too many requests", "error": "Please try again later" }`                     |
| Internal server error        | `500`       | `{ "message": "Internal server error", "error": "<generic in production>" }`                 |

---

## Dependencies

### Production Dependencies (to install)

| Package              | Purpose                                   |
|----------------------|-------------------------------------------|
| `cors`               | Cross-Origin Resource Sharing             |
| `multer`             | Multipart form data / file uploads        |
| `uuid`               | Unique filename generation                |
| `helmet`             | Secure HTTP headers                       |
| `express-rate-limit` | API rate limiting                         |
| `sanitize-html`      | XSS prevention via input sanitization     |

### Dev Dependencies (to install)

| Package                | Purpose                            |
|------------------------|------------------------------------|
| `@types/cors`          | TypeScript types for cors          |
| `@types/multer`        | TypeScript types for multer        |
| `@types/uuid`          | TypeScript types for uuid          |
| `@types/sanitize-html` | TypeScript types for sanitize-html |

### Existing Dependencies (already installed)

| Package            | Purpose                       |
|--------------------|-------------------------------|
| `express`          | Web framework                 |
| `@prisma/client`   | Database ORM                  |
| `prisma`           | Migration and schema tool     |
| `dotenv`           | Environment variables         |
| `jest`             | Testing framework             |
| `ts-jest`          | TypeScript support for Jest   |
| `typescript`       | TypeScript compiler           |
| `ts-node-dev`      | Development server            |
| `supertest`        | HTTP integration testing      |

---

## Notes

### Important Reminders

1. **TDD Process**: For Steps 6, 7, 8 — always write the test file FIRST, verify tests fail, then implement the production code to make tests pass. This is a core project principle from `base-standards.mdc`.
2. **English Only**: All code, comments, error messages, log messages, test names, and documentation MUST be in English. No Spanish identifiers or messages.
3. **Small Steps**: Work through each implementation step one at a time. Do not jump ahead or combine multiple steps. Verify each step works before proceeding.
4. **Incremental Commits**: Make a git commit after each major step (or group of related sub-steps). Use descriptive English commit messages.
5. **Type Safety**: All code must be fully typed with TypeScript. Avoid `any` — use `unknown` or specific types.
6. **90% Coverage**: Tests must achieve 90%+ coverage across branches, functions, lines, and statements.
7. **Security First**: All inputs must be sanitized before processing. Never log raw PII. Never expose internal error details to clients in production. Never serve uploaded files statically.

### Business Rules

1. **Unique Email**: A candidate's email must be unique across the system. Attempting to create a candidate with an existing email returns a 400 error with a generic message (no email enumeration).
2. **Education Limit**: Maximum of 3 education records per candidate.
3. **Phone Format**: Spanish phone format — must start with 6, 7, or 9, followed by exactly 8 digits (9 digits total).
4. **File Upload**: CV upload supports only PDF and DOCX, max 10MB. File content is validated via magic bytes, not just MIME type.
5. **Atomic Create**: Candidate creation with all relations (educations, work experiences, resume) must be atomic — either all succeed or all fail (Prisma nested create handles this).
6. **Optional Fields**: `phone`, `address`, `educations`, `workExperiences`, and `cv` are all optional.
7. **Data Consent**: A `consentDate` is automatically recorded when a candidate is created, registering the timestamp of data processing consent.

### Security & Privacy Rules

1. **Input Sanitization**: All text inputs are sanitized against XSS before processing. HTML/script tags are stripped from all string fields.
2. **Rate Limiting**: API endpoints are rate-limited (100 req/15min for candidates, 20 req/15min for uploads) to prevent abuse and brute-force attacks.
3. **Secure Headers**: Helmet middleware sets security headers (X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.) on all responses.
4. **PII Protection in Logs**: Candidate PII (email, phone, name, address) is automatically masked in all log output. No raw personal data in logs.
5. **No Email Enumeration**: Duplicate email errors return a generic message to prevent attackers from discovering registered emails.
6. **File Content Validation**: Uploaded files are validated by magic bytes (not just MIME type) to prevent disguised malicious files.
7. **No Static File Serving**: The `uploads/` directory is never served statically. CV files should only be accessible through authenticated endpoints.
8. **Body Size Limit**: JSON request bodies are limited to 1MB to prevent payload-based DoS attacks.
9. **Error Message Safety**: Internal error details and stack traces are never exposed in production responses.

---

## Next Steps After Implementation

1. **Code Review**: Submit the feature branch for code review
2. **Frontend Integration**: Coordinate with frontend implementation (`feature/LABIDES-1-frontend`) to ensure API contract matches
3. **Merge to Main**: After code review approval and all tests passing, merge `feature/LABIDES-1-backend` into `main`
4. **Database Migration in Staging**: Apply Prisma migration in staging environment

---

## Implementation Verification

### Final Checklist

**Code Quality:**
- [ ] All code written in English (variables, functions, comments, error messages)
- [ ] TypeScript strict mode — no compilation errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] DDD layered architecture followed (domain, application, presentation, infrastructure)
- [ ] SOLID principles applied
- [ ] No `any` types used

**Functionality:**
- [ ] `POST /candidates` creates candidate with all fields
- [ ] `POST /candidates` creates candidate with required fields only
- [ ] `POST /candidates` validates all input fields correctly
- [ ] `POST /candidates` rejects duplicate emails with 400
- [ ] `POST /candidates` returns proper error responses for invalid data
- [ ] `POST /upload` accepts PDF and DOCX files
- [ ] `POST /upload` rejects invalid file types
- [ ] `POST /upload` enforces 10MB size limit

**Testing:**
- [ ] All unit tests pass (`npm test`)
- [ ] 90%+ coverage achieved (`npm run test:coverage`)
- [ ] Validator tests cover all validation rules
- [ ] Service tests cover happy path, errors, and edge cases
- [ ] Controller tests cover all HTTP status codes
- [ ] Manual integration tests pass

**Security & Privacy:**
- [ ] Helmet middleware applied (secure HTTP headers)
- [ ] Rate limiting configured on `/candidates` (100 req/15min) and `/upload` (20 req/15min)
- [ ] Input sanitization middleware strips HTML/script tags from all text inputs
- [ ] Logger masks PII (email, phone, name, address) in all log output
- [ ] Duplicate email error returns generic message (no email enumeration)
- [ ] File uploads validated by magic bytes (not just MIME type)
- [ ] `uploads/` directory NOT served statically
- [ ] JSON body size limited to 1MB
- [ ] Error responses do not expose stack traces or internal details in production
- [ ] `consentDate` field recorded on candidate creation

**Integration:**
- [ ] CORS configured for frontend origin
- [ ] JSON body parser configured with size limit
- [ ] Routes mounted correctly with rate limiters
- [ ] Error middleware returns JSON responses (safe for production)
- [ ] Prisma migration applied successfully

**Documentation:**
- [ ] `ai-specs/specs/data-model.md` reviewed and updated
- [ ] `ai-specs/specs/api-spec.yml` reviewed and updated
- [ ] Coverage report saved to `coverage/YYYYMMDD-backend-coverage.md`
