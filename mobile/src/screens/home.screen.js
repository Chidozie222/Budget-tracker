import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { activeBudgetRequest } from "../api/budget.api";
import { dailySummaryRequest } from "../api/dailysummary.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";
import AppBackground from "../components/background.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";
import ListTransactions from "../components/listTransaction.component";

export default function Home() {
  const [activeBudget, setActiveBudget] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadBudget = async () => {
      const date = new Date().toISOString().slice(0, 10);
      const take = 10;
      const skip = 0;
      const _activeBudget = await activeBudgetRequest(user.accessToken);
      setActiveBudget(_activeBudget);
      if (_activeBudget.length === 0) {
        return;
      }
      const _dailySummary = await dailySummaryRequest(
        _activeBudget.id,
        date,
        user.accessToken,
      );
      const _transaction = await getTransactionByBudgetRequest(
        _activeBudget.id,
        date,
        take,
        skip,
        user.accessToken,
      );
      console.log(_activeBudget, _dailySummary, _transaction);
      setDailySummary(_dailySummary);
      setTransaction(_transaction);
    };

    loadBudget();
  }, []);

  const mini = [
    { id: 1, name: "Income", data: activeBudget?.income },
    { id: 2, name: "Remaining Amount", data: dailySummary?.remainBuget },
    { id: 3, name: "Today's spend", data: dailySummary?.spendToday },
    {
      id: 4,
      name: "Daily limt",
      data: dailySummary?.recommendedSpendingAmount,
    },
  ];

  return (
    <AppBackground>
      {(!activeBudget && !dailySummary && !transaction) ||
      activeBudget.length === 0 ? (
        <Text style={styles.text}>No data avaliable</Text>
      ) : (
        <View style={{ paddingTop: 30 }}>
          <View style={{ marginBottom: 22 }}>
            <Text style={styles.brandText}>Budget Tracker</Text>
            <Text style={styles.brandSubText}>{activeBudget.name}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              ₦{dailySummary?.budgetAmount}
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
    display: "flex",
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
    display: "flex",
    alignItems: "center",
    width: "48%",
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
});
