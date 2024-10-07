const request = require('supertest');
const app = require('../../src/app');

describe('POST /fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('Unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));
  // Incorrect credentials should also return 401
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));
  // Valid credentials should allow fragment creation
  test('authenticated users can create a fragment', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('This is a test fragment'));

    expect(response.statusCode).toBe(201);

    // Check the response body structure
    expect(response.body).toHaveProperty('status', 'ok');

    const fragment = response.body.fragment;

    // Check fragment object properties
    expect(fragment).toHaveProperty('id'); 
    expect(fragment).toHaveProperty('created'); 
    expect(fragment.created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // ISO string format
    expect(fragment).toHaveProperty('updated'); 
    expect(fragment.updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); 

    expect(fragment).toHaveProperty('ownerId');
    expect(fragment.ownerId).toMatch(/^[a-fA-F0-9]{64}$/); // 64-character hex hash

    expect(fragment).toHaveProperty('type', 'text/plain');
    expect(fragment).toHaveProperty('size', Buffer.from('This is a test fragment').length);

    // Check Location header
    expect(response.header.location).toMatch(/\/v1\/fragments\/\w+/); // Ensure location URL is valid
  });

  test('creating a fragment with an unsupported Content-Type returns 415 error', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/unsupported') // Use an unsupported content type
      .send(Buffer.from('This is a test fragment with an unsupported type'));

    // Check that the status code is 415 (Unsupported Media Type)
    expect(response.statusCode).toBe(415);

    // Check that the response contains an error message related to unsupported content type
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe('Unsupported Content-Type: application/unsupported');
});
});
