import { Education } from '../Education';
import { WorkExperience } from '../WorkExperience';
import { Resume } from '../Resume';
import { Candidate } from '../Candidate';

jest.mock('../../../infrastructure/prismaClient', () => ({
  __esModule: true,
  default: {
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

import prisma from '../../../infrastructure/prismaClient';

describe('Education', () => {
  it('should create Education with all fields', () => {
    const edu = new Education({
      id: 1,
      institution: 'MIT',
      title: 'CS BSc',
      startDate: '2015-09-01T00:00:00.000Z',
      endDate: '2019-06-30T00:00:00.000Z',
      candidateId: 1,
    });

    expect(edu.id).toBe(1);
    expect(edu.institution).toBe('MIT');
    expect(edu.title).toBe('CS BSc');
    expect(edu.startDate).toBeInstanceOf(Date);
    expect(edu.endDate).toBeInstanceOf(Date);
    expect(edu.candidateId).toBe(1);
  });

  it('should handle null endDate', () => {
    const edu = new Education({
      institution: 'MIT',
      title: 'CS BSc',
      startDate: '2015-09-01T00:00:00.000Z',
      endDate: null,
    });

    expect(edu.endDate).toBeUndefined();
  });

  it('should handle Date objects for dates', () => {
    const startDate = new Date('2015-09-01');
    const edu = new Education({
      institution: 'MIT',
      title: 'CS BSc',
      startDate,
    });

    expect(edu.startDate).toBeInstanceOf(Date);
  });
});

describe('WorkExperience', () => {
  it('should create WorkExperience with all fields', () => {
    const we = new WorkExperience({
      id: 1,
      company: 'Tech Corp',
      position: 'Engineer',
      description: 'Full-stack dev',
      startDate: '2019-07-01T00:00:00.000Z',
      endDate: '2022-12-31T00:00:00.000Z',
      candidateId: 1,
    });

    expect(we.id).toBe(1);
    expect(we.company).toBe('Tech Corp');
    expect(we.position).toBe('Engineer');
    expect(we.description).toBe('Full-stack dev');
    expect(we.startDate).toBeInstanceOf(Date);
    expect(we.endDate).toBeInstanceOf(Date);
    expect(we.candidateId).toBe(1);
  });

  it('should handle null description', () => {
    const we = new WorkExperience({
      company: 'Tech Corp',
      position: 'Engineer',
      description: null,
      startDate: '2019-07-01T00:00:00.000Z',
    });

    expect(we.description).toBeUndefined();
  });

  it('should handle null endDate', () => {
    const we = new WorkExperience({
      company: 'Tech Corp',
      position: 'Engineer',
      startDate: '2019-07-01T00:00:00.000Z',
      endDate: null,
    });

    expect(we.endDate).toBeUndefined();
  });
});

describe('Resume', () => {
  it('should create Resume with all fields', () => {
    const resume = new Resume({
      id: 1,
      filePath: 'uploads/cv.pdf',
      fileType: 'application/pdf',
      uploadDate: '2024-01-01T00:00:00.000Z',
      candidateId: 1,
    });

    expect(resume.id).toBe(1);
    expect(resume.filePath).toBe('uploads/cv.pdf');
    expect(resume.fileType).toBe('application/pdf');
    expect(resume.uploadDate).toBeInstanceOf(Date);
    expect(resume.candidateId).toBe(1);
  });

  it('should default uploadDate to now when not provided', () => {
    const before = new Date();
    const resume = new Resume({
      filePath: 'uploads/cv.pdf',
      fileType: 'application/pdf',
    });
    const after = new Date();

    expect(resume.uploadDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(resume.uploadDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe('Candidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create Candidate with all fields', () => {
    const candidate = new Candidate({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '612345678',
      address: '123 Main St',
      consentDate: '2024-01-01T00:00:00.000Z',
      educations: [
        { institution: 'MIT', title: 'CS', startDate: '2015-01-01' },
      ],
      workExperiences: [
        { company: 'Corp', position: 'Dev', startDate: '2019-01-01' },
      ],
      resumes: [
        { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
      ],
    });

    expect(candidate.id).toBe(1);
    expect(candidate.firstName).toBe('John');
    expect(candidate.lastName).toBe('Doe');
    expect(candidate.email).toBe('john@example.com');
    expect(candidate.phone).toBe('612345678');
    expect(candidate.address).toBe('123 Main St');
    expect(candidate.consentDate).toBeInstanceOf(Date);
    expect(candidate.educations).toHaveLength(1);
    expect(candidate.educations[0]).toBeInstanceOf(Education);
    expect(candidate.workExperiences).toHaveLength(1);
    expect(candidate.workExperiences[0]).toBeInstanceOf(WorkExperience);
    expect(candidate.resumes).toHaveLength(1);
    expect(candidate.resumes[0]).toBeInstanceOf(Resume);
  });

  it('should handle null optional fields', () => {
    const candidate = new Candidate({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: null,
      address: null,
    });

    expect(candidate.phone).toBeUndefined();
    expect(candidate.address).toBeUndefined();
    expect(candidate.educations).toEqual([]);
    expect(candidate.workExperiences).toEqual([]);
    expect(candidate.resumes).toEqual([]);
  });

  it('should default consentDate to now', () => {
    const before = new Date();
    const candidate = new Candidate({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    });
    const after = new Date();

    expect(candidate.consentDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(candidate.consentDate.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should use cv field when resumes is not provided', () => {
    const candidate = new Candidate({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
    });

    expect(candidate.resumes).toHaveLength(1);
    expect(candidate.resumes[0].filePath).toBe('uploads/cv.pdf');
  });

  describe('save', () => {
    it('should call prisma.candidate.create with correct data', async () => {
      const createdData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: null,
        address: null,
        consentDate: new Date(),
        educations: [],
        workExperiences: [],
        resumes: [],
      };

      (prisma.candidate.create as jest.Mock).mockResolvedValue(createdData);

      const candidate = new Candidate({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });

      const result = await candidate.save();

      expect(prisma.candidate.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }),
        include: {
          educations: true,
          workExperiences: true,
          resumes: true,
        },
      });
      expect(result).toBeInstanceOf(Candidate);
      expect(result.id).toBe(1);
    });

    it('should save with educations and work experiences', async () => {
      const createdData = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '612345678',
        address: '123 St',
        consentDate: new Date(),
        educations: [{ id: 1, institution: 'MIT', title: 'CS', startDate: new Date(), endDate: null, candidateId: 2 }],
        workExperiences: [{ id: 1, company: 'Corp', position: 'Dev', description: null, startDate: new Date(), endDate: null, candidateId: 2 }],
        resumes: [{ id: 1, filePath: 'uploads/cv.pdf', fileType: 'application/pdf', uploadDate: new Date(), candidateId: 2 }],
      };

      (prisma.candidate.create as jest.Mock).mockResolvedValue(createdData);

      const candidate = new Candidate({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '612345678',
        address: '123 St',
        educations: [{ institution: 'MIT', title: 'CS', startDate: '2015-01-01' }],
        workExperiences: [{ company: 'Corp', position: 'Dev', startDate: '2019-01-01' }],
        resumes: [{ filePath: 'uploads/cv.pdf', fileType: 'application/pdf' }],
      });

      const result = await candidate.save();
      expect(result.educations).toHaveLength(1);
      expect(result.workExperiences).toHaveLength(1);
      expect(result.resumes).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return candidate when found', async () => {
      const data = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: null,
        address: null,
        consentDate: new Date(),
        educations: [],
        workExperiences: [],
        resumes: [],
      };

      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(data);

      const result = await Candidate.findOne(1);

      expect(prisma.candidate.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { educations: true, workExperiences: true, resumes: true },
      });
      expect(result).toBeInstanceOf(Candidate);
      expect(result?.id).toBe(1);
    });

    it('should return null when not found', async () => {
      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await Candidate.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return candidate when found', async () => {
      const data = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: null,
        address: null,
        consentDate: new Date(),
      };

      (prisma.candidate.findFirst as jest.Mock).mockResolvedValue(data);

      const result = await Candidate.findByEmail('john@example.com');

      expect(prisma.candidate.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toBeInstanceOf(Candidate);
    });

    it('should return null when not found', async () => {
      (prisma.candidate.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await Candidate.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });
});
