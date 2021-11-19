const { redirect } = require("../../modules/http-request/redirect");

test("Should redirect to https://nico-develop.com", async () => {
  // ARRANGE
  let ok = false;

  const request = {
    headers: {
      "user-agent": "youtube",
    },
    params: {
      slug: "Rtgd5hjs",
    },
  };

  const response = {
    redirect: (status, url) => {
      expect(status).toBe(302);
      expect(url).toBe("https://nico-develop.com");

      ok = true;
    },
  };

  // ACT
  await redirect(
    request,
    response,
    [
      async (request, response, { slug }) => ({
        src: "https://nico-develop.com",
      }),
    ],
    null,
    {}
  );

  // ASSERT
  expect(ok).toBe(true);
});

test("Should expected 404 no found with value aaa", async () => {
  // ARRANGE
  let ok = false;

  const request = {
    headers: {
      "user-agent": "youtube",
    },
    params: {
      slug: "aaa",
    },
  };

  const response = {
    status: (status) => {
      expect(status).toBe(404);

      return {
        end: () => {
          ok = true;
        },
      };
    },
  };

  // ACT
  await redirect(
    request,
    response,
    [
      (request, response, { slug }) => {
        throw new Error("Not found");
      },
    ],
    null,
    {}
  );

  // EXPECT
  expect(ok).toBe(true);
});
