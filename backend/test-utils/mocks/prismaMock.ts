export const prismaMock = {
  candidate: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  education: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  workExperience: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  resume: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

export default prismaMock;
