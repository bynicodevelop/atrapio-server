const { filteredByUserAgent } = require("../../modules/filter-user-agent");

test("Should equal to false", () => {
  expect(
    filteredByUserAgent(
      {},
      {},
      {
        userAgent:
          "Mozilla/5.0 (Linux; Android 7.1.1; SM-J250F Build/NMF26X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/340.0.0.27.113;]",
      }
    )
  ).toEqual({ cancel: false });
});

test("Should equal to false", () => {
  expect(
    filteredByUserAgent(
      {},
      {},
      {
        userAgent:
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      }
    )
  ).toEqual({ cancel: true });
});

test("Should equal to false", () => {
  expect(
    filteredByUserAgent(
      {},
      {},
      {
        userAgent:
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      }
    )
  ).toEqual({ cancel: true });
});
