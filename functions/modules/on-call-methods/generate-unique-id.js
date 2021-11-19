const functions = require("firebase-functions");
const admin = require("firebase-admin");
const _ = require("lodash");

const { customAlphabet } = require("nanoid/async");

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const numbers = "0123456789";

const strings = `${alphabet}${alphabet.toUpperCase()}${numbers}`;

// const strings = "12";
const permutations = 5;

const nanoid = customAlphabet(strings, permutations);

const linkRef = admin.firestore().collection("links");
const temporaryLinkRef = admin.firestore().collection("temporary-links");

const countLinks = async () =>
  (await linkRef.get()).size + (await temporaryLinkRef.get()).size;

const getUserTemporaryLinks = async (uid) =>
  await admin
    .firestore()
    .collection("users")
    .doc(uid)
    .collection("temporary-links")
    .get();

const isPossible = async () => {
  console.log(await countLinks(), Math.pow(strings.length, permutations));
  return (await countLinks()) < Math.pow(strings.length, permutations);
};

const generateUniqueIdFromLinks = async () => {
  const uniqueId = await nanoid();

  console.log("Run new unique ID");

  /**
   * It's not possible to create new link
   */
  if (!(await isPossible())) return null;

  const link = await linkRef.doc(uniqueId).get();

  if (link.exists) {
    await generateUniqueIdFromLinks();
  }

  const temporaryLink = await admin
    .firestore()
    .collection("temporary-links")
    .doc(uniqueId)
    .get();

  if (temporaryLink.exists) {
    await generateUniqueIdFromLinks();
  }

  return uniqueId;
};

exports.generateTemporaryUniqueId = async (data, context) => {
  const { uid } = context.auth;

  if (uid == null) {
    throw new functions.https.HttpsError("unauthenticated");
  }

  const temporaryLinks = await getUserTemporaryLinks(uid);

  if (temporaryLinks.size > 0) {
    const link = temporaryLinks.docs[0];

    return {
      linkId: link.id,
    };
  }

  const userRef = await admin.firestore().collection("users").doc(uid);

  const uniqueId = await generateUniqueIdFromLinks();

  if (!_.isNull(uniqueId)) {
    const date = admin.firestore.Timestamp.now();

    await admin
      .firestore()
      .collection("temporary-links")
      .doc(uniqueId)
      .set({ userRef, date });
  }

  return {
    linkId: uniqueId,
  };
};

/**
 * Permet d'associer un lien temporaire à un compte utilisateur
 *
 * @param {*} snap
 * @param {*} context
 * @returns
 */
exports.onTemporaryLinkCreated = async (snap, context) => {
  const { linkId } = context.params;

  const temporaryLink = await admin
    .firestore()
    .collection("temporary-links")
    .doc(linkId)
    .get();

  const { userRef, date } = temporaryLink.data();

  userRef.collection("temporary-links").doc(linkId).set({
    temporaryLinkRef: temporaryLink.ref,
    date,
  });

  return {
    result: "created",
  };
};

/**
 * Permet de supprimer les id de liens dans liste des liens temporaires
 *
 * @param {*} snap
 * @param {*} context
 * @returns
 */
exports.onTemporaryUserLinkDeleted = async (snap, context) => {
  const { linkId } = context.params;

  await admin.firestore().collection("temporary-links").doc(linkId).delete();

  return {
    result: "deleted",
  };
};
