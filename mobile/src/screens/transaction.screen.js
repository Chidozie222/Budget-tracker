import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import AppBackground from "../components/background.component";
import { ListTransactions } from "../components/listTransaction.component";
import { useAuth } from "../store/auth.context";
const { user } = useAuth();

export default function Transaction() {
    const [transaction, setTransaction] = useState(null);
    const [activeBudget, setActiveBudget] = useState(null);

      useEffect(() => {
        const loadBudget = async () => {
          const date = new Date().toISOString().slice(0, 10);
          const _activeBudget = await activeBudgetRequest(user.accessToken);
          setActiveBudget(_activeBudget);
          if (_activeBudget.length === 0) {
            return;
          }
          const _transaction = await getTransactionByBudgetRequest(
            _activeBudget.id,
            date,
            user.accessToken,
          );
          setTransaction(_transaction);
        };
    
        loadBudget();
      }, []);
  return (
    <AppBackground>
      <Text>Transaction</Text>
          <ListTransactions transaction={transaction} />
    </AppBackground>
  );
}
