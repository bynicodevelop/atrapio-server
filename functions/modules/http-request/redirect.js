exports.redirect = async (request, response, callbacks, admin, params) => {
  const { slug } = request.params;
  const userAgent = request.headers["user-agent"];

  let localParams = { ...params, ...{ slug, userAgent } };

  try {
    if (callbacks.length > 0) {
      for (let i = 0; i < callbacks.length; i++) {
        const callback = callbacks[i];
        const callbackParams = await callback(
          request,
          response,
          localParams,
          admin
        );

        if (callbackParams) {
          localParams = { ...localParams, ...callbackParams };
        }
      }
    }

    const { src } = localParams;

    if (params.isDevelopmentMode) {
      response.send(`Redirecting to ${src}`);
    } else {
      response.redirect(302, src);
    }
  } catch (error) {
    console.log(error);
    response.status(404).end();
  }
};
