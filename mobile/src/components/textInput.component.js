import { View, Text, TextInput } from "react-native";
import { COLORS } from "../styles/style";

const CtextInput = ({ label, isPassword, value, setValue, placeHolder }) => {
  return (
    <View
      style={{
        width: "90%",
        marginVertical: 10,
      }}
    >
      <Text style={{color: "#fff"}}>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeHolder}
        placeholderTextColor={"#a7a2a2"}
        onChangeText={(item) => setValue(item)}
        secureTextEntry={isPassword}
        style={{
          paddingHorizontal: 6,
          borderStyle: "solid",
          borderColor: COLORS.green_dim,
          borderWidth: 1,
          borderRadius: 5,
          marginVertical: 5,
          color: "#fff"
        }}
      />
    </View>
  );
};

export default CtextInput;
