import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 30;
const COLORS = ['#4ADE80', '#818CF8', '#FBBF24', '#F97316', '#EF4444', '#22D3EE', '#A78BFA'];

function ConfettiPiece({ delay, startX }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 200;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_HEIGHT + 50, duration: 2500 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: drift, duration: 2500 + Math.random() * 1000, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(1800),
          Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = 6 + Math.random() * 8;

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: startX,
          width: size,
          height: size * (0.6 + Math.random() * 0.8),
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
          transform: [
            { translateY },
            { translateX },
            { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + Math.random() * 720}deg`] }) },
          ],
          opacity,
        },
      ]}
    />
  );
}

export default function Confetti({ trigger }) {
  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: CONFETTI_COUNT }, (_, i) => (
        <ConfettiPiece
          key={i}
          delay={i * 50}
          startX={Math.random() * SCREEN_WIDTH}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  piece: { position: 'absolute', top: -10 },
});
