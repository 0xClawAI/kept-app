import React from 'react';
import { Text, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataProvider } from './src/context/DataContext';
import { Colors, Spacing } from './src/utils/colors';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import LogScreen from './src/screens/LogScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

// Clean text-based icons instead of emojis — more premium feel
const TAB_ICONS = {
  Home:       { active: '◉', inactive: '○' },
  Calendar:   { active: '▦', inactive: '▤' },
  Challenges: { active: '⬡', inactive: '⬡' },
  Log:        { active: '≡', inactive: '≡' },
  Settings:   { active: '◎', inactive: '◎' },
};

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
                paddingTop: Spacing.sm,
              },
              tabBarActiveTintColor: Colors.primary,
              tabBarInactiveTintColor: Colors.textDisabled,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 0.3,
                marginTop: 2,
              },
              tabBarIcon: ({ focused }) => {
                const icon = TAB_ICONS[route.name];
                return (
                  <View style={{
                    width: 44,
                    height: 28,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      fontSize: 20,
                      color: focused ? Colors.primary : Colors.textDisabled,
                      fontWeight: focused ? '700' : '400',
                    }}>
                      {focused ? icon.active : icon.inactive}
                    </Text>
                  </View>
                );
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Challenges" component={ChallengesScreen} />
            <Tab.Screen name="Log" component={LogScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}
