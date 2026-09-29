import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { activeBudgetRequest } from "../api/budget.api";
import { useAuth } from "../store/auth.context";

export default function Home() {
  const [activeBudget, setActiveBudget] = useState(null);
  const { user } = useAuth();

  let result = useEffect(() => {
    const loadBudget = async () => {
      const result = await activeBudgetRequest(user.accessToken);
      console.log(result)
      setActiveBudget(result);
    };

    loadBudget();
  }, []);
  
  return (
    <View style={styles.container}>
      {!activeBudget || activeBudget.length === 0 ? (
        <Text style={styles.text}>No data avaliable</Text>
      ) : (
          <Text style={styles.text}>{activeBudget.name}</Text>
      )}
    </View>
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
});
