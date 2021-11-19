const _ = require("lodash");

exports.searchSlug = async (request, response, { slug }, admin) => {
  const slugQuerySnapshot = await admin
    .firestore()
    .collection("links")
    .doc(slug)
    .get();

  if (!slugQuerySnapshot.exists) {
    throw new Error("Slug not found");
  }

  const { src } = slugQuerySnapshot.data();

  return { src };
};
