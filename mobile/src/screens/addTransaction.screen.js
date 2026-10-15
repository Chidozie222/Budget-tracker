import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppBackground from "../components/background.component";
import { COLORS } from "../styles/style";

const categoryOptions = [
  { label: "Food", active: true },
  { label: "Transport" },
  { label: "Data" },
  { label: "Utilities" },
  { label: "Health" },
  { label: "Other" },
];

const AddTransactionScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("3,000");
  const [description, setDescription] = useState("1 book");

  return (
    <AppBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add transaction</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Amount (₦)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.amountInput}
            placeholderTextColor={COLORS.text_secondary}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categoryOptions.map((item) => (
            <View
              key={item.label}
              style={[styles.chip, item.active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, item.active && styles.chipTextActive]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.field}
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>Date</Text>
        <View style={styles.fieldMuted}>
          <Text style={styles.fieldMutedText}>Today · 24 Sep 2026</Text>
          <Text style={styles.calendarText}>📅</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backText: {
    color: COLORS.text_primary,
    fontSize: 30,
    fontWeight: "700",
  },
  title: {
    color: COLORS.text_primary,
    fontSize: 22,
    fontWeight: "700",
  },
  amountBlock: {
    marginBottom: 18,
  },
  amountLabel: {
    color: COLORS.text_secondary,
    fontSize: 15,
    marginBottom: 10,
  },
  amountInput: {
    color: COLORS.text_primary,
    fontSize: 42,
    fontWeight: "700",
  },
  label: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(140, 152, 174, 0.12)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: "rgba(29, 211, 176, 0.12)",
    borderColor: COLORS.green,
  },
  chipText: {
    color: COLORS.text_primary,
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.green,
  },
  field: {
    backgroundColor: "rgba(140, 152, 174, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: COLORS.text_primary,
    fontSize: 15,
  },
  fieldMuted: {
    backgroundColor: "rgba(140, 152, 174, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldMutedText: {
    color: COLORS.text_secondary,
    fontSize: 15,
  },
  calendarText: {
    fontSize: 18,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: COLORS.bg_app,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddTransactionScreen;
