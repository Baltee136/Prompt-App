import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import FeedScreen from './src/screens/FeedScreen';
import PromptDetailScreen from './src/screens/PromptDetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import SavedScreen from './src/screens/SavedScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Feed"
          screenOptions={{
            headerStyle: { backgroundColor: '#0F0F14' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: '#0F0F14' },
          }}
        >
          <Stack.Screen
            name="Feed"
            component={FeedScreen}
            options={{ title: 'Viral Prompts' }}
          />
          <Stack.Screen
            name="PromptDetail"
            component={PromptDetailScreen}
            options={{ title: 'Prompt' }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ title: 'Search' }}
          />
          <Stack.Screen
            name="Saved"
            component={SavedScreen}
            options={{ title: 'Saved' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
