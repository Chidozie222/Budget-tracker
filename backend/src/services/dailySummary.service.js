import budgetRepository from "../repositories/budget.repository.js";
import expenseRepository from "../repositories/expense.repository.js";
import transactionRepository from "../repositories/transaction.repository.js";
import savingRepository from "../repositories/saving.repository.js";
import { daysBetween, round2 } from "../utils/dailySummary.utiliy.js";

const dailySummaryService = async (budgetId, currentDate) => {
  if (budgetId === null || budgetId === undefined) {
    return {
      statusCode: 400,
      data: {
        message: "budget Id must be given",
      },
    };
  }

  const budget = await budgetRepository.getBudgetById(budgetId);
  const totalFixedExpenses =
    await expenseRepository.getTotalFixedExpenses(budgetId);
  const totalPlannedSavings =
    await savingRepository.getTotalPlannedSavings(budgetId);
  const totalExpenditureFromPrevoiusDay =
    await transactionRepository.getTotalExpensesFromPerviousDay(
      budgetId,
      currentDate,
    );
  const totalExpenditureFromCurrentDay =
    await transactionRepository.getTotalExpensesFromCurrentDay(
      budgetId,
      currentDate,
    );

  const budgetAmount = budget.income - totalFixedExpenses - totalPlannedSavings;
  const remainingBudgetAmount = budgetAmount - totalExpenditureFromPrevoiusDay;
  const totalNumberOfDays = daysBetween(budget.start_date, budget.end_date);
  const daysPassed = daysBetween(budget.start_date, currentDate) - 1;
  const remainingDays = totalNumberOfDays - daysPassed;
  const recommendedExpenditure =
    remainingDays > 0 ? remainingBudgetAmount / remainingDays : 0;
  const difference = recommendedExpenditure - totalExpenditureFromCurrentDay;

  return {
    statusCode: 200,
    data: {
      budgetId,
      data: currentDate,
      recommendedSpendingAmount: round2(recommendedExpenditure),
      spendToday: round2(totalExpenditureFromCurrentDay),
      remainBuget: round2(remainingBudgetAmount),
      remainingDays,
      leftover: difference > 0 ? round2(difference) : 0,
      overspend: difference < 0 ? round2(Math.abs(difference)) : 0,
    },
  };
};

export default dailySummaryService;
