exports.removeTemporaryLink = async (snap, context, admin) => {
  const { userId, linkId } = context.params;

  try {
    await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("temporary-links")
      .doc(linkId)
      .delete();
  } catch (error) {
    console.log(error);
  }
};

exports.removeUserLink = async (snap, context, admin) => {
  const { userLinkRef } = snap.data();

  await admin.firestore().doc(userLinkRef).delete();
};
