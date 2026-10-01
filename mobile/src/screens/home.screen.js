import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { activeBudgetRequest } from "../api/budget.api";
import { dailySummaryRequest } from "../api/dailysummary.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";
import AppBackground from "../components/background.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";

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

  const mini = ["Income", "Remaining Amount", "Today's spend", "Daily limt"]

  return (
    <AppBackground>
      {!activeBudget && !dailySummary && !transaction || activeBudget.length === 0 ? (
        <Text style={styles.text}>No data avaliable</Text>
      ) : (
        <View>
          <View style={{marginBottom: 22}}>
            <Text style={styles.brandText}>Budget Tracker</Text>
            <Text style={styles.brandSubText}>{activeBudget.name}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>₦{dailySummary?.budgetAmount}</Text>
          </View>
        </View>
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    // color: '#fff',
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  brandText: {
    fontWeight: "600",
    fontSize: 21,
    color: "#fff"
  },
  brandSubText: {
    fontWeight: "500",
    color: COLORS.text_secondary,
    fontSize: 15
  },
  balanceCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: COLORS.radius_lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 14
  },
  balanceLabel: {
    fontSize: 15,
    color: COLORS.text_secondary,
    marginBottom: 4
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "600",
    color: "#fff"
  }
});
