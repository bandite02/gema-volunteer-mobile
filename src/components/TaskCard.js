import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function TaskCard({ task, isOfficer, onStartTask, onCompleteTask }) {
  const statusUpper = (task.status || '').toUpperCase();

  const getStatusBadge = (st) => {
    if (st === 'COMPLETED') return { color: '#16A34A', text: 'SELESAI' };
    if (st === 'IN_PROGRESS') return { color: '#0284C7', text: 'BERJALAN' };
    return { color: '#D97706', text: 'MENUNGGU' };
  };

  const badge = getStatusBadge(statusUpper);
  const volName = task.volunteer?.user?.name 
    || task.volunteer?.full_name 
    || task.assigned_to_volunteer?.user?.name 
    || task.assigned_to_volunteer?.full_name 
    || task.assignee_name 
    || '-';

  return (
    <View style={styles.taskCardItem}>
      <View style={styles.taskCardHeader}>
        <Text style={styles.taskCardTitle}>{task.title}</Text>
        <View style={[styles.taskStatusBadge, { backgroundColor: badge.color }]}>
          <Text style={styles.taskStatusBadgeText}>{badge.text}</Text>
        </View>
      </View>

      {task.description ? <Text style={styles.taskCardDesc}>{task.description}</Text> : null}
      
      <Text style={styles.taskCardSub}>
        PIC Relawan: {volName}
      </Text>

      {/* Task Status Overview for Officer vs Action Buttons for Target Volunteer */}
      {isOfficer ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
            Status Penugasan: <Text style={{ color: badge.color, fontWeight: '700' }}>
              {statusUpper === 'COMPLETED' ? 'Selesai' : statusUpper === 'IN_PROGRESS' ? 'Sedang Dikerjakan Relawan' : 'Menunggu Diterima Relawan'}
            </Text>
          </Text>
        </View>
      ) : (
        <View style={{ marginTop: 10, flexDirection: 'row', gap: 8 }}>
          {statusUpper === 'PENDING' && (
            <TouchableOpacity
              style={[styles.taskActionBtn, { backgroundColor: '#0284C7' }]}
              onPress={() => onStartTask && onStartTask(task.id)}
            >
              <Feather name="play" size={14} color={WHITE} style={{ marginRight: 4 }} />
              <Text style={styles.taskActionBtnText}>Terima Task</Text>
            </TouchableOpacity>
          )}

          {statusUpper === 'IN_PROGRESS' && (
            <TouchableOpacity
              style={[styles.taskActionBtn, { backgroundColor: '#16A34A' }]}
              onPress={() => onCompleteTask && onCompleteTask(task.id)}
            >
              <Feather name="check" size={14} color={WHITE} style={{ marginRight: 4 }} />
              <Text style={styles.taskActionBtnText}>Selesaikan Task</Text>
            </TouchableOpacity>
          )}

          {statusUpper === 'COMPLETED' && (
            <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '700' }}>
              ✓ Task telah diselesaikan
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  taskCardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_GRAY,
    flex: 1,
    marginRight: 8,
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  taskStatusBadgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '800',
  },
  taskCardDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 6,
  },
  taskCardSub: {
    fontSize: 10,
    color: '#6B7280',
  },
  taskActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  taskActionBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
});
