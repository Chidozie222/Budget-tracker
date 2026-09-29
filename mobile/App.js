import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/store/auth.context";
import AuthNavigation from "./src/navigation/auth.nav";
import Home from "./src/screens/home.screen";
import { useAuth } from "./src/store/auth.context";

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
    return <Home />;
  } else {
    return <AuthNavigation />;
  }
  // return <AuthNavigation />;
};
