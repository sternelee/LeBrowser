import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const TypingIndicator = () => {
  const y = new Animated.Value(0);

  Animated.loop(
    Animated.sequence([
      Animated.timing(y, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ])
  ).start();

  const translateY = y.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ translateY }] }]} />
      <Animated.View
        style={[
          styles.dot,
          { transform: [{ translateY }], marginHorizontal: 8 },
        ]}
      />
      <Animated.View style={[styles.dot, { transform: [{ translateY }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c9d1d9',
  },
});

export default TypingIndicator;
