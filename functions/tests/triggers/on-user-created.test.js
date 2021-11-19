const { OnUserCreated } = require("../../modules/triggers/on-user-created");

test("Should create an user collection in firestore", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => {
      return {
        collection: (collectionName) => {
          expect(collectionName).toBe("users");

          return {
            doc: (docId) => {
              expect(docId).toBe("user-id");

              return {
                set: (data) => {
                  ok = true;

                  expect(data).toEqual({});
                },
              };
            },
          };
        },
      };
    },
  };

  const user = {
    uid: "user-id",
  };

  // ACT
  await OnUserCreated(user, admin);

  // ASSERT
  expect(ok).toBe(true);
});
