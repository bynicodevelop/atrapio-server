const {
  OnSessionUpdated,
} = require("../../modules/triggers/on-session-updated");

test("Should update visit from session in links collection", async () => {
  // ARRANGE
  let ok1 = false;
  let ok2 = false;

  const snap = {
    data: () => ({
      visitRef: {
        update: (data) => {
          ok1 = true;
          expect(data).toEqual({
            sessionRef: "sessions/session-id",
          });
        },
      },
    }),
  };

  const context = {
    params: {
      sessionId: "session-id",
    },
  };

  const admin = {
    firestore: () => ({
      collection: (sessionCollectionName) => {
        expect(sessionCollectionName).toEqual("sessions");

        return {
          doc: (sessionId) => {
            ok2 = true;

            expect(sessionId).toEqual("session-id");

            return "sessions/session-id";
          },
        };
      },
    }),
  };

  // ACT
  await OnSessionUpdated(snap, context, admin);

  // ASSERT
  expect(ok1).toBe(true);
  expect(ok2).toBe(true);
});
