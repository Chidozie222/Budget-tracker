import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/store/auth.context";
import AuthNavigation from "./src/navigation/auth.nav";
import { useAuth } from "./src/store/auth.context";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthNavigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
