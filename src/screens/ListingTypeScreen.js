import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ListingTypeScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState(null);

  const listingTypes = [
    {
      title: "Plot",
      description: "Residential or commercial land ready for construction",
      icon: "map-outline",
      screen: "PlotPropertyDetails",
      accent: "#172554",
      iconBg: "#DBEAFE"
    },
    {
      title: "Builder Floor",
      description: "Independent floor within a low-rise residential building",
      icon: "office-building-outline",
      screen: "BuilderFloorPropertyDetails",
      accent: "#111827",
      iconBg: "#E5E7EB"
    },
    //   {
    //   title: "Kothi",
    //   description: "Independent house with floor-wise unit details",
    //   icon: "home-city-outline",
    //   screen: "KothiPropertyDetails",
    //   accent: "#0F766E",
    //   iconBg: "#CCFBF1"
    // },
  ];

  const handleSelect = (item) => {
    setSelectedType(item.title);
    navigation.navigate(item.screen);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Create Listing</Text>
          <Text style={styles.title}>What are you listing?</Text>
          <Text style={styles.subtitle}>
            Choose the property type to open the right form with the correct details.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Property Categories</Text>
          <Text style={styles.sectionHint}>Select one option to continue</Text>
        </View>

        {listingTypes.map((item, index) => {
          const isSelected = selectedType === item.title;

          return (
            <Pressable
              key={index}
              onPress={() => handleSelect(item)}
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: item.accent },
                isSelected && styles.selectedCard,
                pressed && styles.pressedCard
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                <Icon name={item.icon} size={28} color={item.accent} />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDesc}>{item.description}</Text>
              </View>

              <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                  Continue
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB"
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 32
  },

  heroCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    marginBottom: 22
  },

  eyebrow: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 21
  },

  sectionHeader: {
    marginBottom: 14
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4
  },

  sectionHint: {
    fontSize: 13,
    color: "#64748B"
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },

  pressedCard: {
    transform: [{ scale: 0.985 }]
  },

  selectedCard: {
    backgroundColor: "#F8FAFC"
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },

  textContainer: {
    flex: 1,
    paddingRight: 12
  },

  optionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4
  },

  optionDesc: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19
  },

  badge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999
  },

  badgeSelected: {
    backgroundColor: "#DCFCE7"
  },

  badgeText: {
    color: "#3730A3",
    fontSize: 12,
    fontWeight: "700"
  },

  badgeTextSelected: {
    color: "#166534"
  }
});
