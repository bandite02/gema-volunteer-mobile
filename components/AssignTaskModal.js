import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function AssignTaskModal({
  visible,
  onClose,
  approvedVolunteers,
  user,
  apiUrl,
  onTaskCreated
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [volunteerQuery, setVolunteerQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTaskTitle('');
      setTaskDesc('');
      setSelectedVolunteerId('');
      setVolunteerQuery('');
      setDropdownOpen(false);
    }
  }, [visible]);

  // Filter volunteers strictly by officer's district_code unless SUPERADMIN
  const filteredVolunteers = (approvedVolunteers || []).filter(v => {
    const roleName = (user?.roles?.[0]?.name || user?.role || '').toUpperCase();
    if (roleName.includes('SUPERADMIN')) return true;

    const userDistrict = user?.district_code || user?.district?.code;
    const volDistrict = v.user?.district_code || v.district_code;
    if (!userDistrict || !volDistrict) return true;
    return volDistrict === userDistrict;
  });

  // Autocomplete real-time search filtering by name, phone, subdistrict
  const searchedVolunteers = filteredVolunteers.filter(v => {
    if (!volunteerQuery.trim()) return true;
    const q = volunteerQuery.toLowerCase().trim();
    const name = (v.user?.name || v.full_name || '').toLowerCase();
    const phone = (v.phone || v.user?.email || '').toLowerCase();
    const subdistrict = (v.user?.subdistrict?.name || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || subdistrict.includes(q);
  });

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !selectedVolunteerId) {
      Alert.alert('Validasi', 'Mohon isi judul kegiatan dan pilih relawan penerima tugas dari pencarian.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedVol = filteredVolunteers.find(v => v.id === selectedVolunteerId);
      const payload = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        assigned_to_volunteer_id: selectedVolunteerId,
        district_code: selectedVol?.user?.district_code || user?.district_code || '33.71.01',
        status: 'PENDING'
      };

      const res = await axios.post(`${apiUrl}/tasks`, payload);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Penugasan kegiatan berhasil dikirim ke relawan!');
        onClose();
        if (onTaskCreated) onTaskCreated();
      }
    } catch (e) {
      const msg = e.response?.data?.message;
      let errStr = 'Gagal membuat penugasan task.';
      if (typeof msg === 'object') {
        errStr = Object.values(msg).flat().join('\n');
      } else if (typeof msg === 'string') {
        errStr = msg;
      }
      Alert.alert('Error', errStr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContentCard}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>+ Buat Penugasan Task Baru</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={DARK_GRAY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
            {/* VAutocomplete Equivalent in React Native */}
            <Text style={styles.inputLabel}>
              Pilih Relawan Wilayah {user?.district?.name || 'Anda'} <Text style={{ color: '#DC2626' }}>*</Text>
            </Text>

            <View style={styles.autocompleteContainer}>
              <View style={styles.searchBarRow}>
                <Feather name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.autocompleteInput}
                  placeholder="Ketik & cari nama / WA relawan..."
                  value={volunteerQuery}
                  onChangeText={(text) => {
                    setVolunteerQuery(text);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholderTextColor="#9CA3AF"
                />
                {volunteerQuery ? (
                  <TouchableOpacity onPress={() => { setVolunteerQuery(''); setSelectedVolunteerId(''); setDropdownOpen(true); }}>
                    <Feather name="x-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Selected Volunteer Active Badge */}
              {selectedVolunteerId ? (
                <View style={styles.selectedVolChip}>
                  <Feather name="check-circle" size={14} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={styles.selectedVolChipText}>
                    Terpilih: {filteredVolunteers.find(v => v.id === selectedVolunteerId)?.user?.name || filteredVolunteers.find(v => v.id === selectedVolunteerId)?.full_name}
                  </Text>
                </View>
              ) : null}

              {/* Autocomplete Suggestions Box */}
              {dropdownOpen && (
                <View style={styles.suggestionsBox}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }} keyboardShouldPersistTaps="handled">
                    {searchedVolunteers.length > 0 ? (
                      searchedVolunteers.map(v => (
                        <TouchableOpacity
                          key={v.id}
                          style={[
                            styles.suggestionItem,
                            selectedVolunteerId === v.id && styles.suggestionItemActive
                          ]}
                          onPress={() => {
                            setSelectedVolunteerId(v.id);
                            setVolunteerQuery(v.user?.name || v.full_name);
                            setDropdownOpen(false);
                          }}
                        >
                          <Text style={[
                            styles.suggestionName,
                            selectedVolunteerId === v.id && styles.suggestionNameActive
                          ]}>
                            {v.user?.name || v.full_name}
                          </Text>
                          <Text style={[
                            styles.suggestionSub,
                            selectedVolunteerId === v.id && styles.suggestionSubActive
                          ]}>
                            WA: {v.phone || '-'} • {v.user?.subdistrict?.name || 'Kelurahan'}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.emptyTextSubtle}>
                        {filteredVolunteers.length === 0
                          ? `Tidak ada relawan disetujui di wilayah ${user?.district?.name || 'Anda'}.`
                          : `Tidak ada relawan yang cocok dengan "${volunteerQuery}".`}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Judul Kegiatan / Penugasan <Text style={{ color: '#DC2626' }}>*</Text></Text>
            <TextInput
              style={styles.cleanTextInput}
              placeholder="Contoh: Pendataan Canvassing Pemilih RT 03"
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Deskripsi & Instruksi Task</Text>
            <TextInput
              style={[styles.cleanTextInput, styles.textArea]}
              placeholder="Instruksi detail kegiatan harian..."
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />
          </ScrollView>

          <View style={styles.modalFooterRow}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleCreateTask}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={WHITE} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Kirim Task</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 6,
  },
  autocompleteContainer: {
    marginBottom: 4,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  autocompleteInput: {
    flex: 1,
    fontSize: 13,
    color: DARK_GRAY,
    paddingVertical: 6,
  },
  selectedVolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  selectedVolChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  suggestionsBox: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    marginTop: 6,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionItemActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  suggestionName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  suggestionNameActive: {
    color: WHITE,
  },
  suggestionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  suggestionSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cleanTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: DARK_GRAY,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emptyTextSubtle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
  },
  modalSubmitBtnText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 13,
  },
});
