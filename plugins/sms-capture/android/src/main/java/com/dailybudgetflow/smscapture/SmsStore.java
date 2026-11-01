package com.dailybudgetflow.smscapture;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Queue of captured messages, kept in SharedPreferences so it survives until the web app
 * opens and drains it. The app may not be running when an SMS arrives.
 */
final class SmsStore {

    private static final String PREFS = "sms_capture";
    private static final String KEY_QUEUE = "queue";
    /** Hard cap so a flood of messages can never grow storage without bound. */
    private static final int MAX_ITEMS = 300;

    private SmsStore() {}

    private static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static synchronized void add(Context context, String id, String sender, String body, long timestamp) {
        JSONArray queue = read(context);
        try {
            for (int i = 0; i < queue.length(); i++) {
                if (id.equals(queue.getJSONObject(i).optString("id"))) return;
            }
            JSONObject item = new JSONObject();
            item.put("id", id);
            item.put("sender", sender == null ? "" : sender);
            item.put("body", body);
            item.put("timestamp", timestamp);
            queue.put(item);
            while (queue.length() > MAX_ITEMS) queue.remove(0);
        } catch (JSONException e) {
            return;
        }
        prefs(context).edit().putString(KEY_QUEUE, queue.toString()).apply();
    }

    static synchronized JSONArray read(Context context) {
        String raw = prefs(context).getString(KEY_QUEUE, "[]");
        try {
            return new JSONArray(raw);
        } catch (JSONException e) {
            return new JSONArray();
        }
    }

    static synchronized void remove(Context context, java.util.Set<String> ids) {
        JSONArray queue = read(context);
        JSONArray kept = new JSONArray();
        for (int i = 0; i < queue.length(); i++) {
            JSONObject item = queue.optJSONObject(i);
            if (item != null && !ids.contains(item.optString("id"))) kept.put(item);
        }
        prefs(context).edit().putString(KEY_QUEUE, kept.toString()).apply();
    }
}
