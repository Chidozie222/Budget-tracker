import { FlatList, Text, View } from "react-native";
import { COLORS } from "../styles/style";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const ListTransactions = ({ transaction = [] }) => {
  return (
    <FlatList
      data={Array.isArray(transaction) ? transaction : []}
      keyExtractor={(item, index) => String(item?.id ?? index)}
      renderItem={({ item }) => (
        <View
          style={{
            marginVertical: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ fontSize: 15, color: "#fff" }}>
              {item.description || item.name || "Transaction"}
            </Text>
            <Text style={{ color: COLORS.text_secondary, fontSize: 12 }}>
              {formatDate(item.created_at || item.date || item.updated_at)}
            </Text>
          </View>
          <Text style={{ fontSize: 15, color: COLORS.red, fontWeight: "600" }}>
            -₦{Number(item.amount ?? 0).toLocaleString()}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            marginVertical: 20,
            textAlign: "center",
          }}
        >
          No Transactions yet
        </Text>
      }
      horizontal={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ListTransactions;
