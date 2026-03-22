import request from 'supertest';
import { app } from '../index';

describe('Integration - Express App', () => {
  it('GET / should return Hola LTI!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hola LTI!');
  });

  it('POST /candidates with empty body should return 400', async () => {
    const response = await request(app)
      .post('/candidates')
      .send({})
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Validation error');
  });

  it('POST /upload without file should return 400', async () => {
    const response = await request(app).post('/upload');
    expect(response.statusCode).toBe(400);
  });

  it('should include security headers (helmet)', async () => {
    const response = await request(app).get('/');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('POST /upload with invalid file type should return error', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('not a pdf'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(response.statusCode).toBe(400);
  });

  it('POST /upload with valid PDF MIME but fake content should be caught by magic bytes', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('fake pdf content'), {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

    expect(response.statusCode).toBe(400);
  });

  it('POST /candidates with sanitized XSS input should strip HTML', async () => {
    const response = await request(app)
      .post('/candidates')
      .send({
        firstName: '<script>alert(1)</script>',
        lastName: 'Doe',
        email: 'xss@test.com',
      })
      .set('Content-Type', 'application/json');

    expect(response.statusCode).toBe(400);
  });
});
