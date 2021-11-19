exports.getClicksFromVisitsByDate = async (linkId, date, admin) => {
  const visits = await admin
    .firestore()
    .collection("links")
    .doc(linkId)
    .collection("visits")
    .where("timestamp", ">=", date)
    .get();

  return visits.docs;
};
