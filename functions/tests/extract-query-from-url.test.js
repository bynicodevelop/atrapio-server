const { extractQueryFromUrl } = require("../modules/extract-query-from-url");

test("Should return an object of query from an url", async () => {
  const src = "https://www.example.com/search?q=test&page=1";
  const query = await extractQueryFromUrl({}, {}, { src });

  expect(query).toEqual({
    queries: {
      q: "test",
      page: "1",
    },
  });
});
