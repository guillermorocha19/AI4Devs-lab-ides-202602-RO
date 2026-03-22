export interface EducationData {
  id?: number;
  institution: string;
  title: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  candidateId?: number;
}

export interface WorkExperienceData {
  id?: number;
  company: string;
  position: string;
  description?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  candidateId?: number;
}

export interface ResumeData {
  id?: number;
  filePath: string;
  fileType: string;
  uploadDate?: string | Date;
  candidateId?: number;
}

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

export function buildCandidateData(overrides?: Partial<CandidateData>): CandidateData {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '612345678',
    address: '123 Main St, Madrid',
    educations: [
      {
        institution: 'MIT',
        title: 'Computer Science BSc',
        startDate: '2015-09-01T00:00:00.000Z',
        endDate: '2019-06-30T00:00:00.000Z',
      },
    ],
    workExperiences: [
      {
        company: 'Tech Corp',
        position: 'Software Engineer',
        description: 'Full-stack development',
        startDate: '2019-07-01T00:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

export function buildEducationData(overrides?: Partial<EducationData>): EducationData {
  return {
    institution: 'MIT',
    title: 'Computer Science BSc',
    startDate: '2015-09-01T00:00:00.000Z',
    endDate: '2019-06-30T00:00:00.000Z',
    ...overrides,
  };
}

export function buildWorkExperienceData(
  overrides?: Partial<WorkExperienceData>,
): WorkExperienceData {
  return {
    company: 'Tech Corp',
    position: 'Software Engineer',
    description: 'Full-stack development',
    startDate: '2019-07-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildResumeData(overrides?: Partial<ResumeData>): ResumeData {
  return {
    filePath: 'uploads/test-resume.pdf',
    fileType: 'application/pdf',
    ...overrides,
  };
}
