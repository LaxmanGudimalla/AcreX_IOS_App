import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function OwnerListingsScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.title}>Listings</Text>
        <Text style={styles.subtitle}>
          Choose which owner listings you want to view.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.optionCard, styles.pendingCard]}
        onPress={() => navigation.navigate("OwnerPendingListings")}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconWrap, styles.pendingIconWrap]}>
            <Ionicons name="time-outline" size={26} color="#C2410C" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.optionTitle}>Pending Listings</Text>
            <Text style={styles.optionSubtitle}>Review and approve dealer listing requests</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#C2410C" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, styles.approvedCard]}
        onPress={() => navigation.navigate("OwnerApprovedListings")}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconWrap, styles.approvedIconWrap]}>
            <Ionicons name="checkmark-done-outline" size={26} color="#15803D" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.optionTitle}>Approved Listings</Text>
            <Text style={styles.optionSubtitle}>See listings that were approved by you</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#15803D" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.optionCard, styles.rejectedCard]}
        onPress={() => navigation.navigate("OwnerRejectedListings")}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconWrap, styles.rejectedIconWrap]}>
            <Ionicons name="close-circle-outline" size={26} color="#B91C1C" />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.optionTitle}>Rejected Listings</Text>
            <Text style={styles.optionSubtitle}>See listings that were rejected by you</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#B91C1C" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF3F8"
  },
  content: {
    padding: 18,
    paddingBottom: 30
  },
  heroCard: {
    backgroundColor: "#123458",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16
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
  optionCard: {
    minHeight: 124,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#102A43",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5
  },
  pendingCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FDBA74"
  },
  rejectedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FECACA"
  },
  approvedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#BBF7D0"
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  pendingIconWrap: {
    backgroundColor: "#FFEDD5"
  },
  rejectedIconWrap: {
    backgroundColor: "#FEE2E2"
  },
  approvedIconWrap: {
    backgroundColor: "#DCFCE7"
  },
  textWrap: {
    marginLeft: 14,
    flex: 1
  },
  optionTitle: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 18
  },
  optionSubtitle: {
    marginTop: 4,
    color: "#475569",
    fontSize: 13,
    lineHeight: 18
  }
});
