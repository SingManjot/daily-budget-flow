import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import { readInboxSms, requestSmsPermission, smsPermission, smsSupported } from "@/lib/sms/plugin";

const BACKFILL_DAYS = 30;

/**
 * Settings card for bank-SMS import. The explanation is shown before the permission request
 * (this doubles as the "prominent disclosure" Google Play expects for SMS access).
 */
export function SmsImportSettings() {
  const { data, setSmsEnabled, ingestSms } = useStore();
  const enabled = data.smsImport?.enabled === true;
  const supported = smsSupported();
  const [granted, setGranted] = useState<boolean | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!supported) return;
    void smsPermission().then((s) => setGranted(s === "granted"));
  }, [supported]);

  const toggle = async (next: boolean) => {
    if (!next) {
      setSmsEnabled(false);
      return;
    }
    const state = await requestSmsPermission();
    const ok = state === "granted";
    setGranted(ok);
    if (!ok) {
      toast.error("SMS permission not allowed", {
        description:
          "Open Android Settings → Apps → Daily Budget Flow → Permissions → SMS. If it's greyed out, tap ⋮ → Allow restricted settings first.",
        duration: 8000,
      });
      return;
    }
    setSmsEnabled(true);
    toast.success("SMS import is on");
  };

  const backfill = async () => {
    setImporting(true);
    try {
      const added = ingestSms(await readInboxSms(BACKFILL_DAYS));
      toast(
        added > 0
          ? `${added} ${added === 1 ? "transaction" : "transactions"} ready to review on Home`
          : "No new bank transactions found",
      );
    } catch {
      toast.error("Couldn't read your SMS inbox");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="sms-import" className="text-[15px]">
          Read bank SMS
        </label>
        <Switch
          id="sms-import"
          checked={supported && enabled && granted === true}
          disabled={!supported}
          onCheckedChange={(v) => void toggle(v)}
        />
      </div>
      <p className="text-[13px] leading-relaxed text-mut">
        {supported
          ? "Spots debit alerts from your bank and card in incoming SMS and adds them to a review list on Home. Messages are read on this phone only and never leave it. Personal texts and OTPs are ignored."
          : "Available in the Android app. It spots bank debit SMS and adds them to a review list."}
      </p>
      {supported && enabled && granted && (
        <>
          <button
            type="button"
            onClick={() => void backfill()}
            disabled={importing}
            className="pressable h-12 w-full rounded-xl bg-accent text-[15px] font-medium disabled:opacity-50"
          >
            {importing ? "Importing…" : `Import Last ${BACKFILL_DAYS} Days`}
          </button>
          {data.smsImport?.lastSyncAt && (
            <p className="text-[12px] text-mut">
              Last checked {new Date(data.smsImport.lastSyncAt).toLocaleString("en-IN")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
