# Navigation Deep Dive — Stack, Tabs, and Drawer

Expo Router is built on top of **React Navigation**. The file-based routes decide *which screens exist and their hierarchy*; the layout files (`_layout.tsx`) decide *how they're presented* — as a stack, tabs, or drawer. You can nest these inside each other (e.g. tabs, where one tab is itself a stack).

---

## 1. Stack Navigation

The default. Screens push on top of each other with a back button/swipe-back gesture. Think: browser history, but native.

### File structure
```
app/
  _layout.tsx        # Stack
  index.tsx           # "/"
  details.tsx         # "/details"
  [id].tsx            # "/123" dynamic route
```

### Layout
```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',   // 'default' | 'fade' | 'slide_from_bottom' | 'none'
        gestureEnabled: true,             // swipe back (iOS)
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen
        name="details"
        options={{
          title: 'Details',
          headerRight: () => <Text>Edit</Text>,
          presentation: 'modal',   // makes this screen slide up as a modal instead of pushing
        }}
      />
    </Stack>
  );
}
```

### Passing params and navigating
```tsx
import { useRouter, useLocalSearchParams } from 'expo-router';

// Navigate with params
const router = useRouter();
router.push({ pathname: '/details', params: { id: '42' } });
// or with dynamic routes:
router.push(`/user/42`);

// Read params on the receiving screen
const { id } = useLocalSearchParams<{ id: string }>();
```

### Going back
```tsx
router.back();
router.replace('/home');     // replaces current screen, no back entry left
router.dismiss();            // closes a modal presentation
router.canGoBack();          // check before calling back()
```

### Per-screen header customization (from inside the screen itself)
```tsx
import { Stack } from 'expo-router';

export default function DetailsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Product Details' }} />
      <View>{/* content */}</View>
    </>
  );
}
```

Use a stack whenever a screen is a "drill-down" from another — e.g. a list → an item's detail page.

---

## 2. Tab Navigation

Persistent tab bar at the bottom (or top), switching between top-level sections of the app. Each tab typically keeps its own state/history.

### File structure
```
app/
  (tabs)/
    _layout.tsx     # Tabs
    index.tsx        # Home tab
    search.tsx       # Search tab
    profile.tsx       # Profile tab
```
The parentheses `(tabs)` create a "group" — it organizes files without adding a `/tabs` segment to the URL.

### Layout
```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { height: 60 },
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          tabBarBadge: 3,   // small notification badge
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

### Nesting a stack inside a tab
This is extremely common: a tab shows a list, tapping an item pushes a detail screen — but the tab bar stays visible or hides depending on how you nest it.

```
app/
  (tabs)/
    _layout.tsx        # Tabs
    index.tsx           # Home list
    home/
      _layout.tsx        # Stack (nested inside the Home tab)
      [id].tsx            # detail screen, pushed within this tab
```

Each tab effectively gets its own navigation stack, so switching tabs and coming back preserves where you were.

### Hiding the tab bar on a specific screen
```tsx
<Tabs.Screen name="modal-screen" options={{ href: null }} />  // removes it from the tab bar entirely, but keeps it routable
```

Use tabs for 3–5 top-level, equally-important sections a user jumps between constantly (Home, Search, Profile, etc.) — not for occasional or drill-down navigation.

---

## 3. Drawer Navigation

A side panel that slides in (usually from the left), typically opened via a hamburger icon or edge swipe. Requires an extra package since it's not in Expo Router's core.

```bash
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install @react-navigation/drawer
```

### File structure
```
app/
  (drawer)/
    _layout.tsx     # Drawer
    index.tsx        # Home
    settings.tsx      # Settings
```

### Layout
```tsx
// app/(drawer)/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: '#2563eb',
        drawerStyle: { width: 260 },
        drawerType: 'front',        // 'front' | 'back' | 'slide' | 'permanent'
        swipeEnabled: true,
        headerShown: true,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Drawer>
  );
}
```

### Custom drawer content (profile card, logout button, etc.)
```tsx
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: '600' }}>Chidozie</Text>
      </View>
      <DrawerItemList {...props} />
      <Pressable onPress={() => {/* logout */}} style={{ padding: 16 }}>
        <Text>Log out</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

// then in the layout:
<Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
  ...
</Drawer>
```

### Opening/closing programmatically
```tsx
import { useNavigation } from 'expo-router';

const navigation = useNavigation();
navigation.openDrawer();
navigation.closeDrawer();
navigation.toggleDrawer();
```

Use a drawer for secondary/less-frequent destinations (Settings, Help, Legal, Switch Account) that don't deserve permanent tab-bar real estate — common in larger apps alongside tabs, not usually instead of them.

---

## 4. Combining All Three (typical real-app structure)

A common pattern: **Drawer** at the root for account-level nav → contains **Tabs** for the main app sections → each tab contains its own **Stack** for drill-down screens.

```
app/
  (drawer)/
    _layout.tsx                  # Drawer
    (tabs)/
      _layout.tsx                 # Tabs (nested in drawer)
      index.tsx                    # Home tab
      home/
        _layout.tsx                # Stack (nested in Home tab)
        [id].tsx
      profile.tsx
    settings.tsx                  # Drawer-only screen, no tabs
```

This nesting is exactly how apps like Gmail or most large consumer apps are structured: drawer for account switching/settings, tabs for the core sections, stacks for going deeper into any one section.

---

## 5. Quick Comparison

| | Stack | Tabs | Drawer |
|---|---|---|---|
| Use for | Drill-down flows | Top-level sections (3–5) | Secondary/occasional destinations |
| Always visible? | No — hidden behind pushed screens | Yes, persistent bar | No — hidden until opened |
| Typical trigger | Tapping a list item | Tapping a tab icon | Hamburger icon / edge swipe |
| Preserves state per screen? | Yes, per stack entry | Yes, per tab | Yes, per screen |
