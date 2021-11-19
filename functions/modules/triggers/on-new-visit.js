const {
  getClicksFromVisitsByDate,
} = require("../helpers/get-clicks-from-visits-by-date");
const { getRoudedDate } = require("../helpers/rounded-time");
const {
  setClicksFromVisitsByDate,
} = require("../helpers/set-clicks-from-visits-by-date");

exports.OnNewVisit = async (snap, context, admin) => {
  const { linkId } = context.params;

  const date = admin.firestore.Timestamp.now();

  const dateByDay = getRoudedDate(date.seconds, "days");
  const dateByHours = getRoudedDate(date.seconds, "hours");
  const dateByMinutes = getRoudedDate(date.seconds, "minutes");

  const clicksByDays = await getClicksFromVisitsByDate(
    linkId,
    admin.firestore.Timestamp.fromDate(dateByDay),
    admin
  );

  const clicksByHours = await getClicksFromVisitsByDate(
    linkId,
    admin.firestore.Timestamp.fromDate(dateByHours),
    admin
  );

  const clicksByMinutes = await getClicksFromVisitsByDate(
    linkId,
    admin.firestore.Timestamp.fromDate(dateByMinutes),
    admin
  );

  await setClicksFromVisitsByDate(
    linkId,
    clicksByDays.length,
    dateByDay.getTime(),
    "clicks-by-days",
    admin
  );

  await setClicksFromVisitsByDate(
    linkId,
    clicksByHours.length,
    dateByDay.getTime(),
    "clicks-by-hours",
    admin
  );

  await setClicksFromVisitsByDate(
    linkId,
    clicksByMinutes.length,
    dateByMinutes.getTime(),
    "clicks-by-minutes",
    admin
  );
};
