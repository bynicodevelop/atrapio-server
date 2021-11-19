const { getReferer } = require("../modules/get-referer");

test("Should get referer referer url from headers", async () => {
  // ARRANGE
  const request = {
    headers: {
      referer: "https://youtube.com",
    },
  };

  const response = {};

  // ACT
  const data = await getReferer(request, response, { cancel: false });

  // ASSERT
  expect(data).toEqual({
    referer: "https://youtube.com",
    domain: "youtube.com",
  });
});

test("Should get referer referer url from headers", async () => {
  // ARRANGE
  const request = {
    headers: {
      referer: "https://l.instagram.com",
    },
  };

  const response = {};

  // ACT

  const data = await getReferer(request, response, { cancel: false });

  // ASSERT
  expect(data).toEqual({
    referer: "https://l.instagram.com",
    domain: "instagram.com",
  });
});

test("Should get referer referer url from headers ('')", async () => {
  // ARRANGE
  const request = {
    headers: {
      referer: "",
    },
  };

  const response = {};

  // ACT

  const data = await getReferer(request, response, { cancel: false });

  // ASSERT
  expect(data).toEqual({ referer: "direct", domain: "" });
});

test("Should get referer referer url from headers (null)", async () => {
  // ARRANGE
  const request = {
    headers: {
      referer: null,
    },
  };

  const response = {};

  // ACT

  const data = await getReferer(request, response, { cancel: false });

  // ASSERT
  expect(data).toEqual({ referer: "direct", domain: "" });
});

test("Should get referer referer url from headers (undefined)", async () => {
  // ARRANGE
  const request = {
    headers: {},
  };

  const response = {};

  // ACT

  const data = await getReferer(request, response, { cancel: false });

  // ASSERT
  expect(data).toEqual({ referer: "direct", domain: "" });
});
