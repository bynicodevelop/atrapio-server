exports.createNewSession = async (
  request,
  response,
  { cookieId, cancel, timestamp, visitId, visitRef },
  admin
) => {
  if (cancel) {
    return {};
  }

  const sessionRef = await admin
    .firestore()
    .collection("sessions")
    .doc(cookieId)
    .get();

  if (!sessionRef.exists) {
    const session = {
      lastActivity: timestamp,
    };

    await admin.firestore().collection("sessions").doc(cookieId).set(session);
  }

  await admin
    .firestore()
    .collection("sessions")
    .doc(cookieId)
    .collection("visits")
    .doc(visitId)
    .set({ visitRef });
};
