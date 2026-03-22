import { Request, Response } from 'express';
import { uploadFileController } from '../uploadController';

describe('UploadController - uploadFileController', () => {
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

  it('should return 200 with file path and type on successful upload', async () => {
    mockRequest = {
      file: {
        path: 'uploads/test-uuid.pdf',
        mimetype: 'application/pdf',
        fieldname: 'file',
        originalname: 'resume.pdf',
        encoding: '7bit',
        size: 1024,
        destination: 'uploads/',
        filename: 'test-uuid.pdf',
        buffer: Buffer.from(''),
        stream: {} as NodeJS.ReadableStream,
      } as Express.Multer.File,
    };

    await uploadFileController(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      filePath: 'uploads/test-uuid.pdf',
      fileType: 'application/pdf',
    });
  });

  it('should return 400 when no file is provided', async () => {
    mockRequest = {};

    await uploadFileController(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'No file uploaded',
      error: 'A file is required',
    });
  });

  it('should return 400 when file is undefined', async () => {
    mockRequest = { file: undefined };

    await uploadFileController(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'No file uploaded',
      error: 'A file is required',
    });
  });

  it('should return 200 with DOCX file type', async () => {
    const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    mockRequest = {
      file: {
        path: 'uploads/test-uuid.docx',
        mimetype: docxMime,
        fieldname: 'file',
        originalname: 'resume.docx',
        encoding: '7bit',
        size: 2048,
        destination: 'uploads/',
        filename: 'test-uuid.docx',
        buffer: Buffer.from(''),
        stream: {} as NodeJS.ReadableStream,
      } as Express.Multer.File,
    };

    await uploadFileController(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      filePath: 'uploads/test-uuid.docx',
      fileType: docxMime,
    });
  });
});
