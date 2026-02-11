import React from 'react';
import { Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './src/context/DataContext';
import { Colors } from './src/utils/colors';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import LogScreen from './src/screens/LogScreen';

const Tab = createBottomTabNavigator();

const ICONS = { Home: '🏠', Calendar: '📅', Challenges: '🏆', Log: '📝' };

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: Colors.primary,
              background: Colors.background,
              card: Colors.surface,
              text: Colors.textPrimary,
              border: Colors.border,
              notification: Colors.primary,
            },
          }}
        >
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: Colors.surface,
                borderTopColor: Colors.border,
                borderTopWidth: 1,
                height: 88,
                paddingBottom: 28,
                paddingTop: 10,
              },
              tabBarActiveTintColor: Colors.primary,
              tabBarInactiveTintColor: Colors.textDisabled,
              tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
                  {ICONS[route.name]}
                </Text>
              ),
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Challenges" component={ChallengesScreen} />
            <Tab.Screen name="Log" component={LogScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}
