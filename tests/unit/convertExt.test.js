const request = require("supertest");
const app = require("../../src/app");

describe("GET /fragments/:id.:ext", () => {
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

  test("Convert to txt", async () => {
    let response = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth("user1@email.com", "password1");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("This is a test fragment for GET test");

    const responseForCreatingMarkdown = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/markdown")
      .send(Buffer.from("Fragment type: text/markdown"));

    response = await request(app)
      .get(`/v1/fragments/${responseForCreatingMarkdown.body.fragment.id}.txt`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Fragment type: text/markdown");

    const responseForCreatingHtml = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/html")
      .send(Buffer.from("<p>Fragment type: text/html</p>"));

    response = await request(app)
      .get(`/v1/fragments/${responseForCreatingHtml.body.fragment.id}.txt`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Fragment type: text/html");

    const responseForCreatingCSV = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob, age\nArlene, 03/21, 21"));

    response = await request(app)
      .get(`/v1/fragments/${responseForCreatingCSV.body.fragment.id}.txt`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("name, dob, age\nArlene, 03/21, 21");
  });

  test("Convert to markdown", async () => {
    const responseForCreatingMarkdown = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/markdown")
      .send(Buffer.from("## Fragment type: text/markdown"));

    let response = await request(app)
      .get(`/v1/fragments/${responseForCreatingMarkdown.body.fragment.id}.md`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("## Fragment type: text/markdown");
  });

  test("Convert to Html", async () => {
    const responseForCreatingMarkdown = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/markdown")
      .send(Buffer.from("## Fragment type: text/markdown", "utf-8"));

    let response = await request(app)
      .get(`/v1/fragments/${responseForCreatingMarkdown.body.fragment.id}.html`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text.trim()).toBe("<h2>Fragment type: text/markdown</h2>");
  });

  test("Convert to csv", async () => {
    const responseForCreatingMarkdown = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob, age\nArlene, 03/21, 21"));

    let response = await request(app)
      .get(`/v1/fragments/${responseForCreatingMarkdown.body.fragment.id}.csv`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("name, dob, age\nArlene, 03/21, 21");
  });

  test("Convert to JSON", async () => {
    const responseForCreatingMarkdown = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, Arlene\nage, 21"));

    let response = await request(app)
      .get(`/v1/fragments/${responseForCreatingMarkdown.body.fragment.id}.json`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);

    const responseForCreatingCSV = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob\nArlene, 21"));

    response = await request(app)
      .get(`/v1/fragments/${responseForCreatingCSV.body.fragment.id}.json`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(200);
  });

  test("Unsupported convert from CSV", async () => {
    const responseForCreatingCSV = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob, age\nArlene, 03/21, 21"));

    const response = await request(app)
      .get(
        `/v1/fragments/${responseForCreatingCSV.body.fragment.id}.unsupported`
      )
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Unsupported file extension");
  });

  test("Unsupported convert from CSV to xml", async () => {
    const responseForCreatingCSV = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob, age\nArlene, 03/21, 21"));

    const response = await request(app)
      .get(`/v1/fragments/${responseForCreatingCSV.body.fragment.id}.xml`)
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Unsupported file extension");
  });

  test("Unsupported convert from CSV to invalid extension", async () => {
    const responseForCreatingCSV = await request(app)
      .post("/v1/fragments")
      .auth("user1@email.com", "password1")
      .set("Content-Type", "text/csv")
      .send(Buffer.from("name, dob, age\nArlene, 03/21, 21"));

    const response = await request(app)
      .get(
        `/v1/fragments/${responseForCreatingCSV.body.fragment.id}.invalidext`
      )
      .auth("user1@email.com", "password1");

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Unsupported file extension");
  });
});
