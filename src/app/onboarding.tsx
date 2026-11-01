import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AmountInput } from "@/components/FormFields";
import { Button, Card, Txt } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { hapticSuccess } from "@/lib/haptics";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space, tabular, type } from "@/theme/type";

const LABELS = ["Get Started", "Continue", "Continue", "Continue", "Start Tracking"];

export default function Onboarding() {
  const { completeOnboarding, currency } = useStore();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("");
  const [weekend, setWeekend] = useState("");

  const canContinue =
    step === 0 ||
    step === 4 ||
    (step === 1 && name.trim().length > 0) ||
    (step === 2 && Number(weekday) > 0) ||
    (step === 3 && Number(weekend) > 0);

  const next = () => {
    if (step < 4) return setStep(step + 1);
    completeOnboarding({
      name: name.trim(),
      weekdayBudget: Number(weekday),
      weekendBudget: Number(weekend),
    });
    hapticSuccess();
    router.replace("/");
  };

  const heading = (eyebrow: string, title: string, sub?: string) => (
    <>
      <Txt style={type.sectionHeader} muted>
        {eyebrow}
      </Txt>
      <Txt style={[type.largeTitle, { marginTop: space.sm }]}>{title}</Txt>
      {sub ? (
        <Txt style={[type.body, { marginTop: space.sm }]} muted>
          {sub}
        </Txt>
      ) : null}
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + space.xxl,
        paddingBottom: insets.bottom + space.lg,
        paddingHorizontal: space.xl,
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", gap: space.lg }}>
        {step === 0 && (
          <>
            <Txt
              style={[type.display, { fontSize: 52, lineHeight: 56 }]}
              color={colors.accentStrong}
            >
              Spend smarter.
            </Txt>
            <Txt style={[type.body, { lineHeight: 26 }]} muted>
              {
                "Know what you can spend.\nSee what you actually spent.\nKnow whether you're ahead or behind."
              }
            </Txt>
          </>
        )}
        {step === 1 && (
          <>
            {heading("Step 1 of 3", "What should we call you?")}
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              returnKeyType="next"
              onSubmitEditing={() => canContinue && next()}
              style={[
                type.body,
                {
                  minHeight: 56,
                  paddingHorizontal: space.lg,
                  borderRadius: radius.control,
                  backgroundColor: colors.card,
                  color: colors.text,
                },
              ]}
            />
          </>
        )}
        {step === 2 && (
          <>
            {heading(
              "Step 2 of 3",
              "Weekday budget",
              "How much can you spend from Monday to Friday?",
            )}
            <AmountInput value={weekday} onChange={setWeekday} currency={currency} autoFocus />
          </>
        )}
        {step === 3 && (
          <>
            {heading(
              "Step 3 of 3",
              "Weekend budget",
              "How much can you spend on Saturday and Sunday?",
            )}
            <AmountInput value={weekend} onChange={setWeekend} currency={currency} autoFocus />
          </>
        )}
        {step === 4 && (
          <>
            <Txt
              style={[type.display, { fontSize: 44, lineHeight: 50 }]}
              color={colors.accentStrong}
            >
              You&apos;re all set
            </Txt>
            {[
              ["Mon – Fri", weekday],
              ["Sat – Sun", weekend],
            ].map(([label, v]) => (
              <Card key={label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Txt style={type.body} muted>
                  {label}
                </Txt>
                <Txt style={[type.headline, tabular]}>{formatMoney(Number(v) || 0, currency)}</Txt>
              </Card>
            ))}
            <Txt style={type.footnote} muted>
              Your weekday and weekend budgets are tracked separately.
            </Txt>
          </>
        )}
      </View>

      <View style={{ marginTop: space.xxl, gap: space.md }}>
        <View style={{ flexDirection: "row", gap: 6 }} accessibilityLabel={`Step ${step + 1} of 5`}>
          {LABELS.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? colors.accent : colors.hairline,
              }}
            />
          ))}
        </View>
        <Button label={LABELS[step] ?? "Continue"} onPress={next} disabled={!canContinue} />
        {step > 0 ? (
          <Button label="Back" variant="plain" onPress={() => setStep(step - 1)} />
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
