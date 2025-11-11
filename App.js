import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerificationChoiceScreen from './src/screens/VerificationChoiceScreen';
import PhoneNumberScreen from './src/screens/PhoneNumberScreen';
import SmsCodeVerificationScreen from './src/screens/SmsCodeVerificationScreen';
import MainTabs from './src/navigation/MainTabs';
import { ModeProvider } from './src/context/ModeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ModeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VerificationChoice" component={VerificationChoiceScreen} />
          <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
          <Stack.Screen name="SmsCodeVerification" component={SmsCodeVerificationScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </ModeProvider>
  );
}
