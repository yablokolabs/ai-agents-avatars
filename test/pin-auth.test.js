const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { authHeaders } = require("../scripts/pin.js");

describe("pinning credentials", () => {
  test("sends a JWT as a bearer token", () => {
    assert.deepEqual(authHeaders({ PINATA_JWT: "eyJtoken" }), {
      Authorization: "Bearer eyJtoken",
    });
  });

  test("falls back to the legacy key and secret pair", () => {
    assert.deepEqual(authHeaders({ PINATA_API_KEY: "k", PINATA_API_SECRET: "s" }), {
      pinata_api_key: "k",
      pinata_secret_api_key: "s",
    });
  });

  test("prefers the JWT when both are present", () => {
    const headers = authHeaders({ PINATA_JWT: "eyJtoken", PINATA_API_KEY: "k", PINATA_API_SECRET: "s" });
    assert.deepEqual(headers, { Authorization: "Bearer eyJtoken" });
  });

  test("refuses to pin with no credentials at all", () => {
    assert.throws(() => authHeaders({}), /PINATA_JWT/);
  });

  test("refuses a half-configured legacy pair", () => {
    assert.throws(() => authHeaders({ PINATA_API_KEY: "k" }), /PINATA_JWT/);
  });
});
