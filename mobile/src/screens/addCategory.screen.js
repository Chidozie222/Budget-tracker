import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AppBackground from "../components/background.component";
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
          value="Electricity"
          style={styles.field}
          placeholderTextColor={COLORS.text_secondary}
        />

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {colors.map((item) => (
            <View
              key={item.name}
              style={[
                styles.colorDot,
                { backgroundColor: `${item.value}22` },
                item.name === "green" && styles.colorDotSelected,
              ]}
            >
              {item.name === "green" ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : null}
            </View>
          ))}
        </View>

        <Text style={styles.label}>Budget</Text>
        <View style={styles.fieldMuted}>
          <Text style={styles.fieldMutedText}>100 week budget</Text>
          <Text style={styles.chevron}>⌄</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Save category</Text>
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

export default AddCategoryScreen;
