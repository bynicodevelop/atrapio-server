const admin = require("firebase-admin");
const _ = require("lodash");

const eventExtractor = (eventData, dataStat) => {
  const { event, created_at, value, page, eventRef, visitRef } = eventData;
  const listEvents = ["TrackerEvent.prospect", "EventTracker.click"];

  if (listEvents.includes(event)) {
    if (event === "TrackerEvent.prospect") {
      dataStat["conversion"] = {
        prospect: true,
        conversion_date: created_at,
        value,
        page,
        eventRef,
        visitRef,
      };
    }
  }
};

const isMergeable = (conversionList, conversion) => {
  let isFound = false;

  for (let index = 0; index < conversionList.length; index++) {
    const convertionItem = conversionList[index];

    if (
      convertionItem.page === conversion.page &&
      convertionItem.prospect === conversion.prospect
    ) {
      isFound = true;
    }
  }

  return !isFound;
};

exports.OnNewEventTracked = async (snap, context) => {
  const { trackingId, statId, visitId } = context.params;
  const { event, created_at, value } = snap.data();

  const dataStat = {};

  const stats = await admin
    .firestore()
    .doc(`trackings/${trackingId}/stats/${statId}`)
    .get();

  const visitRef = await admin
    .firestore()
    .doc(`trackings/${trackingId}/stats/${statId}/visits/${visitId}`)
    .get();

  const { page } = visitRef.data();

  eventExtractor(
    {
      event,
      created_at,
      value,
      page,
      eventRef: snap.ref,
      visitRef: visitRef.ref,
    },
    dataStat
  );

  const { conversion = {} } = dataStat;

  const data = {};

  if (!_.isEmpty(conversion)) {
    const conversionsStats = stats.get("conversions") ?? [];

    if (isMergeable(conversionsStats, conversion)) {
      data["conversions"] = admin.firestore.FieldValue.arrayUnion(conversion);
    }
  }

  if (!_.isEmpty(data)) {
    if (!stats.exists) {
      await stats.ref.set(data);
    } else {
      await stats.ref.update(data);
    }
  }
};
