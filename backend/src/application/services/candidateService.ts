import { Candidate } from '../../domain/models/Candidate';
import { validateCandidateData } from '../validator';
import { Logger } from '../../infrastructure/logger';

const logger = new Logger();

export async function addCandidate(candidateData: unknown): Promise<Candidate> {
  const validatedData = validateCandidateData(candidateData);

  const existingCandidate = await Candidate.findByEmail(validatedData.email);
  if (existingCandidate) {
    logger.warn('Candidate registration rejected: duplicate email', {
      email: validatedData.email,
    });
    throw new Error('The candidate could not be registered');
  }

  const candidate = new Candidate(validatedData);
  const savedCandidate = await candidate.save();

  logger.info('Candidate created successfully', { candidateId: savedCandidate.id });

  return savedCandidate;
}
