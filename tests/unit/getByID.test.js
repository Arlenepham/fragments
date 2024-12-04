
const request = require('supertest');
const app = require('../../src/app');

describe('GET /fragments/:id', () => {
  // Setup: Create a test fragment to retrieve
  let fragmentId;

  beforeAll(async () => {
    // Create a fragment for the test (use the actual POST route or database setup code)
    const createResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(Buffer.from('This is a test fragment for GET test'));

    // Store the ID for later use in the GET test
    fragmentId = createResponse.body.fragment.id;  });

  test('Unauthenticated requests are denied', async () => {
    await request(app).get(`/v1/fragments/${fragmentId}`).expect(401);
  });

  test('Incorrect credentials are denied', async () => {
    await request(app).get(`/v1/fragments/${fragmentId}`)
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  test('Authenticated users can get a fragment by ID', async () => {
    const response = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');
    expect(response.statusCode).toBe(200);

    expect(response.text).toBe('This is a test fragment for GET test');
  });

  test('Authenticated users can get fragment metadata', async () => {
    const response = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');

    const fragment = response.body.fragment;

    // Check fragment object properties
    expect(fragment).toHaveProperty('id', fragmentId);
    expect(fragment).toHaveProperty('created');
    expect(fragment.created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // ISO string format
    expect(fragment).toHaveProperty('updated');
    expect(fragment.updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/); // ISO string format

    expect(fragment).toHaveProperty('ownerId');
    expect(fragment.ownerId).toMatch(/^[a-fA-F0-9]{64}$/); // 64-character hex hash

    expect(fragment).toHaveProperty('type', 'text/plain');
    expect(fragment).toHaveProperty('size', Buffer.from('This is a test fragment for GET test').length);
  });

  test('Getting a fragment with an invalid ID returns 404', async () => {
    const invalidId = 'invalid-id';
    const response = await request(app)
      .get(`/v1/fragments/${invalidId}`)
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toBe('Fragment not found');
  });
});
