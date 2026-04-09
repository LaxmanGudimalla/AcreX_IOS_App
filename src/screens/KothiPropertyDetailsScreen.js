import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createPlotDealerListing,
  getBlocksBySector,
  getPocketsByBlock,
  getSectors
} from "../services/api";

const KothiPropertyDetailsScreen = ({ navigation }) => {
  const [sectorId, setSectorId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [size, setSize] = useState("");
  const [bhk, setBhk] = useState("");
  const [readyToMove, setReadyToMove] = useState(null);
  const [askingPrice, setAskingPrice] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [pockets, setPockets] = useState([]);

  const [showSector, setShowSector] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showPocket, setShowPocket] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bhkOptions = [1, 2, 3, 4];

  useEffect(() => {
    loadSectors();
  }, []);

  const loadSectors = async () => {
    try {
      const res = await getSectors();
      setSectors(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const closeAllDropdowns = () => {
    setShowSector(false);
    setShowBlock(false);
    setShowPocket(false);
  };

  const handleSectorChange = async (id) => {
    setSectorId(id);
    setBlockId("");
    setPocketId("");
    setBlocks([]);
    setPockets([]);
    setShowSector(false);
    setShowBlock(false);
    setShowPocket(false);

    try {
      const res = await getBlocksBySector(id);
      setBlocks(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlockChange = async (id) => {
    setBlockId(id);
    setPocketId("");
    setPockets([]);
    setShowBlock(false);
    setShowPocket(false);

    try {
      const res = await getPocketsByBlock(id);
      setPockets(res.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePocketChange = (id) => {
    setPocketId(id);
    setShowPocket(false);
  };

  const validateForm = () => {
    if (
      !sectorId ||
      !blockId ||
      !pocketId ||
      !plotNumber ||
      !size ||
      !bhk ||
      readyToMove === null ||
      !askingPrice ||
      !address ||
      !description
    ) {
      Alert.alert("Missing details", "Please fill all required fields.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const userData = await AsyncStorage.getItem("userData");

      if (!userData) {
        Alert.alert("Session expired", "User not found. Please login again.");
        return;
      }

      const user = JSON.parse(userData);

      const payload = {
        sector_id: Number(sectorId),
        block_id: Number(blockId),
        pocket_id: Number(pocketId),
        plot_number: Number(plotNumber),
        dealer_id: user.user_id,
        property_type: "kothi",
        size: size.trim(),
        bhk: Number(bhk),
        ready_to_move: readyToMove,
        asking_price: Number(askingPrice),
        address: address.trim(),
        description: description.trim()
      };

      const response = await createPlotDealerListing(payload);
      const responseData = response?.data?.data ?? response?.data ?? {};
      const ownerApprovalStatus = String(
        responseData?.owner_approval_status || ""
      ).toLowerCase();
      const storedRole = await AsyncStorage.getItem("userRole");
      const currentRole = String(user?.role || storedRole || "").toLowerCase();

      const isOwnerDuplicate =
        currentRole === "dealer" && ownerApprovalStatus === "pending";

      const message = isOwnerDuplicate
        ? "This property was already uploaded by the Owner. It is now pending Owner and Admin approval."
        : "Your listing has been submitted for Admin review.";

      Alert.alert("Submitted Successfully", message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("ListingType")
        }
      ]);
    } catch (error) {
      console.log(error);
      Alert.alert("Failed", "Failed to submit details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    multiline = false
  ) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  const renderDropdown = (
    label,
    selected,
    data,
    show,
    setShow,
    onSelect,
    keyName,
    disabled = false
  ) => {
    const selectedItem = data.find((item) => String(item.id) === String(selected));

    return (
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.dropdownTrigger, disabled && styles.inputDisabled]}
          onPress={() => {
            if (disabled) {
              return;
            }

            closeAllDropdowns();
            setShow(!show);
          }}
        >
          <Text style={[styles.dropdownValue, !selectedItem && styles.dropdownPlaceholder]}>
            {selectedItem ? selectedItem[keyName] : `Select ${label}`}
          </Text>
          <Text style={styles.chevron}>{show ? "^" : "v"}</Text>
        </TouchableOpacity>

        {show && !disabled && (
          <View style={styles.dropdownList}>
            {data.length ? (
              data.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    index === data.length - 1 && styles.dropdownItemLast
                  ]}
                  onPress={() => onSelect(item.id)}
                >
                  <Text style={styles.dropdownItemText}>{item[keyName]}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.dropdownEmpty}>
                <Text style={styles.dropdownEmptyText}>No options available</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.title}>Kothi Property Details</Text>
        <Text style={styles.subtitle}>
          Fill required details and submit for admin verification.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Location</Text>
        {renderDropdown(
          "Sector",
          sectorId,
          sectors,
          showSector,
          setShowSector,
          handleSectorChange,
          "sector_name"
        )}
        {renderDropdown(
          "Block",
          blockId,
          blocks,
          showBlock,
          setShowBlock,
          handleBlockChange,
          "block_name",
          !sectorId
        )}
        {renderDropdown(
          "Pocket",
          pocketId,
          pockets,
          showPocket,
          setShowPocket,
          handlePocketChange,
          "pocket_name",
          !blockId
        )}

        {renderField("Plot Number", "Enter plot number", plotNumber, setPlotNumber, "numeric")}
        {renderField("Size", "Example: 250 sq yd", size, setSize)}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>BHK Type</Text>
          <View style={styles.optionRow}>
            {bhkOptions.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                style={[
                  styles.optionButton,
                  Number(bhk) === item && styles.optionButtonSelected
                ]}
                onPress={() => setBhk(String(item))}
              >
                <Text
                  style={[
                    styles.optionText,
                    Number(bhk) === item && styles.optionTextSelected
                  ]}
                >
                  {item} BHK
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {renderField("Asking Price", "Enter asking price", askingPrice, setAskingPrice, "numeric")}
        {renderField("Address", "Enter full address", address, setAddress, "default", true)}
        {renderField("Description", "Enter description", description, setDescription, "default", true)}

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Ready To Move</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.toggleButton,
                readyToMove === true && styles.toggleButtonSelected
              ]}
              onPress={() => setReadyToMove(true)}
            >
              <Text
                style={[
                  styles.toggleText,
                  readyToMove === true && styles.toggleTextSelected
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.toggleButton,
                readyToMove === false && styles.toggleButtonSelected
              ]}
              onPress={() => setReadyToMove(false)}
            >
              <Text
                style={[
                  styles.toggleText,
                  readyToMove === false && styles.toggleTextSelected
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? "Submitting..." : "Submit For Review"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default KothiPropertyDetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF4F8"
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 40
  },
  heroCard: {
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCE7EF"
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10
  },
  fieldBlock: {
    marginBottom: 14
  },
  label: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500"
  },
  textArea: {
    minHeight: 92,
    paddingTop: 12
  },
  inputDisabled: {
    opacity: 0.55
  },
  dropdownTrigger: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
    flex: 1
  },
  dropdownPlaceholder: {
    color: "#94A3B8"
  },
  chevron: {
    color: "#475569",
    fontSize: 12,
    marginLeft: 8
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E0E8",
    borderRadius: 14,
    overflow: "hidden"
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF2F7"
  },
  dropdownItemLast: {
    borderBottomWidth: 0
  },
  dropdownItemText: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "500"
  },
  dropdownEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  dropdownEmptyText: {
    color: "#94A3B8",
    fontSize: 14
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10
  },
  optionRow: {
    flexDirection: "row",
    gap: 10
  },
  optionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  optionButtonSelected: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A"
  },
  optionText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700"
  },
  optionTextSelected: {
    color: "#FFFFFF"
  },
  toggleButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  toggleButtonSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E"
  },
  toggleText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700"
  },
  toggleTextSelected: {
    color: "#FFFFFF"
  },
  submitBtn: {
    backgroundColor: "#0F766E",
    borderRadius: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  submitBtnDisabled: {
    opacity: 0.7
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  }
});
