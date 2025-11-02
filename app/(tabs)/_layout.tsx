import { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, History } from 'lucide-react-native';
import { ThemeContext } from '@/hooks/useTheme';
import { storage } from '@/lib/storage';

export default function TabLayout() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    // Load saved theme preference on app start
    const loadTheme = async () => {
      const savedTheme = await storage.getThemePreference();
      setIsDarkTheme(savedTheme);
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    // Save theme preference
    await storage.setThemePreference(newTheme);
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
