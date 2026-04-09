import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function firstDefined(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

function getDealerName(dealer, index) {
  return (
    firstDefined(dealer, [
      'dealer_name',
    ]) || `Dealer ${index + 1}`
  );
}

function getDealerSubtitle(dealer) {
  const rawRole = firstDefined(dealer, [
    'user_role',
  ]);

  if (!rawRole) {
    return null;
  }

  const normalizedRole = String(rawRole)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

  return `Role: ${normalizedRole}`;
}

function getDealerContact(dealer) {
  const phone = firstDefined(dealer, [
    'dealer_phone',
  ]);
  const email = firstDefined(dealer, [
    'email',
  ]);

  return [phone, email].filter(Boolean).join(' | ');
}

export default function PlotDealersScreen({navigation, route}) {
  const plotDetails = route?.params?.plotDetails || {};
  const dealerListings = Array.isArray(route?.params?.dealerListings)
    ? route.params.dealerListings
    : [];

  const plotLabel =
    plotDetails?.plot_number ||
    plotDetails?.plot_no ||
    plotDetails?.plotId ||
    plotDetails?.plot_id ||
    plotDetails?.plot_ref ||
    'Selected Plot';

  const handleSelectDealer = dealer => {
    navigation.navigate('PlotDetails', {
      mapName: route?.params?.mapName || 'Dynamic API Map',
      plotDetails: {
        ...plotDetails,
        ...dealer,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Dealer Listings</Text>
        <Text style={styles.title}>Plot {String(plotLabel).toUpperCase()}</Text>
        <Text style={styles.subtitle}>
          {dealerListings.length} result{dealerListings.length === 1 ? '' : 's'} available for this property
        </Text>
      </View>

      {dealerListings.length > 0 ? (
        dealerListings.map((dealer, index) => {
          const dealerName = getDealerName(dealer, index);
          const dealerSubtitle = getDealerSubtitle(dealer);
          const dealerContact = getDealerContact(dealer);

          return (
            <Pressable
              key={String(dealer?.id ?? dealer?.dealer_id ?? index)}
              style={styles.dealerCard}
              onPress={() => handleSelectDealer(dealer)}>
              <View style={styles.badgeRow}>
                 <Text style={styles.dealerName}>{dealerName}</Text>
          
                <Text style={styles.tapHint}>Tap to open details</Text>
              </View>
             <View style={styles.badgeRow}>
               <Text style={styles.dealerContact}>
                {dealerContact || 'Contact details not available'}
              </Text>
              {dealerSubtitle ? (
                <Text style={styles.dealerSubtitle}>{dealerSubtitle}</Text>
              ) : null}
             
              </View>
            </Pressable>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No dealers found</Text>
          <Text style={styles.emptyText}>
            There are no dealer listings available for this plot right now.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECF4F9',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#0B1B34',
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#C7DAF8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D5E3F7',
    fontSize: 14,
    lineHeight: 20,
  },
  dealerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCE7F2',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countBadge: {
    backgroundColor: '#E8F1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countBadgeText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  tapHint: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dealerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dealerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#45628A',
    fontWeight: '600',
  },
  dealerContact: {
    marginTop: 10,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#DCE7F2',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
  },
});
