import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Home, History } from 'lucide-react-native';
import { ThemeContext } from '@/hooks/useTheme';

export default function TabLayout() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: isDarkTheme ? '#60a5fa' : '#3b82f6',
          tabBarInactiveTintColor: isDarkTheme ? '#6b7280' : '#9ca3af',
          tabBarStyle: {
            backgroundColor: isDarkTheme ? '#1e293b' : '#ffffff',
            borderTopColor: isDarkTheme ? '#334155' : '#e5e7eb',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ThemeContext.Provider>
  );
}
