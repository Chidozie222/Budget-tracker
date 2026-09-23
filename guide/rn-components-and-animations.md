# React Native Core Components & Animations — Deep Dive

## 1. `View`

The basic container — equivalent to a `<div>`. No visual behavior of its own beyond layout and styling.

Key props:
```tsx
<View
  style={{ flex: 1, backgroundColor: '#fff' }}
  pointerEvents="auto"        // 'auto' | 'none' | 'box-none' | 'box-only' — controls touch passthrough
  onLayout={(e) => {          // fires once layout is calculated
    const { x, y, width, height } = e.nativeEvent.layout;
  }}
  accessible={true}           // marks as a single accessible element
  accessibilityLabel="Card"   // screen reader text
  testID="my-view"            // for testing (Jest/Detox)
/>
```

`onLayout` is important — it's how you measure a component's rendered size/position at runtime (there's no `getBoundingClientRect` on native).

---

## 2. `Text`

All text must live inside a `<Text>`. Text styles inherit only from parent `<Text>` components (not from `<View>`).

```tsx
<Text
  style={{ fontSize: 16, fontWeight: '600', color: '#111' }}
  numberOfLines={2}                 // truncates + adds ellipsis after N lines
  ellipsizeMode="tail"              // 'head' | 'middle' | 'tail' | 'clip'
  selectable={true}                 // allow copy/select
  onPress={() => {}}                // Text itself can be pressable
  adjustsFontSizeToFit               // iOS: shrink font to fit numberOfLines
  minimumFontScale={0.8}
  suppressHighlighting                // iOS: disable press highlight
>
  Hello <Text style={{ fontWeight: 'bold' }}>world</Text>
</Text>
```

Nesting `<Text>` inside `<Text>` is the standard way to apply mixed styling within one paragraph (like `<span>` inside `<p>`).

---

## 3. `TextInput`

This one has the most configuration of any core component, since it has to replicate every native keyboard behavior.

```tsx
<TextInput
  value={text}
  onChangeText={setText}
  placeholder="Enter email"
  placeholderTextColor="#999"

  // Keyboard behavior
  keyboardType="email-address"   // 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'decimal-pad' | 'url'
  autoCapitalize="none"          // 'none' | 'sentences' | 'words' | 'characters'
  autoCorrect={false}
  autoComplete="email"           // hints for autofill
  returnKeyType="done"           // 'done' | 'go' | 'next' | 'search' | 'send'
  onSubmitEditing={() => {}}     // fires on return key
  blurOnSubmit={true}

  // Security
  secureTextEntry={true}         // password masking
  textContentType="password"     // iOS autofill hint: 'emailAddress' | 'password' | 'oneTimeCode' etc.

  // Multiline
  multiline={true}
  numberOfLines={4}
  textAlignVertical="top"        // Android only, aligns text to top in multiline

  // Limits & formatting
  maxLength={100}

  // Focus control
  autoFocus={false}
  editable={true}
  onFocus={() => {}}
  onBlur={() => {}}

  // Refs (for imperative focus)
  ref={inputRef}
/>
```

Imperative focus (common for "focus next field" UX):
```tsx
const inputRef = useRef<TextInput>(null);
inputRef.current?.focus();
inputRef.current?.blur();
inputRef.current?.clear();
```

Controlled vs. uncontrolled: almost always use controlled (`value` + `onChangeText`) so React state is the source of truth — same pattern as web forms.

---

## 4. `Image`

```tsx
<Image
  source={{ uri: 'https://example.com/photo.jpg' }}   // remote
  // source={require('./assets/photo.png')}            // local (bundled)
  style={{ width: 100, height: 100, borderRadius: 8 }}
  resizeMode="cover"        // 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
  onLoad={() => {}}
  onError={(e) => console.log(e.nativeEvent.error)}
  defaultSource={require('./placeholder.png')}   // iOS: shown while loading
  blurRadius={2}
/>
```

Note: unlike `<img>` on the web, `Image` does **not** auto-size to its content — you must give it explicit `width`/`height` (or use `aspectRatio` in style). For heavier image work (caching, progressive loading), teams typically swap in `expo-image`, which is a drop-in upgrade with a nearly identical API.

---

## 5. `ScrollView` vs `FlatList`

**`ScrollView`** renders all children immediately — fine for short, fixed content.
```tsx
<ScrollView
  horizontal={false}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ padding: 16 }}   // style for the inner content, not the scroll box
  refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
  keyboardShouldPersistTaps="handled"        // lets taps through while keyboard is open
  onScroll={(e) => {}}
  scrollEventThrottle={16}
>
  {children}
</ScrollView>
```

**`FlatList`** renders lazily (virtualized) — use for any list that could grow long.
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => <ItemCard item={item} />}
  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
  ListHeaderComponent={<Header />}
  ListFooterComponent={<Footer />}
  ListEmptyComponent={<Text>No items</Text>}
  onEndReached={loadMore}          // infinite scroll
  onEndReachedThreshold={0.5}
  refreshing={loading}
  onRefresh={onRefresh}
  numColumns={2}                   // grid layout
  horizontal={false}
  getItemLayout={(data, index) => ( // skips measurement — big perf win for fixed-height rows
    { length: 80, offset: 80 * index, index }
  )}
/>
```

---

## 6. Touch / Press Components

```tsx
<Pressable
  onPress={() => {}}
  onLongPress={() => {}}
  onPressIn={() => {}}
  onPressOut={() => {}}
  delayLongPress={500}
  disabled={false}
  hitSlop={10}                     // expands touchable area beyond visual bounds
  style={({ pressed }) => [         // style can be a function of press state
    { opacity: pressed ? 0.6 : 1 },
  ]}
>
  <Text>Tap</Text>
</Pressable>
```

`Pressable` is the modern, flexible replacement for `TouchableOpacity` / `TouchableHighlight` / `TouchableWithoutFeedback` — prefer it for new code.

---

## 7. `Switch` and `Modal` (common utility components)

```tsx
<Switch
  value={enabled}
  onValueChange={setEnabled}
  trackColor={{ false: '#ccc', true: '#2563eb' }}
  thumbColor="#fff"
/>

<Modal
  visible={showModal}
  animationType="slide"     // 'none' | 'slide' | 'fade'
  transparent={true}
  onRequestClose={() => setShowModal(false)}   // Android back button
  presentationStyle="pageSheet"                 // iOS: 'fullScreen' | 'pageSheet' | 'formSheet'
>
  <View style={{ flex: 1, justifyContent: 'center' }}>
    <Text>Modal content</Text>
  </View>
</Modal>
```

---

## 8. Animations

There are two systems in common use: the built-in **Animated** API, and **Reanimated** (the modern standard, better performance because it runs on the UI thread instead of bridging to JS every frame). Expo supports both out of the box.

### 8a. Built-in `Animated` API

Good for simple, one-off animations without adding a dependency.

```tsx
import { Animated, Pressable } from 'react-native';
import { useRef } from 'react';

function FadeInBox() {
  const opacity = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,   // runs on native thread — always set true when possible
    }).start();
  };

  return (
    <Animated.View style={{ opacity }}>
      <Pressable onPress={fadeIn}>
        <Text>Fade me in</Text>
      </Pressable>
    </Animated.View>
  );
}
```

Common animation types:
```tsx
Animated.timing(value, { toValue: 1, duration: 300, easing: Easing.ease, useNativeDriver: true }).start();
Animated.spring(value, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
Animated.sequence([anim1, anim2]).start();      // one after another
Animated.parallel([anim1, anim2]).start();      // simultaneously
Animated.loop(anim, { iterations: -1 }).start(); // infinite loop
```

Interpolating a value into another range (e.g. driving both scale and rotation from one progress value):
```tsx
const rotate = value.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});
<Animated.View style={{ transform: [{ rotate }] }} />
```

Any style-driven component you animate must be wrapped as `Animated.View`, `Animated.Text`, `Animated.Image`, or created via `Animated.createAnimatedComponent(YourComponent)`.

### 8b. Reanimated (recommended for anything beyond simple fades)

```bash
npx expo install react-native-reanimated
```

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

function ScaleBox() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={() => (scale.value = withSpring(scale.value === 1 ? 1.2 : 1))}>
      <Animated.View style={[{ width: 100, height: 100, backgroundColor: '#2563eb' }, animatedStyle]} />
    </Pressable>
  );
}
```

Why Reanimated over `Animated`: the logic runs on the UI thread, so animations stay smooth even if the JS thread is busy (e.g. during a network call or heavy re-render). It also pairs with `react-native-gesture-handler` for drag/swipe/pinch interactions driven directly by touch, which the built-in `Animated` API can't do well.

### 8c. `LayoutAnimation` (quick wins for layout changes)

For animating layout changes (item added/removed from a list, height changes) without manually tracking values:

```tsx
import { LayoutAnimation, UIManager, Platform } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// before you change state that affects layout:
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
setItems([...items, newItem]);
```

This is the lowest-effort animation option — one line before a state update, and the layout transition (position/size changes) is animated automatically.

---

## 9. Which Animation Tool for Which Job

| Need | Tool |
|---|---|
| Simple fade/slide on mount or press | `Animated` |
| Smooth animation while JS thread is busy | `Reanimated` |
| Drag, swipe, pinch gestures | `Reanimated` + `react-native-gesture-handler` |
| List item add/remove/reorder transitions | `LayoutAnimation` |
| Screen transitions | Handled by Expo Router / React Navigation automatically |
