exports.OnUserCreated = async (user, admin) => {
  await admin.firestore().collection("users").doc(user.uid).set({});
};
