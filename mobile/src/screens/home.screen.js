import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { activeBudgetRequest } from "../api/budget.api";
import { dailySummaryRequest } from "../api/dailysummary.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";
import AppBackground from "../components/background.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";
import ListTransactions from "../components/listTransaction.component";

const formatMoney = (value) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Home() {
  const [activeBudget, setActiveBudget] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [transaction, setTransaction] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.accessToken) return;

      try {
        const date = new Date().toISOString().slice(0, 10);
        const take = 10;
        const skip = 0;
        const _activeBudget = await activeBudgetRequest(user.accessToken);
        const active = Array.isArray(_activeBudget)
          ? _activeBudget[0]
          : _activeBudget;

        setActiveBudget(active || null);

        if (!active || !active.id) {
          setDailySummary(null);
          setTransaction([]);
          return;
        }

        const _dailySummary = await dailySummaryRequest(
          active.id,
          date,
          user.accessToken,
        );
        const _transaction = await getTransactionByBudgetRequest(
          active.id,
          date,
          take,
          skip,
          user.accessToken,
        );

        setDailySummary(_dailySummary);
        setTransaction(Array.isArray(_transaction) ? _transaction : []);
      } catch (error) {
        console.error("Home loadBudget error:", error);
        setActiveBudget(null);
        setDailySummary(null);
        setTransaction([]);
      }
    };

    loadBudget();
  }, [user?.accessToken]);

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
  const showUnderSpend = Number(dailySummary?.leftover ?? 0) > 0;

  return (
    <AppBackground>
      {!hasData ? (
        <Text style={styles.text}>No data available</Text>
      ) : (
        <View style={{ flex: 1, paddingTop: 30 }}>
          <View style={{ marginBottom: 22 }}>
            <Text style={styles.brandText}>Budget Tracker</Text>
            <Text style={styles.brandSubText}>{activeBudget.name}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatMoney(dailySummary?.budgetAmount)}
            </Text>
          </View>
          <View style={styles.statGrid}>
            {mini.map((item) => (
              <View key={item.id} style={styles.statCard}>
                <Text style={styles.statLabel}>{item.name}</Text>
                <Text style={styles.statValue}>{item.data}</Text>
              </View>
            ))}
          </View>
          <View style={styles.transactionContainer}>
            <Text style={{ color: "#fff", fontSize: 15 }}>
              Recent transactions
            </Text>
            <TouchableOpacity>
              <Text style={{ color: COLORS.green, fontSize: 15 }}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <ListTransactions transaction={transaction} />

          {showUnderSpend && (
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
                  >
                    <Text style={styles.primaryButtonText}>Save it</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.secondaryButton}
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
    marginBottom: 25,
  },
  balanceLabel: {
    fontSize: 15,
    color: COLORS.text_secondary,
    marginBottom: 4,
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
    paddingHorizontal: 14,
    alignItems: "center",
    width: "48%",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 13.5,
    color: COLORS.text_secondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  transactionContainer: {
    flexDirection: "row",
    marginTop: 30,
    marginBottom: 15,
    justifyContent: "space-between",
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
