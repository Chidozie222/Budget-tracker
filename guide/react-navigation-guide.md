# React Navigation — Complete Reference (v6/v7, Expo)

## Table of Contents
1. [Installation](#installation)
2. [Root Setup](#root-setup)
3. [Stack Navigator](#stack-navigator)
4. [Bottom Tabs Navigator](#bottom-tabs-navigator)
5. [Drawer Navigator](#drawer-navigator)
6. [Material Top Tabs](#material-top-tabs)
7. [Nesting Navigators](#nesting-navigators)
8. [Navigation Actions](#navigation-actions)
9. [Hooks](#hooks)
10. [Passing Data Between Screens](#passing-data-between-screens)
11. [TypeScript](#typescript)
12. [Deep Linking](#deep-linking)
13. [Authentication Flow Pattern](#authentication-flow-pattern)
14. [Modals](#modals)
15. [Screen Options & Header Customization](#screen-options--header-customization)
16. [Gestures & Animations](#gestures--animations)
17. [Common Gotchas & Fixes](#common-gotchas--fixes)
18. [Debugging Native Module Errors](#debugging-native-module-errors)

---

## Installation

### Core packages (always required)
```bash
npx expo install @react-navigation/native react-native-screens react-native-safe-area-context
```

### Navigator-specific packages
```bash
# Stack
npx expo install @react-navigation/native-stack

# Bottom tabs
npx expo install @react-navigation/bottom-tabs

# Drawer (also needs gesture-handler + reanimated)
npx expo install @react-navigation/drawer react-native-gesture-handler react-native-reanimated

# Material top tabs (also needs pager-view)
npx expo install @react-navigation/material-top-tabs react-native-pager-view
```

### Bare React Native (non-Expo)
```bash
npm install @react-navigation/native react-native-screens react-native-safe-area-context
npm install @react-navigation/native-stack
cd ios && pod install
```
Android requires no extra linking with RN ≥0.60 autolinking. If using `react-native-gesture-handler`, import it at the very top of your entry file (`index.js`):
```js
import 'react-native-gesture-handler';
```

### Reanimated setup (if using Drawer or custom animations)
Add the Babel plugin — **must be last** in the plugins array:
```js
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};
```
Then clear cache: `npx expo start --clear`

---

## Root Setup

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {/* your navigator tree */}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```
Wrap in `GestureHandlerRootView` if you're using Drawer or gesture-handler anywhere — required for gestures to work correctly, especially on Android.

### Theming
```jsx
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    primary: '#6200ee',
  },
};

<NavigationContainer theme={MyTheme}>...</NavigationContainer>
```
Switch between `DefaultTheme` and `DarkTheme` based on `useColorScheme()` for automatic dark mode support.

---

## Stack Navigator

```jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Welcome' }} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
```

### `native-stack` vs `stack`
| | `@react-navigation/native-stack` | `@react-navigation/stack` |
|---|---|---|
| Rendering | Native platform primitives (UIKit/Fragment) | Pure JS re-implementation |
| Performance | Faster, native feel | Slower, more customizable |
| Custom transitions | Limited | Fully customizable |
| Extra deps | None | `react-native-gesture-handler` |
| Recommended default | ✅ Yes | Only if you need custom animations |

### Common screenOptions
```jsx
<Stack.Navigator
  screenOptions={{
    headerShown: true,
    headerStyle: { backgroundColor: '#1e1e1e' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerBackTitleVisible: false, // iOS
    animation: 'slide_from_right', // native-stack only
    contentStyle: { backgroundColor: '#fff' },
  }}
>
```

### Per-screen header customization
```jsx
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={{
    title: 'Details',
    headerRight: () => (
      <Button onPress={() => alert('pressed')} title="Info" />
    ),
    headerLeft: () => null, // hide back button
  }}
/>
```

### Dynamic titles from within a screen
```jsx
function DetailsScreen({ route, navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.name });
  }, [navigation, route.params.name]);
}
```

---

## Bottom Tabs Navigator

```jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = { Home: 'home', Settings: 'settings' };
          const name = focused ? icons[route.name] : `${icons[route.name]}-outline`;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
```

### Badges
```jsx
<Tab.Screen
  name="Notifications"
  component={NotificationsScreen}
  options={{ tabBarBadge: 3 }}
/>
```

### Hiding tab bar on specific nested screens
```jsx
function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ tabBarStyle: { display: 'none' } }} // won't work directly here
      />
    </Stack.Navigator>
  );
}
```
Correct approach — set it dynamically via `navigation.getParent()`:
```jsx
useLayoutEffect(() => {
  navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
  return () => navigation.getParent()?.setOptions({ tabBarStyle: undefined });
}, [navigation]);
```

---

## Drawer Navigator

```jsx
import { createDrawerNavigator } from '@react-navigation/drawer';
const Drawer = createDrawerNavigator();

<Drawer.Navigator
  screenOptions={{
    drawerActiveTintColor: '#6200ee',
    drawerType: 'front', // 'front' | 'back' | 'slide' | 'permanent'
  }}
>
  <Drawer.Screen name="Home" component={HomeScreen} />
  <Drawer.Screen name="Profile" component={ProfileScreen} />
</Drawer.Navigator>
```

### Custom drawer content
```jsx
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Logout" onPress={() => auth.signOut()} />
    </DrawerContentScrollView>
  );
}

<Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
  ...
</Drawer.Navigator>
```

### Opening/closing programmatically
```jsx
navigation.openDrawer();
navigation.closeDrawer();
navigation.toggleDrawer();
```

---

## Material Top Tabs

```jsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
const TopTab = createMaterialTopTabNavigator();

<TopTab.Navigator
  screenOptions={{
    tabBarActiveTintColor: '#6200ee',
    tabBarIndicatorStyle: { backgroundColor: '#6200ee' },
  }}
>
  <TopTab.Screen name="Feed" component={FeedScreen} />
  <TopTab.Screen name="Trending" component={TrendingScreen} />
</TopTab.Navigator>
```

---

## Nesting Navigators

Most real apps look like: **Stack → Tabs → (Stack per tab)**.

```jsx
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Modal" component={ModalScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
```

**Rule of thumb:** hide the header on the outer navigator wrapping an inner one, or you'll get double headers.

### Navigating to a screen in a different nested stack
```jsx
navigation.navigate('HomeTab', {
  screen: 'PostDetails',
  params: { postId: 123 },
});
```

---

## Navigation Actions

```jsx
navigation.navigate('Screen', { param: 'value' }); // go to screen, or focus if already in stack
navigation.push('Screen', { param: 'value' });      // always adds new instance (stack only)
navigation.goBack();                                 // go back one screen
navigation.popToTop();                               // back to first screen in stack
navigation.pop(2);                                   // go back N screens
navigation.replace('Screen');                        // replace current screen (no back)
navigation.reset({                                   // clear entire history
  index: 0,
  routes: [{ name: 'Home' }],
});
navigation.setParams({ key: 'value' });              // update current screen's params
navigation.canGoBack();                              // boolean check
navigation.isFocused();                              // boolean check
navigation.getParent();                              // access parent navigator
navigation.getState();                                // full nav state tree
```

### Listening to events
```jsx
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    if (!hasUnsavedChanges) return;
    e.preventDefault();
    Alert.alert('Discard changes?', '', [
      { text: "Don't leave", style: 'cancel' },
      { text: 'Discard', onPress: () => navigation.dispatch(e.data.action) },
    ]);
  });
  return unsubscribe;
}, [navigation, hasUnsavedChanges]);
```

---

## Hooks

```jsx
import {
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
  useNavigationState,
} from '@react-navigation/native';

const navigation = useNavigation();       // access nav object outside of screen props
const route = useRoute();                 // access current route/params
const isFocused = useIsFocused();         // re-renders on focus change

useFocusEffect(
  useCallback(() => {
    console.log('screen focused');
    return () => console.log('screen unfocused');
  }, [])
);

const routeCount = useNavigationState((state) => state.routes.length);
```

**`useFocusEffect` vs `useEffect`:** `useEffect` runs once on mount. `useFocusEffect` re-runs every time the screen comes into focus (e.g., navigating back to it) — critical for refreshing data.

---

## Passing Data Between Screens

### Forward (via params)
```jsx
navigation.navigate('Details', { userId: 42, name: 'Chidozie' });

// receiving screen
function DetailsScreen({ route }) {
  const { userId, name } = route.params;
}
```

### Backward (callback pattern)
```jsx
// Screen A
navigation.navigate('Picker', {
  onSelect: (value) => setSelectedValue(value),
});

// Screen B (Picker)
function PickerScreen({ route, navigation }) {
  const handlePick = (value) => {
    route.params.onSelect(value);
    navigation.goBack();
  };
}
```

### Global state (better for complex apps)
For data shared across many screens, prefer Context, Zustand, Redux, or Jotai over deeply nested params.

---

## TypeScript

```tsx
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Define param lists per navigator
export type RootStackParamList = {
  Main: undefined;
  Details: { userId: number };
  Modal: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Typed screen props
type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

function DetailsScreen({ route, navigation }: DetailsProps) {
  const { userId } = route.params; // fully typed, autocompletes
  navigation.navigate('Main'); // typo-checked
}

// Composite props for nested navigators (tab screen that can also navigate stack routes)
type HomeTabProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
```

### Global type declaration (optional but recommended)
```tsx
// navigation.d.ts
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```
This makes `useNavigation()` and `useRoute()` automatically typed everywhere without manual generics.

---

## Deep Linking

```jsx
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Main: {
        screens: {
          HomeTab: 'home',
          ProfileTab: 'profile/:userId',
        },
      },
      Details: 'details/:id',
      NotFound: '*',
    },
  },
};

<NavigationContainer linking={linking} fallback={<LoadingScreen />}>
  <RootStack />
</NavigationContainer>
```

### Testing deep links
```bash
# iOS simulator
xcrun simctl openurl booted myapp://details/42

# Android emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://details/42" com.yourapp.package
```

### Expo config (`app.json`)
```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

---

## Authentication Flow Pattern

Standard pattern: conditionally render either the Auth stack or the App stack based on auth state — don't try to "navigate" between them as if in the same stack.

```jsx
function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
```
When `user` changes, React unmounts one tree and mounts the other — this correctly resets navigation history (no back button to a logged-out screen).

---

## Modals

### Using `native-stack` presentation
```jsx
<Stack.Navigator>
  <Stack.Screen name="Main" component={MainTabs} />
  <Stack.Group screenOptions={{ presentation: 'modal' }}>
    <Stack.Screen name="NewPost" component={NewPostScreen} />
    <Stack.Screen name="Settings" component={SettingsModal} />
  </Stack.Group>
</Stack.Navigator>
```
`presentation` options: `'card'` (default), `'modal'`, `'transparentModal'`, `'containedModal'` (Android), `'fullScreenModal'` (iOS).

### Closing a modal
```jsx
navigation.goBack();
// or if pushed from elsewhere:
navigation.dismiss();
```

---

## Screen Options & Header Customization

### Custom header component entirely
```jsx
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    header: (props) => <CustomHeader {...props} />,
  }}
/>
```

### Search bar in header (native-stack, iOS-native feel)
```jsx
<Stack.Screen
  name="Search"
  component={SearchScreen}
  options={{
    headerSearchBarOptions: {
      placeholder: 'Search',
      onChangeText: (e) => setQuery(e.nativeEvent.text),
    },
  }}
/>
```

### Large title (iOS)
```jsx
options={{ headerLargeTitle: true }}
```

---

## Gestures & Animations

### Custom transition (with `@react-navigation/stack`, not native-stack)
```jsx
import { CardStyleInterpolators } from '@react-navigation/stack';

<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={{
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  }}
/>
```

### Disabling swipe-back gesture
```jsx
options={{ gestureEnabled: false }}
```

### Custom animation duration (native-stack)
```jsx
options={{
  animation: 'fade', // 'default' | 'fade' | 'flip' | 'none' | 'slide_from_bottom' etc.
  animationDuration: 200,
}}
```

---

## Common Gotchas & Fixes

| Symptom | Cause | Fix |
|---|---|---|
| Screen doesn't refresh when navigating back | Used `useEffect` instead of focus-aware hook | Use `useFocusEffect` |
| Double headers in nested navigators | Both outer and inner navigator show headers | Set `headerShown: false` on the outer `Stack.Screen` wrapping the inner navigator |
| TypeScript complains about missing params | Screen expects params but navigated without them | Use `undefined` in param list type for paramless screens, or make params optional |
| Back button loops to logged-out screen after login | Auth and app screens in same stack | Use the conditional-render auth pattern (separate trees) |
| Tab bar visible on a modal/detail screen when it shouldn't be | Tab bar styling not scoped correctly | Use `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })` in a `useLayoutEffect` |
| Gestures not working (drawer swipe, etc.) | Missing `GestureHandlerRootView` wrapper | Wrap root `App` component in it |
| Reanimated errors / crashes | Babel plugin missing or not last in the list | Add `react-native-reanimated/plugin` as the **last** plugin, clear cache |
| `navigation.navigate` doesn't do anything | Screen name typo, or navigating to a screen not in the current navigator's tree | Use nested navigate syntax: `navigate('TabName', { screen: 'ScreenName' })` |
| Deep link doesn't open the right screen | Config path doesn't match nested navigator structure | Mirror your `linking.config.screens` structure exactly to your navigator nesting |

---

## Debugging Native Module Errors

Example: `Can't find ViewManager 'RNSScreenContentWrapper'`

This means the native Android/iOS binary doesn't have a native module that your JS code expects — almost always caused by adding/upgrading a native dependency (like `react-native-screens`) without rebuilding the native app.

**Fix checklist:**
1. Confirm package versions match your Expo SDK:
   ```bash
   npx expo install --check
   ```
2. Rebuild the native project:
   ```bash
   npx expo prebuild --clean
   npx expo run:android   # or run:ios
   ```
3. **If using EAS Build:** a JS-only OTA update will NOT fix this — you need a brand new build:
   ```bash
   eas build --profile development --platform android
   ```
   Then reinstall the new APK/IPA on your device — don't reload JS on the old native binary.
4. Nuclear reset if all else fails:
   ```bash
   rm -rf node_modules android ios
   npm install
   npx expo prebuild --clean
   npx expo run:android
   ```

**Rule of thumb:** any time you add, remove, or upgrade a package that includes native code, you need a new native build — not just a JS bundle refresh.
