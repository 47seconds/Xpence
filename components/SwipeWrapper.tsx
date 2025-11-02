import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { router } from 'expo-router';

interface SwipeWrapperProps {
  children: React.ReactNode;
  currentTab: 'home' | 'history';
}

export default function SwipeWrapper({ children, currentTab }: SwipeWrapperProps) {
  const onSwipeGesture = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END) {
      const swipeThreshold = 100; // Minimum distance to trigger swipe
      
      if (translationX > swipeThreshold && currentTab === 'history') {
        // Swipe right from history - go to home
        router.push('/');
      } else if (translationX < -swipeThreshold && currentTab === 'home') {
        // Swipe left from home - go to history
        router.push('/history');
      }
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onSwipeGesture} onHandlerStateChange={onSwipeGesture}>
      <View style={styles.container}>
        {children}
      </View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});