const functions = require("firebase-functions");
const admin = require("firebase-admin");
const dataSet = require("./dataset/data.json");

const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cookieParser = require("cookie-parser");
const getMetaData = require("metadata-scraper");

admin.initializeApp();

const isDevelopmentMode = process.env.FUNCTIONS_EMULATOR;

const { redirect } = require("./modules/http-request/redirect");
const { searchSlug } = require("./modules/search-slug");
const { createNewVisit } = require("./modules/create-new-visit");
const { cookieManager } = require("./modules/cookie-manager");
const { createNewSession } = require("./modules/create-new-session");
const { OnSessionUpdated } = require("./modules/triggers/on-session-updated");
const { extractQueryFromUrl } = require("./modules/extract-query-from-url");
const { getReferer } = require("./modules/get-referer");
const { filteredByUserAgent } = require("./modules/filter-user-agent");

const { OnLinkCreated } = require("./modules/triggers/on-link-created");
const { OnLinkDeleted } = require("./modules/triggers/on-link-deleted");
const { OnUserCreated } = require("./modules/triggers/on-user-created");
const { OnNewVisit } = require("./modules/triggers/on-new-visit");

const {
  generateTemporaryUniqueId,
  onTemporaryLinkCreated,
  onTemporaryUserLinkDeleted,
} = require("./modules/on-call-methods/generate-unique-id");
const {
  OnNewVisitTracked,
} = require("./modules/triggers/on-new-visit-tracked");
const {
  OnNewEventTracked,
} = require("./modules/triggers/on-new-event-tracked");
const {
  OnUpdateVisitTracked,
} = require("./modules/triggers/on-update-visit-tracked");

const app = express();

app.use(cookieParser());

app.get("/l/:slug", async (req, res) => {
  await redirect(
    req,
    res,
    [
      searchSlug,
      filteredByUserAgent,
      extractQueryFromUrl,
      getReferer,
      cookieManager,
      createNewVisit,
      createNewSession,
    ],
    admin,
    {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      uuid: uuidv4(),
      isDevelopmentMode,
    }
  );
});

exports.redirect = functions.https.onRequest(app);

exports.onUserCreated = functions.auth
  .user()
  .onCreate(async (user) => OnUserCreated(user, admin));

exports.onLinkCreated = functions.firestore
  .document("users/{userId}/links/{linkId}")
  .onCreate(
    async (snap, context) =>
      await OnLinkCreated(snap, context, admin, {
        getMetaData,
        logger: functions.logger.log,
      })
  );

exports.onLinkDeleted = functions.firestore
  .document("links/{linkId}")
  .onDelete(async (snap, context) => await OnLinkDeleted(snap, context, admin));

exports.onSessionUpdated = functions.firestore
  .document("sessions/{sessionId}/visits/{visitId}")
  .onCreate(async (snap, context) => {
    await OnSessionUpdated(snap, context, admin);
  });

exports.OnNewVisit = functions.firestore
  .document("links/{linkId}/visits/{visitId}")
  .onCreate(async (snap, context) => {
    await OnNewVisit(snap, context, admin);
  });

/**
 * Déclanche une action quand un utilisateur
 * vient de créer un lien temporaire pour le réserver
 */
exports.OnTemporaryLinkGenerated = functions.firestore
  .document("temporary-links/{linkId}")
  .onCreate(onTemporaryLinkCreated);

/**
 * Déclanche une action quand un utilisateur
 * vient de créer son lien et à supprimé la lien temporaire
 */
exports.OnTemporaryUserLinkDeleted = functions.firestore
  .document("users/{userId}/temporary-links/{linkId}")
  .onDelete(onTemporaryUserLinkDeleted);

/**
 * Remonte le nombre de visites par session utilisateur
 * (par visiteur)
 * Permet en même temps de remonter les informations relatives à une visite
 * (referer, dernière visite...)
 */
exports.onNewVisitTracked = functions.firestore
  .document("trackings/{trackingId}/stats/{statId}/visits/{visitId}")
  .onCreate(OnNewVisitTracked);

/**
 * Remonte les informations en provenance des événements.
 * (conversion, click...)
 */
exports.onNewEventTracked = functions.firestore
  .document(
    "trackings/{trackingId}/stats/{statId}/visits/{visitId}/events/{eventId}"
  )
  .onCreate(OnNewEventTracked);

/**
 * Permet de générer les stats générales associées à un ID de tracking
 */
exports.onUpdateVisitTracked = functions.firestore
  .document("trackings/{trackingId}/stats/{statId}")
  .onWrite(OnUpdateVisitTracked);

exports.generateTemporaryUniqueId = functions.https.onCall(
  generateTemporaryUniqueId
);

exports.generateTrackingId = functions.https.onCall(async (data, context) => {
  const { uid } = context.auth;

  if (uid == null) {
    throw new functions.https.HttpsError("unauthenticated");
  }

  const { url } = data;

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const baseTrackingId = `${year}${month}${day}`;

  const trackingFound = await admin
    .firestore()
    .collection("trackings")
    .where("baseTrackingId", "==", baseTrackingId)
    .where("url", "==", url)
    .get();

  if (trackingFound.size > 0) {
    const trackingIdDocument = trackingFound.docs[0];

    const data = trackingIdDocument.data();

    return { ...data, trackingId: trackingIdDocument.id };
  }

  const trackingsResult = await admin
    .firestore()
    .collection("trackings")
    .where("baseTrackingId", "==", baseTrackingId)
    .get();

  const trackingId = `${baseTrackingId}-${trackingsResult.size + 1}`;

  const created_at = admin.firestore.FieldValue.serverTimestamp();

  try {
    await admin
      .firestore()
      .collection("trackings")
      .doc(trackingId)
      .set({
        created_at,
        baseTrackingId,
        url,
        trackingId,
        userRef: admin.firestore().doc(`users/${uid}`),
      });
  } catch (error) {
    console.error(error);
  }

  try {
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .collection("trackings")
      .doc(trackingId)
      .set({
        trackingRef: admin.firestore().doc(`trackings/${trackingId}`),
        url,
        created_at,
      });
  } catch (error) {
    console.error(error);
  }

  return {
    trackingId,
    url,
  };
});

// exports.updateClicks = functions.https.onRequest(async (req, res) => {
//   const linkList = await admin.firestore().collection("links").get();

//   for (const linkItem in linkList.docs) {
//     if (Object.hasOwnProperty.call(linkList.docs, linkItem)) {
//       const link = linkList.docs[linkItem];

//       const { userLinkRef } = link.data();

//       const linkRef = admin.firestore().doc(`links/${link.id}`);

//       const visits = await linkRef.collection("visits").get();

//       const clicks = {
//         clicks: visits.size,
//       };

//       await admin.firestore().doc(userLinkRef).update(clicks);

//       await linkRef.update(clicks);
//     }
//   }

//   res.json({ status: "ok" });
// });

if (isDevelopmentMode) {
  exports.createStats = functions.https.onRequest(async (req, res) => {
    body = req.body;

    if (body.length > 0) {
      for (let index = 0; index < body.length; index++) {
        const { uid, data } = body[index];

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const {
              start_time,
              page,
              referrerHost = "",
              query = {},
              events = [],
            } = data[key];

            const visitsRef = await admin
              .firestore()
              .collection("trackings")
              .doc("2021118-1")
              .collection("stats")
              .doc(uid)
              .collection("visits")
              .doc(start_time.toString());

            visitsRef.set({ start_time, page, query, referrerHost });

            if (events) {
              for (const event of events) {
                const { created_at } = event;

                await visitsRef
                  .collection("events")
                  .doc(created_at.toString())
                  .set(event);
              }
            }
          }
        }
      }
    }

    res.send("Stats created");
  });

  exports.setDataSet = functions.https.onRequest(async (req, res) => {
    await setUserDataSet(dataSet);

    await setTrackingDataSet(dataSet);

    res.json({ stats: "ok" });
  });
}

const setTrackingDataSet = async (dataSet) => {
  const key = "trackings";

  const tackingsIds = Object.keys(dataSet[key]);

  for (const trackingId of tackingsIds) {
    const { url, pages, prospects_conversions, stats } =
      dataSet[key][trackingId];

    const trackingRef = admin.firestore().doc(`trackings/${trackingId}`);

    trackingRef.set({ url });

    const pagesIds = Object.keys(pages);

    for (const pageId of pagesIds) {
      const { page, visits } = pages[pageId];

      await trackingRef.collection("pages").doc(pageId).set({ page, visits });
    }

    const prospectsConversionsIds = Object.keys(prospects_conversions);

    for (const prospectConversionId of prospectsConversionsIds) {
      const { conversion_date, page, prospect, value } =
        prospects_conversions[prospectConversionId];

      await trackingRef
        .collection("prospects_conversions")
        .doc(prospectConversionId)
        .set({ conversion_date, page, prospect, value });
    }

    const statsIds = Object.keys(stats);

    for (const statId of statsIds) {
      const { email, last_visit_at } = stats[statId];

      await trackingRef
        .collection("stats")
        .doc(statId)
        .set({ email, last_visit_at });
    }
  }
};

const setUserDataSet = async (data) => {
  await admin.auth().createUser({
    uid: "g3tDd61PdPatq14n1pewDn678q22",
    email: "john@domain.tld",
    password: "123456",
  });

  const key = "users";

  const userIds = Object.keys(data[key]);

  for (const indexId in userIds) {
    if (Object.hasOwnProperty.call(userIds, indexId)) {
      const userId = userIds[indexId];

      const trackingCollection = data[key][userId]["trackings"];

      const trackingId = Object.keys(trackingCollection);

      for (const indexTracking in trackingId) {
        if (Object.hasOwnProperty.call(trackingId, indexTracking)) {
          const tracking = trackingId[indexTracking];
          const { created_at, trackingRef, url } = trackingCollection[tracking];

          const trackingReference = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("trackings")
            .doc(tracking);

          await trackingReference.set({ created_at, trackingRef, url });
        }
      }

      const linksId = Object.keys(data[key][userId]["links"]);

      for (const indexLink in linksId) {
        if (Object.hasOwnProperty.call(linksId, indexLink)) {
          const linkIdRef = linksId[indexLink];

          const { linkId, created_at, linkRef, name, src } =
            data[key][userId]["links"][linkIdRef];

          console.log();

          await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .collection("links")
            .doc(linkIdRef)
            .set({
              linkId,
              created_at,
              linkRef,
              name,
              src,
            });
        }
      }
    }
  }
};
