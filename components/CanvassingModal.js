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
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editItem) {
      setFullName(editItem.full_name || '');
      setPhone(editItem.phone || '');
      setSegmentation(editItem.segmentation || 'KUAT');
      setNotes(editItem.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setSegmentation('KUAT');
      setNotes('');
    }
  }, [editItem, visible]);

  const segmentationOptions = [
    { label: 'Pasti Dukung (KUAT)', value: 'KUAT', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Ragu-ragu (CONDONG)', value: 'CONDONG', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Mengambang', value: 'MENGAMBANG', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Menolak', value: 'MENOLAK', color: '#DC2626', bg: '#FEE2E2' },
  ];

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validasi', 'Mohon isi nama lengkap calon pemilih / warga.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        segmentation,
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

          <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
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
});
