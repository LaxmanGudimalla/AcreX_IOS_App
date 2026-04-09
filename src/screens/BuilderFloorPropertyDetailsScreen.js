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
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createPlotDealerListing,
  getBlocksBySector,
  getPocketsByBlock,
  getSectors,
  getFilters
} from "../services/api";

const BuilderFloorPropertyDetailsScreen = ({ navigation }) => {
  const [sectorId, setSectorId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [pocketId, setPocketId] = useState("");
  const [plotNumber, setPlotNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");

  const [bhk, setBhk] = useState(null);
  const [readyToMove, setReadyToMove] = useState(null);
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Your listing has been submitted for Admin review."
  );
  const [activeDateField, setActiveDateField] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [sectors, setSectors] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [floorNumberOptions, setFloorNumberOptions] = useState([]);

  const [showSector, setShowSector] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [showPocket, setShowPocket] = useState(false);
  const [showFloorNumber, setShowFloorNumber] = useState(false);

  const bhkOptions = [1, 2, 3, 4];
  const floorNumberPlaceholder = "Floor";

  useEffect(() => {
    loadSectors();
    fetchFloorFilters(); // ✅ ADD THIS
  }, []);

  const loadSectors = async () => {
    try {
      const res = await getSectors();
      setSectors(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchFloorFilters = async () => {
  try {
    const res = await getFilters("builder_floor");
    setFloorNumberOptions(res.data.floor_filters || []);
  } catch (error) {
    console.log("Error fetching filters:", error);
  }
};

  const closeAllDropdowns = () => {
    setShowSector(false);
    setShowBlock(false);
    setShowPocket(false);
    setShowFloorNumber(false);
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
      setBlocks(res.data);
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
      setPockets(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePocketChange = (id) => {
    setPocketId(id);
    setShowPocket(false);
  };

  const handleFloorNumberChange = (value) => {
    setFloorNumber(value);
    setShowFloorNumber(false);
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

  const openDatePicker = (fieldName, value) => {
    const { year, month, day } = parseDateParts(value);

    setActiveDateField(fieldName);
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    setActiveDateField("");
  };

  const applySelectedDate = () => {
    if (!selectedYear || !selectedMonth || !selectedDay || !activeDateField) {
      closeDatePicker();
      return;
    }

    const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;

    if (activeDateField === "startDate") {
      setStartDate(formattedDate);
    }

    if (activeDateField === "deliveryDate") {
      setDeliveryDate(formattedDate);
    }

    if (activeDateField === "paymentDate") {
      setPaymentDate(formattedDate);
    }

    closeDatePicker();
  };

 const handleSubmit = async () => {
  try {
   if (
  !sectorId ||
  !blockId ||
  !pocketId ||
  !plotNumber ||
  (floorNumber === "" || floorNumber === null || floorNumber === undefined) ||
  !bhk
) {
  alert("Please fill all required fields");
  return;
}

    // 👇 GET LOGGED-IN USER
    const userData = await AsyncStorage.getItem("userData");

    if (!userData) {
      alert("User not found. Please login again.");
      return;
    }

    const user = JSON.parse(userData);

    const payload = {
      sector_id: Number(sectorId),
      block_id: Number(blockId),
      pocket_id: Number(pocketId),
      plot_number: Number(plotNumber),
      dealer_id: user.user_id, // ✅ ONLY CHANGE
      property_type: "builder_floor",
      floor_number: floorNumber,
      bhk: Number(bhk),
      ready_to_move: readyToMove,
      size: size || null,
      asking_price: price ? Number(price) : null,
      payment_date: paymentDate || null,
      start_date: startDate || null,
      delivery_date: deliveryDate || null,
      address: address || null,
      description: description || null
    };

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
    console.log(error);
    alert("Failed to submit details");
  }
};

  const renderField = (
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = "default",
    multiline = false,
    helperText = "",
    maxLength
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
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
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
          <Text style={styles.heroBadgeText}>Builder Floor</Text>
        </View>
        <Text style={styles.title}>Property Details</Text>
        <Text style={styles.subtitle}>
          Add the location, configuration, and pricing details in one clean submission.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Location Details</Text>
          <Text style={styles.sectionSubtitle}>Required for mapping the exact property.</Text>
        </View>

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

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderField("Plot Number", "Enter plot number", plotNumber, setPlotNumber, "numeric")}
          </View>
          <View style={styles.halfWidth}>
            {renderDropdown(
              floorNumberPlaceholder,
              floorNumber,
              floorNumberOptions.map(item => ({
    id: item.value,     // ✅ VERY IMPORTANT
    label: item.label
  })),
              showFloorNumber,
              setShowFloorNumber,
              handleFloorNumberChange,
              "label"
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Property Configuration</Text>
          <Text style={styles.sectionSubtitle}>Highlight what the buyer will get.</Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>BHK Type</Text>
          <View style={styles.optionRow}>
            {bhkOptions.map((item) => (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                style={[
                  styles.optionButton,
                  bhk === item && styles.optionButtonSelected
                ]}
                onPress={() => setBhk(item)}
              >
                <Text
                  style={[
                    styles.optionText,
                    bhk === item && styles.optionTextSelected
                  ]}
                >
                  {item} BHK
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Ready To Move</Text>
          <View style={styles.toggleRow}>
            {[true, false].map((value) => (
              <TouchableOpacity
                key={String(value)}
                activeOpacity={0.85}
                style={[
                  styles.toggleButton,
                  readyToMove === value && styles.toggleButtonSelected
                ]}
                onPress={() => setReadyToMove(value)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    readyToMove === value && styles.toggleTextSelected
                  ]}
                >
                  {value ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderField("Size", "Enter size", size, setSize)}
          </View>
          <View style={styles.halfWidth}>
            {renderField("Price", "Enter price", price, setPrice)}
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderDateField("Start Date", startDate, () => openDatePicker("startDate", startDate))}
          </View>
          <View style={styles.halfWidth}>
            {renderDateField(
              "Delivery Date",
              deliveryDate,
              () => openDatePicker("deliveryDate", deliveryDate)
            )}
          </View>
        </View>

        <View style={styles.twoColumnRow}>
          <View style={styles.halfWidth}>
            {renderDateField(
              "Payment Date",
              paymentDate,
              () => openDatePicker("paymentDate", paymentDate)
            )}
          </View>
        </View>

        {renderField("Address", "Enter full address", address, setAddress, "default", true)}
        {renderField("Description", "Enter description", description, setDescription, "default", true)}
      </View>

      <TouchableOpacity activeOpacity={0.9} style={styles.submitBtn} onPress={handleSubmit}>
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

export default BuilderFloorPropertyDetailsScreen;

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
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6
  },

  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 14
  },

  heroBadgeText: {
    color: "#BFDBFE",
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
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 22
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DCE7EF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
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
    marginBottom: 18
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

  helperText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 6
  },

  inputDisabled: {
    opacity: 0.55
  },

  dropdownTrigger: {
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

  dropdownValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: 12
  },

  dropdownPlaceholder: {
    color: "#94A3B8"
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

  twoColumnRow: {
    flexDirection: "row",
    gap: 12
  },

  halfWidth: {
    flex: 1
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },

  optionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 18,
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

  toggleRow: {
    flexDirection: "row",
    gap: 12
  },

  toggleButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
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
    borderRadius: 18,
    minHeight: 58,
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
    fontSize: 16,
    fontWeight: "800",
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

  yearInputRow: {
    marginBottom: 12
  },

  yearInputLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6
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

  selectedDatePreview: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.4
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
