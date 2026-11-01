package com.dailybudgetflow.smscapture;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Pre-filter run on the device before anything is stored. It keeps only messages that look
 * like a bank or card debit alert from a business sender, and it never lets a message that
 * carries a secret (OTP, PIN, passcode, verification code) reach storage.
 *
 * Keep SECRET in sync with SECRET in src/lib/sms/parser.ts (the second line of defence).
 */
final class SmsFilter {

    /** Bank alerts are short; anything longer is not one and is not worth parsing. */
    static final int MAX_BODY_LENGTH = 2000;

    /** Personal numbers (e.g. +919812345678) are never banks, so their texts are ignored. */
    private static final Pattern PHONE_NUMBER = Pattern.compile("^\\+?[0-9]{7,}$");

    /** "Rs.500", "INR 500", "₹500", or SBI-style "debited by 150.0". */
    private static final Pattern AMOUNT = Pattern.compile(
        "(rs\\.?|inr|₹)\\s*[0-9]|debited\\s+(by|for|with)\\s+[0-9]",
        Pattern.CASE_INSENSITIVE
    );

    private static final Pattern DEBIT_WORD = Pattern.compile(
        "debited|debit|spent|withdrawn|purchase|paid|sent|txn|transaction|dr\\.?\\b",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Any hint that the message carries a one-time code or credential. Deliberately broad:
     * a missed expense can be added by hand, a stored OTP cannot be un-stored.
     */
    static final Pattern SECRET = Pattern.compile(
        "\\botp\\b|one[\\s-]?time|pass\\s?code|password|\\bpwd\\b|verification|verify|"
            + "security\\s+code|auth\\w*\\s+code|\\bcode\\b|\\bcvv\\b|\\bm?pin\\b|"
            + "do\\s+not\\s+share|don'?t\\s+share|never\\s+share|not\\s+to\\s+share",
        Pattern.CASE_INSENSITIVE
    );

    private SmsFilter() {}

    static boolean isCandidate(String sender, String body) {
        if (body == null || body.isEmpty() || body.length() > MAX_BODY_LENGTH) return false;
        if (sender != null && PHONE_NUMBER.matcher(sender.replace(" ", "")).matches()) return false;
        String text = body.toLowerCase(Locale.ROOT);
        if (SECRET.matcher(text).find()) return false;
        return AMOUNT.matcher(text).find() && DEBIT_WORD.matcher(text).find();
    }
}
