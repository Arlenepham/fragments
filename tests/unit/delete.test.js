const request = require("supertest");
const app = require("../../src/app");

describe("DELETE /fragments/:id", () => {
  // Setup: Create a test fragment to retrieve
  let fragmentId;

  beforeAll(async () => {
    // Create a fragment for the test (use the actual POST route or database setup code)
    const createResponse = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/plain")
      .send(Buffer.from("This is a test fragment for GET test"));

    // Store the ID for later use in the GET test
    fragmentId = createResponse.body.fragment.id;
  });

  test("Unauthorized requests are denied", async () => {
    const response = await request(app).get(`/v1/fragments/${fragmentId}`);

    expect(response.statusCode).toBe(401);
  });

  test("Invalid fragment id", async () => {
    const response = await request(app)
      .get(`/v1/fragments/32423423423423423432432432432`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(404);
  });
  test("Valid delete request returns 200", async () => {
    const response = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
  });

  test("Deleting a non-existent fragment returns 404", async () => {
    const response = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(404);
  });
});