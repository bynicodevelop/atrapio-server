exports.createNewVisit = async (
  request,
  response,
  { slug, timestamp, queries, referer, domain, cancel },
  admin
) => {
  if (cancel) {
    return {};
  }

  const visitRef = await admin
    .firestore()
    .collection("links")
    .doc(slug)
    .collection("visits")
    .add({
      timestamp,
      queries,
      data: { referer, domain },
    });

  return { visitRef, visitId: visitRef.id };
};
