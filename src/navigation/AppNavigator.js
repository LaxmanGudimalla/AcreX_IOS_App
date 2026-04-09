import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import NewUserScreen from '../screens/NewUserScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import DealerBuilderRegistrationScreen from '../screens/DealerBuilderRegistrationScreen';
import OwnerRegistration from '../screens/OwnerRegistration';
import RohiniMapScreen from '../features/RohiniMap/screens/RohiniMapScreen';
import PropertyMapScreen from '../features/PropertyMap/screens/PropertyMapScreen';
import PlotDetailsScreen from '../features/PropertyMap/screens/PlotDetailsScreen';
import PlotDealersScreen from '../features/PropertyMap/screens/PlotDealersScreen';
import ListingTypeScreen from '../screens/ListingTypeScreen';
import PlotPropertyDetailsScreen from '../screens/PlotPropertyDetailsScreen';
import BuilderFloorPropertyDetailsScreen from '../screens/BuilderFloorPropertyDetailsScreen';
import KothiPropertyDetailsScreen from '../screens/KothiPropertyDetailsScreen';
import MyListingsScreen from '../screens/MyListingsScreen';
import OwnerListingsScreen from '../screens/OwnerListingsScreen';
import OwnerApprovedListingsScreen from '../screens/OwnerApprovedListingsScreen';
import OwnerPendingListingsScreen from '../screens/OwnerPendingListingsScreen';
import OwnerRejectedListingsScreen from '../screens/OwnerRejectedListingsScreen';
import BottomTabs from "./BottomTabs";
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'true') {
        setInitialRoute('Dashboard');
      } else {
        setInitialRoute('Splash');
      }
    };

    checkLoginStatus();
  }, []);

  if (!initialRoute) return null; // you can add loading screen here

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="NewUser" component={NewUserScreen} />
        <Stack.Screen name="OtpScreen" component={OtpScreen} />
        <Stack.Screen name="Dashboard" component={BottomTabs} />
        <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
        <Stack.Screen name="DealerBuilderRegistration" component={DealerBuilderRegistrationScreen} />
        <Stack.Screen name="OwnerRegistration" component={OwnerRegistration} />
        <Stack.Screen name="RohiniMap" component={RohiniMapScreen} />
        <Stack.Screen name="PropertyMap" component={PropertyMapScreen} />
        <Stack.Screen name="PlotDealers" component={PlotDealersScreen} />
        <Stack.Screen name="PlotDetails" component={PlotDetailsScreen} />
        <Stack.Screen name="ListingType"component={ListingTypeScreen}/>
        <Stack.Screen name="PlotPropertyDetails"component={PlotPropertyDetailsScreen}/>
        <Stack.Screen name="BuilderFloorPropertyDetails"component={BuilderFloorPropertyDetailsScreen}/>
        <Stack.Screen name="KothiPropertyDetails"component={KothiPropertyDetailsScreen}/>
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="OwnerListings" component={OwnerListingsScreen} />
        <Stack.Screen name="OwnerApprovedListings" component={OwnerApprovedListingsScreen} />
        <Stack.Screen name="OwnerPendingListings" component={OwnerPendingListingsScreen} />
        <Stack.Screen name="OwnerRejectedListings" component={OwnerRejectedListingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
