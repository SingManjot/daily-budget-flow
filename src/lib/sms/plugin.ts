import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import type { RawSms } from "./parser";

/**
 * Bridge to the native plugin in plugins/sms-capture (Android only).
 * On web and iOS every call is a harmless no-op; check `smsSupported()` first.
 */
interface SmsCapturePlugin {
  checkPermissions(): Promise<{ sms: PermissionState }>;
  requestPermissions(): Promise<{ sms: PermissionState }>;
  getPending(): Promise<{ messages: RawSms[] }>;
  removePending(options: { ids: string[] }): Promise<void>;
  readInbox(options: { since: number; limit?: number }): Promise<{ messages: RawSms[] }>;
  setEnabled(options: { enabled: boolean }): Promise<void>;
  addListener(event: "smsReceived", fn: () => void): Promise<PluginListenerHandle>;
}

type PermissionState = "granted" | "denied" | "prompt" | "prompt-with-rationale";

const SmsCapture = registerPlugin<SmsCapturePlugin>("SmsCapture");

export function smsSupported(): boolean {
  return Capacitor.getPlatform() === "android" && Capacitor.isPluginAvailable("SmsCapture");
}

export async function smsPermission(): Promise<PermissionState> {
  if (!smsSupported()) return "denied";
  return (await SmsCapture.checkPermissions()).sms;
}

export async function requestSmsPermission(): Promise<PermissionState> {
  if (!smsSupported()) return "denied";
  return (await SmsCapture.requestPermissions()).sms;
}

/** Messages captured in the background since the last drain. Call `ackPending` after storing. */
export async function getPendingSms(): Promise<RawSms[]> {
  if (!smsSupported()) return [];
  return (await SmsCapture.getPending()).messages ?? [];
}

export async function ackPendingSms(ids: string[]): Promise<void> {
  if (!smsSupported() || ids.length === 0) return;
  await SmsCapture.removePending({ ids });
}

/** Back-fill: bank debit messages already in the inbox since `days` ago. */
export async function readInboxSms(days: number): Promise<RawSms[]> {
  if (!smsSupported()) return [];
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return (await SmsCapture.readInbox({ since, limit: 1000 })).messages ?? [];
}

/** Mirror the in-app switch natively. Off stops background capture and clears its queue. */
export async function setNativeSmsEnabled(enabled: boolean): Promise<void> {
  if (!smsSupported()) return;
  await SmsCapture.setEnabled({ enabled });
}

export function onSmsReceived(fn: () => void): () => void {
  if (!smsSupported()) return () => {};
  const handle = SmsCapture.addListener("smsReceived", fn);
  return () => {
    void handle.then((h) => h.remove());
  };
}
