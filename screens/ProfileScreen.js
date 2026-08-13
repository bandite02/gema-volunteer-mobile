import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const ERROR_RED = '#DC2626';

export default function ProfileScreen({ user, isOfficer, onLogout }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <View style={styles.flex1}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.profileHeaderBox}>
          <View style={styles.profileBigAvatar}>
            <Text style={styles.profileBigAvatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.profileNameText}>{user?.name || 'User GEMA'}</Text>
          <Text style={styles.profileEmailText}>{user?.email || 'email@contoh.com'}</Text>
          <Text style={styles.profileLevelText}>
            {isOfficer
              ? `Hak Akses / Role: ${user?.roles?.[0]?.name || user?.role || 'Pengurus DPD/DPC'}`
              : 'Level Relawan: Volunteer'}
          </Text>
        </View>

        {/* Card: Domisili */}
        <View style={styles.profileSubCard}>
          <Text style={styles.formGroupTitle}>DOMISILI</Text>
          <View style={styles.profileRowDetail}>
            <Text style={styles.profileRowLabel}>Kecamatan</Text>
            <Text style={styles.profileRowVal}>{user?.district?.name || 'Magelang'}</Text>
          </View>
          <View style={[styles.profileRowDetail, { borderBottomWidth: 0 }]}>
            <Text style={styles.profileRowLabel}>Kelurahan/Desa</Text>
            <Text style={styles.profileRowVal}>{user?.subdistrict?.name || 'Magelang'}</Text>
          </View>
        </View>

        {/* Card: Data Relawan (If profile complete) */}
        {user?.profile && (
          <View style={styles.profileSubCard}>
            <Text style={styles.formGroupTitle}>DATA RELAWAN</Text>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Nama Lengkap</Text>
              <Text style={styles.profileRowVal}>{user.profile.full_name}</Text>
            </View>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Nama Panggilan</Text>
              <Text style={styles.profileRowVal}>{user.profile.nickname}</Text>
            </View>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>WhatsApp</Text>
              <Text style={styles.profileRowVal}>{user.profile.phone}</Text>
            </View>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Tanggal Lahir</Text>
              <Text style={styles.profileRowVal}>{user.profile.birthdate?.split('T')[0] || '—'}</Text>
            </View>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Jenis Kelamin</Text>
              <Text style={styles.profileRowVal}>{user.profile.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}</Text>
            </View>
            <View style={[styles.profileRowDetail, { borderBottomWidth: 0 }]}>
              <Text style={styles.profileRowLabel}>Pekerjaan</Text>
              <Text style={styles.profileRowVal}>{user.profile.occupation}</Text>
            </View>
          </View>
        )}

        {/* Card: Keahlian & Minat */}
        {user?.profile && (
          <View style={styles.profileSubCard}>
            <Text style={styles.formGroupTitle}>KEAHLIAN & MINAT</Text>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Keahlian</Text>
              <Text style={[styles.profileRowVal, { flex: 1.5 }]}>{user.profile.skills?.join(', ') || '—'}</Text>
            </View>
            <View style={[styles.profileRowDetail, { borderBottomWidth: 0 }]}>
              <Text style={styles.profileRowLabel}>Minat Gerakan</Text>
              <Text style={[styles.profileRowVal, { flex: 1.5 }]}>{user.profile.interests?.join(', ') || '—'}</Text>
            </View>
          </View>
        )}

        {/* Card: Alamat & Motivasi */}
        {user?.profile && (
          <View style={styles.profileSubCard}>
            <Text style={styles.formGroupTitle}>ALAMAT & MOTIVASI</Text>
            <View style={styles.profileRowDetail}>
              <Text style={styles.profileRowLabel}>Alamat Detail</Text>
              <Text style={[styles.profileRowVal, { flex: 1.5 }]}>{user.profile.address_detail || '—'}</Text>
            </View>
            <View style={[styles.profileRowDetail, { borderBottomWidth: 0 }]}>
              <Text style={styles.profileRowLabel}>Motivasi</Text>
              <Text style={[styles.profileRowVal, { flex: 1.5 }]}>{user.profile.motivation || '—'}</Text>
            </View>
          </View>
        )}

        {/* Red Bordered Logout Button */}
        <TouchableOpacity style={styles.modernLogoutBtn} onPress={onLogout}>
          <Feather name="log-out" size={16} color={ERROR_RED} style={{ marginRight: 8 }} />
          <Text style={styles.modernLogoutBtnText}>KELUAR DARI AKUN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
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
  profileHeaderBox: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  profileBigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileBigAvatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  profileNameText: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  profileEmailText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileLevelText: {
    fontSize: 12,
    color: PRIMARY_BLUE,
    fontWeight: '700',
    marginTop: 4,
  },
  profileSubCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: PRIMARY_BLUE,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  profileRowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileRowLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  profileRowVal: {
    fontSize: 12,
    fontWeight: '600',
    color: DARK_GRAY,
  },
  modernLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: ERROR_RED,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
  },
  modernLogoutBtnText: {
    color: ERROR_RED,
    fontSize: 13,
    fontWeight: '700',
  },
});
