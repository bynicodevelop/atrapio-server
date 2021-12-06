const { removeTemporaryLink } = require("../on-call-methods/manage-links");
const {
  duplicateLink,
  createReferenceToLink,
  updateLink,
} = require("../duplicate-link");

exports.OnLinkCreated = async (snap, context, admin, params) => {
  const { logger } = params;

  try {
    await updateLink(snap, context, admin, params);
  } catch (error) {
    logger(error);
  }

  try {
    await duplicateLink(snap, context, admin, params);
  } catch (error) {
    logger(error);
  }

  try {
    await createReferenceToLink(snap, context, admin, params);
  } catch (error) {
    logger(error);
  }

  try {
    await removeTemporaryLink(snap, context, admin, params);
  } catch (error) {
    logger(error);
  }
};
