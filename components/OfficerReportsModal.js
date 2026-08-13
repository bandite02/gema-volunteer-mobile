import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function OfficerReportsModal({
  visible,
  onClose,
  apiUrl,
  token,
  user
}) {
  const [reports, setReports] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const [taskRes, volRes] = await Promise.all([
        axios.get(`${apiUrl}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        }),
        axios.get(`${apiUrl}/volunteers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (volRes.data && volRes.data.status) {
        const vList = Array.isArray(volRes.data.data) ? volRes.data.data : (volRes.data.data.data || []);
        setVolunteers(vList);
      }

      if (taskRes.data && taskRes.data.status) {
        let list = Array.isArray(taskRes.data.data) ? taskRes.data.data : (taskRes.data.data.data || []);
        
        // Filter by officer's district
        if (user?.district_code) {
          list = list.filter(t => !t.district_code || t.district_code === user.district_code);
        }

        // Filter by selected volunteer
        if (selectedVolunteer) {
          list = list.filter(t => 
            t.volunteer?.full_name?.toLowerCase().includes(selectedVolunteer.toLowerCase()) ||
            t.volunteer?.user?.name?.toLowerCase().includes(selectedVolunteer.toLowerCase())
          );
        }

        setReports(list);
      }
    } catch (e) {
      console.log('Error fetching officer daily reports:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchReports();
    }
  }, [visible, token, selectedVolunteer, fromDate, toDate]);

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
              <Feather name="file-text" size={18} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>Laporan Daily Relawan Wilayah</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={DARK_GRAY} />
            </TouchableOpacity>
          </View>

          {/* Filter Bar: Nama Relawan & Range Tanggal */}
          <View style={styles.filterCard}>
            <Text style={styles.filterSectionTitle}>🔍 Filter Laporan Kegiatan</Text>
            
            <TextInput
              style={styles.filterInput}
              placeholder="Filter nama relawan..."
              value={selectedVolunteer}
              onChangeText={setSelectedVolunteer}
              placeholderTextColor="#9CA3AF"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>Dari Tanggal (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="2026-08-01"
                  value={fromDate}
                  onChangeText={setFromDate}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.dateLabel}>Sampai Tanggal (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="2026-08-31"
                  value={toDate}
                  onChangeText={setToDate}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {(selectedVolunteer || fromDate || toDate) ? (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSelectedVolunteer('');
                  setFromDate('');
                  setToDate('');
                }}
              >
                <Text style={styles.resetFilterText}>Reset Filter</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Reports List */}
          <ScrollView style={{ maxHeight: 340 }}>
            {loading ? (
              <ActivityIndicator size="small" color={PRIMARY_BLUE} style={{ marginVertical: 20 }} />
            ) : reports.length > 0 ? (
              reports.map(r => (
                <View key={r.id} style={styles.reportItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportTitle}>{r.title}</Text>
                    <Text style={styles.reportVolunteer}>
                      Relawan: <Text style={{ fontWeight: '700', color: PRIMARY_BLUE }}>{r.volunteer?.full_name || r.volunteer?.user?.name || '-'}</Text>
                    </Text>
                    {r.description ? <Text style={styles.reportDesc}>{r.description}</Text> : null}
                    <Text style={styles.reportDate}>
                      Tanggal: {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}
                    </Text>
                  </View>

                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: r.status === 'COMPLETED' ? '#DCFCE7' : r.status === 'IN_PROGRESS' ? '#E0F2FE' : '#FEF3C7' }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: r.status === 'COMPLETED' ? '#16A34A' : r.status === 'IN_PROGRESS' ? '#0284C7' : '#D97706' }
                    ]}>
                      {r.status === 'COMPLETED' ? 'Selesai' : r.status === 'IN_PROGRESS' ? 'Berjalan' : 'Pending'}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                <Feather name="inbox" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 13, color: DARK_GRAY, fontWeight: '700' }}>Tidak Ada Laporan Daily</Text>
                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Tidak ada laporan kegiatan yang sesuai dengan filter saat ini</Text>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '85%',
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  filterCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: DARK_GRAY,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  resetFilterBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  resetFilterText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '700',
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  reportVolunteer: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  reportDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reportDate: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
