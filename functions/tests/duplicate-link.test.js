const {
  duplicateLink,
  createReferenceToLink,
} = require("../modules/duplicate-link");

test("Should duplicate data in link's document", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => ({
      collection: (linkCollectionName) => {
        expect(linkCollectionName).toBe("links");

        return {
          doc: (docId) => {
            expect(docId).toBe("google");

            return {
              set: (data) => {
                ok = true;
                expect(data).toEqual({
                  src: "https://www.google.com",
                  userLinkRef: "users/user-id/links/google",
                  userRef: "users/user-id",
                });
              },
            };
          },
        };
      },
    }),
  };

  const snap = {
    data: () => ({
      src: "https://www.google.com",
    }),
  };

  const context = {
    params: {
      userId: "user-id",
      linkId: "google",
    },
  };

  // ACT
  await duplicateLink(snap, context, admin);

  // ASSERT
  expect(ok).toBe(true);
});

test("Should create reference link in user's document", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => ({
      collection: (linkCollectionName) => {
        expect(linkCollectionName).toBe("users");

        return {
          doc: (docId) => {
            expect(docId).toBe("user-id");

            return {
              collection: (linkCollectionName) => {
                expect(linkCollectionName).toBe("links");

                return {
                  doc: (docId) => {
                    expect(docId).toBe("google");

                    return {
                      update: (data) => {
                        ok = true;

                        expect(data).toEqual({
                          linkRef: "links/google",
                        });
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    }),
  };

  const snap = {
    data: () => ({
      src: "https://www.google.com",
    }),
  };

  const context = {
    params: {
      userId: "user-id",
      linkId: "google",
    },
  };

  // ACT
  await createReferenceToLink(snap, context, admin);

  // ASSERT
  expect(ok).toBe(true);
});
