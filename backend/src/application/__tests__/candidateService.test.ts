import { addCandidate } from '../services/candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { buildCandidateData } from '../../../test-utils/builders/candidateBuilder';

jest.mock('../../domain/models/Candidate');
jest.mock('../validator');

const MockedCandidate = Candidate as jest.MockedClass<typeof Candidate>;
const mockedValidate = validateCandidateData as jest.MockedFunction<typeof validateCandidateData>;

describe('CandidateService - addCandidate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('should_create_candidate_when_valid_data', () => {
    it('should create candidate with all fields successfully', async () => {
      const inputData = buildCandidateData();
      const savedCandidate = { ...inputData, id: 1 };

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockResolvedValue(new Candidate(savedCandidate));
      MockedCandidate.mockImplementation(() => mockInstance);

      const result = await addCandidate(inputData);

      expect(mockedValidate).toHaveBeenCalledWith(inputData);
      expect(Candidate.findByEmail).toHaveBeenCalledWith(inputData.email);
      expect(mockInstance.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create candidate with only required fields', async () => {
      const inputData = buildCandidateData({
        phone: undefined,
        address: undefined,
        educations: [],
        workExperiences: [],
      });

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockResolvedValue(new Candidate({ ...inputData, id: 2 }));
      MockedCandidate.mockImplementation(() => mockInstance);

      const result = await addCandidate(inputData);

      expect(result).toBeDefined();
      expect(mockedValidate).toHaveBeenCalledWith(inputData);
    });

    it('should create candidate with empty educations array', async () => {
      const inputData = buildCandidateData({ educations: [] });

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockResolvedValue(new Candidate({ ...inputData, id: 3 }));
      MockedCandidate.mockImplementation(() => mockInstance);

      const result = await addCandidate(inputData);
      expect(result).toBeDefined();
    });

    it('should create candidate with empty workExperiences array', async () => {
      const inputData = buildCandidateData({ workExperiences: [] });

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockResolvedValue(new Candidate({ ...inputData, id: 4 }));
      MockedCandidate.mockImplementation(() => mockInstance);

      const result = await addCandidate(inputData);
      expect(result).toBeDefined();
    });
  });

  describe('should_fail_when_duplicate_email', () => {
    it('should throw generic error when email already exists', async () => {
      const inputData = buildCandidateData();
      const existingCandidate = new Candidate({ ...inputData, id: 1 });

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(existingCandidate);

      await expect(addCandidate(inputData)).rejects.toThrow(
        'The candidate could not be registered',
      );
    });
  });

  describe('should_fail_when_validation_fails', () => {
    it('should propagate validation error from validateCandidateData', async () => {
      const inputData = { firstName: '' };

      mockedValidate.mockImplementation(() => {
        throw new Error('Validation error: firstName is required');
      });

      await expect(addCandidate(inputData)).rejects.toThrow('Validation error');
    });
  });

  describe('should_handle_database_errors', () => {
    it('should throw error when Prisma save fails', async () => {
      const inputData = buildCandidateData();

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      MockedCandidate.mockImplementation(() => mockInstance);

      await expect(addCandidate(inputData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('should_handle_edge_cases', () => {
    it('should handle null optional fields gracefully', async () => {
      const inputData = buildCandidateData({
        phone: null,
        address: null,
      });

      mockedValidate.mockReturnValue(inputData);
      (Candidate.findByEmail as jest.Mock).mockResolvedValue(null);

      const mockInstance = new Candidate(inputData);
      (mockInstance.save as jest.Mock) = jest.fn().mockResolvedValue(new Candidate({ ...inputData, id: 5 }));
      MockedCandidate.mockImplementation(() => mockInstance);

      const result = await addCandidate(inputData);
      expect(result).toBeDefined();
    });
  });
});
