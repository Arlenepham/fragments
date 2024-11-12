const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragments');

test('authenticated users can fetch a markdown fragment converted to HTML', async () => {
    // Mock the markdown fragment data
    const mockFragment = {
      id: 'fragment1-id',
      ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a',
      getData: jest.fn().mockResolvedValue(Buffer.from('# Title\nThis is markdown content.')),
    };

    // Mock `Fragment.byId` to return the mock fragment
    Fragment.byId = jest.fn().mockResolvedValue(mockFragment);

    // Mock req.user (ownerId in the actual code)
    const user = '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a'; // This should be the ownerId from the mock data

    const response = await request(app)
      .get('/v1/fragments/fragment1-id.html')
      .auth('user1@email.com', 'password1')  // Authenticate the request
      .set('user', user);  // Set the user directly for testing

    // Check the status code, content type, and converted HTML
    expect(response.statusCode).toBe(200);
    expect(response.type).toBe('text/html');

    // Use toMatch to check for potential formatting differences
    expect(response.text).toMatch(/<h1>Title<\/h1>[\s\S]*<p>This is markdown content.<\/p>/);

    // Verify `Fragment.byId` was called with correct parameters
    expect(Fragment.byId).toHaveBeenCalledWith(user, 'fragment1-id');
  });

  test('returns 400 error if requested file extension is not HTML', async () => {
    const response = await request(app)
      .get('/v1/fragments/fragment1-id.txt')
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error.code', 400);
    expect(response.body.error.message).toBe('Unsupported file extension');
  });

  test('returns 401 error if user is not authenticated', async () => {
    const response = await request(app)
      .get('/v1/fragments/fragment1-id.html');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error.code', 401);
    expect(response.body.error.message).toBe('Unauthorized');
  });

  test('returns 404 error if fragment is not found', async () => {
    // Mock `Fragment.byId` to return null (fragment not found)
    Fragment.byId = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .get('/v1/fragments/fragment1-id.html')
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error.code', 404);
    expect(response.body.error.message).toBe('Fragment not found');
    expect(Fragment.byId).toHaveBeenCalledWith('11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', 'fragment1-id');
  });

  test('returns 500 error if an error occurs during fragment retrieval', async () => {
    const error = new Error('Database error');
    Fragment.byId = jest.fn().mockRejectedValue(error);

    const response = await request(app)
      .get('/v1/fragments/fragment1-id.html')
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('error.code', 500);
    expect(response.body.error.message).toBe('Internal Server Error');
  });


