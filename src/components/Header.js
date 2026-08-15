import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const WHITE = '#FFFFFF';

export default function Header({ user, isOfficer, pendingVolunteersCount, onOpenNotif, onOpenProfile }) {
  return (
    <LinearGradient colors={['#004AD7', '#002E8A']} style={styles.dashboardHeaderGradient}>
      <View style={styles.dashboardHeaderRow}>
        <View>
          <Text style={styles.dashboardWelcomeText}>
            Halo, {user?.name?.split(' ')[0] || 'User'}! {!isOfficer ? '👋' : ''}
          </Text>
          <Text style={styles.dashboardUserLevel}>
            {isOfficer
              ? `Peran: Pengurus / Role: ${user?.roles?.[0]?.name || user?.role || 'pengurus_ds_jurangombo'}`
              : 'Level Relawan: Volunteer'}
          </Text>
        </View>
        <View style={styles.dashboardHeaderActions}>
          <TouchableOpacity style={styles.dashboardHeaderActionButton} onPress={onOpenNotif}>
            <Feather name="inbox" size={18} color={WHITE} />
            {pendingVolunteersCount > 0 && <View style={styles.notifBadgeDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAvatarContainer} onPress={onOpenProfile}>
            <Text style={styles.headerAvatarText}>
              {user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U'}
            </Text>
            <View style={styles.onlineStatusDot} />
          </TouchableOpacity>
        </View>
      </View>

      {!isOfficer && (
        <View style={styles.glassHeaderCard}>
          <View style={styles.glassHeaderCardTopRow}>
            <Text style={styles.glassHeaderCardTitle}>Status Registrasi Relawan</Text>
            <View style={(user?.profile || user?.volunteer) ? styles.glassBadgeGreen : styles.glassBadgeRed}>
              <Text style={styles.glassBadgeGreenText}>
                {(user?.profile || user?.volunteer) ? 'TERDAFTAR' : 'BELUM REGISTRASI'}
              </Text>
            </View>
          </View>

          <View style={styles.glassHeaderCardGrid}>
            <View style={styles.glassHeaderCardCol}>
              <View style={styles.glassIconCircle}>
                <Feather name="user" size={14} color="#004AD7" />
              </View>
              <Text style={styles.glassColLabel}>Nama Lengkap</Text>
              <Text style={styles.glassColValue} numberOfLines={1}>{user?.profile?.full_name || user?.volunteer?.full_name || user?.name || '-'}</Text>
            </View>

            <View style={styles.glassHeaderCardCol}>
              <View style={styles.glassIconCircle}>
                <Feather name="message-circle" size={14} color="#16A34A" />
              </View>
              <Text style={styles.glassColLabel}>WhatsApp</Text>
              <Text style={styles.glassColValue} numberOfLines={1}>{user?.profile?.phone || user?.volunteer?.phone || '-'}</Text>
            </View>

            <View style={styles.glassHeaderCardCol}>
              <View style={styles.glassIconCircle}>
                <Feather name="briefcase" size={14} color="#D97706" />
              </View>
              <Text style={styles.glassColLabel}>Pekerjaan</Text>
              <Text style={styles.glassColValue} numberOfLines={1}>{user?.profile?.occupation || user?.volunteer?.occupation || '-'}</Text>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  dashboardHeaderGradient: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  dashboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardWelcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WHITE,
  },
  dashboardUserLevel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  dashboardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardHeaderActionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  headerAvatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerAvatarText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#002E8A',
  },
  glassHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassHeaderCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  glassHeaderCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: WHITE,
  },
  glassBadgeGreen: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  glassBadgeRed: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  glassBadgeGreenText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  glassHeaderCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassHeaderCardCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  glassIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  glassColLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  glassColValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: WHITE,
    marginTop: 1,
  },
});
