import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CreateAccountScreen({ navigation }) {
  const name = '';
  const roleCards = [
    {
      key: 'Dealer',
      title: 'Broker',
      icon: 'briefcase-outline',
      accent: '#2563EB',
      surface: '#EFF6FF',
      border: '#BFDBFE',
      description: 'List and manage multiple properties with a professional profile.',
      cta: 'For Real-Estate Brokers',
      route: 'DealerBuilderRegistration',
    },
    {
      key: 'Owner',
      title: 'Owner',
      icon: 'home-outline',
      accent: '#0F766E',
      surface: '#ECFDF5',
      border: '#A7F3D0',
      description: 'Sell or rent your own property with a quick verified setup.',
      cta: 'For individual property owners',
      route: 'OwnerRegistration',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={styles.backButton}>
            <Icon name="arrow-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.brandText}>Rohini Realty</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Icon name="person-add-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.eyebrow}>Create Your Account</Text>
            <Text style={styles.title}>Choose how you want to join</Text>
            <Text style={styles.subtitle}>
              Select the profile type that matches your property journey and we
              will take you to the right registration flow.
            </Text>
          </View>

          <View style={styles.roleCardsColumn}>
            {roleCards.map(item => {
              return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.9}
                style={[
                  styles.roleBigCard,
                  {
                    backgroundColor: item.surface,
                    borderColor: item.border,
                  },
                ]}
                onPress={() => {
                  navigation.navigate(item.route, {name, role: item.title});
                }}>
                <View style={styles.roleHeader}>
                  <View
                    style={[
                      styles.roleBadge,
                      {backgroundColor: `${item.accent}18`},
                    ]}>
                    <Icon name={item.icon} size={24} color={item.accent} />
                  </View>
                  <View style={styles.roleTitleWrap}>
                    <Text style={styles.roleTitle}>{item.title}</Text>
                    <Text style={styles.roleCta}>{item.cta}</Text>
                  </View>
                  <Icon
                    name="arrow-forward-circle"
                    size={24}
                    color={item.accent}
                  />
                </View>

                <Text style={styles.roleDesc}>{item.description}</Text>
              </TouchableOpacity>
            );
          })}
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
  brandText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 12,
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
  heroBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  subtitle: {
    marginTop: 10,
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },
  roleCardsColumn: {
    marginTop: 18,
    gap: 14,
  },

  roleBigCard: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    minHeight: 138,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  roleTitleWrap: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },

  roleCta: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    fontWeight: '600',
  },

  roleDesc: {
    fontSize: 14,
    color: '#334155',
    marginTop: 14,
    lineHeight: 21,
  },

});
