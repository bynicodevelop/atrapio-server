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

exports.generateTemporaryUniqueId = functions.https.onCall(
  generateTemporaryUniqueId
);

if (isDevelopmentMode) {
  exports.createUser = functions.https.onRequest(async (req, res) => {
    admin.auth().createUser({
      uid: "g3tDd61PdPatq14n1pewDn678q22",
      email: "john@domain.tld",
      password: "123456",
    });

    res.send("User created");
  });
}
