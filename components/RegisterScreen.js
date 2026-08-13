import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const PRIMARY_BLUE = '#21439A';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1F2937';
const LIGHT_GRAY = '#E5E7EB';
const ORANGE = '#F5A623';

export default function RegisterScreen({
  setAuthTab,
  handleRegister,
  loading,
  name,
  setName,
  identityNumber,
  setIdentityNumber,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  registerDistrict,
  setRegisterDistrict,
  registerSubdistrict,
  setRegisterSubdistrict,
  showDistrictModal,
  setShowDistrictModal,
  showSubdistrictModal,
  setShowSubdistrictModal,
  districtSearch,
  setDistrictSearch,
  subdistrictSearch,
  setSubdistrictSearch,
  districts,
  subdistricts,
  loadingLocations,
  fetchSubdistricts
}) {
  return (
    <View style={styles.flex1}>
      <LinearGradient
        colors={['#21439A', '#1a3580']}
        style={styles.authHeaderGradientSmall}
      >
        <View style={styles.registerHeaderRow}>
          <TouchableOpacity onPress={() => setAuthTab('LOGIN')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.registerHeaderTextContainer}>
            <Text style={styles.registerGradientTitle}>Daftar Akun</Text>
            <Text style={styles.registerGradientSubtitle}>Buat akun untuk menjadi bagian dari GEMA </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.authCardWrapper}>
        <View style={styles.card}>
          <Text style={styles.formGroupTitle}>DATA AKUN</Text>

          {/* PDP Alert Box (Red theme from mockup) */}
          <View style={styles.pdpAlertBox}>
            <Feather name="lock" size={16} color="#92400E" style={{ marginRight: 10, marginTop: 2 }} />
            <Text style={styles.pdpAlertText}>
              Data pribadi Anda dienkripsi untuk kepatuhan UU No. 27/2022 tentang Perlindungan Data Pribadi (PDP).
            </Text>
          </View>

          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.cleanTextInput}
            placeholder="Masukkan nama lengkap"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>Nomor Identitas (NIK KTP)</Text>
          <TextInput
            style={styles.cleanTextInput}
            placeholder="Masukkan NIK (16 digit)"
            value={identityNumber}
            onChangeText={(v) => setIdentityNumber(v.replace(/\D/g, '').slice(0, 16))}
            keyboardType="numeric"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.cleanTextInput}
            placeholder="Masukkan username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.cleanTextInput}
            placeholder="Masukkan email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordTextInput}
              placeholder="Masukkan password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.formGroupTitle}>DOMISILI</Text>

          {/* Kecamatan Dropdown Selection */}
          <Text style={styles.inputLabel}>Kecamatan Domisili Magelang</Text>
          <TouchableOpacity style={styles.dropdownTrigger} onPress={() => { setDistrictSearch(''); setShowDistrictModal(true); }}>
            <Text style={registerDistrict ? styles.dropdownSelected : styles.dropdownPlaceholder}>
              {registerDistrict ? registerDistrict.name : 'Pilih Kecamatan'}
            </Text>
          </TouchableOpacity>

          {/* Native Modal for Kecamatan selection */}
          <Modal visible={showDistrictModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContentCard}>
                <Text style={styles.modalTitle}>Pilih Kecamatan</Text>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Cari kecamatan..."
                  value={districtSearch}
                  onChangeText={setDistrictSearch}
                  placeholderTextColor="#9CA3AF"
                />
                {loadingLocations && <ActivityIndicator color={PRIMARY_BLUE} style={{ marginVertical: 10 }} />}
                <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                  {districts
                    .filter((item) => item.name.toLowerCase().includes(districtSearch.toLowerCase()))
                    .map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.modalItem}
                        onPress={() => {
                          setRegisterDistrict(item);
                          setRegisterSubdistrict('');
                          setShowDistrictModal(false);
                          fetchSubdistricts(item.code);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  {districts.filter((item) => item.name.toLowerCase().includes(districtSearch.toLowerCase())).length === 0 && (
                    <Text style={styles.noResultsText}>Kecamatan tidak ditemukan</Text>
                  )}
                </ScrollView>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowDistrictModal(false)}>
                  <Text style={styles.closeModalText}>BATAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Kelurahan/Desa Dropdown Selection */}
          <Text style={styles.inputLabel}>Desa / Kelurahan</Text>
          <TouchableOpacity
            style={[styles.dropdownTrigger, !registerDistrict && styles.disabledDropdown]}
            onPress={() => {
              if (registerDistrict) {
                setSubdistrictSearch('');
                setShowSubdistrictModal(true);
              }
            }}
          >
            <Text style={registerSubdistrict ? styles.dropdownSelected : styles.dropdownPlaceholder}>
              {registerSubdistrict ? registerSubdistrict.name : 'Pilih Desa/Kelurahan'}
            </Text>
          </TouchableOpacity>

          {/* Native Modal for Kelurahan selection */}
          <Modal visible={showSubdistrictModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContentCard}>
                <Text style={styles.modalTitle}>Pilih Desa / Kelurahan</Text>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Cari desa/kelurahan..."
                  value={subdistrictSearch}
                  onChangeText={setSubdistrictSearch}
                  placeholderTextColor="#9CA3AF"
                />
                {loadingLocations && <ActivityIndicator color={PRIMARY_BLUE} style={{ marginVertical: 10 }} />}
                <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                  {subdistricts
                    .filter((item) => item.name.toLowerCase().includes(subdistrictSearch.toLowerCase()))
                    .map((item) => (
                      <TouchableOpacity
                        key={item.code}
                        style={styles.modalItem}
                        onPress={() => {
                          setRegisterSubdistrict(item);
                          setShowSubdistrictModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  {subdistricts.filter((item) => item.name.toLowerCase().includes(subdistrictSearch.toLowerCase())).length === 0 && (
                    <Text style={styles.noResultsText}>Desa/Kelurahan tidak ditemukan</Text>
                  )}
                </ScrollView>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowSubdistrictModal(false)}>
                  <Text style={styles.closeModalText}>BATAL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.infoBoxBlue}>
            <Text style={styles.infoBoxBlueText}>
              Domisili digunakan untuk menentukan wilayah relawan Anda.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.primaryAuthBtn, { marginTop: 20 }]} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.primaryAuthBtnText}>DAFTAR SEKARANG</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleAuthContainerInside} onPress={() => setAuthTab('LOGIN')}>
          <Text style={styles.toggleAuthLabel}>
            Sudah punya akun? <Text style={styles.toggleAuthAction}>Masuk</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  authHeaderGradientSmall: {
    paddingTop: 40,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  registerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerHeaderTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  registerGradientTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: WHITE,
  },
  registerGradientSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 3,
  },
  backBtn: {
    padding: 6,
  },
  backBtnText: {
    color: WHITE,
    fontSize: 22,
    fontWeight: 'bold',
  },
  authCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -28,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#21439A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 16,
  },
  formGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pdpAlertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#FDD6A0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  pdpAlertIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 1,
  },
  pdpAlertText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 6,
    marginTop: 12,
  },
  cleanTextInput: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 50,
    fontSize: 14,
    color: DARK_GRAY,
    marginBottom: 10,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 10,
  },
  passwordTextInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: DARK_GRAY,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#6B7280',
    padding: 4,
  },
  dropdownTrigger: {
    backgroundColor: WHITE,
    borderRadius: 12,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 10,
  },
  disabledDropdown: {
    opacity: 0.45,
  },
  dropdownPlaceholder: {
    color: '#6B7280',
    fontSize: 14,
  },
  dropdownSelected: {
    color: DARK_GRAY,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSearchInput: {
    height: 46,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: DARK_GRAY,
    backgroundColor: '#F9FAFB',
  },
  modalScroll: {
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 15,
    color: DARK_GRAY,
  },
  closeModalBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalText: {
    color: DARK_GRAY,
    fontWeight: 'bold',
    fontSize: 14,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 20,
    fontSize: 14,
  },
  infoBoxBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  infoBoxBlueText: {
    fontSize: 12,
    color: '#1D4ED8',
    lineHeight: 17,
  },
  primaryAuthBtn: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryAuthBtnText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  toggleAuthContainerInside: {
    alignItems: 'center',
    marginTop: 20,
  },
  toggleAuthLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleAuthAction: {
    color: PRIMARY_BLUE,
    fontWeight: 'bold',
  }
});
