import React, { useRef, useEffect, useState } from 'react';
import { View, PanResponder, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';

interface SimpleSwipeProps {
  children: React.ReactNode;
  currentTab: 'home' | 'history';
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function SimpleSwipe({ children, currentTab }: SimpleSwipeProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset animation when tab changes
  useEffect(() => {
    if (!isNavigating) {
      translateX.setValue(0);
    }
  }, [currentTab, isNavigating]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes and when not currently navigating
        return !isNavigating && 
               Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
               Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations
        translateX.stopAnimation();
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx } = gestureState;
        
        // Allow continuous movement in valid directions
        if (currentTab === 'home' && dx < 0) {
          // Swiping left from home (toward history)
          // Limit the movement to screen width
          const limitedDx = Math.max(dx, -SCREEN_WIDTH);
          translateX.setValue(limitedDx);
        } else if (currentTab === 'history' && dx > 0) {
          // Swiping right from history (toward home)
          // Limit the movement to screen width
          const limitedDx = Math.min(dx, SCREEN_WIDTH);
          translateX.setValue(limitedDx);
        } else if (Math.abs(dx) < 50) {
          // Allow small movements in wrong direction for natural feel
          translateX.setValue(dx * 0.3);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, vx } = gestureState;
        
        // Consider both distance and velocity for navigation decision
        const shouldNavigate = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5;
        
        if (shouldNavigate && !isNavigating) {
          setIsNavigating(true);
          
          if (currentTab === 'home' && dx < 0) {
            // Complete swipe to history
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              setIsNavigating(false);
              router.push('/history');
            });
          } else if (currentTab === 'history' && dx > 0) {
            // Complete swipe to home
            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 250,
              useNativeDriver: true,
            }).start(() => {
              setIsNavigating(false);
              router.push('/');
            });
          } else {
            // Snap back
            setIsNavigating(false);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 200,
              friction: 20,
            }).start();
          }
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset on termination
        if (!isNavigating) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }}>
      <Animated.View 
        style={[
          { 
            flex: 1,
            transform: [{ translateX: translateX }]
          }
        ]} 
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
      
      {/* Overlay next screen preview during swipe */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: currentTab === 'home' ? '#1e293b' : '#f8fafc',
          opacity: translateX.interpolate({
            inputRange: currentTab === 'home' ? [-SCREEN_WIDTH, 0] : [0, SCREEN_WIDTH],
            outputRange: [0.3, 0],
            extrapolate: 'clamp',
          }),
        }}
        pointerEvents="none"
      />
    </View>
  );
}