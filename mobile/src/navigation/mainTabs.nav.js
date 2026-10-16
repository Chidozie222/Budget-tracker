import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../screens/home.screen";
import Transaction from "../screens/transaction.screen";
import ProfileScreen from "../screens/profile.screen";
import AddTransactionScreen from "../screens/addTransaction.screen";
import AddBudgetScreen from "../screens/addBudget.screen";
import AddCategoryScreen from "../screens/addCategory.screen";
import { BudgetDetailScreen, BudgetListScreen } from "../screens/budget.screen";

const Tab = createBottomTabNavigator();
const BudgetStack = createNativeStackNavigator();
const TransactionStack = createNativeStackNavigator();

const BudgetNavigator = () => (
  <BudgetStack.Navigator screenOptions={{ headerShown: false }}>
    <BudgetStack.Screen name="BudgetList" component={BudgetListScreen} />
    <BudgetStack.Screen name="BudgetDetail" component={BudgetDetailScreen} />
    <BudgetStack.Screen name="AddBudget" component={AddBudgetScreen} />
    <BudgetStack.Screen name="AddCategory" component={AddCategoryScreen} />
  </BudgetStack.Navigator>
);

const TransactionNavigator = () => (
  <TransactionStack.Navigator screenOptions={{ headerShown: false }}>
    <TransactionStack.Screen name="TransactionList" component={Transaction} />
    <TransactionStack.Screen
      name="AddTransaction"
      component={AddTransactionScreen}
    />
  </TransactionStack.Navigator>
);

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#22304C",
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#1DD3B0",
        tabBarInactiveTintColor: "#8C98AE",
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Transactions" component={TransactionNavigator} />
      <Tab.Screen name="Budgets" component={BudgetNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
