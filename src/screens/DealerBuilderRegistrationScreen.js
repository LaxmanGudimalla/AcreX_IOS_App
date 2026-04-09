import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/Ionicons';
import { registerDealer } from '../services/api';

export default function DealerBuilderRegistrationScreen({ navigation, route }) {

  const { name } = route.params || {};

  const [fullName, setFullName] = useState(name || '');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {

    if (!fullName || !email || !address || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const userData = await AsyncStorage.getItem("userData");

    let phone = null;

    if (userData) {
      const user = JSON.parse(userData);
      phone = user.phone;
    }

    if (!phone) {
      phone = await AsyncStorage.getItem("phone");
    }

    if (!phone) {
      Alert.alert('Error', 'Phone not found. Please login again.');
      return;
    }

    const formData = {
      name: fullName,
      email,
      password,
      office_address: address,
      role: 'Dealer',
      phone: phone,
    };

    console.log("Submitting data:", formData);

    try {

      const response = await registerDealer(formData);

      console.log("API response:", response);

      if (response.status === 200) {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userRole", "Dealer");

        navigation.replace('Login');
      }

    } catch (error) {

      console.log("API error:", error?.response?.data);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Server error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.85}>
            <Icon name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Dealer Registration</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Icon name="briefcase-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.heroEyebrow}>Professional Profile</Text>
            <Text style={styles.title}>Set up your dealer account</Text>
            <Text style={styles.heroText}>
              Complete your details to join the verified network and start
              managing property listings.
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputWrap}>
                <Icon name="person-outline" size={18} color="#64748B" />
                <TextInput
                  placeholder="Enter full name"
                  placeholderTextColor="#99A2B3"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWrap}>
                <Icon name="mail-outline" size={18} color="#64748B" />
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor="#99A2B3"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Office Address *</Text>
              <View style={[styles.inputWrap, styles.textAreaWrap]}>
                <Icon
                  name="location-outline"
                  size={18}
                  color="#64748B"
                  style={styles.textAreaIcon}
                />
                <TextInput
                  placeholder="Enter office address"
                  placeholderTextColor="#99A2B3"
                  style={[styles.input, styles.textAreaInput]}
                  multiline
                  textAlignVertical="top"
                  value={address}
                  onChangeText={setAddress}
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
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <View style={styles.buttonIconWrap}>
                <Icon name="briefcase-outline" size={16} color="#0F766E" />
              </View>
              <View style={styles.buttonTextWrap}>
                <Text style={styles.buttonText}>Create Dealer Account</Text>
                <Text style={styles.buttonSubtext}>Finish setup and continue</Text>
              </View>
              <Icon name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
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
  input: {
    flex: 1,
    height: 52,
    marginLeft: 10,
    color: '#1A1F2B',
    fontSize: 14,
  },
  textAreaWrap: {
    alignItems: 'flex-start',
    paddingTop: 14,
    minHeight: 96,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textAreaInput: {
    height: 76,
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
    color: '#DBEAFE',
    fontSize: 11,
    marginTop: 2,
  },
});
