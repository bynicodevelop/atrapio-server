const admin = require("firebase-admin");
const _ = require("lodash");

const emailExtractor = (stat, dataStat) => {
  if (_.isEmpty(stat.query)) return;

  const { email = null } = stat.query;

  if (email == null) {
    return null;
  }

  dataStat["email"] = email;
};

const updateVisitPerPage = (data, params) => {
  const { start_time, page, pages } = params;

  if (Object.keys(pages).includes(page)) {
    pages[page] = { ...pages[page], ...{ [start_time]: true } };

    data["pages"] = pages;
  } else {
    data["pages"] = {
      ...pages,
      ...{
        [page]: { [start_time]: true },
      },
    };
  }
};

exports.OnNewVisitTracked = async (snap, context) => {
  const { trackingId, statId } = context.params;
  const { referrerHost = "", page, start_time } = snap.data();

  const dataStat = {};

  emailExtractor(snap.data(), dataStat);

  const stats = await admin
    .firestore()
    .doc(`trackings/${trackingId}/stats/${statId}`)
    .get();

  const pages = stats.get("pages") ?? {};

  const data = {
    ...dataStat,
    last_visit_at: admin.firestore.FieldValue.serverTimestamp(),
    n_visits: admin.firestore.FieldValue.increment(1),
  };

  updateVisitPerPage(data, { page, start_time, pages });

  if (!_.isEmpty(referrerHost)) {
    data["referrersHost"] = admin.firestore.FieldValue.arrayUnion(referrerHost);
  }

  if (!stats.exists) {
    data["first_contact_referrer_host"] = referrerHost;

    await stats.ref.set(data);
  } else {
    await stats.ref.update(data);
  }
};
