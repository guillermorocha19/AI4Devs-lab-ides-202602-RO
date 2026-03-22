import { Education, EducationData } from './Education';
import { WorkExperience, WorkExperienceData } from './WorkExperience';
import { Resume, ResumeData } from './Resume';
import prisma from '../../infrastructure/prismaClient';

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

  constructor(data: CandidateData) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone ?? undefined;
    this.address = data.address ?? undefined;
    this.consentDate = data.consentDate ? new Date(data.consentDate) : new Date();
    this.educations = (data.educations ?? []).map((edu) => new Education(edu));
    this.workExperiences = (data.workExperiences ?? []).map((we) => new WorkExperience(we));

    const resumeDataList: ResumeData[] = [];
    if (data.resumes) {
      resumeDataList.push(...data.resumes);
    } else if (data.cv) {
      resumeDataList.push(data.cv);
    }
    this.resumes = resumeDataList.map((r) => new Resume(r));
  }

  async save(): Promise<Candidate> {
    const created = await prisma.candidate.create({
      data: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone ?? null,
        address: this.address ?? null,
        educations: {
          create: this.educations.map((edu) => ({
            institution: edu.institution,
            title: edu.title,
            startDate: edu.startDate,
            endDate: edu.endDate ?? null,
          })),
        },
        workExperiences: {
          create: this.workExperiences.map((we) => ({
            company: we.company,
            position: we.position,
            description: we.description ?? null,
            startDate: we.startDate,
            endDate: we.endDate ?? null,
          })),
        },
        resumes: {
          create: this.resumes.map((r) => ({
            filePath: r.filePath,
            fileType: r.fileType,
            uploadDate: r.uploadDate,
          })),
        },
      },
      include: {
        educations: true,
        workExperiences: true,
        resumes: true,
      },
    });

    return new Candidate(created);
  }

  static async findOne(id: number): Promise<Candidate | null> {
    const data = await prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        resumes: true,
      },
    });
    return data ? new Candidate(data) : null;
  }

  static async findByEmail(email: string): Promise<Candidate | null> {
    const data = await prisma.candidate.findFirst({
      where: { email },
    });
    return data ? new Candidate(data) : null;
  }
}
