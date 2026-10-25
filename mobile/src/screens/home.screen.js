import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppBackground from "../components/background.component";
import { useAuth } from "../store/auth.context";
import { useAppStore } from "../store/app.store";
import { COLORS } from "../styles/style";
import ListTransactions from "../components/listTransaction.component";
import { createSavingRequest } from "../api/saving.api";
import { connectBudgetSocket } from "../api/socket.api";

const UNDERSPEND_DISMISS_KEY = "budget_tracker_underspend_dismissed_date";

const safeStorage = {
  async getItem(key) {
    if (!AsyncStorage || typeof AsyncStorage.getItem !== "function") {
      return null;
    }

    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  async setItem(key, value) {
    if (!AsyncStorage || typeof AsyncStorage.setItem !== "function") {
      return false;
    }

    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  },
};

const formatMoney = (value) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const { activeBudget, dailySummary, transactions, loadActiveBudgetSnapshot } =
    useAppStore();
  const [showUnderSpend, setShowUnderSpend] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.accessToken) return;

      try {
        await loadActiveBudgetSnapshot(user.accessToken);
      } catch (error) {
        console.error("Home loadBudget error:", error);
      }
    };

    loadBudget();
  }, [user?.accessToken]);

  useEffect(() => {
    if (!activeBudget?.id || !user?.accessToken) return undefined;

    const socket = connectBudgetSocket(activeBudget.id, async () => {
      try {
        await loadActiveBudgetSnapshot(user.accessToken);
      } catch (error) {
        console.error("Socket refresh error:", error);
      }
    });

    return () => {
      socket?.disconnect();
    };
  }, [activeBudget?.id, user?.accessToken]);

  useEffect(() => {
    const checkDismissal = async () => {
      if (!dailySummary || Number(dailySummary?.leftover ?? 0) <= 0) {
        setShowUnderSpend(false);
        return;
      }

      try {
        const today = new Date().toISOString().slice(0, 10);
        const lastDismissed = await safeStorage.getItem(UNDERSPEND_DISMISS_KEY);
        setShowUnderSpend(lastDismissed !== today);
      } catch (error) {
        setShowUnderSpend(true);
      }
    };

    checkDismissal();
  }, [dailySummary]);

  const dismissUnderSpend = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await createSavingRequest(
        activeBudget.id,
        dailySummary?.leftover,
        today,
        user.accessToken,
      );
      await safeStorage.setItem(UNDERSPEND_DISMISS_KEY, today);
    } catch (error) {
      // Storage may be unavailable in some environments; close the modal anyway.
    }
    setShowUnderSpend(false);
  };

  const mini = [
    { id: 1, name: "Income", data: formatMoney(activeBudget?.income) },
    {
      id: 2,
      name: "Remaining Amount",
      data: formatMoney(dailySummary?.remainBuget),
    },
    {
      id: 3,
      name: "Today's spend",
      data: formatMoney(dailySummary?.spendToday),
    },
    {
      id: 4,
      name: "Daily limit",
      data: formatMoney(dailySummary?.recommendedSpendingAmount),
    },
  ];

  const hasData = !!activeBudget && !!dailySummary;
  const shouldShowUnderSpend =
    showUnderSpend && Number(dailySummary?.leftover ?? 0) > 0;

  return (
    <AppBackground>
      {!hasData ? (
        <Text style={styles.text}>No data available</Text>
      ) : (
        <View style={{ flex: 1, paddingTop: 20 }}>
          <View style={styles.topRow}>
            <View style={styles.brandWrap}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>✓</Text>
              </View>
              <View>
                <Text style={styles.brandText}>Budget Tracker</Text>
                <Text style={styles.brandSubText}>{activeBudget.name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <Text style={styles.balanceAmount}>
              {formatMoney(dailySummary?.budgetAmount)}
            </Text>
          </View>

          <View style={styles.statGrid}>
            {mini.map((item) => (
              <View key={item.id} style={styles.statCard}>
                <View
                  style={[
                    styles.statIcon,
                    item.id === 1 && styles.statIconGreen,
                    item.id === 2 && styles.statIconBlue,
                    item.id === 3 && styles.statIconRed,
                    item.id === 4 && styles.statIconPurple,
                  ]}
                >
                  <Text style={styles.statGlyph}>
                    {item.id === 1
                      ? "↑"
                      : item.id === 2
                        ? "↗"
                        : item.id === 3
                          ? "•"
                          : "▥"}
                  </Text>
                </View>
                <Text style={styles.statLabel}>{item.name}</Text>
                <Text style={styles.statValue}>{item.data}</Text>
              </View>
            ))}
          </View>

          <View style={styles.transactionContainer}>
            <Text style={styles.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          <ListTransactions transaction={transactions} />

          {shouldShowUnderSpend && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <View style={styles.modalIcon}>
                  <Text style={styles.modalIconText}>↑</Text>
                </View>
                <Text style={styles.modalTitle}>You underspent today</Text>
                <Text style={styles.modalText}>
                  You budgeted{" "}
                  {formatMoney(dailySummary?.recommendedSpendingAmount || 0)}{" "}
                  and spent {formatMoney(dailySummary?.spendToday || 0)}. What
                  should we do with the rest?
                </Text>
                <Text style={styles.modalAmount}>
                  +{formatMoney(dailySummary?.leftover || 0)} left over
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.primaryButton}
                    onPress={dismissUnderSpend}
                  >
                    <Text style={styles.primaryButtonText}>Save it</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.secondaryButton}
                    onPress={async () => {
                      const today = new Date().toISOString().slice(0, 10);
                      try {
                        await AsyncStorage.setItem(
                          UNDERSPEND_DISMISS_KEY,
                          today,
                        );
                      } catch (error) {
                        console.warn(
                          "Could not persist underspend dismissal",
                          error,
                        );
                      }
                      setShowUnderSpend(false);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Carry forward to tomorrow
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#fff",
  },
  topRow: {
    marginBottom: 16,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(29, 211, 176, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(29, 211, 176, 0.3)",
  },
  brandMarkText: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: "700",
  },
  brandText: {
    fontWeight: "600",
    fontSize: 21,
    color: "#fff",
  },
  brandSubText: {
    fontWeight: "500",
    color: COLORS.text_secondary,
    fontSize: 15,
  },
  balanceCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: COLORS.radius_lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  balanceLabel: {
    fontSize: 15,
    color: COLORS.text_secondary,
    marginBottom: 4,
    textTransform: "capitalize",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff",
  },
  statGrid: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: COLORS.radius_md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: "48%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconGreen: { backgroundColor: "rgba(29, 211, 176, 0.12)" },
  statIconBlue: { backgroundColor: "rgba(59, 130, 246, 0.12)" },
  statIconRed: { backgroundColor: "rgba(240, 64, 91, 0.12)" },
  statIconPurple: { backgroundColor: "rgba(107, 108, 245, 0.12)" },
  statGlyph: { color: COLORS.text_primary, fontSize: 16, fontWeight: "700" },
  statLabel: {
    fontSize: 12.5,
    color: COLORS.text_secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  transactionContainer: {
    flexDirection: "row",
    marginTop: 26,
    marginBottom: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  sectionAction: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(11, 20, 36, 0.75)",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalSheet: {
    width: "100%",
    backgroundColor: COLORS.bg_card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(140, 152, 174, 0.5)",
    alignSelf: "center",
    marginBottom: 18,
  },
  modalIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(29, 211, 176, 0.14)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalIconText: {
    color: COLORS.green,
    fontSize: 26,
    fontWeight: "700",
  },
  modalTitle: {
    color: COLORS.text_primary,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  modalText: {
    color: COLORS.text_secondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  modalAmount: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
  },
  modalActions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: COLORS.bg_app,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "rgba(140, 152, 174, 0.12)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
