import React, { useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { loginWithPassword } from '../services/api';
import { requestUserPermission, getFCMToken } from '../services/firebaseService';
import { saveFcmToken } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();

    if (trimmedPhone.length !== 10 || !password.trim()) {
      Alert.alert('Error', 'Enter mobile number and password');
      return;
    }

    try {
      setLoading(true);
      const response = await loginWithPassword(trimmedPhone, password.trim());
      const user = response?.data?.user;

      // ✅ ADD THIS BLOCK HERE

      // 🔥 Request permission
await requestUserPermission();
// 🔥 Get FCM token
const token = await getFCMToken();
console.log("TOKEN VALUE:", token);

// 🔥 Send token to backend
if (token) {
  try {
    await saveFcmToken({
  token: token,
  user_id: user.user_id
});
    console.log("✅ FCM token saved to backend");
  } catch (err) {
    console.log("❌ Error saving token:", err);
  }
}

      const resolvedEmail =
        user?.email ||
        user?.emailAddress ||
        user?.email_address ||
        user?.mail ||
        user?.ownerEmail ||
        user?.dealerEmail;
      const existingUserData = await AsyncStorage.getItem('userData');
      const parsedExistingUser = existingUserData ? JSON.parse(existingUserData) : {};
      const mergedUser = user ? { ...parsedExistingUser, ...user } : parsedExistingUser;

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('phone', trimmedPhone);
      if (user?.role) {
        await AsyncStorage.setItem('userRole', user.role);
      } else {
        await AsyncStorage.removeItem('userRole');
      }
      if (mergedUser && Object.keys(mergedUser).length > 0) {
        await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
      }
      if (resolvedEmail || parsedExistingUser?.email) {
        await AsyncStorage.setItem(
          'userEmail',
          resolvedEmail || parsedExistingUser.email,
        );
      }

      navigation.reset({
        index: 0,
        routes: [{name: 'Dashboard'}],
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Invalid mobile or password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Login</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.heroCard}>
              <View style={styles.heroIconWrap}>
                <Icon name="shield-checkmark-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroEyebrow}>Secure Access</Text>
              <Text style={styles.title}>Welcome back to AcreX</Text>
              <Text style={styles.heroText}>
                Sign in with your registered mobile number and password to
                continue to your property dashboard.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Mobile Number *</Text>
                <View style={styles.inputWrap}>
                  <Icon name="call-outline" size={18} color="#64748B" />
                  <Text style={styles.prefixText}>+91</Text>
                  <TextInput
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#99A2B3"
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.inputWrap}>
                  <Icon name="lock-closed-outline" size={18} color="#64748B" />
                  <TextInput
                    placeholder="Enter password"
                    placeholderTextColor="#99A2B3"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(current => !current)}
                    activeOpacity={0.8}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                activeOpacity={0.9}
                onPress={handleLogin}
                disabled={loading}
              >
                <View style={styles.buttonIconWrap}>
                  <Icon name="log-in-outline" size={16} color="#0F766E" />
                </View>
                <View style={styles.buttonTextWrap}>
                  <Text style={styles.buttonText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Text>
                  <Text style={styles.buttonSubtext}>Access your dashboard</Text>
                </View>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.termsText}>
                By continuing, you agree to AcreX&apos;s Terms of Service and
                Privacy Policy.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('NewUser')}
            >
              <Text style={styles.secondaryButtonText}>New User</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 3,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#99F6E4',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  heroText: {
    marginTop: 10,
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    color: '#334155',
  },
  inputWrap: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D7E0EA',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefixText: {
    marginLeft: 10,
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 52,
    marginLeft: 10,
    color: '#1A1F2B',
    fontSize: 14,
  },
  eyeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
    minHeight: 62,
    backgroundColor: '#0F766E',
    borderRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
    shadowColor: '#0F766E',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.75,
  },
  buttonIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonSubtext: {
    color: '#CCFBF1',
    fontSize: 11,
    marginTop: 2,
  },
  termsText: {
    marginTop: 14,
    color: '#7D8AA0',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    marginTop: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
  },
  secondaryButton: {
    minWidth: 160,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#0F766E',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '700',
  },
});
