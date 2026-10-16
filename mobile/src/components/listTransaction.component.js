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
      renderItem={({ item }) => {
        const amount = Number(item.amount ?? 0);
        const isIncome = amount >= 0;

        return (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(140, 152, 174, 0.15)",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isIncome ? "rgba(29, 211, 176, 0.12)" : "rgba(245, 166, 35, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: isIncome ? COLORS.green : COLORS.orange, fontWeight: "700" }}>
                  {isIncome ? "↑" : "↓"}
                </Text>
              </View>

              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 15, color: "#fff", fontWeight: "600" }}>
                  {item.description || item.name || "Transaction"}
                </Text>
                <Text style={{ color: COLORS.text_secondary, fontSize: 12, marginTop: 2 }}>
                  {formatDate(item.created_at || item.date || item.updated_at)}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 15,
                color: isIncome ? COLORS.green : COLORS.red,
                fontWeight: "600",
              }}
            >
              {isIncome ? "+" : "-"}₦{Math.abs(amount).toLocaleString()}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text
          style={{
            fontSize: 18,
            color: COLORS.text_secondary,
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
