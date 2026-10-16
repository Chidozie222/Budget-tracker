import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppBackground from "../components/background.component";
import { createBudgetRequest } from "../api/budget.api";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";

const getDefaultEndDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().slice(0, 10);
};

const AddBudgetScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user?.accessToken) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Budget name required", "Please enter a budget name.");
      return;
    }

    const cleanIncome = Number(String(income).replace(/[^\d.]/g, ""));

    if (Number.isNaN(cleanIncome) || cleanIncome <= 0) {
      Alert.alert("Invalid income", "Enter a valid budget amount.");
      return;
    }

    if (!endDate || Number.isNaN(new Date(endDate).getTime())) {
      Alert.alert("Invalid date", "Enter a valid end date in YYYY-MM-DD format.");
      return;
    }

    try {
      setLoading(true);
      await createBudgetRequest(
        {
          name: name.trim(),
          income: cleanIncome,
          end_date: endDate,
        },
        user.accessToken,
      );

      Alert.alert("Success", "Budget created successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Create failed", error.message || "Unable to create budget.");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Add budget</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Budget name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.field}
          placeholder="100 week budget"
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>Monthly income / amount</Text>
        <TextInput
          value={income}
          onChangeText={setIncome}
          keyboardType="numeric"
          style={styles.field}
          placeholder="120000"
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>End date</Text>
        <TextInput
          value={endDate}
          onChangeText={setEndDate}
          style={styles.field}
          placeholder="2026-10-30"
          placeholderTextColor={COLORS.text_secondary}
        />

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Saving..." : "Save budget"}
          </Text>
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
  label: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 14,
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
    color: COLORS.text_primary,
    fontSize: 15,
  },
  calendarText: {
    fontSize: 18,
  },
  primaryButton: {
    marginTop: 28,
    backgroundColor: COLORS.green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.bg_app,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddBudgetScreen;
