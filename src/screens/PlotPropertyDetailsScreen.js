import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  createPlotDealerListing,
  getBlocksBySector,
  getPocketsByBlock,
  getSectors,
  getFilters   // ✅ ADD
} from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlotPropertyDetailsScreen = ({ navigation }) => {
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Your listing has been submitted for Admin review."
  );
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [plotNumber, setPlotNumber] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [pocketId, setPocketId] = useState("");

  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showPocketDropdown, setShowPocketDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  useEffect(() => {
    loadSectors();
    fetchSizeFilters(); // ✅ ADD
  }, []);

  const loadSectors = async () => {
    try {
      const res = await getSectors();
      setSectors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSizeFilters = async () => {
  try {
    const res = await getFilters("plot");
    setSizeOptions(res.data.size_filters || []);
  } catch (error) {
    console.log("Error fetching size filters:", error);
  }
};

  const closeAllDropdowns = () => {
    setShowSectorDropdown(false);
    setShowBlockDropdown(false);
    setShowPocketDropdown(false);
    setShowSizeDropdown(false);
  };

  const handleSectorChange = async (value) => {
    setSectorId(value);
    setBlockId("");
    setPocketId("");
    setBlocks([]);
    setPockets([]);
    setShowSectorDropdown(false);
    setShowBlockDropdown(false);
    setShowPocketDropdown(false);

    try {
      const res = await getBlocksBySector(value);
      setBlocks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleBlockChange = async (value) => {
    setBlockId(value);
    setPocketId("");
    setPockets([]);
    setShowBlockDropdown(false);
    setShowPocketDropdown(false);

    try {
      const res = await getPocketsByBlock(value);
      setPockets(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePocketChange = (value) => {
    setPocketId(value);
    setShowPocketDropdown(false);
  };

  const yearOptions = Array.from({ length: 31 }, (_, index) => String(2010 + index));
  const monthOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  const getDaysInMonth = (year, month) => {
    if (!year || !month) {
      return 31;
    }

    return new Date(Number(year), Number(month), 0).getDate();
  };

  const dayOptions = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, index) => String(index + 1).padStart(2, "0")
  );

  const parseDateParts = (value) => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      return { year, month, day };
    }

    const today = new Date();
    return {
      year: String(today.getFullYear()),
      month: String(today.getMonth() + 1).padStart(2, "0"),
      day: String(today.getDate()).padStart(2, "0")
    };
  };

  const openDatePicker = (value) => {
    const { year, month, day } = parseDateParts(value);

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const applySelectedDate = () => {
    if (!selectedYear || !selectedMonth || !selectedDay) {
      closeDatePicker();
      return;
    }

    setPaymentDate(`${selectedYear}-${selectedMonth}-${selectedDay}`);
    closeDatePicker();
  };

const handleSubmit = async () => {
  try {
    if (!sectorId || !blockId || !pocketId || !plotNumber) {
      alert("Please fill all required fields");
      return;
    }

    const userData = await AsyncStorage.getItem("userData");

    // ✅ SAFETY CHECK
    if (!userData) {
      alert("User not found. Please login again.");
      return;
    }

    const user = JSON.parse(userData);

    if (!user || !user.user_id) {
      alert("Invalid user data. Please login again.");
      return;
    }

    const payload = {
      sector_id: Number(sectorId),
      block_id: Number(blockId),
      pocket_id: Number(pocketId),
      plot_number: Number(plotNumber),
      dealer_id: user.user_id, // ✅ CORRECT
      property_type: "plot",
      size: size || null,
      asking_price: price ? Number(price) : null,
      payment_date: paymentDate || null,
      description: description || null,
      address: address || null
    };

    console.log("PAYLOAD:", payload);

    const response = await createPlotDealerListing(payload);
    const responseData = response?.data?.data ?? response?.data ?? {};
    const ownerApprovalStatus = String(
      responseData?.owner_approval_status || ""
    ).toLowerCase();
    const storedRole = await AsyncStorage.getItem("userRole");
    const currentRole = String(user?.role || storedRole || "").toLowerCase();

    if (currentRole === "dealer" && ownerApprovalStatus === "pending") {
      setSuccessMessage(
        "This property was already uploaded by the Owner. It is now pending Owner and Admin approval."
      );
    } else {
      setSuccessMessage("Your listing has been submitted for Admin review.");
    }

    setShowSuccessModal(true);

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);
    alert("Failed to submit listing");
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

  const renderDateField = (label, value, onPress) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity activeOpacity={0.85} style={styles.input} onPress={onPress}>
        <Text style={[styles.dateValue, !value && styles.dropdownPlaceholder]}>
          {value || "YYYY-MM-DD"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDropdown = (
    label,
    selectedValue,
    show,
    setShow,
    data,
    onSelect,
    keyName,
    disabled = false
  ) => {
    const selectedItem = data.find((item) => String(item.id) === String(selectedValue));

    return (
      <View style={[styles.fieldBlock, show && styles.dropdownFieldActive]}>
        <Text style={styles.label}>{label}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.dropdownBtn, disabled && styles.inputDisabled]}
          onPress={() => {
            if (disabled) {
              return;
            }

            closeAllDropdowns();
            setShow(!show);
          }}
        >
          <Text style={[styles.dropdownText, !selectedItem && styles.dropdownPlaceholder]}>
            {selectedItem ? selectedItem[keyName] : `Select ${label}`}
          </Text>
          <View style={[styles.chevronWrap, show && styles.chevronWrapActive]}>
            <View style={styles.chevronInner}>
              <View style={[styles.chevronLine, styles.chevronLineLeft, show && styles.chevronLineActive]} />
              <View style={[styles.chevronLine, styles.chevronLineRight, show && styles.chevronLineActive]} />
            </View>
          </View>
        </TouchableOpacity>

        {show && !disabled && (
          <Modal
            visible={show}
            transparent
            animationType="fade"
            onRequestClose={closeAllDropdowns}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.dropdownModalOverlay}
              onPress={closeAllDropdowns}
            >
              <TouchableOpacity activeOpacity={1} style={styles.dropdownModalCard}>
                <Text style={styles.dropdownModalTitle}>{label}</Text>
                {data.length ? (
                  <ScrollView
                    style={styles.dropdownScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled"
                  >
                    {data.map((item, index) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.dropdownItem,
                          index === data.length - 1 && styles.dropdownItemLast
                        ]}
                        onPress={() => {
                          onSelect(item.id);
                          closeAllDropdowns();
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{item[keyName]}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.dropdownEmpty}>
                    <Text style={styles.dropdownEmptyText}>No options available</Text>
                  </View>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
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
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>Plot Listing</Text>
        </View>
        <Text style={styles.title}>Plot Details</Text>
        <Text style={styles.subtitle}>
          Add the exact location, pricing, and short notes before sending it for review.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <Text style={styles.sectionSubtitle}>Choose the sector, block, and pocket first.</Text>
        </View>

        {renderDropdown(
          "Sector",
          sectorId,
          showSectorDropdown,
          setShowSectorDropdown,
          sectors,
          handleSectorChange,
          "sector_name"
        )}

        {renderDropdown(
          "Block",
          blockId,
          showBlockDropdown,
          setShowBlockDropdown,
          blocks,
          handleBlockChange,
          "block_name",
          !sectorId
        )}

        {renderDropdown(
          "Pocket",
          pocketId,
          showPocketDropdown,
          setShowPocketDropdown,
          pockets,
          handlePocketChange,
          "pocket_name",
          !blockId
        )}

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderField("Plot Number", "Enter plot number", plotNumber, setPlotNumber, "numeric")}
          </View>
          <View style={styles.halfWidth}>
            {
            renderDropdown(
  "Plot Size",
  size,
  showSizeDropdown,
  setShowSizeDropdown,
  sizeOptions.map(item => ({
    id: item,
    label: item
  })),
  setSize,
  "label"
)
}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Commercial Details</Text>
          <Text style={styles.sectionSubtitle}>Share the core sale details for this plot.</Text>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderField("Price", "Enter price", price, setPrice)}
          </View>
          <View style={styles.halfWidth}>
            {renderDateField("Payment Date", paymentDate, () => openDatePicker(paymentDate))}
          </View>
        </View>

        {renderField("Address", "Enter address", address, setAddress, "default", true)}
        {renderField("Description", "Enter description", description, setDescription, "default", true)}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.9}>
        <Text style={styles.submitText}>Submit For Review</Text>
      </TouchableOpacity>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalTopRow}>
              <View>
                <Text style={styles.modalEyebrow}>Custom Date Picker</Text>
                <Text style={styles.modalTitle}>Select Date</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeDatePicker}>
                <Text style={styles.modalCloseText}>X</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Selected Date</Text>
              <Text style={styles.selectedDatePreview}>
                {selectedYear && selectedMonth && selectedDay
                  ? `${selectedYear}-${selectedMonth}-${selectedDay}`
                  : "YYYY-MM-DD"}
              </Text>
            </View>

            <View style={styles.yearInputRow}>
              <Text style={styles.yearInputLabel}>Type Year</Text>
              <TextInput
                style={styles.yearInput}
                value={selectedYear}
                onChangeText={(value) =>
                  setSelectedYear(value.replace(/\D/g, "").slice(0, 4))
                }
                keyboardType="numeric"
                maxLength={4}
                placeholder="YYYY"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.datePickerColumns}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerList}>
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.dateOption,
                        selectedYear === year && styles.dateOptionSelected
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          selectedYear === year && styles.dateOptionTextSelected
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerList}>
                  {monthOptions.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.dateOption,
                        selectedMonth === month && styles.dateOptionSelected
                      ]}
                      onPress={() => setSelectedMonth(month)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          selectedMonth === month && styles.dateOptionTextSelected
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Date</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.datePickerList}>
                  {dayOptions.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateOption,
                        selectedDay === day && styles.dateOptionSelected
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.dateOptionText,
                          selectedDay === day && styles.dateOptionTextSelected
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={closeDatePicker}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={applySelectedDate}>
                <Text style={styles.modalPrimaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Text style={styles.successIcon}>OK</Text>
            </View>
            <Text style={styles.successTitle}>Submitted Successfully</Text>
            <Text style={styles.successSubtitle}>
              {successMessage}
            </Text>

            <TouchableOpacity
              style={styles.successBtn}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate("ListingType");
              }}
            >
              <Text style={styles.successBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PlotPropertyDetailsScreen;

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
    backgroundColor: "#172554",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#172554",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1D4ED8",
    borderWidth: 1,
    borderColor: "#60A5FA",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14
  },

  heroBadgeText: {
    color: "#DBEAFE",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 10
  },

  subtitle: {
    color: "#D6E4FF",
    fontSize: 14,
    lineHeight: 22
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#DCE7EF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: "visible"
  },

  sectionHeader: {
    marginBottom: 14
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4
  },

  sectionSubtitle: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8
  },

  fieldBlock: {
    marginBottom: 18,
    position: "relative"
  },

  dropdownFieldActive: {
    zIndex: 1000,
    elevation: 1000
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8
  },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500"
  },

  dateValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500"
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14
  },

  inputDisabled: {
    opacity: 0.55
  },

  dropdownBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  dropdownText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: 12
  },

  dropdownPlaceholder: {
    color: "#94A3B8"
  },

  chevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#D8E1EA",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },

  chevronWrapActive: {
    backgroundColor: "#E0ECFF",
    borderColor: "#BBD3FF"
  },

  chevronInner: {
    width: 12,
    height: 8,
    position: "relative"
  },

  chevronLine: {
    position: "absolute",
    width: 7,
    height: 2.2,
    borderRadius: 2,
    backgroundColor: "#475569",
    top: 3
  },

  chevronLineLeft: {
    left: 0,
    transform: [{ rotate: "38deg" }]
  },

  chevronLineRight: {
    right: 0,
    transform: [{ rotate: "-38deg" }]
  },

  chevronLineActive: {
    backgroundColor: "#2563EB"
  },

  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.2)",
    justifyContent: "center",
    paddingHorizontal: 24
  },

  dropdownModalCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E0E8",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },

  dropdownModalTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12
  },

  dropdownScroll: {
    maxHeight: 320
  },

  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    paddingHorizontal: 16,
    paddingVertical: 14
  },

  dropdownEmptyText: {
    color: "#94A3B8",
    fontSize: 14
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
    overflow: "visible"
  },

  halfWidth: {
    flex: 1
  },

  submitBtn: {
    backgroundColor: "#0F766E",
    minHeight: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#0F766E",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },

  submitText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.2
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 28
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCE7EF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6
  },

  modalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16
  },

  modalEyebrow: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6
  },

  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#D8E1EA",
    alignItems: "center",
    justifyContent: "center"
  },

  modalCloseText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "800"
  },

  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24
  },

  previewCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    alignItems: "center"
  },

  previewLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },

  selectedDatePreview: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4
  },

  yearInputRow: {
    marginBottom: 12
  },

  yearInputLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6
  },

  yearInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E1EA",
    borderRadius: 12,
    minHeight: 40,
    paddingHorizontal: 10,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },

  datePickerColumns: {
    flexDirection: "row",
    gap: 8
  },

  datePickerColumn: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },

  datePickerLabel: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center"
  },

  datePickerList: {
    maxHeight: 150
  },

  dateOption: {
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center"
  },

  dateOptionSelected: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
    shadowColor: "#0F766E",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },

  dateOptionText: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700"
  },

  dateOptionTextSelected: {
    color: "#FFFFFF"
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },

  modalSecondaryBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },

  modalSecondaryText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700"
  },

  modalPrimaryBtn: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F766E",
    shadowColor: "#0F766E",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },

  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800"
  },

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE7EF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6
  },

  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },

  successIcon: {
    color: "#15803D",
    fontSize: 20,
    fontWeight: "800"
  },

  successTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center"
  },

  successSubtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 20
  },

  successBtn: {
    minWidth: 140,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#0F766E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F766E",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },

  successBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  }
});
