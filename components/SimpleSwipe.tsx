import React, { useRef, useEffect } from 'react';
import { View, PanResponder, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';

interface SimpleSwipeProps {
  children: React.ReactNode;
  currentTab: 'home' | 'history';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function SimpleSwipe({ children, currentTab }: SimpleSwipeProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Reset animation values when component mounts or tab changes
  useEffect(() => {
    translateX.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);
  }, [currentTab]);

  const resetAnimations = () => {
    translateX.setValue(0);
    scale.setValue(1);
    opacity.setValue(1);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
      },
      onPanResponderGrant: () => {
        // Reset any previous animations when gesture starts
        resetAnimations();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        
        // Only allow meaningful swipe directions
        if (currentTab === 'home' && dx < 0) {
          // Swiping left from home (to history)
          translateX.setValue(dx);
        } else if (currentTab === 'history' && dx > 0) {
          // Swiping right from history (to home)
          translateX.setValue(dx);
        } else {
          // Invalid swipe direction, reset
          translateX.setValue(0);
          return;
        }
        
        // Calculate progress for effects
        const progress = Math.abs(dx) / SWIPE_THRESHOLD;
        const clampedProgress = Math.min(progress, 1);
        
        // Scale effect - slightly shrink during swipe
        const scaleValue = 1 - (clampedProgress * 0.05); // Scale down by max 5%
        scale.setValue(scaleValue);
        
        // Opacity effect
        const opacityValue = 1 - (clampedProgress * 0.3); // Fade by max 30%
        opacity.setValue(opacityValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const shouldNavigate = Math.abs(dx) > SWIPE_THRESHOLD;
        
        if (shouldNavigate) {
          // Complete navigation immediately and reset
          if (currentTab === 'home' && dx < -SWIPE_THRESHOLD) {
            resetAnimations();
            router.push('/history');
          } else if (currentTab === 'history' && dx > SWIPE_THRESHOLD) {
            resetAnimations();
            router.push('/');
          }
        } else {
          // Snap back to original position with bounce
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 200,
              friction: 7,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 200,
              friction: 7,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
              tension: 200,
              friction: 7,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset if gesture is terminated
        resetAnimations();
      },
    })
  ).current;

  return (
    <Animated.View 
      style={[
        { flex: 1 },
        {
          transform: [
            { translateX: translateX },
            { scale: scale }
          ],
          opacity: opacity,
        }
      ]} 
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}