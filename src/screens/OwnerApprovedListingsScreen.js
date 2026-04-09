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

import { getOwnerApprovedListings } from "../services/api";

export default function OwnerApprovedListingsScreen() {
  const [approvedListings, setApprovedListings] = useState([]);
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

    if (Array.isArray(payload?.approved_listings)) {
      return payload.approved_listings;
    }

    return [];
  };

  const resolveApprovedListingsByOwner = async (ownerIdCandidates) => {
    for (const candidateId of ownerIdCandidates) {
      try {
        const response = await getOwnerApprovedListings(candidateId);
        const nextList = extractListings(response?.data);
        if (nextList.length > 0) {
          return nextList;
        }
      } catch (error) {
        console.log(error?.response?.data || error?.message);
      }
    }

    try {
      const responseWithoutId = await getOwnerApprovedListings();
      return extractListings(responseWithoutId?.data);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      return [];
    }
  };

  const loadApprovedListings = useCallback(async () => {
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
        Alert.alert("Access denied", "Only owners can access approved listings.");
        setApprovedListings([]);
        return;
      }

      const resolvedApprovedListings = await resolveApprovedListingsByOwner(ownerIdCandidates);
      setApprovedListings(resolvedApprovedListings);
    } catch (error) {
      console.log(error?.response?.data || error?.message);
      setApprovedListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApprovedListings();
    }, [loadApprovedListings])
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
        <Text style={styles.title}>Approved Listings</Text>
        <Text style={styles.subtitle}>
          Listings approved by you are shown here.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={loadApprovedListings}
        disabled={loading}
      >
        <Text style={styles.refreshBtnText}>{loading ? "Loading..." : "Refresh"}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loaderText}>Loading approved listings...</Text>
        </View>
      ) : approvedListings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Approved Listings</Text>
          <Text style={styles.emptySubtitle}>
            Approved listings by owner will appear here.
          </Text>
        </View>
      ) : (
        approvedListings.map((item) => (
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
    backgroundColor: "#F0FDF4"
  },
  content: {
    padding: 18,
    paddingBottom: 34
  },
  heroCard: {
    backgroundColor: "#166534",
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
    backgroundColor: "#16A34A",
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
    color: "#14532D",
    fontSize: 14
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#86EFAC",
    padding: 20
  },
  emptyTitle: {
    color: "#14532D",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6
  },
  emptySubtitle: {
    color: "#166534",
    fontSize: 14,
    lineHeight: 20
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#86EFAC",
    padding: 16,
    marginBottom: 12
  },
  cardTitle: {
    color: "#14532D",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10
  },
  rowText: {
    color: "#166534",
    fontSize: 14,
    marginBottom: 5
  },
  rowValue: {
    color: "#14532D",
    fontWeight: "700"
  }
});
