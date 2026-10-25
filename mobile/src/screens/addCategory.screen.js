import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppBackground from "../components/background.component";
import { createCategoryRequest } from "../api/category.api";
import { useAuth } from "../store/auth.context";
import { useAppStore } from "../store/app.store";
import { COLORS } from "../styles/style";

const colors = [
  { name: "green", value: COLORS.green },
  { name: "orange", value: COLORS.orange },
  { name: "purple", value: COLORS.purple },
  { name: "blue", value: COLORS.blue },
  { name: "red", value: COLORS.red },
  { name: "indigo", value: COLORS.indigo },
];

const AddCategoryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    activeBudget,
    categories,
    setActiveBudget,
    setCategories,
    loadActiveBudgetSnapshot,
    loadCategoriesForActiveBudget,
  } = useAppStore();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("green");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.accessToken) return;

      try {
        const snapshot = await loadActiveBudgetSnapshot(user.accessToken);
        const active = snapshot?.activeBudget || activeBudget;
        setActiveBudget(active || null);

        if (active?.id) {
          const fetched = await loadCategoriesForActiveBudget(
            user.accessToken,
            active.id,
          );
          setCategories(Array.isArray(fetched) ? fetched : []);
        }
      } catch (error) {
        console.error("AddCategory loadBudget error:", error);
      }
    };

    loadBudget();
  }, [user?.accessToken]);

  const handleSave = async () => {
    if (!user?.accessToken) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    if (!activeBudget?.id) {
      Alert.alert(
        "No active budget",
        "Create or select a budget before adding a category.",
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Category name required", "Please enter a category name.");
      return;
    }

    try {
      setLoading(true);
      await createCategoryRequest(activeBudget.id, name, user.accessToken);
      Alert.alert("Success", "Category created successfully.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Failed", error.message || "Unable to create category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add category</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.label}>Category name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.field}
          placeholder="Electricity"
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {colors.map((item) => (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.9}
              onPress={() => setSelectedColor(item.name)}
              style={[
                styles.colorDot,
                { backgroundColor: `${item.value}22` },
                selectedColor === item.name && styles.colorDotSelected,
              ]}
            >
              {selectedColor === item.name ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Budget</Text>
        <View style={styles.fieldMuted}>
          <Text style={styles.fieldMutedText}>
            {activeBudget?.name || "No active budget"}
          </Text>
          <Text style={styles.chevron}>⌄</Text>
        </View>

        <Text style={styles.helperText}>
          {categories.length} category(s) already in this budget
        </Text>

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
            {loading ? "Saving..." : "Save category"}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 12,
    marginTop: 12,
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
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  colorDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorDotSelected: {
    borderColor: COLORS.green,
  },
  checkmark: {
    color: COLORS.green,
    fontSize: 18,
    fontWeight: "700",
  },
  fieldMuted: {
    backgroundColor: "rgba(140, 152, 174, 0.08)",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldMutedText: {
    color: COLORS.text_secondary,
    fontSize: 15,
  },
  chevron: {
    color: COLORS.text_secondary,
    fontSize: 18,
  },
  helperText: {
    color: COLORS.text_secondary,
    fontSize: 12,
    marginTop: 8,
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

export default AddCategoryScreen;
