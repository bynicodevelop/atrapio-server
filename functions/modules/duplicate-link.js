exports.duplicateLink = async (snap, context, admin) => {
  const { src } = snap.data();
  const { userId, linkId } = context.params;

  await admin
    .firestore()
    .collection("links")
    .doc(linkId)
    .set({
      src,
      userLinkRef: `users/${userId}/links/${linkId}`,
      userRef: `users/${userId}`,
    });
};

exports.createReferenceToLink = async (snap, context, admin) => {
  const { userId, linkId } = context.params;

  await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("links")
    .doc(linkId)
    .update({
      linkRef: `links/${linkId}`,
    });
};
