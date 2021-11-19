const { cookieManager } = require("../modules/cookie-manager");

test("Should set new cookie if not exists", async () => {
  // ARRANGE
  let ok = false;

  const request = {
    cookies: {},
  };

  const response = {
    cookie: (name, value) => {
      ok = true;

      expect(name).toBe("__session");
      expect(value).toEqual({ uid: "string-uid" });
    },
  };

  // ACT
  const result = await cookieManager(request, response, { uuid: "string-uid" });

  // EXPECT
  expect(ok).toBe(true);
  expect(result).toEqual({ cookieId: "string-uid" });
});

test("Should not set cookie if exists", async () => {
  // ARRANGE
  let ok = false;

  const request = {
    cookies: {
      __session: { uid: "string-uid" },
    },
  };

  const response = {
    cookie: (name, value) => {},
  };

  // ACT
  const result = await cookieManager(request, response, {
    uuid: "string-uid-other",
  });

  // EXPECT
  expect(ok).toBe(false);
  expect(result).toEqual({ cookieId: "string-uid" });
});
