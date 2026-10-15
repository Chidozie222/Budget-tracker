import { StyleSheet } from "react-native";
import { COLORS } from "./style";

const style = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 30,
    color: "#fff"
  },
  button: {
    marginTop: 25,
    paddingVertical: 10,
    width: "90%",
    backgroundColor: COLORS.blue,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 15,
    color: "#fff",
  },
  subContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  link: {
    marginHorizontal: 5,
  },
  linkText: {
    color: "#0000ff",
    textDecorationLine: "underline",
  },
});

export default style;
