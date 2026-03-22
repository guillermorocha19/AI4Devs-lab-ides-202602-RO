import axios from 'axios';
import {
  CandidateFormData,
  CandidateResponse,
  FileUploadResponse,
  ApiErrorResponse,
} from '../types/candidate';

const API_BASE_URL = 'http://localhost:3010';

const transformFormData = (formData: CandidateFormData) => {
  const educations = formData.educations
    .filter((edu) => edu.institution.trim() && edu.title.trim())
    .map((edu) => ({
      institution: edu.institution.trim(),
      title: edu.title.trim(),
      startDate: edu.startDate ? new Date(edu.startDate).toISOString() : undefined,
      endDate: edu.endDate ? new Date(edu.endDate).toISOString() : undefined,
    }));

  const workExperiences = formData.workExperiences
    .filter((exp) => exp.company.trim() && exp.position.trim())
    .map((exp) => ({
      company: exp.company.trim(),
      position: exp.position.trim(),
      description: exp.description.trim() || null,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString() : undefined,
      endDate: exp.endDate ? new Date(exp.endDate).toISOString() : undefined,
    }));

  return {
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim(),
    phone: formData.phone.trim() || null,
    address: formData.address.trim() || null,
    educations,
    workExperiences,
    ...(formData.cv ? { cv: formData.cv } : {}),
  };
};

export const candidateService = {
  createCandidate: async (formData: CandidateFormData): Promise<CandidateResponse> => {
    try {
      const data = transformFormData(formData);
      const response = await axios.post(`${API_BASE_URL}/candidates`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: ApiErrorResponse }; message?: string };
      console.error('Error creating candidate:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },

  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: ApiErrorResponse }; message?: string };
      console.error('Error uploading file:', axiosError.response?.data || axiosError.message);
      throw error;
    }
  },
};
