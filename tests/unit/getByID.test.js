const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require(`../../src/model/fragments`);

describe('GET /v1/fragments/:id', () => {
    
  test('authenticated users can fetch a fragment by ID', async () => {
      // Mock the fragment data
      const mockFragment = {
          id: 'fragment1-id',
          ownerId: '11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', // Adjust to match the hashed value in req.user
          getData: jest.fn().mockResolvedValue(Buffer.from('This is the fragment data')),
      };

      // Mock the `Fragment.byId` method to return the mock fragment
      Fragment.byId = jest.fn().mockResolvedValue(mockFragment);

      const response = await request(app)
          .get('/v1/fragments/fragment1-id')
          .auth('user1@email.com', 'password1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok'); 
      expect(response.body).toHaveProperty('fragment', 'This is the fragment data'); // Ensure fragment data is returned as a string

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
      expect(Fragment.byId).toHaveBeenCalledWith('11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a', 'fragment1-id');
  });

});
