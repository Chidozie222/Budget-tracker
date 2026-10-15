import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { activeBudgetRequest } from "../api/budget.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";
import AppBackground from "../components/background.component";
import ListTransactions from "../components/listTransaction.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";

export default function Transaction({ navigation }) {
  const [transaction, setTransaction] = useState([]);
  const [activeBudget, setActiveBudget] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.accessToken) return;

      try {
        const date = new Date().toISOString().slice(0, 10);
        const _activeBudget = await activeBudgetRequest(user.accessToken);
        const active = Array.isArray(_activeBudget)
          ? _activeBudget[0]
          : _activeBudget;

        setActiveBudget(active || null);

        if (!active || !active.id) {
          setTransaction([]);
          return;
        }

        const _transaction = await getTransactionByBudgetRequest(
          active.id,
          date,
          20,
          0,
          user.accessToken,
        );

        setTransaction(Array.isArray(_transaction) ? _transaction : []);
      } catch (error) {
        console.error("Transaction loadBudget error:", error);
        setTransaction([]);
      }
    };

    loadBudget();
  }, [user?.accessToken]);

  return (
    <AppBackground>
      <View style={styles.screenContainer}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AddTransaction")}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>
        </View>

        {activeBudget ? (
          <Text style={styles.subtitle}>{activeBudget.name}</Text>
        ) : (
          <Text style={styles.subtitle}>No active budget</Text>
        )}
        <ListTransactions transaction={transaction} />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingTop: 28,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    color: COLORS.text_primary,
    fontSize: 26,
    fontWeight: "700",
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bg_card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: COLORS.text_primary,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.text_secondary,
    fontSize: 14,
    marginBottom: 12,
  },
});
