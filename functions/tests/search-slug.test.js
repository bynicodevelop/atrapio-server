const { searchSlug } = require("../modules/search-slug");

test("Should return a collection equal to { src: 'https://nico-develop.com' }", async () => {
  // ARRANGE
  let ok = false;

  const request = {};

  const response = {};

  const admin = {
    firestore() {
      return {
        collection(collectionName) {
          expect(collectionName).toBe("links");

          return {
            doc(docName) {
              expect(docName).toBe("123456");

              return {
                get() {
                  return {
                    exists: true,
                    data() {
                      ok = true;

                      return {
                        src: "https://nico-develop.com",
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  // ACT
  const { src } = await searchSlug(
    request,
    response,
    { slug: "123456" },
    admin
  );

  // ASSERT
  expect(src).toBe("https://nico-develop.com");

  expect(ok).toBe(true);
});

test("Should exepect an Error exception", async () => {
  // ARRANGE
  const request = {};

  const response = {};

  const admin = {
    firestore() {
      return {
        collection(collectionName) {
          expect(collectionName).toBe("links");

          return {
            doc(docName) {
              expect(docName).toBe("123456");

              return {
                get() {
                  return {
                    exists: false,
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  // ACT
  // ASSERT
  searchSlug(request, response, { slug: "123456" }, admin).catch((e) => {
    expect(e.message).toBe("Slug not found");
  });
});
