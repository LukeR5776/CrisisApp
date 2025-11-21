/**
 * Points Toast Component
 * Animated notification showing points earned
 */

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface PointsToastProps {
  points: number;
  visible: boolean;
  onComplete?: () => void;
}

export function PointsToast({ points, visible, onComplete }: PointsToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.5);
      translateYAnim.setValue(0);

      // Animate in and out
      Animated.sequence([
        // Fade in and scale up
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ]),
        // Hold
        Animated.delay(800),
        // Float up and fade out
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: -50,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [visible, points]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        <Text style={styles.pointsText}>+{points}</Text>
        <Text style={styles.label}>points</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
});
