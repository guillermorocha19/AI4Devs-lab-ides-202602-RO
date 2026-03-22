import { CandidateData } from '../domain/models/Candidate';

const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[679]\d{8}$/;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function isValidDate(value: unknown): boolean {
  if (!value) return false;
  const date = new Date(value as string);
  return !isNaN(date.getTime());
}

export function validateCandidateData(data: unknown): CandidateData {
  const errors: string[] = [];
  const candidate = data as Record<string, unknown>;

  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Validation error: No data provided');
  }

  const firstName = candidate.firstName as string | undefined;
  if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
    errors.push('firstName is required');
  } else if (firstName.length < 2) {
    errors.push('firstName must be at least 2 characters');
  } else if (firstName.length > 100) {
    errors.push('firstName must not exceed 100 characters');
  } else if (!NAME_REGEX.test(firstName)) {
    errors.push('firstName must contain only letters and spaces');
  }

  const lastName = candidate.lastName as string | undefined;
  if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
    errors.push('lastName is required');
  } else if (lastName.length < 2) {
    errors.push('lastName must be at least 2 characters');
  } else if (lastName.length > 100) {
    errors.push('lastName must not exceed 100 characters');
  } else if (!NAME_REGEX.test(lastName)) {
    errors.push('lastName must contain only letters and spaces');
  }

  const email = candidate.email as string | undefined;
  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('email must have a valid format');
  }

  const phone = candidate.phone as string | undefined | null;
  if (phone !== undefined && phone !== null && phone !== '') {
    if (!PHONE_REGEX.test(phone)) {
      errors.push('phone must be a valid Spanish phone number (9 digits starting with 6, 7, or 9)');
    }
  }

  const address = candidate.address as string | undefined | null;
  if (address !== undefined && address !== null && address !== '') {
    if (typeof address === 'string' && address.length > 100) {
      errors.push('address must not exceed 100 characters');
    }
  }

  const educations = candidate.educations as Record<string, unknown>[] | undefined;
  if (educations && Array.isArray(educations)) {
    if (educations.length > 3) {
      errors.push('Maximum of 3 education records allowed');
    }
    educations.forEach((edu, index) => {
      if (!edu.institution || typeof edu.institution !== 'string' || (edu.institution as string).trim() === '') {
        errors.push(`educations[${index}].institution is required`);
      } else if ((edu.institution as string).length > 100) {
        errors.push(`educations[${index}].institution must not exceed 100 characters`);
      }

      if (!edu.title || typeof edu.title !== 'string' || (edu.title as string).trim() === '') {
        errors.push(`educations[${index}].title is required`);
      } else if ((edu.title as string).length > 250) {
        errors.push(`educations[${index}].title must not exceed 250 characters`);
      }

      if (!edu.startDate) {
        errors.push(`educations[${index}].startDate is required`);
      } else if (!isValidDate(edu.startDate)) {
        errors.push(`educations[${index}].startDate must be a valid date`);
      }

      if (edu.endDate !== undefined && edu.endDate !== null) {
        if (!isValidDate(edu.endDate)) {
          errors.push(`educations[${index}].endDate must be a valid date`);
        } else if (edu.startDate && isValidDate(edu.startDate)) {
          const start = new Date(edu.startDate as string);
          const end = new Date(edu.endDate as string);
          if (end < start) {
            errors.push(`educations[${index}].endDate must not be before startDate`);
          }
        }
      }
    });
  }

  const workExperiences = candidate.workExperiences as Record<string, unknown>[] | undefined;
  if (workExperiences && Array.isArray(workExperiences)) {
    workExperiences.forEach((we, index) => {
      if (!we.company || typeof we.company !== 'string' || (we.company as string).trim() === '') {
        errors.push(`workExperiences[${index}].company is required`);
      } else if ((we.company as string).length > 100) {
        errors.push(`workExperiences[${index}].company must not exceed 100 characters`);
      }

      if (!we.position || typeof we.position !== 'string' || (we.position as string).trim() === '') {
        errors.push(`workExperiences[${index}].position is required`);
      } else if ((we.position as string).length > 100) {
        errors.push(`workExperiences[${index}].position must not exceed 100 characters`);
      }

      if (we.description !== undefined && we.description !== null) {
        if (typeof we.description === 'string' && (we.description as string).length > 200) {
          errors.push(`workExperiences[${index}].description must not exceed 200 characters`);
        }
      }

      if (!we.startDate) {
        errors.push(`workExperiences[${index}].startDate is required`);
      } else if (!isValidDate(we.startDate)) {
        errors.push(`workExperiences[${index}].startDate must be a valid date`);
      }

      if (we.endDate !== undefined && we.endDate !== null) {
        if (!isValidDate(we.endDate)) {
          errors.push(`workExperiences[${index}].endDate must be a valid date`);
        } else if (we.startDate && isValidDate(we.startDate)) {
          const start = new Date(we.startDate as string);
          const end = new Date(we.endDate as string);
          if (end < start) {
            errors.push(`workExperiences[${index}].endDate must not be before startDate`);
          }
        }
      }
    });
  }

  const cv = candidate.cv as Record<string, unknown> | undefined;
  if (cv !== undefined && cv !== null) {
    if (!cv.filePath || typeof cv.filePath !== 'string' || (cv.filePath as string).trim() === '') {
      errors.push('cv.filePath is required');
    } else if ((cv.filePath as string).length > 500) {
      errors.push('cv.filePath must not exceed 500 characters');
    }

    if (!cv.fileType || !ALLOWED_FILE_TYPES.includes(cv.fileType as string)) {
      errors.push('cv.fileType must be PDF or DOCX');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation error: ${errors.join('; ')}`);
  }

  return candidate as unknown as CandidateData;
}
