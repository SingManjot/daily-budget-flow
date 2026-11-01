import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import {
  ackPendingSms,
  getPendingSms,
  onSmsReceived,
  setNativeSmsEnabled,
  smsSupported,
} from "./plugin";

/**
 * Drains SMS captured by the native receiver into the review queue: on launch, whenever the
 * app returns to the foreground, and live when a message arrives while it's open.
 * Does nothing unless SMS import is enabled and we're in the Android app.
 */
export function useSmsSync() {
  const { data, ingestSms } = useStore();
  const enabled = data.smsImport?.enabled === true;
  const busy = useRef(false);
  const ingestRef = useRef(ingestSms);
  ingestRef.current = ingestSms;

  const sync = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const messages = await getPendingSms();
      if (messages.length === 0) return;
      const added = ingestRef.current(messages);
      // Only clear the native queue after the messages are safely in app storage.
      await ackPendingSms(messages.map((m) => m.id));
      if (added > 0) {
        toast(`${added} new ${added === 1 ? "transaction" : "transactions"} to review`);
      }
    } catch {
      /* plugin unavailable or permission revoked: try again next time */
    } finally {
      busy.current = false;
    }
  }, []);

  // Keep the native receiver in step with the in-app switch (also covers app updates).
  useEffect(() => {
    if (!smsSupported()) return;
    void setNativeSmsEnabled(enabled).catch(() => {});
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !smsSupported()) return;
    void sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    const stop = onSmsReceived(() => void sync());
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      stop();
    };
  }, [enabled, sync]);
}
