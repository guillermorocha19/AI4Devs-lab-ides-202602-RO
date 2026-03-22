import { validateCandidateData } from '../validator';
import {
  buildCandidateData,
  buildEducationData,
  buildWorkExperienceData,
} from '../../../test-utils/builders/candidateBuilder';

describe('validateCandidateData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('should_pass_validation_when_valid_data', () => {
    it('should pass with complete valid candidate data', () => {
      const data = buildCandidateData();
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should pass with only required fields', () => {
      const data = buildCandidateData({
        phone: undefined,
        address: undefined,
        educations: [],
        workExperiences: [],
      });
      expect(() => validateCandidateData(data)).not.toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_firstName', () => {
    it('should fail when firstName is missing', () => {
      const data = buildCandidateData();
      delete (data as unknown as Record<string, unknown>).firstName;
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when firstName is empty string', () => {
      const data = buildCandidateData({ firstName: '' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when firstName is shorter than 2 characters', () => {
      const data = buildCandidateData({ firstName: 'J' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when firstName exceeds 100 characters', () => {
      const data = buildCandidateData({ firstName: 'A'.repeat(101) });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when firstName contains numbers', () => {
      const data = buildCandidateData({ firstName: 'John123' });
      expect(() => validateCandidateData(data)).toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_lastName', () => {
    it('should fail when lastName is missing', () => {
      const data = buildCandidateData();
      delete (data as unknown as Record<string, unknown>).lastName;
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when lastName is empty string', () => {
      const data = buildCandidateData({ lastName: '' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when lastName is shorter than 2 characters', () => {
      const data = buildCandidateData({ lastName: 'D' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when lastName exceeds 100 characters', () => {
      const data = buildCandidateData({ lastName: 'B'.repeat(101) });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when lastName contains numbers', () => {
      const data = buildCandidateData({ lastName: 'Doe456' });
      expect(() => validateCandidateData(data)).toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_email', () => {
    it('should fail when email is missing', () => {
      const data = buildCandidateData();
      delete (data as unknown as Record<string, unknown>).email;
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when email is empty string', () => {
      const data = buildCandidateData({ email: '' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when email has invalid format (no @)', () => {
      const data = buildCandidateData({ email: 'john.doe.example.com' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when email has invalid format (no domain)', () => {
      const data = buildCandidateData({ email: 'john.doe@' });
      expect(() => validateCandidateData(data)).toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_phone', () => {
    it('should pass when phone is not provided (optional)', () => {
      const data = buildCandidateData({ phone: undefined });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should pass when phone is null (optional)', () => {
      const data = buildCandidateData({ phone: null });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should fail when phone does not start with 6, 7, or 9', () => {
      const data = buildCandidateData({ phone: '512345678' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when phone has fewer than 9 digits', () => {
      const data = buildCandidateData({ phone: '61234567' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when phone has more than 9 digits', () => {
      const data = buildCandidateData({ phone: '6123456789' });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should pass with valid phone starting with 6', () => {
      const data = buildCandidateData({ phone: '612345678' });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should pass with valid phone starting with 7', () => {
      const data = buildCandidateData({ phone: '712345678' });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should pass with valid phone starting with 9', () => {
      const data = buildCandidateData({ phone: '912345678' });
      expect(() => validateCandidateData(data)).not.toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_address', () => {
    it('should pass when address is not provided (optional)', () => {
      const data = buildCandidateData({ address: undefined });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should fail when address exceeds 100 characters', () => {
      const data = buildCandidateData({ address: 'A'.repeat(101) });
      expect(() => validateCandidateData(data)).toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_educations', () => {
    it('should pass when educations is empty array', () => {
      const data = buildCandidateData({ educations: [] });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should fail when more than 3 education records', () => {
      const data = buildCandidateData({
        educations: [
          buildEducationData(),
          buildEducationData({ institution: 'Stanford' }),
          buildEducationData({ institution: 'Harvard' }),
          buildEducationData({ institution: 'Oxford' }),
        ],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when institution is missing', () => {
      const edu = buildEducationData();
      delete (edu as unknown as Record<string, unknown>).institution;
      const data = buildCandidateData({ educations: [edu] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when institution exceeds 100 characters', () => {
      const data = buildCandidateData({
        educations: [buildEducationData({ institution: 'A'.repeat(101) })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when title is missing', () => {
      const edu = buildEducationData();
      delete (edu as unknown as Record<string, unknown>).title;
      const data = buildCandidateData({ educations: [edu] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when title exceeds 250 characters', () => {
      const data = buildCandidateData({
        educations: [buildEducationData({ title: 'A'.repeat(251) })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when startDate is missing', () => {
      const edu = buildEducationData();
      delete (edu as unknown as Record<string, unknown>).startDate;
      const data = buildCandidateData({ educations: [edu] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when startDate is invalid', () => {
      const data = buildCandidateData({
        educations: [buildEducationData({ startDate: 'not-a-date' })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when endDate is before startDate', () => {
      const data = buildCandidateData({
        educations: [
          buildEducationData({
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2019-01-01T00:00:00.000Z',
          }),
        ],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should pass when endDate is null (ongoing)', () => {
      const data = buildCandidateData({
        educations: [buildEducationData({ endDate: null })],
      });
      expect(() => validateCandidateData(data)).not.toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_workExperiences', () => {
    it('should pass when workExperiences is empty array', () => {
      const data = buildCandidateData({ workExperiences: [] });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should fail when company is missing', () => {
      const we = buildWorkExperienceData();
      delete (we as unknown as Record<string, unknown>).company;
      const data = buildCandidateData({ workExperiences: [we] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when company exceeds 100 characters', () => {
      const data = buildCandidateData({
        workExperiences: [buildWorkExperienceData({ company: 'A'.repeat(101) })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when position is missing', () => {
      const we = buildWorkExperienceData();
      delete (we as unknown as Record<string, unknown>).position;
      const data = buildCandidateData({ workExperiences: [we] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when position exceeds 100 characters', () => {
      const data = buildCandidateData({
        workExperiences: [buildWorkExperienceData({ position: 'A'.repeat(101) })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when description exceeds 200 characters', () => {
      const data = buildCandidateData({
        workExperiences: [buildWorkExperienceData({ description: 'A'.repeat(201) })],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when startDate is missing', () => {
      const we = buildWorkExperienceData();
      delete (we as unknown as Record<string, unknown>).startDate;
      const data = buildCandidateData({ workExperiences: [we] });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when endDate is before startDate', () => {
      const data = buildCandidateData({
        workExperiences: [
          buildWorkExperienceData({
            startDate: '2020-01-01T00:00:00.000Z',
            endDate: '2019-01-01T00:00:00.000Z',
          }),
        ],
      });
      expect(() => validateCandidateData(data)).toThrow();
    });
  });

  describe('should_fail_validation_when_invalid_cv', () => {
    it('should pass when cv is not provided', () => {
      const data = buildCandidateData();
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should fail when filePath is missing but cv object is provided', () => {
      const data = buildCandidateData({
        cv: { fileType: 'application/pdf' } as { filePath: string; fileType: string },
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when filePath exceeds 500 characters', () => {
      const data = buildCandidateData({
        cv: { filePath: 'A'.repeat(501), fileType: 'application/pdf' },
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should fail when fileType is not PDF or DOCX', () => {
      const data = buildCandidateData({
        cv: { filePath: 'uploads/cv.txt', fileType: 'text/plain' },
      });
      expect(() => validateCandidateData(data)).toThrow();
    });

    it('should pass with valid PDF fileType', () => {
      const data = buildCandidateData({
        cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
      });
      expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('should pass with valid DOCX fileType', () => {
      const data = buildCandidateData({
        cv: {
          filePath: 'uploads/cv.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });
      expect(() => validateCandidateData(data)).not.toThrow();
    });
  });
});
