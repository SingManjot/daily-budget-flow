import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { Platform, Pressable, TextInput, View } from "react-native";
import { fromISODate, toISODate } from "@/lib/periods";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space, tabular, type } from "@/theme/type";
import { Icon } from "./Icon";
import { Txt } from "./ui";

/** Large centred amount entry with the currency symbol. Digits and one decimal point only. */
export function AmountInput({
  value,
  onChange,
  currency,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  currency: string;
  autoFocus?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: space.lg,
        borderRadius: radius.card,
        backgroundColor: colors.card,
      }}
    >
      <Txt style={{ fontSize: 30, fontWeight: "600" }} muted>
        {currency}
      </Txt>
      <TextInput
        value={value}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^0-9.]/g, "");
          const [whole = "", ...rest] = cleaned.split(".");
          onChange(rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole);
        }}
        autoFocus={autoFocus}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={colors.hairline}
        selectionColor={colors.accent}
        accessibilityLabel="Amount"
        style={[
          {
            fontSize: 48,
            fontWeight: "700",
            color: colors.text,
            minWidth: 60,
            textAlign: "center",
          },
          tabular,
        ]}
      />
    </View>
  );
}

/** Native date control: compact pill on iOS, Material dialog on Android. */
export function DateField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const { colors, dark } = useTheme();
  const date = fromISODate(value);

  if (Platform.OS === "ios") {
    return (
      <DateTimePicker
        value={date}
        mode="date"
        display="compact"
        maximumDate={new Date(2100, 0, 1)}
        accentColor={colors.accentStrong}
        themeVariant={dark ? "dark" : "light"}
        onChange={(_, d) => d && onChange(toISODate(d))}
      />
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Date, ${format(date, "d MMMM yyyy")}`}
      onPress={() =>
        DateTimePickerAndroid.open({
          value: date,
          mode: "date",
          onChange: (e, d) => {
            if (e.type === "set" && d) onChange(toISODate(d));
          },
        })
      }
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.sm,
        minHeight: 44,
        paddingHorizontal: space.md,
        borderRadius: radius.control,
        backgroundColor: colors.elevated,
      }}
    >
      <Icon name="calendar" size={18} color={colors.accentStrong} />
      <Txt style={type.subhead}>{format(date, "d MMM yyyy")}</Txt>
    </Pressable>
  );
}

export function TextField({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  onSubmitEditing?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.accent}
      onSubmitEditing={onSubmitEditing}
      returnKeyType="done"
      style={{
        minHeight: 48,
        paddingHorizontal: space.lg,
        borderRadius: radius.control,
        backgroundColor: colors.card,
        color: colors.text,
        fontSize: 17,
      }}
    />
  );
}

/** Label + control on one line, for compact form rows. */
export function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: space.md,
      }}
    >
      <Txt style={type.subhead} muted>
        {label}
      </Txt>
      {children}
    </View>
  );
}
