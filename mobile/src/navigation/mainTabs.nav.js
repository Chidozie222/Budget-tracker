import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/home.screen";
import Transaction from "../screens/transaction.screen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            headerShown: false
        })}>
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Transaction" component={Transaction}/>
        </Tab.Navigator>
    )
}
