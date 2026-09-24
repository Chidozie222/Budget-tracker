import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "../screens/Auth/signup.screen";
import SignIn from "../screens/Auth/signin.screen";

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="SignIn" component={SignIn} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
