const { createNewSession } = require("../modules/create-new-session");

test("Should create new session in firestore if not exists", async () => {
  // ARRANGE
  let ok1 = false;
  let ok2 = false;
  let ok3 = false;

  const request = {
    cookies: {
      __session: { uid: "string-uid" },
    },
  };

  const response = {};

  const admin = {
    firestore: () => {
      return {
        collection: (sessionCollectionName) => {
          expect(sessionCollectionName).toBe("sessions");

          return {
            doc: (sessionId) => {
              expect(sessionId).toBe("string-uid");

              return {
                get: () => {
                  ok1 = true;
                  return Promise.resolve({
                    exists: false,
                  });
                },
                set: (data) => {
                  ok2 = true;
                  expect(data).toEqual({
                    lastActivity: expect.any(Date),
                  });
                },
                collection: (sessionVisitsRef) => {
                  expect(sessionVisitsRef).toBe("visits");

                  return {
                    doc: (visitId) => {
                      expect(visitId).toBe("visit-uid");

                      return {
                        set: (data) => {
                          ok3 = true;
                          expect(data).toEqual({
                            visitRef: "links/link-uid/visits/visit-uid",
                          });

                          return Promise.resolve();
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
    },
  };

  // ACT
  await createNewSession(
    request,
    response,
    {
      cancel: false,
      cookieId: "string-uid",
      timestamp: new Date(),
      visitRef: "links/link-uid/visits/visit-uid",
      visitId: "visit-uid",
    },
    admin
  );

  // ASSERT
  expect(ok1).toBe(true);
  expect(ok2).toBe(true);
  expect(ok3).toBe(true);
});

test("Should update visits in session in firestore if exists", async () => {
  // ARRANGE
  let ok1 = false;
  let ok2 = false;
  let ok3 = false;

  const request = {
    cookies: {
      __session: { uid: "string-uid" },
    },
  };

  const response = {};

  const admin = {
    firestore: () => {
      return {
        collection: (sessionCollectionName) => {
          expect(sessionCollectionName).toBe("sessions");

          return {
            doc: (sessionId) => {
              expect(sessionId).toBe("string-uid");

              return {
                get: () => {
                  ok1 = true;
                  return Promise.resolve({
                    exists: true,
                  });
                },
                set: (data) => {
                  ok2 = true;
                  expect(data).toEqual({
                    lastActivity: expect.any(Date),
                  });
                },
                collection: (sessionVisitsRef) => {
                  expect(sessionVisitsRef).toBe("visits");

                  return {
                    doc: (visitId) => {
                      expect(visitId).toBe("visit-uid");

                      return {
                        set: (data) => {
                          ok3 = true;
                          expect(data).toEqual({
                            visitRef: "links/link-uid/visits/visit-uid",
                          });

                          return Promise.resolve();
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
    },
  };

  // ACT
  await createNewSession(
    request,
    response,
    {
      cookieId: "string-uid",
      timestamp: new Date(),
      visitRef: "links/link-uid/visits/visit-uid",
      visitId: "visit-uid",
    },
    admin
  );

  // ASSERT
  expect(ok1).toBe(true);
  expect(ok2).toBe(false);
  expect(ok3).toBe(true);
});
