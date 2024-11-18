const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragments');

describe('GET /v1/fragments/:id', () => {

  test('authenticated users can fetch a fragment by ID', async () => {
      // Mock the fragment data
      const mockFragment = {
          id: 'fragment1-id',
          ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', // Adjust to match the hashed value in req.user
          getData: jest.fn().mockResolvedValue(Buffer.from('This is the fragment data')),
          type: 'text/plain',
      };

      // Mock the `Fragment.byId` method to return the mock fragment
      Fragment.byId = jest.fn().mockResolvedValue(mockFragment);

      const response = await request(app)
          .get('/v1/fragments/fragment1-id')
          .auth('user1@email.com', 'password1');

      // Check status code and response body
      expect(response.statusCode).toBe(200);
      expect(response.header['content-type']).toBe('text/plain'); // Ensure correct Content-Type header
      expect(response.text).toBe('This is the fragment data'); // Ensure raw fragment data is returned

      // Ensure `Fragment.byId` was called with the correct parameters
      expect(Fragment.byId).toHaveBeenCalledWith('11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', 'fragment1-id');
  });

  test('returns 404 error if fragment is not found', async () => {
      // Mock the `Fragment.byId` method to return null (fragment not found)
      Fragment.byId = jest.fn().mockResolvedValue(null);

      const response = await request(app)
          .get('/v1/fragments/fragment1-id')
          .auth('user1@email.com', 'password1'); // Mock the authenticated request

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('error.code', 404);
      expect(response.body.error.message).toBe('Fragment not found');

      // Ensure `Fragment.byId` was called with the correct parameters
      expect(Fragment.byId).toHaveBeenCalledWith('11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', 'fragment1-id');
  });

  test('authenticated users can fetch fragment metadata by ID with /info', async () => {
    const mockFragmentMetadata = {
      id: 'fragment1-id',
      ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a',
      created: '2024-11-04T18:59:31.779Z',
      updated: '2024-11-04T18:59:31.779Z',
      type: 'text/plain',
      size: 1024,
    };

    Fragment.byId = jest.fn().mockResolvedValue(mockFragmentMetadata);

    const response = await request(app)
      .get('/v1/fragments/fragment1-id/info')
      .auth('user1@email.com', 'password1');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('fragment', mockFragmentMetadata);

    // Ensure `Fragment.byId` was called with the correct parameters
    expect(Fragment.byId).toHaveBeenCalledWith(
      '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a',
      'fragment1-id'
    );
  });

});
