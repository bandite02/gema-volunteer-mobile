import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PRIMARY_BLUE = '#21439A';

export default function BottomNav({ dashboardTab, setDashboardTab, isOfficer, pendingVolunteersCount = 0 }) {
  return (
    <View style={styles.bottomNavContainer}>
      <TouchableOpacity
        style={styles.bottomNavTabButton}
        onPress={() => setDashboardTab('home')}
      >
        <Feather
          name="home"
          size={20}
          color={dashboardTab === 'home' ? PRIMARY_BLUE : '#4B5563'}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.bottomNavTabLabel, dashboardTab === 'home' && styles.bottomNavTabActiveLabel]}>Beranda</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomNavTabButton}
        onPress={() => setDashboardTab('activity')}
      >
        <Feather
          name="clipboard"
          size={20}
          color={dashboardTab === 'activity' ? PRIMARY_BLUE : '#4B5563'}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.bottomNavTabLabel, dashboardTab === 'activity' && styles.bottomNavTabActiveLabel]}>Tugas</Text>
      </TouchableOpacity>

      {isOfficer ? (
        <TouchableOpacity
          style={styles.bottomNavTabButton}
          onPress={() => setDashboardTab('relawan')}
        >
          <View style={{ position: 'relative' }}>
            <Feather
              name="users"
              size={20}
              color={dashboardTab === 'relawan' ? PRIMARY_BLUE : '#4B5563'}
              style={{ marginBottom: 4 }}
            />
            {pendingVolunteersCount > 0 && <View style={styles.notifBadgeDot} />}
          </View>
          <Text style={[styles.bottomNavTabLabel, dashboardTab === 'relawan' && styles.bottomNavTabActiveLabel]}>Relawan</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.bottomNavTabButton}
          onPress={() => setDashboardTab('canvassing')}
        >
          <Feather
            name="users"
            size={20}
            color={dashboardTab === 'canvassing' ? PRIMARY_BLUE : '#4B5563'}
            style={{ marginBottom: 4 }}
          />
          <Text style={[styles.bottomNavTabLabel, dashboardTab === 'canvassing' && styles.bottomNavTabActiveLabel]}>Canvassing</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.bottomNavTabButton}
        onPress={() => setDashboardTab('profile')}
      >
        <Feather
          name="user"
          size={20}
          color={dashboardTab === 'profile' ? PRIMARY_BLUE : '#4B5563'}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.bottomNavTabLabel, dashboardTab === 'profile' && styles.bottomNavTabActiveLabel]}>Profil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavContainer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomNavTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavTabLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  bottomNavTabActiveLabel: {
    color: PRIMARY_BLUE,
    fontWeight: 'bold',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
