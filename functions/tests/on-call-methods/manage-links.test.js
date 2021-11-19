const {
  removeTemporaryLink,
  removeUserLink,
} = require("../../modules/on-call-methods/manage-links");

test("Should delete temporary link", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => ({
      collection: (userCollectionName) => {
        expect(userCollectionName).toBe("users");

        return {
          doc(userId) {
            expect(userId).toBe("user-id");

            return {
              collection(linkCollectionName) {
                expect(linkCollectionName).toBe("temporary-links");

                return {
                  doc(linkId) {
                    expect(linkId).toBe("link-id");

                    return {
                      delete() {
                        ok = true;
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

  // ACT
  await removeTemporaryLink(
    {},
    {
      params: {
        userId: "user-id",
        linkId: "link-id",
      },
    },
    admin
  );

  // ASSERT
  expect(ok).toBe(true);
});

test("Should delete user link when link was deleted", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => ({
      doc: (userReference) => {
        expect(userReference).toBe("refid");

        return {
          delete() {
            ok = true;
          },
        };
      },
    }),
  };

  // ACT
  await removeUserLink(
    {
      data: () => ({
        userLinkRef: "refid",
      }),
    },
    {},
    admin
  );

  // ASSERT
  expect(ok).toBe(true);
});
