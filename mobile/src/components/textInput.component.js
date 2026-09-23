import { View, Text, TextInput } from "react-native";

const CtextInput = ({
  isPassword,
  value,
  setValue,
  container_styles,
  textInput_styles,
  placeHolder,
}) => {
  return (
    <View
      style={{
        backgroundColor: "blue",
        width: "90%",
      }}
    >
      <Text style={{ color: "#fff" }}>Hello world</Text>
      <TextInput
        value={value}
        placeholder={placeHolder}
        onChangeText={(item) => setValue(item)}
        secureTextEntry={isPassword}
      />
    </View>
  );
};

export default CtextInput;
