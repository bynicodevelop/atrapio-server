exports.OnSessionUpdated = (snap, context, admin) => {
  const { sessionId } = context.params;
  const { visitRef } = snap.data();

  visitRef.update({
    sessionRef: admin.firestore().collection("sessions").doc(sessionId),
  });
};
