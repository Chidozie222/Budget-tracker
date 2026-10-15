import { FlatList, Text, View } from "react-native";
import { COLORS } from "../styles/style";

const ListTransactions = ({ transaction }) => {
  return (
    <FlatList
      data={transaction}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <View
          style={{
            marginVertical: 10,
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ fontSize: 15, color: "#fff" }}>{item.name}</Text>
            <Text style={{ color: COLORS.text_secondary }}>
              {item.created_at}
            </Text>
          </View>
          <Text style={{ fontSize: 15, color: COLORS.red }}>
            -₦{item.amount}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text
          style={{
            fontSize: 20,
            color: "#fff",
            marginHorizontal: "auto",
            marginVertical: 20,
          }}
        >
          No Transactions yet
        </Text>
      }
      horizontal={false}
    />
  );
};

export default ListTransactions;
