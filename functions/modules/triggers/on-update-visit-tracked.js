const admin = require("firebase-admin");
const _ = require("lodash");
const {
  extractDiffVisitsPageStats,
} = require("../helpers/extract-diff-visits-page-stats");

const prospectsConversions = async (beforeData, afterData, params) => {
  const { trackingId } = params;

  if (!afterData || _.isEmpty(afterData["conversions"])) return;

  if (!beforeData || (beforeData["conversions"] ?? []).length == 0) {
    await admin
      .firestore()
      .doc(`/trackings/${trackingId}`)
      .collection("prospects_conversions")
      .doc(afterData["conversions"][0]["conversion_date"].toString())
      .set(afterData["conversions"][0]);

    return;
  }

  const newConversions = afterData["conversions"].filter(
    (o1) => !beforeData["conversions"].some((o2) => o1.page === o2.page)
  );

  for (let index = 0; index < newConversions.length; index++) {
    const newConversion = newConversions[index];

    await admin
      .firestore()
      .doc(`/trackings/${trackingId}`)
      .collection("prospects_conversions")
      .doc(newConversion["conversion_date"].toString())
      .set(newConversion);
  }
};

const updateVisitPerPage = async (beforeData, afterData, params) => {
  const { trackingId } = params;

  const statsDiff = extractDiffVisitsPageStats(
    beforeData["pages"] ?? {},
    afterData["pages"] ?? {}
  );

  const visitPerPageRef = admin
    .firestore()
    .doc(`/trackings/${trackingId}`)
    .collection("pages");

  for (const page in statsDiff) {
    if (Object.hasOwnProperty.call(statsDiff, page)) {
      const element = statsDiff[page];

      const itemId = Object.keys(element)[0];

      const pageVisit = await visitPerPageRef.where("page", "==", page).get();

      let pageVisitDocRef = null;

      const data = {
        page,
        visits: admin.firestore.FieldValue.increment(1),
      };

      if (pageVisit.size == 0) {
        pageVisitDocRef = await visitPerPageRef.add(data);
      } else {
        pageVisitDoc = pageVisit.docs[0];

        pageVisitDocRef = pageVisitDoc.ref;

        await pageVisitDocRef.update(data);
      }

      // TODO: Mettre une erreur si pageVisitDoc est null

      await pageVisitDocRef
        .collection("visits")
        .doc(itemId)
        .set({
          [itemId]: element[itemId],
        });
    }
  }
};

exports.OnUpdateVisitTracked = async (change, context) => {
  const { trackingId } = context.params;
  const beforeData = change.before.data();
  const afterData = change.after.data();

  await prospectsConversions(beforeData ?? {}, afterData ?? {}, { trackingId });
  await updateVisitPerPage(beforeData ?? {}, afterData ?? {}, { trackingId });
};
