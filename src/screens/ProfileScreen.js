import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userData, setUserData] = useState(null);
  const [storedPhone, setStoredPhone] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [storedRole, setStoredRole] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('isLoggedIn');
        const storedUser = await AsyncStorage.getItem('userData');
        const savedPhone = await AsyncStorage.getItem('phone');
        const savedEmail = await AsyncStorage.getItem('userEmail');
        const role = await AsyncStorage.getItem('userRole');
 console.log("Stored User Data:", storedUser);
    console.log("Parsed User Data:", storedUser ? JSON.parse(storedUser) : null);

        setIsLoggedIn(loginStatus);
        setUserData(storedUser ? JSON.parse(storedUser) : null);
        setStoredPhone(savedPhone || '');
        setStoredEmail(savedEmail || '');
        setStoredRole(role || '');
      } catch (error) {
        setUserData(null);
        setStoredPhone('');
        setStoredEmail('');
        setStoredRole('');
      }
    };

    loadProfile();

    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation]);

  const resolvedEmail =
    userData?.email ||
    userData?.emailAddress ||
    userData?.email_address ||
    userData?.mail ||
    userData?.ownerEmail ||
    userData?.dealerEmail ||
    storedEmail ||
    'Not available';
  const normalizedRole = (userData?.role || storedRole || '').toLowerCase();
  const isOwner = normalizedRole === 'owner';
  const isDealer = normalizedRole === 'dealer';
  const profileItems = [
    {
      label: 'Name',
      value:
        userData?.name ||
        userData?.fullName ||
        userData?.username ||
        userData?.ownerName ||
        'Not available',
    },
    {
      label: 'Phone',
      value: userData?.phone || userData?.mobile || storedPhone || 'Not available',
    },
    {
      label: 'Email',
      value: resolvedEmail,
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('isLoggedIn');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('userRole');
            await AsyncStorage.removeItem('phone');
            await AsyncStorage.removeItem('userEmail');

            setIsLoggedIn(null);
            setUserData(null);
            setStoredPhone('');
            setStoredEmail('');

            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
     <View style={styles.heroCard}>

  <View style={styles.topRow}>

    <View style={styles.avatarCircle}>
      <Text style={styles.avatarText}>
        {(profileItems[0]?.value || 'U').slice(0, 1).toUpperCase()}
      </Text>
    </View>

    <View style={styles.roleBadge}>
      <Text style={styles.roleText}>
        {userData?.role || 'Guest'}
      </Text>
    </View>

  </View>

  <Text style={styles.title}>
    {profileItems[0]?.value || 'My Profile'}
  </Text>

  <Text style={styles.subtitle}>
    Your account details and access settings
  </Text>

</View>

      {isLoggedIn === 'true' && (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <Text style={styles.sectionCaption}>Saved details for the current login</Text>
            </View>

            {profileItems.map((item) => (
              <View key={item.label} style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <Text style={styles.infoBadgeText}>{item.label}</Text>
                </View>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}

            {(isOwner || isDealer) && (
              <TouchableOpacity
                style={styles.listingsBtn}
                onPress={() => navigation.navigate('MyListings')}>
                <Text style={styles.listingsText}>My Listings</Text>
              </TouchableOpacity>
            )}

            {isOwner && (
              <TouchableOpacity
                style={styles.listingsBtn}
                onPress={() => navigation.navigate('OwnerListings')}>
                <Text style={styles.listingsText}>Listing Requests</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 120,
    backgroundColor: '#EEF3F8',
  },
  heroCard: {
    backgroundColor: '#123458',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    marginBottom: 18,
    shadowColor: '#123458',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D4E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#123458',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.72)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#102A43',
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7A90',
  },
  infoRow: {
    marginTop: 12,
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7EEF7',
  },
  infoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCEBFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#215A9C',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#102A43',
  },
  logoutBtn: {
    marginTop: 14,
    backgroundColor: '#C0392B',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 150,
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  listingsBtn: {
    marginTop: 12,
    backgroundColor: '#123458',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  listingsText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  nameRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

roleBadge: {
  backgroundColor: '#D4E7FF',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
},

roleText: {
  fontSize: 12,
  fontWeight: '700',
  color: '#123458',
},
topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
});
