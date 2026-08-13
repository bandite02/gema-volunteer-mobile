import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import TaskCard from '../components/TaskCard';

const PRIMARY_BLUE = '#21439A';
const DARK_GRAY = '#1E293B';
const WHITE = '#FFFFFF';

export default function TasksScreen({
  user,
  isOfficer,
  assignedTasks,
  taskFromDate,
  taskToDate,
  showTaskFromPicker,
  showTaskToPicker,
  setTaskFromDate,
  setTaskToDate,
  setShowTaskFromPicker,
  setShowTaskToPicker,
  onApplyFilter,
  onResetFilter,
  onStartTask,
  onCompleteTask
}) {
  return (
    <View style={styles.flex1}>
      {/* Card: Filter Rentang Tanggal Tugas */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Feather name="filter" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
          <Text style={styles.cardSectionTitle}>Filter Rentang Tanggal Tugas</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 4 }}>DARI TANGGAL</Text>
            <TouchableOpacity
              style={styles.datePickerTrigger}
              onPress={() => setShowTaskFromPicker(true)}
            >
              <Text style={{ fontSize: 12, color: taskFromDate ? '#1E293B' : '#9CA3AF' }}>
                {taskFromDate || 'Pilih tanggal'}
              </Text>
              <Feather name="calendar" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', marginBottom: 4 }}>SAMPAI TANGGAL</Text>
            <TouchableOpacity
              style={styles.datePickerTrigger}
              onPress={() => setShowTaskToPicker(true)}
            >
              <Text style={{ fontSize: 12, color: taskToDate ? '#1E293B' : '#9CA3AF' }}>
                {taskToDate || 'Pilih tanggal'}
              </Text>
              <Feather name="calendar" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <TouchableOpacity
            style={styles.filterBtnPrimary}
            onPress={onApplyFilter}
          >
            <Text style={{ color: WHITE, fontSize: 12, fontWeight: '700' }}>Terapkan Filter</Text>
          </TouchableOpacity>

          {(taskFromDate || taskToDate) && (
            <TouchableOpacity
              style={styles.filterBtnReset}
              onPress={onResetFilter}
            >
              <Text style={{ color: '#475569', fontSize: 12, fontWeight: '600' }}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {showTaskFromPicker && (
          <DateTimePicker
            value={taskFromDate ? new Date(taskFromDate) : new Date()}
            mode="date"
            display="default"
            onValueChange={(event, selectedDate) => {
              setShowTaskFromPicker(false);
              if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formatted = `${year}-${month}-${day}`;
                setTaskFromDate(formatted);
              }
            }}
          />
        )}

        {showTaskToPicker && (
          <DateTimePicker
            value={taskToDate ? new Date(taskToDate) : new Date()}
            mode="date"
            display="default"
            onValueChange={(event, selectedDate) => {
              setShowTaskToPicker(false);
              if (selectedDate) {
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const formatted = `${year}-${month}-${day}`;
                setTaskToDate(formatted);
              }
            }}
          />
        )}
      </View>

      {/* Card: List Tugas */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Feather name="check-square" size={16} color={PRIMARY_BLUE} style={{ marginRight: 8 }} />
          <Text style={styles.cardSectionTitle}>Daftar Tugas & Penugasan Lapangan ({assignedTasks.length})</Text>
        </View>
        {assignedTasks.length > 0 ? (
          assignedTasks.map(t => (
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
            <Feather name="calendar" size={32} color="#9CA3AF" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyStateTitle}>Belum ada kegiatan</Text>
            <Text style={styles.emptyStateSubtitle}>Penugasan kegiatan harian akan muncul di sini</Text>
          </View>
        )}
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
  datePickerTrigger: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterBtnPrimary: {
    flex: 1,
    backgroundColor: PRIMARY_BLUE,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterBtnReset: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
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
