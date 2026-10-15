import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppBackground from "../components/background.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";

const rows = [
  { label: "Edit profile", icon: "◔" },
  { label: "Notification preferences", icon: "◌" },
  { label: "Security", icon: "◈" },
  { label: "Help & support", icon: "!" },
  { label: "Log out", icon: "↩", danger: true },
];

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  return (
    <AppBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileHead}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || "C").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || "Chidozie"}</Text>
          <Text style={styles.email}>
            {user?.email || "chidozie@example.com"}
          </Text>
        </View>

        <View style={styles.group}>
          {rows.map((row, index) => (
            <TouchableOpacity
              key={row.label}
              activeOpacity={0.8}
              onPress={row.danger ? signOut : undefined}
              style={[styles.row, index === rows.length - 1 && styles.lastRow]}
            >
              <View style={[styles.rowIcon, row.danger && styles.dangerIcon]}>
                <Text
                  style={[styles.rowIconText, row.danger && styles.dangerText]}
                >
                  {row.icon}
                </Text>
              </View>
              <Text style={[styles.rowLabel, row.danger && styles.dangerText]}>
                {row.label}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  title: {
    color: COLORS.text_primary,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
  },
  profileHead: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: COLORS.bg_app,
    fontSize: 30,
    fontWeight: "700",
  },
  name: {
    color: COLORS.text_primary,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    color: COLORS.text_secondary,
    fontSize: 14,
  },
  group: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(140, 152, 174, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: "rgba(240, 64, 91, 0.12)",
  },
  rowIconText: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "700",
  },
  rowLabel: {
    flex: 1,
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "500",
  },
  chevron: {
    color: COLORS.text_secondary,
    fontSize: 22,
    fontWeight: "500",
  },
  dangerText: {
    color: COLORS.red,
  },
});

export default ProfileScreen;
