exports.setClicksFromVisitsByDate = async (
  linkId,
  clicks,
  timestamp,
  collection,
  admin
) => {
  await admin
    .firestore()
    .collection("links")
    .doc(linkId)
    .collection(collection)
    .doc(timestamp.toString())
    .set({
      timestamp,
      value: clicks,
    });
};
