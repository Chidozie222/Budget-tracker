import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/store/auth.context";
import AuthNavigation from "./src/navigation/auth.nav";
import { useAuth } from "./src/store/auth.context";
import MainStack from "./src/navigation/mainStack.nav";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigation />
      </NavigationContainer>
    </AuthProvider>
  );
}

const MainNavigation = () => {
  const { isLogin } = useAuth();

  if (isLogin) {
    return <MainStack />;
  } else {
    return <AuthNavigation />;
  }
  // return <AuthNavigation />;
};
