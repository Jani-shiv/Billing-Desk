/**
 * Budget Tracker Mobile App
 * Main App Component
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar, View, Text } from 'react-native';

// Import store configuration
import { store, persistor } from './src/store/store';
import { theme } from './src/config/theme';

// Simple splash screen component
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6366f1' }}>
    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Budget Tracker</Text>
  </View>
);

// Main navigation component (simplified for now)
const MainApp = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#6366f1' }}>
        🎉 Budget Tracker Mobile
      </Text>
      <Text style={{ fontSize: 16, marginTop: 20, textAlign: 'center', paddingHorizontal: 40 }}>
        Your mobile app is ready! Connect to your Django API at http://127.0.0.1:8001/mobile/
      </Text>
    </View>
  );
};

const App = () => {
  useEffect(() => {
    console.log('Budget Tracker Mobile App Started');
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar 
              barStyle="light-content" 
              backgroundColor={theme.colors.primary} 
            />
            <MainApp />
          </NavigationContainer>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
