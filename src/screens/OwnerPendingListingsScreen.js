import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  approveOwnerListing,
  getOwnerPendingListings,
  rejectOwnerListing
} from "../services/api";

export default function OwnerPendingListingsScreen() {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

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

    if (Array.isArray(payload?.pending_listings)) {
      return payload.pending_listings;
    }

    return [];
  };

  const isNoListingsError = (error) => {
    const status = error?.response?.status;
    return status === 404 || status === 204;
  };

  const loadPendingListings = useCallback(async () => {
    try {
      setLoading(true);
      const userDataRaw = await AsyncStorage.getItem("userData");
      const storedRole = await AsyncStorage.getItem("userRole");

      if (!userDataRaw) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      const user = JSON.parse(userDataRaw);
      const ownerIdCandidates = Array.from(
        new Set(
          [
            user?.user_id,
            user?.id,
            user?.owner_user_id,
            user?.owner_id,
            user?.owner?.user_id,
            user?.owner?.id
          ].filter((value) => value !== null && value !== undefined && value !== "")
        )
      );
      const roleFromUser = String(user?.role || "").toLowerCase();
      const roleFromStorage = String(storedRole || "").toLowerCase();
      const isOwner = roleFromUser === "owner" || roleFromStorage === "owner";

      if (!isOwner) {
        Alert.alert("Access denied", "Only owners can access pending listings.");
        setPendingListings([]);
        return;
      }

      let resolvedListings = [];

      for (const candidateId of ownerIdCandidates) {
        try {
          const response = await getOwnerPendingListings(candidateId);
          const nextList = extractListings(response?.data);

          if (nextList.length > 0) {
            resolvedListings = nextList;
            break;
          }
        } catch (error) {
          console.log(error?.response?.data || error?.message);
        }
      }

      if (resolvedListings.length === 0) {
        try {
          const responseWithoutId = await getOwnerPendingListings();
          resolvedListings = extractListings(responseWithoutId?.data);
        } catch (error) {
          console.log(error?.response?.data || error?.message);
          resolvedListings = [];
        }
      }

      setPendingListings(resolvedListings);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      setPendingListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPendingListings();
    }, [loadPendingListings])
  );

  const handleApprove = async (plotDealerId) => {
    if (!plotDealerId || approvingId || rejectingId) {
      return;
    }

    try {
      setApprovingId(plotDealerId);
      await approveOwnerListing(plotDealerId);
      if (Platform.OS === "android") {
        ToastAndroid.show("Approved successfully", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Approved successfully");
      }
      setPendingListings((previous) =>
        previous.filter((item) => item?.id !== plotDealerId)
      );
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      Alert.alert("Failed", "Unable to approve listing.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (plotDealerId) => {
    if (!plotDealerId || rejectingId || approvingId) {
      return;
    }

    try {
      setRejectingId(plotDealerId);
      await rejectOwnerListing(plotDealerId);
      if (Platform.OS === "android") {
        ToastAndroid.show("Rejected successfully", ToastAndroid.SHORT);
      } else {
        Alert.alert("Success", "Rejected successfully");
      }
      setPendingListings((previous) =>
        previous.filter((item) => item?.id !== plotDealerId)
      );
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      Alert.alert("Failed", "Unable to reject listing.");
    } finally {
      setRejectingId(null);
    }
  };

  const renderValue = (value, fallback = "Not available") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    return String(value);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.title}>Pending Listings</Text>
        <Text style={styles.subtitle}>
          Approve dealer listings for your properties before they go to admin.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={loadPendingListings}
        disabled={loading}
      >
        <Text style={styles.refreshBtnText}>{loading ? "Loading..." : "Refresh"}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loaderText}>Loading pending listings...</Text>
        </View>
      ) : pendingListings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Pending Listings</Text>
          <Text style={styles.emptySubtitle}>
            All owner approvals are complete for now.
          </Text>
        </View>
      ) : (
        pendingListings.map((item) => (
          <View key={String(item?.id)} style={styles.card}>
            <Text style={styles.cardTitle}>Listing #{renderValue(item?.id)}</Text>
            {item?.is_duplicate_with_owner === true && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Dealer uploaded for your plot</Text>
              </View>
            )}

            <Text style={styles.rowText}>
              Plot ID: <Text style={styles.rowValue}>{renderValue(item?.plot_id)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Plot Number:{" "}
              <Text style={styles.rowValue}>{renderValue(item?.plot_number)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Dealer ID:{" "}
              <Text style={styles.rowValue}>{renderValue(item?.dealer_id)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Dealer Name:{" "}
              <Text style={styles.rowValue}>{renderValue(item?.dealer_name)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Asking Price:{" "}
              <Text style={styles.rowValue}>{renderValue(item?.asking_price)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Status:{" "}
              <Text style={styles.rowValue}>
                {renderValue(item?.owner_approval_status)}
              </Text>
            </Text>

            <View style={styles.actionWrap}>
              <TouchableOpacity
                style={[
                  styles.approveBtn,
                  (approvingId === item?.id || rejectingId === item?.id) &&
                    styles.approveBtnDisabled
                ]}
                onPress={() => handleApprove(item?.id)}
                disabled={approvingId === item?.id || rejectingId === item?.id}
              >
                <Text style={styles.approveText}>
                  {approvingId === item?.id ? "Approving..." : "Approve"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rejectBtn,
                  (rejectingId === item?.id || approvingId === item?.id) &&
                    styles.rejectBtnDisabled
                ]}
                onPress={() => handleReject(item?.id)}
                disabled={rejectingId === item?.id || approvingId === item?.id}
              >
                <Text style={styles.rejectText}>
                  {rejectingId === item?.id ? "Rejecting..." : "Reject"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF7ED"
  },
  content: {
    padding: 18,
    paddingBottom: 34
  },
  heroCard: {
    backgroundColor: "#C2410C",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19
  },
  refreshBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#EA580C",
    borderRadius: 12,
    minHeight: 40,
    minWidth: 90,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  },
  loaderWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34
  },
  loaderText: {
    marginTop: 10,
    color: "#9A3412",
    fontSize: 14
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 20
  },
  emptyTitle: {
    color: "#9A3412",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6
  },
  emptySubtitle: {
    color: "#9A3412",
    fontSize: 14,
    lineHeight: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 16,
    marginBottom: 12
  },
  cardTitle: {
    color: "#9A3412",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D"
  },
  badgeText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "700"
  },
  rowText: {
    color: "#9A3412",
    fontSize: 14,
    marginBottom: 5
  },
  rowValue: {
    color: "#7C2D12",
    fontWeight: "700"
  },
  approveBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center"
  },
  actionWrap: {
    marginTop: 12
  },
  approveBtnDisabled: {
    opacity: 0.7
  },
  approveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  rejectBtn: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DC2626"
  },
  rejectBtnDisabled: {
    opacity: 0.7
  },
  rejectText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "800"
  }
});
