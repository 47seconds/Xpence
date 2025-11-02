import * as React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25; // 25% of screen width

interface SwipeWrapperProps {
  children: React.ReactNode;
  currentTab: 'home' | 'history';
}

export default function SwipeWrapper({ children, currentTab }: SwipeWrapperProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const navigateToTab = (tab: string) => {
    if (tab === 'home') {
      router.push('/');
    } else {
      router.push('/history');
    }
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      // Only allow meaningful swipe directions
      if (currentTab === 'home' && translationX < 0) {
        // Swiping left from home (to history)
        translateX.value = translationX;
      } else if (currentTab === 'history' && translationX > 0) {
        // Swiping right from history (to home)
        translateX.value = translationX;
      }
      
      // Calculate progress for various effects
      const progress = Math.abs(translateX.value) / SWIPE_THRESHOLD;
      const clampedProgress = Math.min(progress, 1);
      
      // Scale effect - slightly shrink during swipe
      scale.value = interpolate(
        clampedProgress,
        [0, 0.5, 1],
        [1, 0.98, 0.95],
        Extrapolate.CLAMP
      );
      
      // Opacity effect
      opacity.value = interpolate(
        clampedProgress,
        [0, 0.5, 1],
        [1, 0.9, 0.7],
        Extrapolate.CLAMP
      );
    } else if (state === State.END) {
      const shouldNavigate = Math.abs(translateX.value) > SWIPE_THRESHOLD;
      
      if (shouldNavigate) {
        // Complete the transition with spring animation
        const targetTranslateX = currentTab === 'home' ? -SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.3;
        
        translateX.value = withSpring(targetTranslateX, {
          damping: 20,
          stiffness: 90,
        });
        
        scale.value = withSpring(0.9, {
          damping: 20,
          stiffness: 90,
        });
        
        opacity.value = withSpring(0.5, {
          damping: 20,
          stiffness: 90,
        });
        
        // Navigate with slight delay for smooth transition
        setTimeout(() => {
          if (currentTab === 'home' && translationX < -SWIPE_THRESHOLD) {
            runOnJS(navigateToTab)('history');
          } else if (currentTab === 'history' && translationX > SWIPE_THRESHOLD) {
            runOnJS(navigateToTab)('home');
          }
        }, 100);
      } else {
        // Snap back to original position with bounce
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
        
        scale.value = withSpring(1, {
          damping: 20,
          stiffness: 200,
        });
        
        opacity.value = withSpring(1, {
          damping: 20,
          stiffness: 200,
        });
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});