const {
  extractDiffVisitsPageStats,
} = require("../../modules/helpers/extract-diff-visits-page-stats");

test("Should return stat from empty object", () => {
  const beforeData = {};

  const afterData = {
    "/index": {
      1639289911: true,
    },
  };

  const result = extractDiffVisitsPageStats(beforeData, afterData);

  expect(JSON.stringify(result)).toEqual(
    JSON.stringify({ "/index": { 1639289911: true } })
  );
});

test("Should return stat from object with 1 stat", () => {
  const beforeData = {
    "/index": {
      1639289911: true,
    },
  };

  const afterData = {
    "/index": {
      1639289911: true,
      1639290815: true,
    },
  };

  const result = extractDiffVisitsPageStats(beforeData, afterData);

  expect(JSON.stringify(result)).toEqual(
    JSON.stringify({ "/index": { 1639290815: true } })
  );
});

test("Should return stat from object with 1 stat and 2 path", () => {
  const beforeData = {
    "/index": {
      1639289911: true,
    },
  };

  const afterData = {
    "/index": {
      1639289911: true,
    },
    "/programme-formation-flutter/": {
      1639290994: true,
    },
  };

  const result = extractDiffVisitsPageStats(beforeData, afterData);

  expect(JSON.stringify(result)).toEqual(
    JSON.stringify({
      "/programme-formation-flutter/": { 1639290994: true },
    })
  );
});
