import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableOpacity, Text, View } from "react-native";
import CtextInput from "../../components/textInput.component";
import style from "../../styles/auth.style";
import { useNavigation } from "@react-navigation/native";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={style.title}>Sign In</Text>
      <CtextInput
        label="Email"
        isPassword={false}
        value={email}
        setValue={setEmail}
        placeHolder={"Email"}
      />
      <CtextInput
        label="Password"
        isPassword={true}
        value={password}
        setValue={setPassword}
        placeHolder={"Password"}
      />
      <TouchableOpacity style={style.button}>
        <Text style={style.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={style.subContainer}>
        <Text>If you have not registered</Text>
        <TouchableOpacity
          style={style.link}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={style.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignIn;
