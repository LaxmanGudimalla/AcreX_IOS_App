import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getMyListings } from '../services/api';

const TAB_CONFIG = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const resolveUserId = (user) => {
  return (
    user?.user_id ??
    user?.id ??
    user?.dealer_id ??
    user?.owner_user_id ??
    user?.owner?.user_id ??
    user?.owner?.id ??
    null
  );
};

const extractListings = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.listings)) {
    return payload.listings;
  }

  if (Array.isArray(payload?.records)) {
    return payload.records;
  }

  return [];
};

const getStatusLabel = (item) => {
  return item?.status || item?.owner_approval_status || 'pending';
};

const normalizeStatus = (value) => String(value || 'pending').trim().toLowerCase();

const getStatusTheme = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === 'approved') {
    return {
      badgeBackground: '#DCFCE7',
      badgeBorder: '#86EFAC',
      badgeText: '#166534',
      accent: '#16A34A',
    };
  }

  if (normalizedStatus === 'rejected') {
    return {
      badgeBackground: '#FEE2E2',
      badgeBorder: '#FECACA',
      badgeText: '#B91C1C',
      accent: '#EF4444',
    };
  }

  return {
    badgeBackground: '#FEF3C7',
    badgeBorder: '#FDE68A',
    badgeText: '#B45309',
    accent: '#F59E0B',
  };
};

const sortByNewest = (list) => {
  return [...list].sort((a, b) => {
    const left = Date.parse(a?.created_at || 0) || 0;
    const right = Date.parse(b?.created_at || 0) || 0;
    return right - left;
  });
};

export default function MyListingsScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const emptyMessage = useMemo(() => {
    if (activeTab === 'approved') return 'No Approved listings yet.';
    if (activeTab === 'pending') return 'No Pending listings yet.';
    if (activeTab === 'rejected') return 'No Rejected listings yet.';
    return 'No listings yet.';
  }, [activeTab]);

  const loadListings = useCallback(
    async (status = activeTab) => {
      try {
        setLoading(true);
        setErrorMessage('');

        const userDataRaw = await AsyncStorage.getItem('userData');
        if (!userDataRaw) {
          setListings([]);
          setErrorMessage('Session expired. Please login again.');
          return;
        }

        const user = JSON.parse(userDataRaw);
        const userId = resolveUserId(user);
        if (!userId) {
          setListings([]);
          setErrorMessage('Unable to resolve user id for listings.');
          return;
        }

        const resolvedStatus = status === 'all' ? undefined : status;
        const response = await getMyListings(userId, resolvedStatus);
        const receivedListings = extractListings(response?.data);
        setListings(sortByNewest(receivedListings));
      } catch (error) {
        const apiMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to load listings right now.';
        setListings([]);
        setErrorMessage(String(apiMessage));
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useFocusEffect(
    useCallback(() => {
      loadListings(activeTab);
    }, [activeTab, loadListings])
  );

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
  };

  const renderValue = (value, fallback = 'Not available') => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return String(value);
  };

  const renderListings = () => {
    if (loading) {
      return (
        <View style={styles.stateWrap}>
          <View style={styles.stateIconWrap}>
            <ActivityIndicator size="large" color="#0F766E" />
          </View>
          <Text style={styles.stateText}>Loading listings...</Text>
          <Text style={styles.stateSubtext}>Please wait while we fetch your latest property updates.</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to load listings</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadListings(activeTab)}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (listings.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return listings.map((item) => {
      const locationParts = [item?.sector_name, item?.block_name, item?.pocket_name]
        .filter((value) => value !== null && value !== undefined && value !== '')
        .join(' / ');
      const statusLabel = getStatusLabel(item);
      const statusTheme = getStatusTheme(statusLabel);
      const hasAskingPrice =
        item?.asking_price !== null &&
        item?.asking_price !== undefined &&
        item?.asking_price !== '';

      return (
        <View key={String(item?.id)} style={styles.card}>
          <View
            style={[
              styles.cardAccent,
              { backgroundColor: statusTheme.accent },
            ]}
          />
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.cardEyebrow}>Property Listing</Text>
              <Text style={styles.cardTitle}>Plot {renderValue(item?.plot_number)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusTheme.badgeBackground,
                  borderColor: statusTheme.badgeBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusTheme.badgeText },
                ]}
              >
                {renderValue(statusLabel, 'pending')}
              </Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Property Type</Text>
              <Text style={styles.metaValue}>{renderValue(item?.property_type)}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Status</Text>
              <Text style={styles.metaValue}>{renderValue(statusLabel)}</Text>
            </View>
            {hasAskingPrice && (
              <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>Asking Price</Text>
                <Text style={styles.metaValue}>{renderValue(item?.asking_price)}</Text>
              </View>
            )}
            <View style={[styles.metaBlock, styles.locationBlock]}>
              <Text style={styles.metaLabel}>Location</Text>
              <Text style={styles.metaValue}>{renderValue(locationParts)}</Text>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />

      <View style={styles.heroCard}>
        <Text style={styles.title}>My Listings</Text>
        <Text style={styles.subtitle}>
          Track approvals, check current statuses, and revisit every property from one place.
        </Text>
      </View>

      <View style={styles.tabs}>
        {TAB_CONFIG.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.refreshButton, loading && styles.refreshButtonDisabled]}
          onPress={() => loadListings(activeTab)}
          disabled={loading}
        >
          <Text style={styles.refreshText}>{loading ? 'Loading...' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSectionHeader}>
        <Text style={styles.listSectionTitle}>Recent Listings</Text>
        <Text style={styles.listSectionCaption}>
          {listings.length} {listings.length === 1 ? 'item' : 'Records'}
        </Text>
      </View>

      <View style={styles.listingsWrap}>
        {renderListings()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E6F4F1',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  bgOrbTop: {
    position: 'absolute',
    top: -60,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(13, 148, 136, 0.10)',
  },
  bgOrbBottom: {
    position: 'absolute',
    bottom: 120,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(244, 114, 182, 0.08)',
  },
  heroCard: {
    backgroundColor: '#0F3D3E',
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#0F3D3E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFE2DB',
  },
  tabActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  tabText: {
    color: '#155E75',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  refreshButton: {
    backgroundColor: '#0F766E',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 110,
    alignItems: 'center',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listSectionTitle: {
    color: '#123B39',
    fontSize: 20,
    fontWeight: '800',
  },
  listSectionCaption: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  listingsWrap: {
    gap: 12,
  },
  stateWrap: {
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#C7E5DF',
  },
  stateIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDF6F2',
  },
  stateText: {
    marginTop: 10,
    color: '#0F3D3E',
    fontSize: 15,
    fontWeight: '700',
  },
  stateSubtext: {
    marginTop: 6,
    color: '#5B6B73',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#C7E5DF',
  },
  emptyTitle: {
    color: '#123B39',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: '#52606D',
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorTitle: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 8,
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#D2E8E2',
    shadowColor: '#0F3D3E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  cardEyebrow: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#123B39',
    fontSize: 20,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaBlock: {
    width: '48%',
    backgroundColor: '#F7FBFA',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E1F1ED',
  },
  locationBlock: {
    width: '100%',
  },
  metaLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  metaValue: {
    color: '#0F3D3E',
    fontSize: 14,
    fontWeight: '700',
  },
});
