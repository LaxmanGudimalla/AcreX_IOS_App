import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendGuestOtp } from '../services/api';

export default function NewUserScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit mobile number');
      return;
    }

    try {
      setSending(true);
      const response = await sendGuestOtp(trimmedPhone);
      const receivedOtp = response?.data?.otp;

      if (receivedOtp) {
        Alert.alert('OTP Sent', `Use this OTP: ${receivedOtp}`);
      }

      navigation.navigate('OtpScreen', { phone: trimmedPhone });
    } catch (error) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to send OTP right now',
      );
    } finally {
      setSending(false);
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
            <Text style={styles.headerTitle}>New User</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.heroCard}>
              <View style={styles.heroIconWrap}>
                <Icon name="sparkles-outline" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.heroEyebrow}>Quick Onboarding</Text>
              <Text style={styles.title}>Start exploring AcreX</Text>
              <Text style={styles.heroText}>
                Verify your mobile number to continue as a new user and browse
                verified property listings.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Mobile Number *</Text>
                <View style={styles.inputWrap}>
                  <Icon name="call-outline" size={18} color="#64748B" />
                  <Text style={styles.prefixText}>+91</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#99A2B3"
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, sending && styles.disabledButton]}
                onPress={handleSendOtp}
                disabled={sending}
                activeOpacity={0.9}
              >
                <View style={styles.buttonIconWrap}>
                  <Icon name="paper-plane-outline" size={16} color="#0F766E" />
                </View>
                <View style={styles.buttonTextWrap}>
                  <Text style={styles.buttonText}>
                    {sending ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                  <Text style={styles.buttonSubtext}>Verify and continue</Text>
                </View>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.termsText}>
                We will send a one-time password to verify your number.
              </Text>
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
});
