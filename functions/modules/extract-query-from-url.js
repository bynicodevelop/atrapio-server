exports.extractQueryFromUrl = (request, response, { src, cancel }) => {
  if (cancel) {
    return {};
  }

  const uri = new URL(src);

  return { queries: Object.fromEntries(uri.searchParams) };
};
