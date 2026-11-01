import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { AmountInput, DateField, FieldRow, TextField } from "@/components/FormFields";
import { Icon, categoryIcon } from "@/components/Icon";
import { Button, Segmented, Txt } from "@/components/ui";
import { hapticSelect, hapticSuccess } from "@/lib/haptics";
import { dateForPeriod, fromISODate, periodTypeForDate, toISODate } from "@/lib/periods";
import { useStore } from "@/lib/store";
import type { PeriodType } from "@/lib/types";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space, type } from "@/theme/type";

/** Add or edit an expense (native form sheet). Pass ?id= to edit. */
export default function AddExpense() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data, currency, addExpense, updateExpense } = useStore();
  const { colors } = useTheme();
  const editing = id ? data.expenses.find((e) => e.id === id) : undefined;

  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? data.categories[0]?.id ?? "");
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [note, setNote] = useState(editing?.note ?? "");
  const period: PeriodType = periodTypeForDate(fromISODate(date));

  const save = () => {
    const value = Number(amount);
    if (!value || value <= 0) return Alert.alert("Enter an amount");
    if (!categoryId) return Alert.alert("Pick a category");
    const input = { amount: value, categoryId, date, periodType: period, note: note.trim() };
    if (editing) updateExpense(editing.id, input);
    else addExpense(input);
    hapticSuccess();
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ padding: space.xl, paddingTop: space.xxl, gap: space.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <Txt style={[type.headline, { textAlign: "center" }]}>
        {editing ? "Edit Expense" : "New Expense"}
      </Txt>
      <AmountInput value={amount} onChange={setAmount} currency={currency} autoFocus={!editing} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {data.categories.map((c) => {
          const selected = c.id === categoryId;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                hapticSelect();
                setCategoryId(c.id);
              }}
              style={{
                width: "31.5%",
                alignItems: "center",
                gap: 6,
                paddingVertical: space.md,
                borderRadius: radius.control,
                backgroundColor: selected ? colors.elevated : colors.card,
                borderWidth: 1,
                borderColor: selected ? colors.accent : "transparent",
              }}
            >
              <Icon
                name={categoryIcon(c.icon)}
                size={22}
                color={selected ? colors.accentStrong : colors.textMuted}
              />
              <Txt
                style={type.footnote}
                color={selected ? colors.text : colors.textMuted}
                numberOfLines={1}
              >
                {c.name}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <FieldRow label="Date">
        <DateField value={date} onChange={setDate} />
      </FieldRow>
      <Segmented
        value={period}
        onChange={(p: PeriodType) => setDate(toISODate(dateForPeriod(p, new Date())))}
        options={[
          { value: "weekday", label: "Weekday" },
          { value: "weekend", label: "Weekend" },
        ]}
      />
      <TextField
        value={note}
        onChangeText={setNote}
        placeholder="Note (optional)"
        onSubmitEditing={save}
      />
      <Button label={editing ? "Save Changes" : "Add Expense"} onPress={save} />
      {editing ? null : (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Icon name="check" size={14} color={colors.textMuted} />
          <Txt style={type.caption} muted>
            Counts toward your {period} budget
          </Txt>
        </View>
      )}
    </ScrollView>
  );
}
