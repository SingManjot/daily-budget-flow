import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView } from "react-native";
import { AmountInput, DateField, FieldRow, TextField } from "@/components/FormFields";
import { Button, Txt } from "@/components/ui";
import { hapticSuccess } from "@/lib/haptics";
import { fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { space, type } from "@/theme/type";

/** Extra money for a period. It raises what's left; the budget itself stays the same. */
export default function AddMoney() {
  const { addMoney, currency } = useStore();
  const { colors } = useTheme();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toISODate(new Date()));
  const [note, setNote] = useState("");
  const period = periodTypeForDate(fromISODate(date));

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) return Alert.alert("Enter an amount");
    addMoney({ amount: value, periodType: period, date, note: note.trim() });
    hapticSuccess();
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.xl, paddingTop: space.xxl, gap: space.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <Txt style={[type.headline, { textAlign: "center" }]}>Add Money</Txt>
      <Txt style={[type.footnote, { textAlign: "center", marginTop: -space.sm }]} muted>
        Extra money for this {period}. Your budget stays the same.
      </Txt>
      <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus />
      <FieldRow label="Date">
        <DateField value={date} onChange={setDate} />
      </FieldRow>
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        onSubmitEditing={save}
      />
      <Button label="Add Money" onPress={save} />
    </ScrollView>
  );
}
