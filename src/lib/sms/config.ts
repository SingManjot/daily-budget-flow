/**
 * Bank SMS import is switched off until the app ships through Google Play.
 *
 * Sideloaded apps that request SMS permissions are blocked by Play Protect's
 * enhanced fraud protection, so the native plugin (plugins/sms-capture) is also
 * left out of package.json, which keeps its permissions out of the APK.
 *
 * To turn it back on:
 *   1. set SMS_IMPORT_ENABLED to true
 *   2. npm install --save capacitor-sms-capture@file:plugins/sms-capture
 */
export const SMS_IMPORT_ENABLED = false;
