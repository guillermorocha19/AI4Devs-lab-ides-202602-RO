import { Request, Response } from 'express';
import fs from 'fs';
import { validateMagicBytes } from '../uploadMiddleware';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('uploadMiddleware - validateMagicBytes', () => {
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

  it('should call next when no file is present', () => {
    mockRequest = {};

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should accept valid PDF files', () => {
    const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]);

    mockRequest = {
      file: { path: 'uploads/test.pdf' } as Express.Multer.File,
    };

    mockedFs.openSync.mockReturnValue(1);
    mockedFs.readSync.mockImplementation((_fd, buffer) => {
      pdfMagicBytes.copy(buffer as Buffer);
      return 4;
    });
    mockedFs.closeSync.mockImplementation(() => undefined);

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should accept valid DOCX files', () => {
    const docxMagicBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

    mockRequest = {
      file: { path: 'uploads/test.docx' } as Express.Multer.File,
    };

    mockedFs.openSync.mockReturnValue(1);
    mockedFs.readSync.mockImplementation((_fd, buffer) => {
      docxMagicBytes.copy(buffer as Buffer);
      return 4;
    });
    mockedFs.closeSync.mockImplementation(() => undefined);

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject files with invalid magic bytes', () => {
    const invalidBytes = Buffer.from([0x00, 0x00, 0x00, 0x00]);

    mockRequest = {
      file: { path: 'uploads/test.pdf' } as Express.Multer.File,
    };

    mockedFs.openSync.mockReturnValue(1);
    mockedFs.readSync.mockImplementation((_fd, buffer) => {
      invalidBytes.copy(buffer as Buffer);
      return 4;
    });
    mockedFs.closeSync.mockImplementation(() => undefined);
    mockedFs.unlinkSync.mockImplementation(() => undefined);

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid file type',
      error: 'File content does not match its declared type',
    });
    expect(mockedFs.unlinkSync).toHaveBeenCalledWith('uploads/test.pdf');
  });

  it('should handle errors during validation and cleanup file', () => {
    mockRequest = {
      file: { path: 'uploads/test.pdf' } as Express.Multer.File,
    };

    mockedFs.openSync.mockImplementation(() => {
      throw new Error('File access error');
    });
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.unlinkSync.mockImplementation(() => undefined);

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockedFs.unlinkSync).toHaveBeenCalledWith('uploads/test.pdf');
  });

  it('should handle errors when file does not exist during cleanup', () => {
    mockRequest = {
      file: { path: 'uploads/test.pdf' } as Express.Multer.File,
    };

    mockedFs.openSync.mockImplementation(() => {
      throw new Error('File access error');
    });
    mockedFs.existsSync.mockReturnValue(false);

    validateMagicBytes(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
  });
});
