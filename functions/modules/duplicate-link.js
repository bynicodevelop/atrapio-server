exports.updateLink = async (snap, context, admin, params) => {
  const { getMetaData } = params;
  const { src } = snap.data();
  const { userId, linkId } = context.params;

  const metadata = await getMetaData(src);

  const { title = "", description = "", image = "" } = metadata;

  await admin
    .firestore()
    .collection("users")
    .doc(userId)
    .collection("links")
    .doc(linkId)
    .update({
      metadata: { name: title, description, image },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
};

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
