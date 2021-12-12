const admin = require("firebase-admin");
const _ = require("lodash");

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

exports.OnUpdateVisitTracked = async (change, context) => {
  const { trackingId } = context.params;
  const beforeData = change.before.data();
  const afterData = change.after.data();

  await prospectsConversions(beforeData, afterData, { trackingId });
};
