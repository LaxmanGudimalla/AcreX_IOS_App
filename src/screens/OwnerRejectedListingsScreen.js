import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getOwnerRejectedListings } from "../services/api";

export default function OwnerRejectedListingsScreen() {
  const [rejectedListings, setRejectedListings] = useState([]);
  const [loading, setLoading] = useState(true);

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

    if (Array.isArray(payload?.rejected_listings)) {
      return payload.rejected_listings;
    }

    return [];
  };

  const isNoListingsError = (error) => {
    const status = error?.response?.status;
    return status === 404 || status === 204;
  };

  const resolveRejectedListingsByOwner = async (ownerIdCandidates) => {
    for (const candidateId of ownerIdCandidates) {
      try {
        const response = await getOwnerRejectedListings(candidateId);
        const nextList = extractListings(response?.data);
        if (nextList.length > 0) {
          return nextList;
        }
      } catch (error) {
        console.log(error?.response?.data || error?.message);
      }
    }

    try {
      const responseWithoutId = await getOwnerRejectedListings();
      return extractListings(responseWithoutId?.data);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      return [];
    }
  };

  const loadRejectedListings = useCallback(async () => {
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
        Alert.alert("Access denied", "Only owners can access rejected listings.");
        setRejectedListings([]);
        return;
      }

      const resolvedRejectedListings = await resolveRejectedListingsByOwner(ownerIdCandidates);
      setRejectedListings(resolvedRejectedListings);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      setRejectedListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRejectedListings();
    }, [loadRejectedListings])
  );

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
        <Text style={styles.title}>Rejected Listings</Text>
        <Text style={styles.subtitle}>
          Listings rejected by you are shown here.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={loadRejectedListings}
        disabled={loading}
      >
        <Text style={styles.refreshBtnText}>{loading ? "Loading..." : "Refresh"}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#B91C1C" />
          <Text style={styles.loaderText}>Loading rejected listings...</Text>
        </View>
      ) : rejectedListings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Rejected Listings</Text>
          <Text style={styles.emptySubtitle}>
            Rejected listings by owner will appear here.
          </Text>
        </View>
      ) : (
        rejectedListings.map((item) => (
          <View key={String(item?.id)} style={styles.card}>
            <Text style={styles.cardTitle}>Listing #{renderValue(item?.id)}</Text>
            <Text style={styles.rowText}>
              Plot ID: <Text style={styles.rowValue}>{renderValue(item?.plot_id)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Plot Number: <Text style={styles.rowValue}>{renderValue(item?.plot_number)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Dealer ID: <Text style={styles.rowValue}>{renderValue(item?.dealer_id)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Dealer Name: <Text style={styles.rowValue}>{renderValue(item?.dealer_name)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Asking Price: <Text style={styles.rowValue}>{renderValue(item?.asking_price)}</Text>
            </Text>
            <Text style={styles.rowText}>
              Status: <Text style={styles.rowValue}>{renderValue(item?.owner_approval_status)}</Text>
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF2F2"
  },
  content: {
    padding: 18,
    paddingBottom: 34
  },
  heroCard: {
    backgroundColor: "#7F1D1D",
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
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19
  },
  refreshBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#B91C1C",
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
    color: "#7F1D1D",
    fontSize: 14
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 20
  },
  emptyTitle: {
    color: "#7F1D1D",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6
  },
  emptySubtitle: {
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 16,
    marginBottom: 12
  },
  cardTitle: {
    color: "#7F1D1D",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10
  },
  rowText: {
    color: "#991B1B",
    fontSize: 14,
    marginBottom: 5
  },
  rowValue: {
    color: "#7F1D1D",
    fontWeight: "700"
  }
});
