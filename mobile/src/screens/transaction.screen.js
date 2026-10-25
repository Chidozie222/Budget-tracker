import { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppBackground from "../components/background.component";
import ListTransactions from "../components/listTransaction.component";
import { useAuth } from "../store/auth.context";
import { useAppStore } from "../store/app.store";
import { COLORS } from "../styles/style";
import { connectBudgetSocket } from "../api/socket.api";

export default function Transaction({ navigation }) {
  const { activeBudget, transactions, loadActiveBudgetSnapshot } =
    useAppStore();
  const { user } = useAuth();

  useEffect(() => {
    const loadBudget = async () => {
      if (!user?.accessToken) return;

      try {
        await loadActiveBudgetSnapshot(user.accessToken);
      } catch (error) {
        console.error("Transaction loadBudget error:", error);
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
        console.error("Transaction socket refresh error:", error);
      }
    });

    return () => {
      socket?.disconnect();
    };
  }, [activeBudget?.id, user?.accessToken]);

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
        <ListTransactions transaction={transactions} />
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
