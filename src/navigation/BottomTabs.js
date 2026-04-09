import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({iconName, color, label, focused, isPrimaryAction}) {
  if (isPrimaryAction) {
    return (
      <View style={styles.primaryActionWrap}>
        <View style={styles.primaryActionButton}>
          <Ionicons name={iconName} size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.primaryActionLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconShell, focused && styles.iconShellActive]}>
        <Ionicons name={iconName} size={22} color={color} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function BottomTabs({navigation}) {
  const handleAddProperty = async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const role = await AsyncStorage.getItem('userRole');
    const canAddProperty = role === 'Dealer' || role === 'Owner';

    if (isLoggedIn !== 'true') {
      navigation.navigate('CreateAccount');
    } else if (!canAddProperty) {
      navigation.navigate('CreateAccount');
    } else {
      navigation.navigate('ListingType', {role});
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#123247',
        tabBarInactiveTintColor: '#6F8596',
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              iconName={focused ? 'home' : 'home-outline'}
              color={color}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="AddProperty"
        component={DashboardScreen}
        options={{
          tabBarIcon: () => (
            <TabIcon iconName="add" label="Add Property" isPrimaryAction />
          ),
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            handleAddProperty();
          },
        }}
      />

      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              iconName={focused ? 'person' : 'person-outline'}
              color={color}
              label="Account"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 60,
    paddingTop: 1,
    paddingHorizontal: 12,
    borderTopWidth: 0,
    backgroundColor: '#F8FBFD',
    shadowColor: '#123247',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 12,
  },

  tabBarItem: {
    paddingVertical: 0,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconShell: {
    width: 38,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  iconShellActive: {
    backgroundColor: '#DCEAF3',
  },

  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#6F8596',
  },

  tabLabelActive: {
    color: '#123247',
  },

  primaryActionWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },

  primaryActionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F766E',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 5,
    borderColor: '#F8FBFD',
  },

  primaryActionLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});
