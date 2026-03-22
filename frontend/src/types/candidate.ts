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
