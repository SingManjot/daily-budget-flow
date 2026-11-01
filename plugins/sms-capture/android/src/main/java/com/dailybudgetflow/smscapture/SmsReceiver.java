package com.dailybudgetflow.smscapture;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.provider.Telephony;
import android.telephony.SmsMessage;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Receives every incoming SMS (system broadcast), keeps bank debit alerts in SmsStore and
 * pings the web app if it is running. Long messages arrive in parts, so parts from the same
 * sender are joined first.
 */
public class SmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!Telephony.Sms.Intents.SMS_RECEIVED_ACTION.equals(intent.getAction())) return;
        if (!SmsStore.isEnabled(context)) return;

        SmsMessage[] parts = Telephony.Sms.Intents.getMessagesFromIntent(intent);
        if (parts == null || parts.length == 0) return;

        Map<String, StringBuilder> bodies = new LinkedHashMap<>();
        Map<String, Long> times = new LinkedHashMap<>();
        for (SmsMessage part : parts) {
            if (part == null) continue;
            String sender = part.getDisplayOriginatingAddress();
            if (sender == null) sender = "";
            StringBuilder body = bodies.get(sender);
            if (body == null) {
                body = new StringBuilder();
                bodies.put(sender, body);
                times.put(sender, part.getTimestampMillis());
            }
            String text = part.getDisplayMessageBody();
            // Stop growing once past the limit; SmsFilter rejects it anyway.
            if (text != null && body.length() <= SmsFilter.MAX_BODY_LENGTH) body.append(text);
        }

        boolean stored = false;
        long now = System.currentTimeMillis();
        for (Map.Entry<String, StringBuilder> entry : bodies.entrySet()) {
            String sender = entry.getKey();
            String body = entry.getValue().toString();
            if (!SmsFilter.isCandidate(sender, body)) continue;
            Long sent = times.get(sender);
            long timestamp = sent != null && sent > 0 ? sent : now;
            String id = "rx-" + timestamp + "-" + Integer.toHexString((sender + body).hashCode());
            SmsStore.add(context, id, sender, body, timestamp);
            stored = true;
        }

        if (stored) SmsCapturePlugin.notifyNewMessages();
    }
}
