import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./mainTabs.nav";

const Stack = createNativeStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default MainStack;
