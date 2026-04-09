import React, { useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { sendGuestOtp, verifyGuestOtp } from '../services/api';

export default function OtpScreen({ route, navigation }) {
  const phone = route?.params?.phone || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const cleanText = String(text || '').replace(/[^0-9]/g, '');
    if (!cleanText) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }

    if (cleanText.length === 1) {
      const next = [...otp];
      next[index] = cleanText;
      setOtp(next);
      if (index < 5) {
        inputs.current[index + 1]?.focus();
      }
      return;
    }

    const chars = cleanText.slice(0, 6).split('');
    const next = [...otp];
    chars.forEach((char, idx) => {
      const targetIndex = index + idx;
      if (targetIndex < 6) {
        next[targetIndex] = char;
      }
    });
    setOtp(next);
    const lastIndex = Math.min(index + chars.length, 5);
    if (lastIndex < 5) {
      inputs.current[lastIndex + 1]?.focus();
    } else {
      inputs.current[5]?.blur();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key !== 'Backspace') {
      return;
    }

    const next = [...otp];
    if (next[index]) {
      next[index] = '';
      setOtp(next);
      return;
    }

    if (index > 0) {
      next[index - 1] = '';
      setOtp(next);
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Invalid mobile number. Please restart signup.');
      return;
    }

    if (otpValue.length !== 6) {
      Alert.alert('Error', 'Enter complete OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyGuestOtp(phone, otpValue);
      const user = res?.data?.user;
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
      const normalizedRole = user?.role;
      const isRegisteredRole = normalizedRole === 'Dealer' || normalizedRole === 'Owner';

      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('phone', phone);
      if (isRegisteredRole) {
        await AsyncStorage.setItem('userRole', normalizedRole);
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
        routes: [{name: 'Dashboard', params: {user}}],
      });
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Invalid mobile number. Please restart signup.');
      return;
    }

    try {
      setResending(true);
      const response = await sendGuestOtp(phone);
      const receivedOtp = response?.data?.otp;
      if (receivedOtp) {
        Alert.alert('OTP Sent', `Use this OTP: ${receivedOtp}`);
        return;
      }
      Alert.alert('Success', 'OTP sent again');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to resend OTP');
    } finally {
      setResending(false);
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
              style={styles.backButton}
              activeOpacity={0.85}
            >
              <Icon name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>OTP Verification</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.heroCard}>
              <View style={styles.heroIconWrap}>
                <Icon name="key-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroEyebrow}>Verify Number</Text>
              <Text style={styles.title}>Enter your 6-digit OTP</Text>
              <Text style={styles.heroText}>
                We sent a verification code to +91 {phone}. Enter it below to
                continue to the dashboard.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Verification Code *</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => {
                      inputs.current[index] = ref;
                    }}
                    style={styles.otpBox}
                    keyboardType="number-pad"
                    maxLength={6}
                    textContentType="oneTimeCode"
                    value={digit}
                    autoFocus={index === 0}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.disabledButton]}
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.9}
              >
                <View style={styles.buttonIconWrap}>
                  <Icon name="checkmark-done-outline" size={16} color="#0F766E" />
                </View>
                <View style={styles.buttonTextWrap}>
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                  <Text style={styles.buttonSubtext}>Complete secure sign-in</Text>
                </View>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={styles.resendButton}
                activeOpacity={0.85}
              >
                <Text style={styles.resendLink}>
                  {resending ? 'Sending OTP...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
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
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    color: '#334155',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  otpBox: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: '#D7E0EA',
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1F2B',
    backgroundColor: '#F8FAFC',
  },
  button: {
    marginTop: 24,
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
  resendText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#8A93A6',
    fontSize: 12,
  },
  resendButton: {
    marginTop: 8,
    alignSelf: 'center',
  },
  resendLink: {
    textAlign: 'center',
    color: '#0F766E',
    fontWeight: '700',
    fontSize: 13,
  },
});
