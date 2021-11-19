const { removeTemporaryLink } = require("../on-call-methods/manage-links");
const { duplicateLink, createReferenceToLink } = require("../duplicate-link");

exports.OnLinkCreated = async (snap, context, admin) => {
  await duplicateLink(snap, context, admin);
  await createReferenceToLink(snap, context, admin);
  await removeTemporaryLink(snap, context, admin);
};
