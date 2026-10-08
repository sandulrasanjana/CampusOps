const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config();

let app;

if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'campusops-26ed0';

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId
      });
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT env var, falling back to projectId:', e.message);
      app = initializeApp({ projectId });
    }
  } else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    app = initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      projectId
    });
  } else {
    app = initializeApp({
      projectId
    });
  }
} else {
  app = getApps()[0];
}

const admin = {
  app,
  auth: () => getAuth(app),
  getAuth: () => getAuth(app)
};

module.exports = admin;
