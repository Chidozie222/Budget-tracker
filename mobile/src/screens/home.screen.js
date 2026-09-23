import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff" }}>
        Open up App.js to start working on your app!
      </Text>
      <Text style={{ color: "#fff" }}>Hello World</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    // color: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
