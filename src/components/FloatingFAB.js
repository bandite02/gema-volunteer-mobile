import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const WHITE = '#FFFFFF';
const PRIMARY_BLUE = '#21439A';

export default function FloatingFAB({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.fabButtonFixed}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Feather name="plus" size={26} color={WHITE} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fabButtonFixed: {
    position: 'absolute',
    bottom: 74,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
