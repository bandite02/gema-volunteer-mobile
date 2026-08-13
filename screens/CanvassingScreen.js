import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import CanvassingModal from '../components/CanvassingModal';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';

export default function CanvassingScreen({ apiUrl, token, user }) {
  const [canvassings, setCanvassings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const segmentationOptions = [
    { label: 'Pasti Dukung (KUAT)', value: 'KUAT', color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Ragu-ragu (CONDONG)', value: 'CONDONG', color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Mengambang', value: 'MENGAMBANG', color: '#D97706', bg: '#FEF3C7' },
    { label: 'Menolak', value: 'MENOLAK', color: '#DC2626', bg: '#FEE2E2' },
  ];

  const fetchCanvassingList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/canvassing-prospects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.status) {
        const data = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
        setCanvassings(data);
      }
    } catch (e) {
      console.log('Error fetching canvassing prospects:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanvassingList();
  }, [token]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDeleteCanvassing = (id, name) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus data pendataan canvassing "${name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await axios.delete(`${apiUrl}/canvassing-prospects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (res.data && res.data.status) {
                Alert.alert('Sukses', 'Data canvassing berhasil dihapus.');
                fetchCanvassingList();
              }
            } catch (e) {
              Alert.alert('Error', 'Gagal menghapus data canvassing.');
            }
          }
        }
      ]
    );
  };

  const getSegmentationBadge = (seg) => {
    const opt = segmentationOptions.find(o => o.value === seg) || segmentationOptions[0];
    return (
      <View style={[styles.segmentBadge, { backgroundColor: opt.bg }]}>
        <Text style={[styles.segmentBadgeText, { color: opt.color }]}>{opt.label}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.flex1} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Feather name="users" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
            <Text style={styles.cardSectionTitle}>Hasil Pendataan Canvassing ({canvassings.length})</Text>
          </View>
          <Text style={styles.cardDescription}>
            Daftar pemilih/warga yang telah didata dalam kegiatan canvassing lapangan di wilayah Anda.
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color={PRIMARY_BLUE} style={{ marginVertical: 20 }} />
          ) : canvassings.length > 0 ? (
            canvassings.map(c => (
              <View key={c.id} style={styles.canvassItem}>
                <View style={styles.flex1}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.canvassName}>{c.full_name}</Text>
                    {getSegmentationBadge(c.segmentation)}
                  </View>
                  <Text style={styles.canvassPhone}>WA: {c.phone || '-'}</Text>
                  {c.notes ? <Text style={styles.canvassNotes}>Catatan: {c.notes}</Text> : null}
                </View>

                {/* Edit and Delete Action Buttons */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.iconActionBtn, { backgroundColor: '#E0F2FE' }]}
                    onPress={() => handleOpenEdit(c)}
                  >
                    <Feather name="edit-2" size={14} color="#0284C7" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.iconActionBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleDeleteCanvassing(c.id, c.full_name)}
                  >
                    <Feather name="trash-2" size={14} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Feather name="users" size={36} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateTitle}>Belum Ada Pendataan</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tekan tombol floating (+) di kanan bawah untuk menambahkan data canvassing warga baru.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Canvassing Modal */}
      <CanvassingModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
        }}
        apiUrl={apiUrl}
        token={token}
        user={user}
        editItem={editingItem}
        onCanvassingSaved={() => fetchCanvassingList()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  canvassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  canvassName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  canvassPhone: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  canvassNotes: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
  },
  segmentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  segmentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
