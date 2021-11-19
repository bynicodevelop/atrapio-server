const { createNewVisit } = require("../modules/create-new-visit");

test("Should create new visit from link id", async () => {
  // ARRANGE
  let ok = false;

  const request = {};

  const response = {};

  const admin = {
    firestore: () => ({
      collection: (linkCollectionName) => {
        expect(linkCollectionName).toBe("links");

        return {
          doc: (linkId) => {
            expect(linkId).toBe("linkId");

            return {
              collection: (visitCollectionName) => {
                expect(visitCollectionName).toBe("visits");

                return {
                  add(data) {
                    ok = true;

                    expect(data).toEqual({
                      timestamp: expect.any(Date),
                      queries: { youtube: "5jsqk", tester: "SKLDJSQ" },
                      data: {
                        referer: "https://youtube.com",
                        domain: "youtube.com",
                      },
                    });

                    return {
                      id: "visitId",
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

  const slug = "linkId";
  const timestamp = new Date();

  // ACT
  await createNewVisit(
    request,
    response,
    {
      slug,
      timestamp,
      queries: { youtube: "5jsqk", tester: "SKLDJSQ" },
      referer: "https://youtube.com",
      domain: "youtube.com",
    },
    admin
  );

  // ASSERT
  expect(ok).toBe(true);
});
