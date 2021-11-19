const { _ } = require("lodash");

exports.cookieManager = (request, response, { uuid, cancel }) => {
  const { __session: { uid } = { uid: null } } = request.cookies;

  if (cancel) {
    return {};
  }

  if (_.isEmpty(uid)) {
    response.cookie("__session", { uid: uuid });

    return { cookieId: uuid };
  }

  return { cookieId: uid };
};
