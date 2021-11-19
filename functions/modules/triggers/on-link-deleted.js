const { removeUserLink } = require("../on-call-methods/manage-links");

exports.OnLinkDeleted = async (snap, context, admin) => {
  await removeUserLink(snap, context, admin);
};
