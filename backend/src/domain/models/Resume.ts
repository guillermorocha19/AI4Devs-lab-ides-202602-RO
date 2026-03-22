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

  constructor(data: ResumeData) {
    this.id = data.id;
    this.filePath = data.filePath;
    this.fileType = data.fileType;
    this.uploadDate = data.uploadDate ? new Date(data.uploadDate) : new Date();
    this.candidateId = data.candidateId;
  }
}
