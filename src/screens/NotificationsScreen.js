import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getNotifications, markNotificationAsRead } from '../services/api';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');

      if (!userData) return;

      const user = JSON.parse(userData);
      const response = await getNotifications(user.user_id);

      setNotifications(response.data);

      await Promise.all(response.data.map((item) => markNotificationAsRead(item.id)));

      navigation.setParams({ resetNotifications: true });
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, !item.user_read && styles.unread]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
<Text style={styles.date}>
  {new Date(item.created_at).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}
</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="notifications-outline" size={32} color="#0369A1" />
        </View>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptySubtitle}>
          You are all caught up. New alerts about listings and account updates
          will appear here.
        </Text>
      </View>
    </View>
  );

return (
  <View style={styles.container}>

    {/* 🔙 Header */}
    <View style={styles.header}>
      <Ionicons
        name="arrow-back"
        size={24}
        color="#102A43"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={{ width: 24 }} /> 
    </View>

    {/* 📋 List */}
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        notifications.length === 0
          ? styles.emptyListContent
          : styles.listContent
      }
      ListEmptyComponent={renderEmptyState}
    />
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8FC',
    padding: 16,
  },
  listContent: {
    paddingBottom: 12,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102A43',
  },
  message: {
    fontSize: 13,
    marginTop: 4,
    color: '#334E68',
  },
  date: {
    fontSize: 11,
    marginTop: 6,
    color: '#829AB1',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9EAF7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#102A43',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#627D98',
    marginTop: 8,
    lineHeight: 21,
    textAlign: 'center',
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 10,
},

headerTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#102A43',
},
});
