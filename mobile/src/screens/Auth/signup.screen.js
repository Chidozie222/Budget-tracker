import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableOpacity, Text, View } from "react-native";
import CtextInput from "../../components/textInput.component";
import style from "../../styles/auth.style";
import { useNavigation } from "@react-navigation/native";
import { validName, validEmail, validPassword } from "../../utils/validation";
import { useAuth } from "../../store/auth.context";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signUp, isLoading, error } = useAuth();

  const navigation = useNavigation();

  const HandleSignUpApICall = async () => {
    if (!validName(name?.trim())) {
      alert("Name is required");
      return;
    }
    if (!validEmail(email?.trim())) {
      alert("Email is required and the format is yourname@email.com");
      return;
    }
    if (!validPassword(password?.trim())) {
      alert("password is required");
      return;
    }

    try {
      const result = await signUp(name, email, password);
      alert(result?.message || "Account created successfully");
      navigation.navigate("SignIn");
    } catch (err) {
      alert(err.message || "Registration failed");
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
      <Text style={style.title}>Sign Up</Text>
      <CtextInput
        label="Name"
        isPassword={false}
        value={name}
        setValue={setName}
        placeHolder={"Name"}
      />
      <CtextInput
        label="Email"
        isPassword={false}
        value={email}
        setValue={setEmail}
        placeHolder={"Email"}
      />
      <View
        style={{
          width: "100%",
          alignItems: "center",
          position: "relative",
        }}
      >
        <CtextInput
          label="Password"
          isPassword={true}
          value={password}
          setValue={setPassword}
          placeHolder={"Password"}
        />
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 30,
            bottom: 23,
          }}
        >
          <Text style={{ color: "#000" }}>E</Text>
        </TouchableOpacity>
      </View>
      {/* {error ? <Text style={{ color: "red" }}>{error}</Text> : null} */}
      <TouchableOpacity
        style={[style.button, isLoading && { opacity: 0.6 }]}
        onPress={HandleSignUpApICall}
        disabled={isLoading}
      >
        <Text style={style.buttonText}>{isLoading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>

      <View style={style.subContainer}>
        <Text>If you have registered</Text>
        <TouchableOpacity
          style={style.link}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={style.linkText}>sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Register;
