import { View, Text, TextInput } from "react-native";

const CtextInput = ({ label, isPassword, value, setValue, placeHolder }) => {
  return (
    <View
      style={{
        width: "90%",
        marginVertical: 10,
      }}
    >
      <Text>{label}</Text>
      <TextInput
        value={value}
        placeholder={placeHolder}
        placeholderTextColor={"#5a5656"}
        onChangeText={(item) => setValue(item)}
        secureTextEntry={isPassword}
        style={{
          paddingHorizontal: 6,
          borderStyle: "solid",
          borderColor: "#000",
          borderWidth: 1,
          borderRadius: 5,
          marginVertical: 5,
          color: "#000"
        }}
      />
    </View>
  );
};

export default CtextInput;
