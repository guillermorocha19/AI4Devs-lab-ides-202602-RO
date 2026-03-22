import { Request, Response } from 'express';
import { addCandidateController } from '../candidateController';
import { addCandidate } from '../../../application/services/candidateService';
import { Candidate } from '../../../domain/models/Candidate';
import { buildCandidateData } from '../../../../test-utils/builders/candidateBuilder';

jest.mock('../../../application/services/candidateService');

const mockedAddCandidate = addCandidate as jest.MockedFunction<typeof addCandidate>;

describe('CandidateController - addCandidateController', () => {
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

  describe('should_return_201_when_successful', () => {
    it('should return 201 with created candidate data for full request', async () => {
      const candidateData = buildCandidateData();
      const createdCandidate = { ...candidateData, id: 1 };

      mockRequest = { body: candidateData };
      mockedAddCandidate.mockResolvedValue(createdCandidate as unknown as Candidate);

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCandidate);
    });

    it('should return 201 with created candidate data for minimal request', async () => {
      const candidateData = buildCandidateData({
        phone: undefined,
        address: undefined,
        educations: [],
        workExperiences: [],
      });
      const createdCandidate = { ...candidateData, id: 2 };

      mockRequest = { body: candidateData };
      mockedAddCandidate.mockResolvedValue(createdCandidate as unknown as Candidate);

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdCandidate);
    });
  });

  describe('should_return_400_when_validation_error', () => {
    it('should return 400 when validation fails', async () => {
      mockRequest = { body: { firstName: '' } };
      mockedAddCandidate.mockRejectedValue(
        new Error('Validation error: firstName is required'),
      );

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'Validation error: firstName is required',
      });
    });

    it('should return 400 when email already exists', async () => {
      const candidateData = buildCandidateData();
      mockRequest = { body: candidateData };
      mockedAddCandidate.mockRejectedValue(
        new Error('The candidate could not be registered'),
      );

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'The candidate could not be registered',
      });
    });

    it('should return 400 when request body is empty', async () => {
      mockRequest = { body: {} };

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'No data provided',
      });
    });

    it('should return 400 when request body is null', async () => {
      mockRequest = { body: null };

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Validation error',
        error: 'No data provided',
      });
    });
  });

  describe('should_return_500_when_server_error', () => {
    it('should return 500 for unexpected errors', async () => {
      mockRequest = { body: buildCandidateData() };
      mockedAddCandidate.mockRejectedValue(new Error('Database connection failed'));

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating candidate',
        error: 'Database connection failed',
      });
    });

    it('should return 500 for non-Error exceptions', async () => {
      mockRequest = { body: buildCandidateData() };
      mockedAddCandidate.mockRejectedValue('unknown error string');

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating candidate',
        error: 'Internal server error',
      });
    });
  });

  describe('should_handle_edge_cases', () => {
    it('should handle request body with extra unknown fields', async () => {
      const candidateData = { ...buildCandidateData(), unknownField: 'value' };
      const createdCandidate = { ...candidateData, id: 10 };

      mockRequest = { body: candidateData };
      mockedAddCandidate.mockResolvedValue(createdCandidate as unknown as Candidate);

      await addCandidateController(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });
});
