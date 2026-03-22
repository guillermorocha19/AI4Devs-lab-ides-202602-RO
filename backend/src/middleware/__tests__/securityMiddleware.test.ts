import { Request, Response, NextFunction } from 'express';
import { sanitizeInputMiddleware } from '../securityMiddleware';

describe('SecurityMiddleware', () => {
  describe('sanitizeInputMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockResponse = {};
      mockNext = jest.fn();
    });

    it('should strip HTML tags from string fields', () => {
      mockRequest = {
        body: {
          firstName: '<script>alert("xss")</script>John',
          lastName: 'Doe<img src=x onerror=alert(1)>',
        },
      };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.firstName).toBe('John');
      expect(mockRequest.body.lastName).toBe('Doe');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize nested array items', () => {
      mockRequest = {
        body: {
          educations: [
            { institution: '<b>MIT</b>', title: 'CS<script>alert(1)</script>' },
          ],
        },
      };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.educations[0].institution).toBe('MIT');
      expect(mockRequest.body.educations[0].title).toBe('CS');
    });

    it('should sanitize nested objects', () => {
      mockRequest = {
        body: {
          cv: { filePath: '<a href="evil">path</a>', fileType: 'application/pdf' },
        },
      };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.cv.filePath).toBe('path');
    });

    it('should pass through non-string values', () => {
      mockRequest = {
        body: {
          age: 25,
          active: true,
          score: null,
        },
      };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.age).toBe(25);
      expect(mockRequest.body.active).toBe(true);
      expect(mockRequest.body.score).toBeNull();
    });

    it('should handle empty body', () => {
      mockRequest = { body: null };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle undefined body', () => {
      mockRequest = { body: undefined };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle non-string items in arrays', () => {
      mockRequest = {
        body: {
          items: [42, true, 'text<br>'],
        },
      };

      sanitizeInputMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body.items[0]).toBe(42);
      expect(mockRequest.body.items[1]).toBe(true);
      expect(mockRequest.body.items[2]).toBe('text');
    });
  });
});
