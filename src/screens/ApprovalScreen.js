import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import TaskCard from '../components/TaskCard';
import OfficerVolunteersModal from '../components/OfficerVolunteersModal';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function ApprovalScreen({
  isOfficer,
  pendingVolunteers,
  assignedTasks,
  onApproveVol,
  onRejectVol,
  onStartTask,
  onCompleteTask,
  apiUrl,
  token,
  user
}) {
  const [volunteersModalVisible, setVolunteersModalVisible] = useState(false);
  const unacceptedTasks = (assignedTasks || []).filter(t => t.status === 'PENDING');

  return (
    <View style={styles.flex1}>
      {isOfficer ? (
        <ScrollView style={styles.flex1}>
          {/* Action Bar for Officer: + Tambah Relawan Baru */}
          <View style={styles.topActionBar}>
            <TouchableOpacity
              style={styles.addVolBtn}
              onPress={() => setVolunteersModalVisible(true)}
            >
              <Feather name="user-plus" size={16} color={WHITE} style={{ marginRight: 8 }} />
              <Text style={styles.addVolBtnText}>+ TAMBAH RELAWAN BARU</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Approvals Section */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Feather name="check-square" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
              <Text style={styles.cardSectionTitle}>Persetujuan Relawan Baru ({pendingVolunteers.length})</Text>
            </View>
            <Text style={styles.cardDescription}>
              Daftar calon relawan yang mendaftar di wilayah Anda dan memerlukan persetujuan berjenjang.
            </Text>
            {pendingVolunteers.length > 0 ? (
              pendingVolunteers.map(v => (
                <View key={v.id} style={[styles.pendingVolItem, { paddingVertical: 12 }]}>
                  <View style={styles.flex1}>
                    <Text style={styles.pendingVolName}>{v.user?.name || v.full_name}</Text>
                    <Text style={styles.pendingVolPhone}>WA: {v.phone || '-'}</Text>
                    <Text style={styles.pendingVolDistrict}>
                      {v.user?.district?.name || 'Kecamatan Magelang'} - {v.user?.subdistrict?.name || ''}
                    </Text>
                    {v.occupation ? <Text style={{ fontSize: 11, color: '#6B7280' }}>Pekerjaan: {v.occupation}</Text> : null}
                    {v.motivation ? <Text style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic', marginTop: 2 }}>Motivasi: {v.motivation}</Text> : null}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={[styles.smallApproveBtn, { backgroundColor: '#16A34A' }]}
                      onPress={() => onApproveVol(v.id)}
                    >
                      <Text style={styles.smallApproveBtnText}>Setujui</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallApproveBtn, { backgroundColor: '#DC2626' }]}
                      onPress={() => onRejectVol(v.id)}
                    >
                      <Text style={styles.smallApproveBtnText}>Tolak</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Feather name="check-circle" size={32} color="#16A34A" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyStateTitle}>Semua Relawan Disetujui</Text>
                <Text style={styles.emptyStateSubtitle}>Tidak ada pendaftaran relawan baru yang menunggu persetujuan.</Text>
              </View>
            )}
          </View>

          {/* Quick Kelola Data Relawan Banner */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Feather name="users" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
              <Text style={styles.cardSectionTitle}>Kelola Data & Status Relawan</Text>
            </View>
            <Text style={styles.cardDescription}>
              Kelola status aktif/nonaktif serta daftar seluruh relawan terdaftar di wilayah keanggotaan Anda.
            </Text>
            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 10 }]}
              onPress={() => setVolunteersModalVisible(true)}
            >
              <Text style={styles.secondaryBtnText}>KELOLA DATA RELAWAN WILAYAH →</Text>
            </TouchableOpacity>
          </View>

          {/* Officer Volunteers Management Modal */}
          <OfficerVolunteersModal
            visible={volunteersModalVisible}
            onClose={() => setVolunteersModalVisible(false)}
            apiUrl={apiUrl}
            token={token}
            user={user}
          />
        </ScrollView>
      ) : (
        /* VOLUNTEER INBOX VIEW: Tasks that are PENDING (unaccepted) */
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Feather name="inbox" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
            <Text style={styles.cardSectionTitle}>Inbox Penugasan Baru ({unacceptedTasks.length})</Text>
          </View>
          <Text style={styles.cardDescription}>
            Daftar penugasan kegiatan harian baru yang ditugaskan kepada Anda dan belum diterima.
          </Text>

          {unacceptedTasks.length > 0 ? (
            unacceptedTasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                isOfficer={false}
                onStartTask={onStartTask}
                onCompleteTask={onCompleteTask}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Feather name="inbox" size={36} color="#16A34A" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyStateTitle}>Inbox Kosong</Text>
              <Text style={styles.emptyStateSubtitle}>Tidak ada penugasan baru yang menunggu diterima saat ini.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  topActionBar: {
    marginBottom: 12,
  },
  addVolBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  addVolBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  secondaryBtnText: {
    color: PRIMARY_BLUE,
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    backgroundColor: WHITE,
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
  pendingVolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pendingVolName: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  pendingVolPhone: {
    fontSize: 11,
    color: '#6B7280',
  },
  pendingVolDistrict: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  smallApproveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallApproveBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
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
