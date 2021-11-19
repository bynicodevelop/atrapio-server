exports.filteredByUserAgent = (request, response, { userAgent }, admin) => {
  const userAgents = [
    "facebookexternalhit",
    "Facebot",
    "Googlebot",
    "google.com/bot",
    "Google-PageRenderer",
    "SerendeputyBot",
    "Twitterbot",
    "Slackbot-LinkExpanding",
    "LivelapBot",
    "okhttp",
  ];

  let cancel = false;

  userAgents.forEach((userAgentString) => {
    if (userAgent.includes(userAgentString)) {
      cancel = true;
    }
  });

  return { cancel };
};
