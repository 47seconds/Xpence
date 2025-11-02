import { createContext, useContext } from 'react';

interface SwipeGestureContextType {
  navigateToHistory: () => void;
  navigateToHome: () => void;
}

export const SwipeGestureContext = createContext<SwipeGestureContextType>({
  navigateToHistory: () => {},
  navigateToHome: () => {},
});

export const useSwipeGesture = () => {
  const context = useContext(SwipeGestureContext);
  if (!context) {
    throw new Error('useSwipeGesture must be used within a SwipeGestureProvider');
  }
  return context;
};