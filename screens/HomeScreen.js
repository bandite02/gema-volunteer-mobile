import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import TaskCard from '../components/TaskCard';
import OfficerVolunteersModal from '../components/OfficerVolunteersModal';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function HomeScreen({
  user,
  isOfficer,
  assignedTasks,
  pendingVolunteers,
  onOpenAssignModal,
  onApproveVol,
  onRejectVol,
  onStartTask,
  onCompleteTask,
  onGoToApprovalTab,
  onOpenVolunteerForm,
  apiUrl,
  token
}) {
  const [volunteersModalVisible, setVolunteersModalVisible] = useState(false);
  const [volunteersList, setVolunteersList] = useState([]);

  const isRegisteredVolunteer = Boolean(user?.profile || user?.volunteer);

  // Active Tasks Filter (Strictly filter for current volunteer user)
  const userVolId = user?.volunteer?.id || user?.profile?.id;
  const activeTasks = (assignedTasks || []).filter(t => {
    if (t.status === 'COMPLETED') return false;
    if (isOfficer) return true;
    // Volunteer strict assignment check
    if (userVolId && (t.assigned_to_volunteer_id == userVolId)) return true;
    if (t.volunteer && (t.volunteer.user_id == user?.id)) return true;
    return false;
  });

  const pendingTasksCount = (assignedTasks || []).filter(t => {
    if (t.status !== 'PENDING') return false;
    if (isOfficer) return true;
    if (userVolId && (t.assigned_to_volunteer_id == userVolId)) return true;
    if (t.volunteer && (t.volunteer.user_id == user?.id)) return true;
    return false;
  }).length;

  const inProgressTasksCount = (assignedTasks || []).filter(t => {
    if (t.status !== 'IN_PROGRESS') return false;
    if (isOfficer) return true;
    if (userVolId && (t.assigned_to_volunteer_id == userVolId)) return true;
    if (t.volunteer && (t.volunteer.user_id == user?.id)) return true;
    return false;
  }).length;

  const completedTasksCount = (assignedTasks || []).filter(t => {
    if (t.status !== 'COMPLETED') return false;
    if (isOfficer) return true;
    if (userVolId && (t.assigned_to_volunteer_id == userVolId)) return true;
    if (t.volunteer && (t.volunteer.user_id == user?.id)) return true;
    return false;
  }).length;

  useEffect(() => {
    if (isOfficer && token) {
      axios.get(`${apiUrl}/volunteers`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data && res.data.status) {
          const list = Array.isArray(res.data.data) ? res.data.data : (res.data.data.data || []);
          const districtVolunteers = list.filter(v => !user?.district_code || v.district_code === user.district_code || v.user?.district_code === user.district_code);
          setVolunteersList(districtVolunteers);
        }
      }).catch(e => console.log('Error fetching home volunteers:', e.message));
    }
  }, [isOfficer, token, user]);

  const activeVolunteersCount = volunteersList.filter(v => (v.status || v.user?.status) === 'ACTIVE').length || volunteersList.length;

  return (
    <View style={styles.flex1}>
      {/* 0. UNREGISTERED VOLUNTEER WARNING BANNER */}
      {!isOfficer && !isRegisteredVolunteer && (
        <View style={styles.registerWarningCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Feather name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.registerWarningTitle}>Pendaftaran Relawan Belum Lengkap</Text>
          </View>
          <Text style={styles.registerWarningSub}>
            Akun Anda sudah terdaftar, tetapi Anda belum melengkapi formulir data relawan (3 Step). Silakan lengkapi pendaftaran relawan agar bisa mendapatkan tugas di wilayah Anda.
          </Text>
          <TouchableOpacity
            style={styles.registerWarningBtn}
            onPress={onOpenVolunteerForm}
          >
            <Text style={styles.registerWarningBtnText}>LENGKAPI FORM RELAWAN (3 STEP) →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 1. SUMMARY METRIC CARDS FOR OFFICER & VOLUNTEER */}
      {isOfficer ? (
        /* OFFICER METRIC CARDS (3 CARDS) */
        <View style={styles.metricsRow3}>
          {/* Card 1: RELAWAN AKTIF */}
          <View style={[styles.metricCardBox, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#9333EA' }]}>
              <Feather name="users" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#9333EA' }]}>RELAWAN AKTIF</Text>
            <Text style={[styles.metricValue, { color: '#6B21A8' }]}>{activeVolunteersCount} Orang</Text>
            <Text style={styles.metricSub}>Terdaftar Wilayah</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#9333EA' }]} />
          </View>

          {/* Card 2: PENDING PENUGASAN */}
          <View style={[styles.metricCardBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#F59E0B' }]}>
              <Feather name="clock" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#D97706' }]}>PENDING</Text>
            <Text style={[styles.metricValue, { color: '#B45309' }]}>{pendingVolunteers.length} Relawan</Text>
            <Text style={styles.metricSub}>Belum Ditugaskan</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#F59E0B' }]} />
          </View>

          {/* Card 3: TUGAS BERJALAN */}
          <View style={[styles.metricCardBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#0284C7' }]}>
              <Feather name="navigation" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#0284C7' }]}>BERJALAN</Text>
            <Text style={[styles.metricValue, { color: '#0369A1' }]}>{inProgressTasksCount} Task</Text>
            <Text style={styles.metricSub}>Sedang Berjalan</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#0284C7' }]} />
          </View>
        </View>
      ) : (
        /* VOLUNTEER METRIC CARDS (3 CARDS) */
        <View style={styles.metricsRow3}>
          <View style={[styles.metricCardBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#F59E0B' }]}>
              <Feather name="clock" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#D97706' }]}>PENDING</Text>
            <Text style={[styles.metricValue, { color: '#B45309' }]}>{pendingTasksCount} Task</Text>
            <Text style={styles.metricSub}>Perlu Dikerjakan</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#F59E0B' }]} />
          </View>

          <View style={[styles.metricCardBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#0284C7' }]}>
              <Feather name="navigation" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#0284C7' }]}>BERJALAN</Text>
            <Text style={[styles.metricValue, { color: '#0369A1' }]}>{inProgressTasksCount} Task</Text>
            <Text style={styles.metricSub}>Sedang Berjalan</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#0284C7' }]} />
          </View>

          <View style={[styles.metricCardBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
            <View style={[styles.metricIconBadge, { backgroundColor: '#16A34A' }]}>
              <Feather name="check" size={14} color={WHITE} />
            </View>
            <Text style={[styles.metricLabel, { color: '#16A34A' }]}>SELESAI</Text>
            <Text style={[styles.metricValue, { color: '#15803D' }]}>{completedTasksCount} Task</Text>
            <Text style={styles.metricSub}>Selesai</Text>
            <View style={[styles.progressBarLine, { backgroundColor: '#16A34A' }]} />
          </View>
        </View>
      )}

      {/* 2. WILAYAH KEANGGOTAAN ANDA CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.headerIconCircle, { backgroundColor: '#EEF2FF', marginRight: 8 }]}>
            <Feather name="map-pin" size={14} color={PRIMARY_BLUE} />
          </View>
          <Text style={[styles.cardSectionTitle, { flex: 1 }]}>Wilayah Keanggotaan Anda</Text>
          <Feather name="chevron-right" size={18} color="#9CA3AF" />
        </View>
        <Text style={styles.cardDetailLabel}>
          Kecamatan: <Text style={styles.cardDetailVal}>{user?.district?.name || 'Kecamatan Magelang Selatan'}</Text>
        </Text>
        <Text style={styles.cardDetailLabel}>
          Kelurahan/Desa: <Text style={styles.cardDetailVal}>{user?.subdistrict?.name || 'Jurangombo Selatan'}</Text>
        </Text>
        <Text style={styles.cardDetailLabel}>
          Hak Akses / Role: <Text style={[styles.cardDetailVal, { color: PRIMARY_BLUE, fontWeight: '700' }]}>{user?.roles?.[0]?.name || user?.role || (isOfficer ? 'PENGURUS' : 'USER')}</Text>
        </Text>
      </View>

      {/* 3. MENU PENGURUS GRID SECTION */}
      {isOfficer && (
        <View style={styles.card}>
          <Text style={[styles.cardSectionTitle, { marginBottom: 12 }]}>Menu Pengurus</Text>
          <View style={styles.menuGridRow2}>
            {/* 1. Kelola Relawan */}
            <TouchableOpacity
              style={styles.menuGridItem2}
              onPress={() => setVolunteersModalVisible(true)}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="users" size={22} color={PRIMARY_BLUE} />
              </View>
              <Text style={styles.menuGridTitle}>Kelola Relawan</Text>
              <Text style={styles.menuGridSub}>Lihat & kelola data relawan</Text>
            </TouchableOpacity>

            {/* 2. Penugasan Tugas */}
            <TouchableOpacity
              style={styles.menuGridItem2}
              onPress={onOpenAssignModal}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Feather name="clipboard" size={22} color="#DC2626" />
              </View>
              <Text style={styles.menuGridTitle}>Penugasan Tugas</Text>
              <Text style={styles.menuGridSub}>Buat & kelola penugasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 4. KEGIATAN & PENUGASAN AKTIF SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardSectionTitle, { flex: 1 }]}>
            Kegiatan & Penugasan Aktif <Text style={{ color: PRIMARY_BLUE }}>{activeTasks.length}</Text>
          </Text>
          <TouchableOpacity onPress={onGoToApprovalTab}>
            <Text style={{ fontSize: 12, color: PRIMARY_BLUE, fontWeight: '700' }}>Lihat Semua →</Text>
          </TouchableOpacity>
        </View>

        {activeTasks.length > 0 ? (
          activeTasks.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              isOfficer={isOfficer}
              onStartTask={onStartTask}
              onCompleteTask={onCompleteTask}
            />
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <Feather name="calendar" size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyStateTitle}>Belum Ada Tugas Aktif</Text>
            <Text style={styles.emptyStateSubtitle}>Penugasan kegiatan harian yang belum selesai akan muncul di sini</Text>
          </View>
        )}
      </View>

      {/* Officer Volunteers Management Modal */}
      <OfficerVolunteersModal
        visible={volunteersModalVisible}
        onClose={() => setVolunteersModalVisible(false)}
        apiUrl={apiUrl}
        token={token}
        user={user}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  registerWarningCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  registerWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  registerWarningSub: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    marginBottom: 10,
  },
  registerWarningBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerWarningBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '800',
  },
  headerIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow3: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCardBox: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  metricIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 9,
    color: '#64748B',
  },
  progressBarLine: {
    height: 3,
    borderRadius: 2,
    marginTop: 6,
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
  cardDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  cardDetailVal: {
    fontWeight: '600',
    color: DARK_GRAY,
  },
  menuGridRow2: {
    flexDirection: 'row',
    gap: 12,
  },
  menuGridItem2: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuGridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
    textAlign: 'center',
  },
  menuGridSub: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 2,
  },
  emptyStateSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
