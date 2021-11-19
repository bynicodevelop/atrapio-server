const {
  setClicksFromVisitsByDate,
} = require("../../modules/helpers/set-clicks-from-visits-by-date");

test("Should save number of clicks to links by date", async () => {
  // ARRANGE
  let ok = false;

  const admin = {
    firestore: () => ({
      collection: (collectionLinkName) => {
        expect(collectionLinkName).toBe("links");

        return {
          doc: (linkId) => {
            expect(linkId).toBe("linkId");

            return {
              collection: (collectionName) => {
                expect(collectionName).toBe("clicks-by-days");

                return {
                  doc: (timestamp) => {
                    expect(timestamp).toBe("1234567");

                    return {
                      set: (data) => {
                        ok = true;

                        expect(data).toEqual({
                          timestamp: 1234567,
                          value: 10,
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

  // ACT
  await setClicksFromVisitsByDate(
    "linkId",
    10,
    1234567,
    "clicks-by-days",
    admin
  );

  // ASSERT
  expect(ok).toBe(true);
});
