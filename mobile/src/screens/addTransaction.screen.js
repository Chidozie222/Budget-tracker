import { useEffect, useState } from "react";
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
import { createTransactionRequest } from "../api/transactionCreate.api";
import { useAuth } from "../store/auth.context";
import { useAppStore } from "../store/app.store";
import { COLORS } from "../styles/style";

const AddTransactionScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    activeBudget,
    categories,
    setActiveBudget,
    setCategories,
    loadActiveBudgetSnapshot,
    loadCategoriesForActiveBudget,
  } = useAppStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.accessToken) return;

      try {
        const snapshot = await loadActiveBudgetSnapshot(user.accessToken);
        const active = snapshot?.activeBudget || activeBudget;
        setActiveBudget(active || null);

        const fetchedCategories = await loadCategoriesForActiveBudget(
          user.accessToken,
          active?.id ?? null,
        );

        const safeCategories = Array.isArray(fetchedCategories)
          ? fetchedCategories
          : [];
        setCategories(safeCategories);

        if (
          safeCategories.length &&
          !safeCategories.some((item) => item.id === selectedCategoryId)
        ) {
          setSelectedCategoryId(safeCategories[0].id);
        }
      } catch (error) {
        console.error("AddTransaction loadData error:", error);
        setCategories([]);
      }
    };

    loadData();
  }, [user?.accessToken]);

  const handleSave = async () => {
    if (!user?.accessToken) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    if (!activeBudget?.id) {
      Alert.alert("No active budget", "Create or select a budget first.");
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert("Choose a category", "Select a category before saving.");
      return;
    }

    const numericAmount = Number(String(amount).replace(/[^\d.]/g, ""));

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Enter an amount greater than zero.");
      return;
    }

    try {
      setLoading(true);
      await createTransactionRequest({
        budgetId: activeBudget.id,
        categoryId: selectedCategoryId,
        amount: numericAmount,
        description,
        accessToken: user.accessToken,
      });

      Alert.alert("Success", "Transaction saved successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Save failed",
        error.message || "Unable to save transaction.",
      );
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
            placeholder="0"
            placeholderTextColor={COLORS.text_secondary}
          />
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categories.length ? (
            categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => setSelectedCategoryId(item.id)}
                style={[
                  styles.chip,
                  selectedCategoryId === item.id && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategoryId === item.id && styles.chipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No categories available</Text>
          )}
        </View>

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.field}
          placeholder="1 book"
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>Date</Text>
        <View style={styles.fieldMuted}>
          <Text style={styles.fieldMutedText}>Today</Text>
          <Text style={styles.calendarText}>📅</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.primaryButton,
            loading && styles.primaryButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Saving..." : "Save transaction"}
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
    paddingVertical: 0,
  },
  label: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
  },
  emptyText: {
    color: COLORS.text_secondary,
    fontSize: 14,
    marginBottom: 10,
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
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: COLORS.bg_app,
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AddTransactionScreen;
