import React, {useCallback, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import {
  BackHandler,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { getUnreadCount } from '../services/api';

import PropertyMap from '../features/PropertyMap/screens/PropertyMapScreen';

export default function DashboardScreen({navigation, route}) {
const tabBarHeight = useBottomTabBarHeight();
  const lastBackPress = useRef(0);

  const [userRole, setUserRole] = useState(null);
  const isGuest = !userRole || userRole === 'Guest';
  const isRegisteredRole = userRole === 'Dealer' || userRole === 'Owner';
  const [selectedType, setSelectedType] = useState(null);
  const [stats, setStats] = useState({
  totalPlots: 0,
  builderFloors: 0,
  kothis: 0,
  plotsOnly: 0,
});
const [notificationCount, setNotificationCount] = useState(3); // dummy for now

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      console.log('Dashboard role:', role);
      setUserRole(role);
    };

    checkRole();
    fetchNotificationCount(); // 👈 ADD THIS LINE
  }, []);

  useEffect(() => {
  if (route.params?.resetNotifications) {
    setNotificationCount(0);
  }
}, [route.params?.resetNotifications]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') {
        return undefined;
      }


      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPress.current < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPress.current = now;
        ToastAndroid.show('Tap again to exit.', ToastAndroid.SHORT);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

// 3️⃣ ✅ CORRECT
useFocusEffect(
  useCallback(() => {
    fetchNotificationCount();
  }, [])
);


  const fetchNotificationCount = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");

    if (!userData) return;

    const user = JSON.parse(userData);

    const response = await getUnreadCount(user.user_id);

    setNotificationCount(response.data.unread_count);

  } catch (error) {
    console.log("Error fetching notification count:", error);
  }
};

  const overviewCards = [
    {
      key: 'plots',
      label: 'Plots',
      value: stats.totalPlots,
      icon: 'map-outline',
      accent:'#7C3AED',
      onPress: () => setSelectedType('plot'),
    },
    {
      key: 'dealers',
      label: 'Property Dealers',
      value: 342,
      icon: 'people-outline',
      accent: '#0F766E',
    },
    {
      key: 'builderFloors',
      label: 'Builder Floors',
      value: stats.builderFloors,
      icon: 'business-outline',
      accent: '#2563EB',
     
      onPress: () => setSelectedType('builder_floor'),
    },
    {
      key: 'kothis',
      label: 'Kothis',
      value: stats.kothis,
      icon: 'home-outline',
      accent:'#D97706' ,
    
      onPress: () => setSelectedType('kothi'),
    },
  ];


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: tabBarHeight + 36},
        ]}>
<Header 
  title="Dashboard"
  onNotificationPress={() => navigation.navigate('Notifications')}
  notificationCount={notificationCount}
/>
        {/* REGISTER OPTIONS */}
        {/* {!isRegisteredRole && (
          <View style={styles.registerContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.registerCard, styles.dealerCard]}
              onPress={() => navigation.navigate('DealerBuilderRegistration')}>
              <View style={styles.registerContent}>
                <View style={styles.registerIconWrap}>
                  <Icon name="briefcase-outline" size={20} color="#2563EB" />
                </View>
                <View style={styles.registerTextWrap}>
                  <Text style={styles.registerTitle}>Be a Dealer</Text>
                  <Text style={styles.registerSubtitle}>
                    Manage property leads
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.registerCard, styles.ownerCard]}
              onPress={() => navigation.navigate('OwnerRegistration')}>
              <View style={styles.registerContent}>
                <View style={styles.registerIconWrap}>
                  <Icon name="home-outline" size={20} color="#0F766E" />
                </View>
                <View style={styles.registerTextWrap}>
                  <Text style={styles.registerTitle}>Be an Owner</Text>
                  <Text style={styles.registerSubtitle}>
                    Post your property fast
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )} */}

        {/* MAP */}
        <View style={styles.mapContainer}>
          <PropertyMap
            navigation={navigation}
            selectedType={selectedType}
            isGuest={isGuest}   // 👈 ADD THIS
            onStatsChange={data => {
              setStats({
                totalPlots: data.totalPlots || 0,
                builderFloors: data.builderFloors || 0,
                kothis: data.kothis || 0,
                plotsOnly: data.plotsOnly || 0,
              });
            }}
          />
        </View>

        {/* MARKET OVERVIEW */}
        <View style={styles.marketContainer}>
          <View style={styles.marketHeader}>
            <View>
              <Text style={styles.marketTitle}>Market Overview</Text>
              <Text style={styles.marketSubtitle}>
                Real-time property statistics
              </Text>
            </View>

            <TouchableOpacity
              style={styles.seeAllBtn}
              onPress={() => setSelectedType(null)}>
              <Text style={styles.seeAllText}>All Properties</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {overviewCards.map(card => {
              const CardWrapper = card.onPress ? TouchableOpacity : View;

              return (
                <CardWrapper
                  key={card.key}
 style={[
  styles.card,
  {borderTopColor: card.accent},
 (selectedType === 'plot' && card.key === 'plots') ||
(selectedType === 'builder_floor' && card.key === 'builderFloors') ||
(selectedType === 'kothi' && card.key === 'kothis')
  ? styles.activeCard
  : null
]}
                  {...(card.onPress ? {onPress: card.onPress, activeOpacity: 1} : {})}>
                 <View style={styles.valueRow}>
  <Text style={styles.value}>{card.value}</Text>

  <View
    style={[
      styles.iconWrap,
      {backgroundColor: `${card.accent}15`},
    ]}>
    <Icon name={card.icon} size={28} color={card.accent} />
  </View>
</View>

<Text style={styles.label}>{card.label}</Text>
                </CardWrapper>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8FC',
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F2F8FC',
  },

  mapContainer: {
    height: 560,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  marketContainer: {
    backgroundColor: '#F2F8FC',
    padding: 18,
  },

  marketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  marketSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    marginBottom: 15,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
    borderTopWidth: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 10,
  },

  registerCard: {
    width: '48%',
    minHeight: 76,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  dealerCard: {
    backgroundColor: '#EEF4FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  ownerCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },

  registerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  registerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  registerTextWrap: {
    flex: 1,
    marginLeft: 8,
  },

  registerTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },

  registerSubtitle: {
    color: '#475569',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },

  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  label: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
    fontWeight: '600',
  },

  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  seeAllBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  seeAllText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
activeCard: {
  borderWidth: 2,
  borderColor: '#2563EB',
  transform: [{scale: 1.03}],
},
  valueRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});
