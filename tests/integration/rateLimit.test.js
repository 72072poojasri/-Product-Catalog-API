const request = require("supertest");

const app = require("../../src/app");

describe("Rate Limiting Middleware", () => {
  it("should enforce API rate limiting", async () => {
    let blocked = false;

    for (let i = 0; i < 60; i++) {
      const response = await request(app).get("/health");

      if (response.statusCode === 429) {
        blocked = true;
        break;
      }
    }

    expect(blocked).toBe(true);
  });
});