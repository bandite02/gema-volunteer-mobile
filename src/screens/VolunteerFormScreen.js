import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const PRIMARY_BLUE = '#21439A';
const WHITE = '#FFFFFF';
const LIGHT_BG = '#F5F7FA';

export default function VolunteerFormScreen({
  user,
  token,
  apiUrl,
  onSuccess,
  onCancel,
  availableSkills: initialSkills = [],
  availableInterests: initialInterests = [],
}) {
  const [formStep, setFormStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('MALE');
  const [occupation, setOccupation] = useState('');
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [motivation, setMotivation] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  // 4 Photos
  const [photoKtp, setPhotoKtp] = useState(null);
  const [photoFree1, setPhotoFree1] = useState(null);
  const [photoFree2, setPhotoFree2] = useState(null);
  const [photoFree3, setPhotoFree3] = useState(null);

  // Dynamic Coverage Area State (RT/RW pairs)
  const [coverageArea, setCoverageArea] = useState([{ rt: '', rw: '' }]);

  const availableSkills = initialSkills.length > 0 ? initialSkills : [
    'Pendidikan', 'Desain Grafis', 'Public Speaking', 'IT & Media', 'Kesehatan Medis', 'Logistik', 'Komunikasi'
  ];
  const availableInterests = initialInterests.length > 0 ? initialInterests : [
    'Pendidikan & Literasi', 'Kesehatan Masyarakat', 'Lingkungan Hidup', 'Tanggap Bencana', 'Ekonomi Kreatif'
  ];

  useEffect(() => {
    loadDraft();
  }, []);

  useEffect(() => {
    saveDraft();
  }, [phone, birthdate, gender, occupation, skills, interests, motivation, addressDetail, formStep]);

  const saveDraft = async () => {
    try {
      const draft = { phone, birthdate, gender, occupation, skills, interests, motivation, addressDetail, formStep };
      await AsyncStorage.setItem('gema_volunteer_draft', JSON.stringify(draft));
    } catch (e) {
      console.log('Error saving draft:', e);
    }
  };

  const loadDraft = async () => {
    try {
      const cached = await AsyncStorage.getItem('gema_volunteer_draft');
      if (cached) {
        const draft = JSON.parse(cached);
        setPhone(draft.phone || '');
        setBirthdate(draft.birthdate || '');
        setGender(draft.gender || 'MALE');
        setOccupation(draft.occupation || '');
        setSkills(draft.skills || []);
        setInterests(draft.interests || []);
        setMotivation(draft.motivation || '');
        setAddressDetail(draft.addressDetail || '');
        setFormStep(draft.formStep || 1);
      }
    } catch (e) {
      console.log('Error loading draft:', e);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem('gema_volunteer_draft');
    } catch (e) {
      console.log('Error clearing draft:', e);
    }
  };

  const addCoverageRow = () => setCoverageArea([...coverageArea, { rt: '', rw: '' }]);
  const removeCoverageRow = (index) => {
    if (coverageArea.length === 1) {
      setCoverageArea([{ rt: '', rw: '' }]);
      return;
    }
    setCoverageArea(coverageArea.filter((_, i) => i !== index));
  };
  const updateCoverageRow = (index, field, value) => {
    const updated = coverageArea.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setCoverageArea(updated);
  };

  const setPhotoState = (type, uri) => {
    if (type === 'ktp') setPhotoKtp(uri);
    else if (type === 'free1') setPhotoFree1(uri);
    else if (type === 'free2') setPhotoFree2(uri);
    else setPhotoFree3(uri);
  };

  const takePhotoWithCamera = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Kamera Ditolak', 'Akses kamera dibutuhkan.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true });
      if (!result.canceled && result.assets?.length > 0) {
        const photo = result.assets[0];
        setPhotoState(type, photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri);
      }
    } catch (error) {
      console.log('Error camera:', error.message);
    }
  };

  const pickFromGallery = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Izin Galeri Ditolak', 'Akses galeri foto dibutuhkan.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7, base64: true });
      if (!result.canceled && result.assets?.length > 0) {
        const photo = result.assets[0];
        setPhotoState(type, photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri);
      }
    } catch (error) {
      console.log('Error gallery:', error.message);
    }
  };

  const handlePickPhoto = (type) => {
    const titleMap = { ktp: 'Foto KTP', free1: 'Foto Bebas 1', free2: 'Foto Bebas 2', free3: 'Foto Bebas 3' };
    Alert.alert('Unggah Foto', `Pilih sumber foto untuk ${titleMap[type]}:`, [
      { text: 'Kamera HP (Ambil Foto)', onPress: () => takePhotoWithCamera(type) },
      { text: 'Galeri HP (Pilih Gambar)', onPress: () => pickFromGallery(type) },
      { text: 'Batal', style: 'cancel' }
    ]);
  };

  const toggleSkill = (item) => {
    if (skills.includes(item)) setSkills(skills.filter(s => s !== item));
    else setSkills([...skills, item]);
  };

  const toggleInterest = (item) => {
    if (interests.includes(item)) setInterests(interests.filter(i => i !== item));
    else setInterests([...interests, item]);
  };

  const handleSubmitProfile = async () => {
    try {
      setLoading(true);
      const filteredCoverage = coverageArea.filter(c => c.rt.trim() !== '' || c.rw.trim() !== '');

      const payload = {
        phone,
        birth_date: birthdate,
        gender,
        occupation,
        skills,
        interests,
        motivation,
        address_detail: addressDetail,
        coverage_area: filteredCoverage.length > 0 ? filteredCoverage : [{ rt: '01', rw: '01' }],
        photo_ktp: photoKtp || null,
        photo_free_1: photoFree1 || null,
        photo_free_2: photoFree2 || null,
        photo_free_3: photoFree3 || null,
      };

      const response = await axios.post(`${apiUrl}/volunteers`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.status) {
        await clearDraft();
        Alert.alert('Berhasil', 'Profil volunteer berhasil dikirim & disimpan!', [
          { text: 'OK', onPress: () => onSuccess && onSuccess() }
        ]);
      } else {
        Alert.alert('Gagal', response.data?.message || 'Gagal menyimpan profil.');
      }
    } catch (e) {
      console.log('Error submit profile:', e.message);
      Alert.alert('Gagal', e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex1}>
      <LinearGradient colors={['#21439A', '#1a3580']} style={styles.formHeaderGradient}>
        <View style={styles.formHeaderRow}>
          <TouchableOpacity
            onPress={() => {
              if (formStep > 1) {
                setFormStep(formStep - 1);
              } else {
                Alert.alert('Batal', 'Draft Anda telah otomatis tersimpan. Anda bisa melanjutkannya nanti.', [
                  { text: 'Batal', style: 'cancel' },
                  { text: 'Oke', onPress: () => onCancel && onCancel() }
                ]);
              }
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>Lengkapi Profil Volunteer</Text>
        </View>

        <View style={styles.progressStepperContainer}>
          <View style={styles.progressStepperTextRow}>
            <Text style={styles.progressStepperStepText}>Langkah {formStep} dari 3</Text>
            <Text style={styles.progressStepperLabelText}>
              {formStep === 1 ? 'Data Diri & Kontak' : formStep === 2 ? 'Keahlian & Minat' : 'Alamat & Esai'}
            </Text>
          </View>
          <View style={styles.progressStepperTrack}>
            <View style={[styles.progressStepperFill, { width: `${(formStep / 3) * 100}%` }]} />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.stepDotsContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.stepDot,
              s === formStep ? styles.stepDotActive : s < formStep ? styles.stepDotCompleted : null
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.formScrollContent} keyboardShouldPersistTaps="handled" style={styles.transparentBg}>
        <View style={styles.stepHeaderContainer}>
          <Text style={styles.stepHeaderTitle}>
            {formStep === 1 ? 'Data Diri & Kontak' : formStep === 2 ? 'Keahlian & Bidang Minat' : 'Alamat & Esai Motivasi'}
          </Text>
          {formStep === 1 && (
            <Text style={styles.stepHeaderSubtitle}>Lengkapi data diri Anda dengan benar.</Text>
          )}
        </View>

        {formStep === 1 && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Nomor WhatsApp</Text>
            <TextInput
              style={styles.cleanTextInput}
              placeholder="Contoh: 081234567890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Tanggal Lahir</Text>
            <TouchableOpacity style={styles.datePickerTrigger} onPress={() => setShowDatePicker(true)}>
              <Text style={birthdate ? styles.datePickerText : styles.datePickerPlaceholder}>
                {birthdate || 'Pilih Tanggal Lahir'}
              </Text>
              <Feather name="calendar" size={16} color="#6B7280" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate ? new Date(birthdate) : new Date(2000, 0, 1)}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    setBirthdate(`${year}-${month}-${day}`);
                  }
                }}
              />
            )}

            <Text style={styles.inputLabel}>Jenis Kelamin</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOption} onPress={() => setGender('MALE')}>
                <View style={[styles.radioButton, gender === 'MALE' && styles.radioButtonSelected]}>
                  {gender === 'MALE' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.radioLabel, gender === 'MALE' && styles.radioLabelSelected]}>LAKI-LAKI</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.radioOption} onPress={() => setGender('FEMALE')}>
                <View style={[styles.radioButton, gender === 'FEMALE' && styles.radioButtonSelected]}>
                  {gender === 'FEMALE' && <View style={styles.radioButtonInner} />}
                </View>
                <Text style={[styles.radioLabel, gender === 'FEMALE' && styles.radioLabelSelected]}>PEREMPUAN</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Pekerjaan Saat Ini</Text>
            <TextInput
              style={styles.cleanTextInput}
              placeholder="Contoh: Mahasiswa, Wiraswasta"
              value={occupation}
              onChangeText={setOccupation}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.formGroupTitle, { marginTop: 22, marginBottom: 12 }]}>DOKUMENTASI FOTO (1 KTP & 3 FOTO BEBAS - OPSIONAL)</Text>
            <View style={styles.photoGrid}>
              <TouchableOpacity style={styles.photoBox} onPress={() => handlePickPhoto('ktp')}>
                {photoKtp ? (
                  <Image source={{ uri: photoKtp }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Feather name="credit-card" size={24} color={PRIMARY_BLUE} />
                    <Text style={styles.photoBoxTitle}>Foto KTP</Text>
                    <Text style={styles.photoBoxSub}>Ketuk untuk unggah (Opsional)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoBox} onPress={() => handlePickPhoto('free1')}>
                {photoFree1 ? (
                  <Image source={{ uri: photoFree1 }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Feather name="camera" size={24} color={PRIMARY_BLUE} />
                    <Text style={styles.photoBoxTitle}>Foto Bebas 1</Text>
                    <Text style={styles.photoBoxSub}>Ketuk untuk unggah (Opsional)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoBox} onPress={() => handlePickPhoto('free2')}>
                {photoFree2 ? (
                  <Image source={{ uri: photoFree2 }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Feather name="image" size={24} color={PRIMARY_BLUE} />
                    <Text style={styles.photoBoxTitle}>Foto Bebas 2</Text>
                    <Text style={styles.photoBoxSub}>Ketuk untuk unggah (Opsional)</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoBox} onPress={() => handlePickPhoto('free3')}>
                {photoFree3 ? (
                  <Image source={{ uri: photoFree3 }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Feather name="grid" size={24} color={PRIMARY_BLUE} />
                    <Text style={styles.photoBoxTitle}>Foto Bebas 3</Text>
                    <Text style={styles.photoBoxSub}>Ketuk untuk unggah (Opsional)</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {formStep === 2 && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Pilih Keahlian Anda (Bisa pilih lebih dari satu)</Text>
            <View style={styles.tagsContainer}>
              {availableSkills.map((item) => {
                const selected = skills.includes(item);
                return (
                  <TouchableOpacity key={item} style={[styles.tag, selected && styles.tagActive]} onPress={() => toggleSkill(item)}>
                    <Text style={[styles.tagText, selected && styles.tagTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Pilih Bidang Minat (Bisa pilih lebih dari satu)</Text>
            <View style={styles.tagsContainer}>
              {availableInterests.map((item) => {
                const selected = interests.includes(item);
                return (
                  <TouchableOpacity key={item} style={[styles.tag, selected && styles.tagActive]} onPress={() => toggleInterest(item)}>
                    <Text style={[styles.tagText, selected && styles.tagTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {formStep === 3 && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Alamat Detail (Jalan, RT/RW, Dusun)</Text>
            <TextInput
              style={[styles.cleanTextInput, styles.textArea]}
              placeholder="Contoh: Jl. Pemuda No. 4, RT 01 / RW 02"
              value={addressDetail}
              onChangeText={setAddressDetail}
              multiline
              numberOfLines={3}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.formGroupTitle, { marginTop: 20, marginBottom: 4 }]}>
              WILAYAH COVERAGE / CAKUPAN PENUGASAN (RT / RW)
            </Text>
            <Text style={styles.coverageSubtitle}>
              Tentukan nomor RT dan RW di wilayah kelurahan Anda yang dapat Anda jangkau sebagai relawan.
            </Text>

            {coverageArea.map((item, index) => (
              <View key={index} style={styles.coverageRowContainer}>
                <View style={styles.coverageInputGroup}>
                  <Text style={styles.coverageInputLabel}>Nomor RT</Text>
                  <TextInput
                    style={styles.coverageInput}
                    placeholder="Misal: 03"
                    keyboardType="number-pad"
                    value={item.rt}
                    onChangeText={(val) => updateCoverageRow(index, 'rt', val)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.coverageInputGroup}>
                  <Text style={styles.coverageInputLabel}>Nomor RW</Text>
                  <TextInput
                    style={styles.coverageInput}
                    placeholder="Misal: 03"
                    keyboardType="number-pad"
                    value={item.rw}
                    onChangeText={(val) => updateCoverageRow(index, 'rw', val)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity style={styles.coverageDeleteBtn} onPress={() => removeCoverageRow(index)}>
                  <Feather name="trash-2" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addCoverageBtn} onPress={addCoverageRow}>
              <Feather name="plus-circle" size={16} color={PRIMARY_BLUE} style={{ marginRight: 6 }} />
              <Text style={styles.addCoverageBtnText}>+ Tambah Area (RT/RW)</Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Esai Motivasi (Minimal 20 Karakter)</Text>
            <TextInput
              style={[styles.cleanTextInput, styles.textArea]}
              placeholder="Tuliskan motivasi Anda ingin bergabung menjadi bagian dari GEMA Magelang..."
              value={motivation}
              onChangeText={setMotivation}
              multiline
              numberOfLines={5}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.fixedFormFooter}>
        {formStep > 1 && (
          <TouchableOpacity style={styles.formFooterBackBtn} onPress={() => setFormStep(formStep - 1)}>
            <Text style={styles.formFooterBackBtnText}>Kembali</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryAuthBtn, { flex: formStep > 1 ? 2 : 1 }]}
          onPress={() => {
            if (formStep === 1) {
              if (!phone || !birthdate || !occupation) {
                Alert.alert('Validasi', 'Mohon lengkapi seluruh field.');
              } else {
                setFormStep(2);
              }
            } else if (formStep === 2) {
              if (skills.length === 0 || interests.length === 0) {
                Alert.alert('Validasi', 'Mohon pilih minimal satu keahlian dan minat.');
              } else {
                setFormStep(3);
              }
            } else {
              handleSubmitProfile();
            }
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.primaryAuthBtnText}>
              {formStep === 3 ? 'SIMPAN PROFIL' : 'LANJUTKAN'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: LIGHT_BG },
  transparentBg: { backgroundColor: 'transparent' },
  formHeaderGradient: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  formHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backBtnText: { color: WHITE, fontSize: 18, fontWeight: 'bold' },
  formTitle: { color: WHITE, fontSize: 18, fontWeight: 'bold', flex: 1 },
  progressStepperContainer: { marginTop: 4 },
  progressStepperTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressStepperStepText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: 'bold' },
  progressStepperLabelText: { color: WHITE, fontSize: 12, fontWeight: '600' },
  progressStepperTrack: { height: 6, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 3, overflow: 'hidden' },
  progressStepperFill: { height: '100%', backgroundColor: '#F5A623', borderRadius: 3 },
  stepDotsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  stepDotActive: { width: 24, backgroundColor: PRIMARY_BLUE, borderRadius: 4 },
  stepDotCompleted: { backgroundColor: '#16A34A' },
  formScrollContent: { padding: 16, paddingBottom: 100 },
  stepHeaderContainer: { marginBottom: 16 },
  stepHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  stepHeaderSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  cleanTextInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1F2937' },
  textArea: { height: 90, textAlignVertical: 'top' },
  datePickerTrigger: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datePickerText: { fontSize: 14, color: '#1F2937' },
  datePickerPlaceholder: { fontSize: 14, color: '#9CA3AF' },
  radioGroup: { flexDirection: 'row', marginVertical: 6 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#9CA3AF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  radioButtonSelected: { borderColor: PRIMARY_BLUE },
  radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: PRIMARY_BLUE },
  radioLabel: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  radioLabelSelected: { color: PRIMARY_BLUE, fontWeight: 'bold' },
  formGroupTitle: { fontSize: 11, fontWeight: 'bold', color: '#6B7280', letterSpacing: 0.5 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  photoBox: { width: '48%', height: 110, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8 },
  photoBoxTitle: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginTop: 4 },
  photoBoxSub: { fontSize: 9, color: '#9CA3AF', textAlign: 'center', marginTop: 2 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  tagActive: { backgroundColor: '#EEF2FF', borderColor: PRIMARY_BLUE },
  tagText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  tagTextActive: { color: PRIMARY_BLUE, fontWeight: 'bold' },
  coverageSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  coverageRowContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  coverageInputGroup: { flex: 1, marginRight: 10 },
  coverageInputLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  coverageInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, color: '#1F2937' },
  coverageDeleteBtn: { padding: 8, marginTop: 14 },
  addCoverageBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, alignSelf: 'flex-start' },
  addCoverageBtnText: { color: PRIMARY_BLUE, fontSize: 13, fontWeight: 'bold' },
  fixedFormFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: WHITE, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', flexDirection: 'row' },
  formFooterBackBtn: { flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  formFooterBackBtnText: { color: '#374151', fontSize: 14, fontWeight: 'bold' },
  primaryAuthBtn: { backgroundColor: PRIMARY_BLUE, paddingVertical: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  primaryAuthBtnText: { color: WHITE, fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
});
