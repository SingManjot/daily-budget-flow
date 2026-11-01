package com.dailybudgetflow.smscapture;

import android.Manifest;
import android.content.ContentResolver;
import android.database.Cursor;
import android.provider.Telephony;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import java.util.HashSet;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * JS bridge for bank SMS capture. Exposed to the web app as "SmsCapture"
 * (see src/lib/sms/plugin.ts).
 *
 * - checkPermissions / requestPermissions: built into Plugin, alias "sms".
 * - getPending: messages captured by SmsReceiver since the last drain.
 * - removePending: drop drained messages by id.
 * - readInbox: back-fill from the SMS inbox (needs READ_SMS).
 * - setEnabled: mirror the in-app switch; disabling stops capture and clears the queue.
 * - "smsReceived" event: fired when a new message is queued while the app is running.
 */
@CapacitorPlugin(
    name = "SmsCapture",
    permissions = {
        @Permission(alias = "sms", strings = { Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS })
    }
)
public class SmsCapturePlugin extends Plugin {

    private static volatile SmsCapturePlugin instance;

    @Override
    public void load() {
        instance = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (instance == this) instance = null;
    }

    static void notifyNewMessages() {
        SmsCapturePlugin plugin = instance;
        if (plugin != null) plugin.notifyListeners("smsReceived", new JSObject());
    }

    @PluginMethod
    public void setEnabled(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled", false);
        SmsStore.setEnabled(getContext(), enabled != null && enabled);
        call.resolve();
    }

    @PluginMethod
    public void getPending(PluginCall call) {
        JSONArray queue = SmsStore.read(getContext());
        JSObject result = new JSObject();
        result.put("messages", toJsArray(queue));
        call.resolve(result);
    }

    @PluginMethod
    public void removePending(PluginCall call) {
        JSArray ids = call.getArray("ids", new JSArray());
        Set<String> set = new HashSet<>();
        for (int i = 0; i < ids.length(); i++) {
            String id = ids.optString(i, null);
            if (id != null) set.add(id);
        }
        SmsStore.remove(getContext(), set);
        call.resolve();
    }

    @PluginMethod
    public void readInbox(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission not granted", "PERMISSION_DENIED");
            return;
        }
        long since = call.getLong("since", System.currentTimeMillis() - 30L * 24 * 60 * 60 * 1000);
        int limit = Math.max(1, Math.min(call.getInt("limit", 500), 2000));

        JSONArray out = new JSONArray();
        ContentResolver resolver = getContext().getContentResolver();
        String[] projection = { Telephony.Sms._ID, Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE };
        try (
            Cursor cursor = resolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                projection,
                Telephony.Sms.DATE + " >= ?",
                new String[] { String.valueOf(since) },
                Telephony.Sms.DATE + " DESC"
            )
        ) {
            if (cursor != null) {
                int idCol = cursor.getColumnIndexOrThrow(Telephony.Sms._ID);
                int addressCol = cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS);
                int bodyCol = cursor.getColumnIndexOrThrow(Telephony.Sms.BODY);
                int dateCol = cursor.getColumnIndexOrThrow(Telephony.Sms.DATE);
                while (cursor.moveToNext() && out.length() < limit) {
                    String sender = cursor.getString(addressCol);
                    String body = cursor.getString(bodyCol);
                    if (!SmsFilter.isCandidate(sender, body)) continue;
                    JSONObject item = new JSONObject();
                    item.put("id", "inbox-" + cursor.getLong(idCol));
                    item.put("sender", sender == null ? "" : sender);
                    item.put("body", body);
                    item.put("timestamp", cursor.getLong(dateCol));
                    out.put(item);
                }
            }
        } catch (Exception e) {
            call.reject("Could not read SMS inbox", e);
            return;
        }

        JSObject result = new JSObject();
        result.put("messages", toJsArray(out));
        call.resolve(result);
    }

    private static JSArray toJsArray(JSONArray array) {
        JSArray out = new JSArray();
        for (int i = 0; i < array.length(); i++) {
            Object item = array.opt(i);
            if (item != null) out.put(item);
        }
        return out;
    }
}
