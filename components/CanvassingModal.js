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

export default function CanvassingModal({
  visible,
  onClose,
  apiUrl,
  token,
  user,
  editItem,
  onCanvassingSaved
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [segmentation, setSegmentation] = useState('KUAT');
  const [maritalStatus, setMaritalStatus] = useState('SINGLE');
  const [hasChildren, setHasChildren] = useState(false);
  const [lines, setLines] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFullName(editItem.full_name || '');
      setPhone(editItem.phone || '');
      setSegmentation(editItem.segmentation || 'KUAT');
      setMaritalStatus(editItem.marital_status || 'SINGLE');
      setHasChildren(Boolean(editItem.has_children));
      if (editItem.lines && editItem.lines.length > 0) {
        setLines(editItem.lines.map(l => ({ child_name: l.child_name || '', education_level: l.education_level || 'SD' })));
      } else {
        setLines([]);
      }
      setNotes(editItem.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setSegmentation('KUAT');
      setMaritalStatus('SINGLE');
      setHasChildren(false);
      setLines([]);
      setNotes('');
    }
  }, [editItem, visible]);

  const segmentationOptions = [
    { label: 'Pasti Dukung (KUAT)', value: 'KUAT', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Ragu-ragu (CONDONG)', value: 'CONDONG', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Mengambang', value: 'MENGAMBANG', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Menolak', value: 'MENOLAK', color: '#DC2626', bg: '#FEE2E2' },
  ];

  const maritalStatusOptions = [
    { label: 'Belum Menikah', value: 'SINGLE' },
    { label: 'Menikah', value: 'MARRIED' },
    { label: 'Duda / Janda', value: 'DIVORCED' },
  ];

  const educationLevels = ['Belum Sekolah', 'TK', 'SD', 'SMP', 'SMA/SMK', 'Diploma', 'S1/S2/S3'];

  const handleAddChild = () => {
    setLines([...lines, { child_name: '', education_level: 'SD' }]);
  };

  const handleRemoveChild = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validasi', 'Mohon isi nama lengkap calon pemilih / warga.');
      return;
    }

    if (hasChildren) {
      if (lines.length === 0) {
        Alert.alert('Validasi', 'Mohon tambahkan minimal 1 data anak atau pilih "Tidak" jika belum memiliki anak.');
        return;
      }
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].child_name.trim()) {
          Alert.alert('Validasi', `Mohon isi nama anak ke-${i + 1}.`);
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        segmentation,
        marital_status: maritalStatus,
        has_children: hasChildren,
        lines: hasChildren ? lines.map(l => ({ child_name: l.child_name.trim(), education_level: l.education_level })) : [],
        notes: notes.trim() || null,
        district_code: user?.district_code || editItem?.district_code || '33.71.01',
        subdistrict_code: user?.subdistrict_code || editItem?.subdistrict_code || '33.71.01.1001',
      };

      if (editItem?.volunteer_id) {
        payload.volunteer_id = editItem.volunteer_id;
      } else if (user?.profile?.id) {
        payload.volunteer_id = user.profile.id;
      }

      let res;
      if (editItem && editItem.id) {
        res = await axios.patch(`${apiUrl}/canvassing-prospects/${editItem.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${apiUrl}/canvassing-prospects`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data && res.data.status) {
        Alert.alert('Sukses', editItem ? 'Data canvassing berhasil diperbarui!' : 'Data pendataan canvassing berhasil ditambahkan!');
        onClose();
        if (onCanvassingSaved) onCanvassingSaved();
      }
    } catch (e) {
      const msg = e.response?.data?.message;
      let errStr = 'Gagal menyimpan pendataan canvassing.';
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
            <Text style={styles.modalTitle}>{editItem ? '✏️ Edit Data Canvassing Warga' : '+ Pendataan Canvassing Warga'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={DARK_GRAY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 460 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.inputLabel}>
              Nama Lengkap Warga / Pemilih <Text style={{ color: '#DC2626' }}>*</Text>
            </Text>
            <TextInput
              style={styles.cleanTextInput}
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Nomor WhatsApp / HP</Text>
            <TextInput
              style={styles.cleanTextInput}
              placeholder="Contoh: 08123456789"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Pilihan Dukungan <Text style={{ color: '#DC2626' }}>*</Text></Text>
            <View style={{ gap: 6, marginBottom: 6 }}>
              {segmentationOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segmentSelectItem,
                    segmentation === opt.value && { backgroundColor: opt.bg, borderColor: opt.color }
                  ]}
                  onPress={() => setSegmentation(opt.value)}
                >
                  <Text
                    style={[
                      styles.segmentSelectItemText,
                      segmentation === opt.value && { color: opt.color, fontWeight: '700' }
                    ]}
                  >
                    {segmentation === opt.value ? '✓ ' : ''}{opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Pernikahan */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Status Pernikahan</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              {maritalStatusOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chipSelectBtn,
                    maritalStatus === opt.value && styles.chipSelectBtnActive
                  ]}
                  onPress={() => setMaritalStatus(opt.value)}
                >
                  <Text style={[
                    styles.chipSelectText,
                    maritalStatus === opt.value && styles.chipSelectTextActive
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Memiliki Anak */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Memiliki Anak?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.chipSelectBtn,
                  hasChildren && styles.chipSelectBtnActive
                ]}
                onPress={() => {
                  setHasChildren(true);
                  if (lines.length === 0) {
                    setLines([{ child_name: '', education_level: 'SD' }]);
                  }
                }}
              >
                <Text style={[styles.chipSelectText, hasChildren && styles.chipSelectTextActive]}>
                  ✓ Ya, Memiliki Anak
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chipSelectBtn,
                  !hasChildren && styles.chipSelectBtnActive
                ]}
                onPress={() => {
                  setHasChildren(false);
                  setLines([]);
                }}
              >
                <Text style={[styles.chipSelectText, !hasChildren && styles.chipSelectTextActive]}>
                  Tidak
                </Text>
              </TouchableOpacity>
            </View>

            {/* List Anak if hasChildren is true */}
            {hasChildren && (
              <View style={styles.childSectionCard}>
                <View style={styles.childHeaderRow}>
                  <Text style={styles.childSectionTitle}>👶 Data Anak ({lines.length})</Text>
                  <TouchableOpacity style={styles.addChildBtn} onPress={handleAddChild}>
                    <Feather name="plus" size={14} color={WHITE} />
                    <Text style={styles.addChildBtnText}>Tambah Anak</Text>
                  </TouchableOpacity>
                </View>

                {lines.map((line, idx) => (
                  <View key={idx} style={styles.childItemCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: PRIMARY_BLUE }}>Anak ke-{idx + 1}</Text>
                      {lines.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveChild(idx)}>
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      style={[styles.cleanTextInput, { marginBottom: 8, backgroundColor: WHITE }]}
                      placeholder="Nama Anak..."
                      value={line.child_name}
                      onChangeText={(val) => handleChildChange(idx, 'child_name', val)}
                      placeholderTextColor="#9CA3AF"
                    />

                    <Text style={{ fontSize: 11, fontWeight: '600', color: DARK_GRAY, marginBottom: 4 }}>Jenjang Pendidikan:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {educationLevels.map(edu => (
                          <TouchableOpacity
                            key={edu}
                            style={[
                              styles.eduChip,
                              line.education_level === edu && styles.eduChipActive
                            ]}
                            onPress={() => handleChildChange(idx, 'education_level', edu)}
                          >
                            <Text style={[
                              styles.eduChipText,
                              line.education_level === edu && styles.eduChipTextActive
                            ]}>
                              {edu}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Catatan / Aspirasi Warga</Text>
            <TextInput
              style={[styles.cleanTextInput, styles.textArea]}
              placeholder="Catatan kebutuhan/aspirasi pemilih..."
              value={notes}
              onChangeText={setNotes}
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
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={WHITE} size="small" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>{editItem ? 'Simpan Perubahan' : 'Simpan Data'}</Text>
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
  segmentSelectItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  segmentSelectItemText: {
    fontSize: 12,
    color: DARK_GRAY,
    fontWeight: '500',
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
  chipSelectBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  chipSelectBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: PRIMARY_BLUE,
  },
  chipSelectText: {
    fontSize: 12,
    color: DARK_GRAY,
    fontWeight: '500',
  },
  chipSelectTextActive: {
    color: PRIMARY_BLUE,
    fontWeight: '700',
  },
  childSectionCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  childHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  childSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  addChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  addChildBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '600',
  },
  childItemCard: {
    backgroundColor: WHITE,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 8,
  },
  eduChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F1F5F9',
  },
  eduChipActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  eduChipText: {
    fontSize: 11,
    color: DARK_GRAY,
  },
  eduChipTextActive: {
    color: WHITE,
    fontWeight: '700',
  },
});

