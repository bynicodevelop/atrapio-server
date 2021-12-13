const { _ } = require("lodash");

exports.extractDiffVisitsPageStats = (beforePages, afterPages) => {
  const result = {};

  for (const path in afterPages) {
    if (Object.hasOwnProperty.call(afterPages, path)) {
      const afterStatsPages = Object.keys(afterPages[path] ?? {});
      const beforeStatsPages = Object.keys(beforePages[path] ?? {});

      const stats = afterStatsPages.filter(
        (stat) => !beforeStatsPages.includes(stat)
      );

      const reducedStats = stats.reduce((map, obj) => {
        map[obj] = afterPages[path][obj];
        return map;
      }, {});

      if (!_.isEmpty(reducedStats)) {
        result[path] = reducedStats;
      }
    }
  }

  return result;
};
