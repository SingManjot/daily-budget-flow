package com.dailybudgetflow.smscapture;

import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Cheap pre-filter run on the device before anything is stored. It keeps only messages that
 * look like a bank or card debit alert from a business sender. The web app's parser
 * (src/lib/sms/parser.ts) makes the final decision.
 */
final class SmsFilter {

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

    private static final Pattern OTP = Pattern.compile("\\botp\\b|one[ -]time password|verification code", Pattern.CASE_INSENSITIVE);

    private SmsFilter() {}

    static boolean isCandidate(String sender, String body) {
        if (body == null || body.isEmpty()) return false;
        if (sender != null && PHONE_NUMBER.matcher(sender.replace(" ", "")).matches()) return false;
        String text = body.toLowerCase(Locale.ROOT);
        if (OTP.matcher(text).find()) return false;
        return AMOUNT.matcher(text).find() && DEBIT_WORD.matcher(text).find();
    }
}
