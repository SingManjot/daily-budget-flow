import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";
import { DateField } from "@/components/FormFields";
import { Icon } from "@/components/Icon";
import { Button, Card, ListRow, Screen, SectionHeader, Txt } from "@/components/ui";
import { budgetOn } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { hapticSelect, hapticSuccess } from "@/lib/haptics";
import { toISODate } from "@/lib/periods";
import { useStore } from "@/lib/store";
import type { AppData } from "@/lib/types";
import { THEMES, THEME_ORDER } from "@/theme/palettes";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space, tabular, type } from "@/theme/type";

export default function Settings() {
  const store = useStore();
  const { data, currency } = store;
  const theme = useTheme();
  const { colors } = theme;
  const today = toISODate(new Date());
  const active = budgetOn(data.budgets, today);

  const [name, setName] = useState(data.user?.name ?? "");
  const [weekday, setWeekday] = useState(String(active?.weekdayBudget ?? ""));
  const [weekend, setWeekend] = useState(String(active?.weekendBudget ?? ""));
  const [effectiveFrom, setEffectiveFrom] = useState(today.slice(0, 8) + "01");
  const [newCategory, setNewCategory] = useState("");

  const inputStyle = [
    type.body,
    tabular,
    { color: colors.text, textAlign: "right" as const, minWidth: 100, paddingVertical: 8 },
  ];

  const saveBudget = () => {
    const wd = Number(weekday);
    const we = Number(weekend);
    if (!wd || !we) return Alert.alert("Enter both budgets");
    store.setBudgets({ weekdayBudget: wd, weekendBudget: we, effectiveFrom });
    hapticSuccess();
    Alert.alert(
      "Budget saved",
      "New budgets apply from the chosen date. Past months keep their budgets.",
    );
  };

  const exportData = async () => {
    try {
      // SMS text and senders never leave the app in a backup.
      const backup = {
        ...data,
        pending: data.pending?.map((p) => ({ ...p, body: "", sender: "" })),
      };
      const file = new File(Paths.cache, `daily-budget-flow-backup-${today}.json`);
      if (file.exists) file.delete();
      file.create();
      await file.write(JSON.stringify(backup, null, 2));
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Save backup",
      });
    } catch {
      Alert.alert("Couldn't export", "Try again in a moment.");
    }
  };

  const importData = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets[0]) return;
      const parsed = JSON.parse(await new File(res.assets[0].uri).text()) as AppData;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.expenses))
        throw new Error("bad file");
      Alert.alert("Replace all data?", "Everything on this phone is replaced with the backup.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Replace",
          style: "destructive",
          onPress: () => {
            store.replaceAll(parsed);
            hapticSuccess();
          },
        },
      ]);
    } catch {
      Alert.alert("That file couldn't be read", "Pick a backup exported from this app.");
    }
  };

  const confirmReset = () =>
    Alert.alert(
      "Delete All Data?",
      "This permanently deletes your profile, budgets and every transaction on this phone. Export a backup first.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Everything", style: "destructive", onPress: store.resetAll },
      ],
    );

  return (
    <Screen title="Settings" bottomInset={120}>
      <SectionHeader title="Profile" />
      <Card padded={false}>
        <View style={rowStyle(colors.hairline, true)}>
          <Txt style={type.body}>Name</Txt>
          <TextInput
            value={name}
            onChangeText={setName}
            onEndEditing={() => name.trim() && store.updateProfile({ name: name.trim() })}
            style={inputStyle}
            selectionColor={colors.accent}
            returnKeyType="done"
          />
        </View>
        <View style={rowStyle(colors.hairline)}>
          <Txt style={type.body}>Currency</Txt>
          <Txt style={type.body} muted>
            {currency} · Indian rupee
          </Txt>
        </View>
      </Card>

      <SectionHeader title="Appearance" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
        {THEME_ORDER.map((id) => {
          const t = THEMES[id];
          const selected = theme.id === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t.label} theme`}
              onPress={() => {
                hapticSelect();
                theme.setTheme(id);
              }}
              style={{
                width: "31.8%",
                padding: space.sm,
                borderRadius: radius.control + 4,
                backgroundColor: colors.card,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.accent : colors.hairline,
              }}
            >
              <View
                style={{
                  height: 44,
                  borderRadius: radius.control - 2,
                  backgroundColor: t.colors.background,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: t.colors.accent,
                  }}
                />
                <View
                  style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.colors.text }}
                />
              </View>
              <Txt style={[type.footnote, { fontWeight: "600", marginTop: 6 }]}>{t.label}</Txt>
              <Txt style={type.caption} muted numberOfLines={1}>
                {t.hint}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Budget" />
      <Card padded={false}>
        <View style={rowStyle(colors.hairline, true)}>
          <Txt style={type.body}>Weekdays</Txt>
          <TextInput
            value={weekday}
            onChangeText={(v) => setWeekday(v.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            style={inputStyle}
            selectionColor={colors.accent}
          />
        </View>
        <View style={rowStyle(colors.hairline)}>
          <Txt style={type.body}>Weekend</Txt>
          <TextInput
            value={weekend}
            onChangeText={(v) => setWeekend(v.replace(/[^0-9.]/g, ""))}
            keyboardType="decimal-pad"
            style={inputStyle}
            selectionColor={colors.accent}
          />
        </View>
        <View style={rowStyle(colors.hairline)}>
          <Txt style={type.body}>Applies from</Txt>
          <DateField value={effectiveFrom} onChange={setEffectiveFrom} />
        </View>
        <View style={{ padding: space.lg, gap: space.sm }}>
          <Button label="Save Budget" onPress={saveBudget} />
          <Txt style={type.footnote} muted>
            New budgets apply from the chosen date. Past months keep the budgets that were active
            then.
          </Txt>
        </View>
      </Card>

      <SectionHeader title="Categories" />
      <Card padded={false}>
        {data.categories.map((c, i) => (
          <ListRow
            key={c.id}
            first={i === 0}
            icon={c.icon}
            title={c.name}
            trailing={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${c.name}`}
                hitSlop={8}
                onPress={() =>
                  Alert.alert(
                    `Delete ${c.name}?`,
                    "Existing expenses keep their amounts but lose this category.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => store.deleteCategory(c.id),
                      },
                    ],
                  )
                }
                style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="delete" size={18} color={colors.textMuted} />
              </Pressable>
            }
          />
        ))}
        <View style={[rowStyle(colors.hairline), { paddingRight: space.sm }]}>
          <TextInput
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="New category"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={[type.body, { flex: 1, color: colors.text, paddingVertical: 8 }]}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (!newCategory.trim()) return;
              store.addCategory(newCategory.trim());
              setNewCategory("");
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add category"
            onPress={() => {
              if (!newCategory.trim()) return;
              store.addCategory(newCategory.trim());
              setNewCategory("");
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.elevated,
            }}
          >
            <Icon name="add" size={18} color={colors.accentStrong} />
          </Pressable>
        </View>
      </Card>

      <SectionHeader title="Data" />
      <View style={{ gap: space.sm }}>
        <Button label="Export Backup" variant="secondary" onPress={() => void exportData()} />
        <Button label="Import Backup" variant="secondary" onPress={() => void importData()} />
        <Button
          label="Delete All Data"
          variant="plain-destructive"
          onPress={confirmReset}
          style={{ minHeight: 44 }}
        />
      </View>

      <SectionHeader title="About" />
      <Card>
        <Txt style={type.headline}>Daily Budget Flow</Txt>
        <Txt style={[type.footnote, { marginTop: 4 }]} muted>
          Everything lives on this phone. Weekday and weekend budgets are tracked separately and
          never roll over. Current plan: {formatMoney(active?.weekdayBudget ?? 0, currency)}{" "}
          weekdays · {formatMoney(active?.weekendBudget ?? 0, currency)} weekend.
        </Txt>
      </Card>
    </Screen>
  );
}

function rowStyle(hairline: string, first = false) {
  return {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: space.md,
    minHeight: 52,
    paddingHorizontal: space.lg,
    ...(first ? null : { borderTopWidth: 0.5, borderTopColor: hairline }),
  };
}
