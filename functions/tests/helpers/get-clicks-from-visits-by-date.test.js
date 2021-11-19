const {
  getClicksFromVisitsByDate,
} = require("../../modules/helpers/get-clicks-from-visits-by-date");

test("Should return 10 visits form firestore", async () => {
  // ARRANGE
  const admin = {
    firestore: () => ({
      collection: (collectionLinkName) => {
        expect(collectionLinkName).toBe("links");

        return {
          doc: (linkId) => {
            expect(linkId).toBe("linkId");

            return {
              collection: (collectionVisitName) => {
                expect(collectionVisitName).toBe("visits");

                return {
                  where: (field, coparator, value) => {
                    expect(field).toBe("timestamp");
                    expect(coparator).toBe(">=");
                    expect(value).toBe("2020-01-01");

                    return {
                      get: () => ({
                        docs: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
                      }),
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
  const result = await getClicksFromVisitsByDate("linkId", "2020-01-01", admin);

  // ASSERT
  expect(result).toEqual([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
});
