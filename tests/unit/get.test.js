// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require(`../../src/model/fragments`);


describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated users can fetch their fragment IDs', async () => {
    // Mock the fragments returned for the user
    const mockFragments = [
        'fragment1-id',
        'fragment2-id',
        'fragment3-id'
    ];

    // Mock the `Fragment.byUser` method to return the mock fragment IDs
    Fragment.byUser = jest.fn().mockResolvedValue(mockFragments);

    const response = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1'); 
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok'); 
    expect(response.body).toHaveProperty('fragments'); 
    
    expect(response.body.fragments).toEqual(mockFragments);
    expect(Array.isArray(response.body.fragments)).toBe(true); // Ensure it's an array
    expect(response.body.fragments.length).toBe(3); // Ensure the array length matches
});
});
