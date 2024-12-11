const request = require('supertest');
const app = require('../../src/app');

describe('PUT/fragments', () => {
  let fragmentId;
  beforeAll(async () => {
    // Create a fragment for the test (use the actual POST route or database setup code)
    const createResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('This is a test fragment for PUT test'));

    // Store the ID for later use in the GET test
    fragmentId = createResponse.body.fragment.id;
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('Unauthenticated requests are denied', () => request(app).put('/v1/fragments').expect(401));
  
  // Incorrect credentials should also return 401
  test('incorrect credentials are denied', () =>
    request(app).put(`/v1/fragments/${fragmentId}`).auth('invalid@email.com', 'incorrect_password').expect(401));

  // Valid credentials should allow updating fragment
  test('authenticated users can update a fragment', async () => {
    const response = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('This is a updated fragment'));

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
    expect(fragment).toHaveProperty('size', Buffer.from('This is a updated fragment').length);
  });

  test('updating a fragment with a non-matching content type returns 400 error', async () => {
    const response = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/jason')
      .send(Buffer.from('This is a test fragment with an unsupported type'));

    // Check that the status code is 415 (Unsupported Media Type)
    expect(response.statusCode).toBe(400);

    // Check that the response contains an error message related to unsupported content type
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.message).toBe(
      `A fragment's type can not be changed after it is created`
    );
  });
});
