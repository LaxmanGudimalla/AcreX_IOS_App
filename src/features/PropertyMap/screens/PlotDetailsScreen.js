import React from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
const GOOGLE_STATIC_MAPS_API_KEY = 'AIzaSyDKEBTCflJhmLKu_u5Yg35umBhwdqoa0Qg';

function firstDefined(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

function displayValue(value, fallbackText) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallbackText;
  }
  return String(value);
}

function formatReadyToMove(value) {
  if (value === true || value === 1 || String(value).toLowerCase() === 'true') {
    return 'Yes';
  }
  if (
    value === false ||
    value === 0 ||
    String(value).toLowerCase() === 'false'
  ) {
    return 'No';
  }
  return null;
}

function formatDateDMY(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }

  const raw = String(value).trim();

  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    return raw;
  }

  const ymdMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return raw;
}

function DetailRow({label, value}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

function SummaryItem({label, value}) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryAccent} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function AddressMapCard({plotAddress, onPress}) {
  const staticMapUrl = plotAddress
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        String(plotAddress),
      )}&zoom=16&size=800x400&scale=2&markers=color:red|${encodeURIComponent(
        String(plotAddress),
      )}&key=${GOOGLE_STATIC_MAPS_API_KEY}`
    : null;

  return (
    <Pressable
      style={[styles.mediaCard, styles.mapFallbackCard]}
      onPress={onPress}>
      {staticMapUrl ? (
        <>
          <Image
            source={{uri: staticMapUrl}}
            style={styles.mapPreviewImage}
            resizeMode="cover"
          />
          <Text style={styles.mapHintText}>Tap to open in Google Maps</Text>
          <Text style={styles.mapFallbackAddress}>{plotAddress}</Text>
        </>
      ) : (
        <>
          <Text style={styles.mapFallbackTitle}>Open In Google Maps</Text>
          <Text style={styles.mapFallbackAddress}>
            Address not available for this property
          </Text>
        </>
      )}
    </Pressable>
  );
}

export default function PlotDetailsScreen({route}) {
  const plotDetails = route?.params?.plotDetails || {};
  const propertyType = String(plotDetails?.property_type || '').toLowerCase();

  const sector = firstDefined(plotDetails, [
    'sector_name',
    'sector',
    'sector_no',
  ]);
  const pocket = firstDefined(plotDetails, [
    'pocket_name',
    'pocket',
    'pocket_no',
  ]);
  const sectorPocketValue = [sector, pocket].filter(Boolean).join(' / ');

  const plotNumber = firstDefined(plotDetails, [
    'plot_number',
    'plot_no',
    'plotId',
    'plot_id',
    'plot_ref',
  ]);
  const size = firstDefined(plotDetails, [
    'size',
    'area',
    'plot_size',
    'super_area',
  ]);
  const price = firstDefined(plotDetails, [
    'price',
    'total_price',
    'expected_price',
    'asking_price',
  ]);

  const plotAddress = firstDefined(plotDetails, ['address', 'full_address']);
  const prettyType =
    propertyType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ||
    'Property';
  const headerTitle = String(
    plotDetails.title || 'Property Details',
  ).toUpperCase();
  const headerLine = sectorPocketValue
    ? `${sectorPocketValue}`
    : 'Smart property insights at a glance';

  const handleOpenAddressMap = async () => {
    if (!plotAddress) {
      Alert.alert(
        'Address unavailable',
        'This property does not have an address to open in Google Maps.',
      );
      return;
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      String(plotAddress),
    )}`;

    try {
      await Linking.openURL(mapsUrl);
    } catch (error) {
      Alert.alert(
        'Unable to open map',
        'Google Maps could not be opened for this address.',
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <View style={styles.heroEyebrowWrap}>
          <Text style={styles.heroEyebrow}>Property Insights</Text>
        </View>
        <Text style={styles.title}>{headerTitle}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.sourceText} numberOfLines={2}>
            {headerLine}
          </Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{prettyType}</Text>
          </View>
        </View>
      </View>

      {propertyType === 'builder_floor' ? (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.sectionSubtitle}>Quick snapshot</Text>
            </View>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Plot Number"
                value={displayValue(plotNumber, 'N/A')}
              />
              <SummaryItem label="Price" value={displayValue(price, 'N/A')} />
              <SummaryItem label="Size" value={displayValue(size, 'N/A')} />
              <SummaryItem
                label="Ready To Move"
                value={displayValue(
                  formatReadyToMove(
                    firstDefined(plotDetails, ['ready_to_move', 'readyToMove']),
                  ),
                  'N/A',
                )}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <Text style={styles.sectionSubtitle}>
                Builder floor information
              </Text>
            </View>
            {/* <DetailRow label="Sector and Pocket" value={displayValue(sectorPocketValue, 'N/A')} /> */}
            <View style={styles.detailTwoColumnRow}>
              <View style={styles.detailHalf}>
                <DetailRow
                  label="BHK"
                  value={displayValue(
                    firstDefined(plotDetails, ['bhk', 'configuration']),
                    'N/A',
                  )}
                />
              </View>
              <View style={styles.detailHalf}>
                <DetailRow
                  label="Floor Number"
                  value={displayValue(
                    firstDefined(plotDetails, [
                      'floor_number',
                      'floor_no',
                      'floor',
                    ]),
                    'N/A',
                  )}
                />
              </View>
            </View>
            <View style={styles.detailTwoColumnRow}>
              <View style={styles.detailHalf}>
                <DetailRow
                  label="Date of Start"
                  value={displayValue(
                    formatDateDMY(
                      firstDefined(plotDetails, [
                        'date_of_start',
                        'start_date',
                      ]),
                    ),
                    'N/A',
                  )}
                />
              </View>
              <View style={styles.detailHalf}>
                <DetailRow
                  label="Date of Delivery"
                  value={displayValue(
                    formatDateDMY(
                      firstDefined(plotDetails, [
                        'date_of_delivery',
                        'delivery_date',
                      ]),
                    ),
                    'N/A',
                  )}
                />
              </View>
            </View>
            <DetailRow
              label="Payment Date"
              value={displayValue(
                formatDateDMY(
                  firstDefined(plotDetails, ['payment_date', 'paymentDate']),
                ),
                'N/A',
              )}
            />
            <DetailRow
              label="Address"
              value={displayValue(
                firstDefined(plotDetails, ['address', 'full_address']),
                'N/A',
              )}
            />
            <DetailRow
              label="Description"
              value={displayValue(
                firstDefined(plotDetails, ['description']),
                'N/A',
              )}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Location Map</Text>
              <Text style={styles.sectionSubtitle}>Open property location</Text>
            </View>
            <AddressMapCard
              plotAddress={plotAddress}
              onPress={handleOpenAddressMap}
            />
          </View>
        </>
      ) : propertyType === 'kothi' ? (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.sectionSubtitle}>Quick snapshot</Text>
            </View>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Plot Number"
                value={displayValue(plotNumber, 'N/A')}
              />
              <SummaryItem label="Price" value={displayValue(price, 'N/A')} />
              <SummaryItem label="Size" value={displayValue(size, 'N/A')} />
              <SummaryItem
                label="Ready To Move"
                value={displayValue(
                  formatReadyToMove(
                    firstDefined(plotDetails, ['ready_to_move', 'readyToMove']),
                  ),
                  'N/A',
                )}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Kothi Details</Text>
              <Text style={styles.sectionSubtitle}>
                Independent house information
              </Text>
            </View>
            <DetailRow
              label="BHK"
              value={displayValue(
                firstDefined(plotDetails, ['bhk', 'configuration']),
                'N/A',
              )}
            />
            <DetailRow
              label="Address"
              value={displayValue(
                firstDefined(plotDetails, ['address', 'full_address']),
                'N/A',
              )}
            />
            <DetailRow
              label="Description"
              value={displayValue(
                firstDefined(plotDetails, ['description']),
                'N/A',
              )}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Location Map</Text>
              <Text style={styles.sectionSubtitle}>Open property location</Text>
            </View>
            <AddressMapCard
              plotAddress={plotAddress}
              onPress={handleOpenAddressMap}
            />
          </View>
        </>
      ) : propertyType === 'plot' ? (
        <>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.sectionSubtitle}>Quick snapshot</Text>
            </View>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Plot Number"
                value={displayValue(plotNumber, 'N/A')}
              />
              <SummaryItem label="Price" value={displayValue(price, 'N/A')} />
              <SummaryItem label="Size" value={displayValue(size, 'N/A')} />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Plot Details</Text>
              <Text style={styles.sectionSubtitle}>Location and notes</Text>
            </View>
            {/* <DetailRow label="Sector and Pocket" value={displayValue(sectorPocketValue, 'N/A')} /> */}
            <DetailRow
              label="Payment Date"
              value={displayValue(
                formatDateDMY(
                  firstDefined(plotDetails, ['payment_date', 'paymentDate']),
                ),
                'N/A',
              )}
            />
            <DetailRow
              label="Address"
              value={displayValue(
                firstDefined(plotDetails, ['address', 'full_address']),
                'N/A',
              )}
            />
            <DetailRow
              label="Description"
              value={displayValue(
                firstDefined(plotDetails, ['description']),
                'N/A',
              )}
            />
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Location Map</Text>
              <Text style={styles.sectionSubtitle}>Area reference</Text>
            </View>
            <AddressMapCard
              plotAddress={plotAddress}
              onPress={handleOpenAddressMap}
            />
          </View>
        </>
      ) : (
        <View style={styles.sectionCard}>
          <DetailRow label="Plot ID" value={plotDetails.plotId || 'N/A'} />
          <DetailRow
            label="Description"
            value={plotDetails.description || 'No details provided.'}
          />
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
    paddingBottom: 48,
  },
  headerCard: {
    backgroundColor: '#0B1B34',
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E3356',
    shadowColor: '#0B1B34',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
    elevation: 5,
  },
  heroEyebrowWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#122B51',
    borderWidth: 1,
    borderColor: '#274272',
    marginBottom: 10,
  },
  heroEyebrow: {
    color: '#C7DAF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 14,
    color: '#D5E3F7',
    lineHeight: 20,
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    backgroundColor: '#1A335A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3C5D8F',
  },
  typeBadgeText: {
    color: '#E8F0FC',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DCE7F2',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 5},
    elevation: 3,
  },
  sectionHead: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailTwoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailHalf: {
    flex: 1,
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#F6FAFF',
    borderWidth: 1,
    borderColor: '#CCE1F6',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    overflow: 'hidden',
  },
  summaryAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1D74E9',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#45628A',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  summaryValue: {
    fontSize: 16,
    color: '#0B1B34',
    fontWeight: '800',
  },
  detailRow: {
    marginBottom: 12,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D7E7F5',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  detailLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#334155',
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  detailValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    lineHeight: 21,
  },
  mediaCard: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D4E5F3',
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
  },
  mapFallbackCard: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mapPreviewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#EAF2FA',
  },
  mapHintText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#1D74E9',
    textAlign: 'center',
  },
  mapFallbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1B34',
    marginBottom: 8,
  },
  mapFallbackAddress: {
    fontSize: 13,
    lineHeight: 19,
    color: '#52708F',
    textAlign: 'center',
  },
});
