import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../styles/style";

const AppBackground = ({ children }) => {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.bg_app,
    // backgroundColor: "white",
    borderRadius: "28px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 10
  },
});

export default AppBackground;