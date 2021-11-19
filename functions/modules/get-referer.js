const { _ } = require("lodash");

exports.getReferer = async (request, response, { cancel }) => {
  if (cancel) {
    return {};
  }

  const {
    headers: { referer },
  } = request;

  if (_.isEmpty(referer) || _.isUndefined(referer)) {
    return { referer: "direct", domain: "" };
  }

  const refererUrl = new URL(referer);

  const hostnameExploded = refererUrl.hostname.split(".");
  const domain = `${hostnameExploded[hostnameExploded.length - 2]}.${
    hostnameExploded[hostnameExploded.length - 1]
  }`;

  return { referer, domain };
};
