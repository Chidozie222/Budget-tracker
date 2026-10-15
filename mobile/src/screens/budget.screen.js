import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { dailySummaryRequest } from "../api/dailysummary.api";
import { getBudgetsRequest } from "../api/budget.api";
import { getTransactionByBudgetRequest } from "../api/transaction.api";
import AppBackground from "../components/background.component";
import ListTransactions from "../components/listTransaction.component";
import { useAuth } from "../store/auth.context";
import { COLORS } from "../styles/style";

const formatMoney = (value) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const isBudgetActive = (budget) => {
  if (!budget?.end_date) return false;

  return new Date(budget.end_date) > new Date();
};

const formatRange = (budget) => {
  if (!budget?.start_date && !budget?.end_date) return "No date range";

  return `${formatDate(budget.start_date)} – ${formatDate(budget.end_date)}`;
};

const BudgetListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const data = await getBudgetsRequest(user.accessToken);
        const today = new Date().toISOString().slice(0, 10);

        const enriched = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (budget) => {
            try {
              const summary = await dailySummaryRequest(
                budget.id,
                today,
                user.accessToken,
              );
              const remaining = Number(summary?.remainBuget ?? 0);
              const income = Number(budget.income ?? 0);
              const spent = Math.max(0, income - remaining);
              const percent =
                income > 0 ? Math.min(100, (spent / income) * 100) : 0;

              return { ...budget, summary, spent, remaining, percent };
            } catch (error) {
              return {
                ...budget,
                summary: null,
                spent: 0,
                remaining: Number(budget.income ?? 0),
                percent: 0,
              };
            }
          }),
        );

        setBudgets(enriched);
      } catch (error) {
        console.error("loadBudgets error:", error);
        setBudgets([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.accessToken) {
      loadBudgets();
    }
  }, [user?.accessToken]);

  if (loading) {
    return (
      <AppBackground>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.green} />
          <Text style={styles.loadingText}>Loading budgets...</Text>
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <View style={styles.screenContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Budgets</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={() => navigation.navigate("AddCategory")}
          >
            <Text style={styles.iconText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={budgets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = isBudgetActive(item);
            const leftAmount = Math.max(0, item.remaining ?? 0);
            const spent = Math.max(0, item.spent ?? 0);
            const percent = Math.min(100, Math.max(0, item.percent ?? 0));

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate("BudgetDetail", { budget: item })
                }
                style={[styles.budgetCard, active && styles.budgetCardActive]}
              >
                <View style={styles.budgetTopRow}>
                  <View style={styles.titleBox}>
                    <Text style={styles.budgetName}>{item.name}</Text>
                    <Text style={styles.budgetRange}>{formatRange(item)}</Text>
                  </View>
                  <View
                    style={[
                      styles.pill,
                      active ? styles.pillActive : styles.pillEnded,
                    ]}
                  >
                    <Text style={styles.pillText}>
                      {active ? "Active" : "Ended"}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percent}%` },
                      !active && styles.progressFillEnded,
                    ]}
                  />
                </View>

                <View style={styles.budgetFoot}>
                  <Text style={styles.mutedText}>
                    Spent{" "}
                    <Text style={styles.strongText}>{formatMoney(spent)}</Text>
                  </Text>
                  <Text style={styles.mutedText}>
                    Left{" "}
                    <Text style={styles.strongText}>
                      {formatMoney(leftAmount)}
                    </Text>
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No budgets yet.</Text>
            </View>
          }
        />
      </View>
    </AppBackground>
  );
};

const BudgetDetailScreen = ({ navigation, route }) => {
  const { budget } = route.params || {};
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetDetail = async () => {
      if (!budget?.id || !user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const date = new Date().toISOString().slice(0, 10);
        const response = await getTransactionByBudgetRequest(
          budget.id,
          date,
          5,
          0,
          user.accessToken,
        );
        setTransactions(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("loadBudgetDetail error:", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetDetail();
  }, [budget?.id, user?.accessToken]);

  const active = isBudgetActive(budget);
  const summary = budget?.summary;
  const income = Number(budget?.income ?? 0);
  const remaining = Number(summary?.remainBuget ?? budget?.remaining ?? 0);
  const spent = Math.max(0, income - remaining);
  const percent = income > 0 ? Math.min(100, (spent / income) * 100) : 0;

  return (
    <AppBackground>
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{budget?.name || "Budget"}</Text>
          <View
            style={[styles.pill, active ? styles.pillActive : styles.pillEnded]}
          >
            <Text style={styles.pillText}>{active ? "Active" : "Ended"}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceMeta}>
            {formatRange(budget)} · {summary?.remainingDays ?? 0} days left
          </Text>
          <Text style={styles.balanceValue}>
            {formatMoney(remaining)}{" "}
            <Text style={styles.balanceLabel}>remaining</Text>
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.incomeIcon]}>
              <Text style={styles.statGlyph}>↑</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{formatMoney(income)}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.spentIcon]}>
              <Text style={styles.statGlyph}>↓</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatMoney(spent)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <Text style={styles.sectionAction}>View all</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.green} />
          </View>
        ) : (
          <ListTransactions transaction={transactions} />
        )}
      </View>
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  screenTitle: {
    fontSize: 23,
    fontWeight: "700",
    color: COLORS.text_primary,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.bg_card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconText: {
    fontSize: 28,
    color: COLORS.text_primary,
    lineHeight: 28,
  },
  listContent: {
    paddingBottom: 30,
  },
  budgetCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  budgetCardActive: {
    borderColor: COLORS.green,
  },
  budgetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  titleBox: {
    flex: 1,
    paddingRight: 12,
  },
  budgetName: {
    color: COLORS.text_primary,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 5,
  },
  budgetRange: {
    color: COLORS.text_secondary,
    fontSize: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: "center",
  },
  pillActive: {
    backgroundColor: "rgba(29, 211, 176, 0.14)",
  },
  pillEnded: {
    backgroundColor: "rgba(140, 152, 174, 0.12)",
  },
  pillText: {
    color: COLORS.text_primary,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 999,
  },
  progressFillEnded: {
    backgroundColor: COLORS.text_muted,
  },
  budgetFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mutedText: {
    color: COLORS.text_secondary,
    fontSize: 12,
  },
  strongText: {
    color: COLORS.text_primary,
    fontWeight: "700",
  },
  emptyState: {
    marginTop: 32,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.text_secondary,
    fontSize: 15,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.text_secondary,
    marginTop: 10,
  },
  detailContainer: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 18,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  backText: {
    color: COLORS.text_primary,
    fontSize: 28,
    fontWeight: "700",
  },
  detailTitle: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text_primary,
    fontSize: 20,
    fontWeight: "600",
  },
  balanceCard: {
    backgroundColor: COLORS.bg_card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  balanceMeta: {
    color: COLORS.text_secondary,
    fontSize: 12,
    marginBottom: 8,
  },
  balanceValue: {
    color: COLORS.text_primary,
    fontSize: 30,
    fontWeight: "700",
  },
  balanceLabel: {
    color: COLORS.text_secondary,
    fontSize: 12,
    fontWeight: "500",
  },
  statGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bg_card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: "rgba(29, 211, 176, 0.12)",
  },
  spentIcon: {
    backgroundColor: "rgba(240, 64, 91, 0.12)",
  },
  statGlyph: {
    color: COLORS.text_primary,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.text_secondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: COLORS.text_primary,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.text_primary,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionAction: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "600",
  },
});

export { BudgetListScreen, BudgetDetailScreen };
