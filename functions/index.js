const functions = require("firebase-functions");
const admin = require("firebase-admin");

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

exports.onNewVisitTracked = functions.firestore
  .document("trackings/{trackingId}/stats/{statId}/visits/{visitId}")
  .onCreate(OnNewVisitTracked);

exports.onNewEventTracked = functions.firestore
  .document(
    "trackings/{trackingId}/stats/{statId}/visits/{visitId}/events/{eventId}"
  )
  .onCreate(OnNewEventTracked);

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

if (isDevelopmentMode) {
  exports.createUser = functions.https.onRequest(async (req, res) => {
    admin.auth().createUser({
      uid: "g3tDd61PdPatq14n1pewDn678q22",
      email: "john@domain.tld",
      password: "123456",
    });

    res.send("User created");
  });

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

  exports.getStats = functions.https.onRequest(async (req, res) => {
    // BESOIN
    // Nombre de visites uniques
    // Nombre de visites par jours
    // Nombre de convertions
    // Referrer

    res.json({
      trackingId: req.query.trackingId,
    });
  });
}
