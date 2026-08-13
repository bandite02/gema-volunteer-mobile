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

export default function OfficerVolunteersModal({
  visible,
  onClose,
  apiUrl,
  token,
  user
}) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Volunteer Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.status) {
        const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
        // Filter by officer's district
        const filtered = list.filter(v => !user?.district_code || v.district_code === user.district_code || v.user?.district_code === user.district_code);
        setVolunteers(filtered);
      }
    } catch (e) {
      console.log('Error fetching volunteers:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && token) {
      fetchVolunteers();
    }
  }, [visible, token]);

  const handleCreateVolunteer = async () => {
    if (!name.trim() || !username.trim() || !phone.trim()) {
      Alert.alert('Validasi', 'Nama lengkap, username, dan nomor HP/WA wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        phone: phone.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@gema.org`,
        password,
        identity_number: `${Date.now()}`.slice(0, 16),
        district_code: user?.district_code || '33.71.01',
        subdistrict_code: user?.subdistrict_code || '33.71.01.1001',
        status: 'ACTIVE'
      };

      const res = await axios.post(`${apiUrl}/users`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Relawan baru berhasil ditambahkan!');
        setName('');
        setUsername('');
        setPhone('');
        setEmail('');
        setShowAddForm(false);
        fetchVolunteers();
      }
    } catch (e) {
      const msg = e.response?.data?.message;
      let errStr = 'Gagal menambahkan relawan.';
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

  const handleToggleStatus = async (vol) => {
    const userId = vol.user_id || vol.user?.id;
    if (!userId) {
      Alert.alert('Error', 'ID User tidak ditemukan.');
      return;
    }

    const currentStatus = vol.status || vol.user?.status || 'ACTIVE';
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionText = nextStatus === 'INACTIVE' ? 'menonaktifkan' : 'mengaktifkan';

    Alert.alert(
      'Konfirmasi Status',
      `Apakah Anda yakin ingin ${actionText} relawan "${vol.full_name || vol.user?.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Lanjutkan',
          onPress: async () => {
            try {
              const res = await axios.put(
                `${apiUrl}/users/${userId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (res.data && res.data.status) {
                Alert.alert('Sukses', `Status relawan berhasil diubah menjadi ${nextStatus}.`);
                fetchVolunteers();
              }
            } catch (e) {
              Alert.alert('Error', 'Gagal mengubah status relawan.');
            }
          }
        }
      ]
    );
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="users" size={18} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Kelola Relawan Wilayah</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={DARK_GRAY} />
            </TouchableOpacity>
          </View>

          {showAddForm ? (
            <ScrollView style={{ maxHeight: 400 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY_BLUE, marginBottom: 12 }}>
                + Form Tambah Relawan Baru
              </Text>
              
              <Text style={styles.inputLabel}>Nama Lengkap *</Text>
              <TextInput
                style={styles.cleanTextInput}
                placeholder="Nama lengkap relawan"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Username *</Text>
              <TextInput
                style={styles.cleanTextInput}
                placeholder="Username akun relawan"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Nomor WhatsApp / HP *</Text>
              <TextInput
                style={styles.cleanTextInput}
                placeholder="08123456789"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Alamat Email</Text>
              <TextInput
                style={styles.cleanTextInput}
                placeholder="email@gema.org (Opsional)"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { flex: 1 }]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { flex: 1 }]}
                  onPress={handleCreateVolunteer}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={WHITE} size="small" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Simpan Relawan</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <View style={{ minHeight: 300, maxHeight: 420 }}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddForm(true)}
              >
                <Feather name="plus" size={16} color={WHITE} style={{ marginRight: 6 }} />
                <Text style={styles.addBtnText}>TAMBAH RELAWAN BARU</Text>
              </TouchableOpacity>

              <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {loading ? (
                  <ActivityIndicator size="small" color={PRIMARY_BLUE} style={{ marginVertical: 30 }} />
                ) : volunteers.length > 0 ? (
                  volunteers.map(v => {
                    const isVolActive = (v.status || v.user?.status) === 'ACTIVE';
                    return (
                      <View key={v.id} style={styles.volItemRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.volName}>{v.full_name || v.user?.name}</Text>
                          <Text style={styles.volSub}>WA: {v.phone || v.user?.phone || '-'}</Text>
                          <Text style={styles.volDistrict}>
                            {v.district?.name || 'Magelang'} - {v.subdistrict?.name || ''}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.statusToggleBtn,
                            { backgroundColor: isVolActive ? '#FEE2E2' : '#DCFCE7' }
                          ]}
                          onPress={() => handleToggleStatus(v)}
                        >
                          <Text
                            style={[
                              styles.statusToggleText,
                              { color: isVolActive ? '#DC2626' : '#16A34A' }
                            ]}
                          >
                            {isVolActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <Feather name="users" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                    <Text style={{ fontSize: 13, color: DARK_GRAY, fontWeight: '700' }}>Belum Ada Data Relawan</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Klik tombol di atas untuk menambah relawan baru</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
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
    maxHeight: 520,
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
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  addBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  cleanTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: DARK_GRAY,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 12,
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 12,
  },
  volItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  volName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  volSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  volDistrict: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
