import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import SecurityScreen from '../screens/SecurityScreen';
import GeneratorScreen from '../screens/GeneratorScreen'; // ✅ Correcto
import AccountsScreen from '../screens/AccountsScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { useMode } from '../context/ModeContext';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { isRealMode } = useMode();

  const withBanner = (Component) => (props) => (
    <View style={{ flex: 1 }}>
      {isRealMode && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🛡️ Estás en el MODO REAL</Text>
        </View>
      )}
      <Component {...props} />
    </View>
  );

  return (
    <Tab.Navigator
      initialRouteName="Direcciónes"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Direcciónes': iconName = 'shield-checkmark'; break;
            case 'Generador de contraseñas': iconName = 'key'; break;
            case 'Cuentas': iconName = 'mail'; break;
            case 'Tarjetas bancarias': iconName = 'card'; break;
            case 'Ajustes': iconName = 'settings'; break;
            default: iconName = 'help';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: true,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Direcciónes" component={withBanner(SecurityScreen)} />
      <Tab.Screen name="Generador de contraseñas" component={withBanner(GeneratorScreen)} />
      <Tab.Screen name="Cuentas" component={withBanner(AccountsScreen)} />
      <Tab.Screen name="Tarjetas bancarias" component={withBanner(PaymentsScreen)} />
      <Tab.Screen name="Ajustes" component={withBanner(SettingsScreen)} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#d4edda',
    padding: 10,
    alignItems: 'center',
  },
  bannerText: {
    color: '#155724',
    fontWeight: 'bold',
  },
});
