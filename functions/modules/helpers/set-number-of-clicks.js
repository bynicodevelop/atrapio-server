exports.setNumberOfClicks = async (linkId, admin) => {
  const linkRef = await admin.firestore().collection("links").doc(linkId).get();

  const { userLinkRef } = linkRef.data();

  await admin
    .firestore()
    .doc(userLinkRef)
    .update({
      clicks: admin.firestore.FieldValue.increment(1),
    });

  await linkRef.ref.update({ clicks: admin.firestore.FieldValue.increment(1) });
};
