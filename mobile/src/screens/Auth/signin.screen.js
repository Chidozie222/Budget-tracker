import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableOpacity, Text, View } from "react-native";
import CtextInput from "../../components/textInput.component";
import style from "../../styles/auth.style";
import { useNavigation } from "@react-navigation/native";
import { validEmail, validPassword } from "../../utils/validation";
import { useAuth } from "../../store/auth.context";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading, error } = useAuth();

  const navigation = useNavigation();

  const HandleSignInApICall = async () => {
    if (!validEmail(email?.trim())) {
      alert("Email is required and the format is yourname@email.com");
      return;
    }
    if (!validPassword(password?.trim())) {
      alert("password is required");
      return;
    }

    try {
      const result = await signIn(email, password);
      console.log(result)
      alert(result?.message || "Sign in successful");
      // navigation.navigate("Home");
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

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
      {/* {error ? <Text style={{ color: "red" }}>{error}</Text> : null} */}
      <TouchableOpacity
        style={[style.button, isLoading && { opacity: 0.6 }]}
        onPress={HandleSignInApICall}
        disabled={isLoading}
      >
        <Text style={style.buttonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
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
