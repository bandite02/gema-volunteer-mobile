import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  RefreshControl,
  Modal,
  StatusBar as RNStatusBar
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import RegisterScreen from './src/components/RegisterScreen';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import AssignTaskModal from './src/components/AssignTaskModal';
import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import FloatingFAB from './src/components/FloatingFAB';
import HomeScreen from './src/screens/HomeScreen';
import TasksScreen from './src/screens/TasksScreen';
import ApprovalScreen from './src/screens/ApprovalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CanvassingScreen from './src/screens/CanvassingScreen';
import VolunteerFormScreen from './src/screens/VolunteerFormScreen';
import CanvassingModal from './src/components/CanvassingModal';

// Base API URL for Android App (.env configuration)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://volunteer-api.gemakita.id/api';


const PRIMARY_BLUE = '#21439A';
const SECONDARY_BLUE = '#21439A';
const GOLD = '#F5A623';
const ORANGE = '#F5A623';
const TEAL = '#16A34A';
const LIGHT_BG = '#F5F7FA';
const WHITE = '#FFFFFF';
const DARK_GRAY = '#1F2937';
const LIGHT_GRAY = '#E5E7EB';
const ERROR_RED = '#DC2626';

export default function App() {
  // Navigation State
  const [screen, setScreen] = useState('SPLASH'); // SPLASH, AUTH, DASHBOARD, VOLUNTEER_FORM, SUCCESS
  const [authTab, setAuthTab] = useState('LOGIN'); // LOGIN, REGISTER
  const [dashboardTab, setDashboardTab] = useState('home'); // home, activity, notif, profile

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (screen === 'SPLASH') {
      // Loop pulse animation on logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [screen]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (token) {
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.status) {
          setUser(res.data.data);
          await AsyncStorage.setItem('gema_auth_user', JSON.stringify(res.data.data));
        }
      }
      await loadLocationsCache();
    } catch (e) {
      console.log('Refresh error:', e.message);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  // Connectivity State
  const [isOnline, setIsOnline] = useState(true);
  const [syncingOffline, setSyncingOffline] = useState(false);

  // App Master Data (Locations cached)
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Auth Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identityNumber, setIdentityNumber] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [subdistrictSearch, setSubdistrictSearch] = useState('');
  const [registerDistrict, setRegisterDistrict] = useState('');
  const [registerSubdistrict, setRegisterSubdistrict] = useState('');
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showSubdistrictModal, setShowSubdistrictModal] = useState(false);

  // Authenticated User Info
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Volunteer Form Inputs (Step State)
  const [formStep, setFormStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('MALE'); // MALE, FEMALE
  const [occupation, setOccupation] = useState('');
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [motivation, setMotivation] = useState('');
  const [addressDetail, setAddressDetail] = useState('');

  // 4 Photo Documentation Fields (1 KTP & 3 Foto Bebas)
  const [photoKtp, setPhotoKtp] = useState(null);
  const [photoFree1, setPhotoFree1] = useState(null);
  const [photoFree2, setPhotoFree2] = useState(null);
  const [photoFree3, setPhotoFree3] = useState(null);

  // Dynamic Coverage Area State (RT/RW pairs)
  const [coverageArea, setCoverageArea] = useState([{ rt: '', rw: '' }]);

  // RBAC & Tasks Mobile States
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [pendingVolunteers, setPendingVolunteers] = useState([]);
  const [approvedVolunteers, setApprovedVolunteers] = useState([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [taskTitleInput, setTaskTitleInput] = useState('');
  const [taskDescInput, setTaskDescInput] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Task Date Range Filter States
  const [taskFromDate, setTaskFromDate] = useState('');
  const [taskToDate, setTaskToDate] = useState('');
  const [showTaskFromPicker, setShowTaskFromPicker] = useState(false);
  const [showTaskToPicker, setShowTaskToPicker] = useState(false);

  // Canvassing Modal State
  const [canvassingModalVisible, setCanvassingModalVisible] = useState(false);

  const addCoverageRow = () => {
    setCoverageArea([...coverageArea, { rt: '', rw: '' }]);
  };

  const removeCoverageRow = (index) => {
    if (coverageArea.length === 1) {
      setCoverageArea([{ rt: '', rw: '' }]);
      return;
    }
    setCoverageArea(coverageArea.filter((_, i) => i !== index));
  };

  const updateCoverageRow = (index, field, value) => {
    const updated = coverageArea.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
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
      if (permissionResult.granted === false) {
        Alert.alert('Izin Kamera Ditolak', 'Akses kamera dibutuhkan untuk mengambil foto secara langsung.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const imageUri = photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri;
        setPhotoState(type, imageUri);
      }
    } catch (error) {
      console.log('Error launching camera:', error.message);
      Alert.alert('Kamera', 'Tidak dapat membuka kamera pada lingkungan emulator/simulator. Menggunakan gambar sampel.');
      const dummyUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
      setPhotoState(type, dummyUri);
    }
  };

  const pickFromGallery = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Izin Galeri Ditolak', 'Akses galeri foto dibutuhkan untuk memilih foto.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        const imageUri = photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : photo.uri;
        setPhotoState(type, imageUri);
      }
    } catch (error) {
      console.log('Error launching gallery:', error.message);
      const dummyUri = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80';
      setPhotoState(type, dummyUri);
    }
  };

  const handlePickPhoto = (type) => {
    const titleMap = { ktp: 'Foto KTP', free1: 'Foto Bebas 1', free2: 'Foto Bebas 2', free3: 'Foto Bebas 3' };
    Alert.alert(
      'Unggah Foto',
      `Pilih sumber foto untuk ${titleMap[type]}:`,
      [
        {
          text: 'Kamera HP (Ambil Foto)',
          onPress: () => takePhotoWithCamera(type)
        },
        {
          text: 'Galeri HP (Pilih Gambar)',
          onPress: () => pickFromGallery(type)
        },
        { text: 'Batal', style: 'cancel' }
      ]
    );
  };

  // Loading States
  const [loading, setLoading] = useState(false);

  // Available Skills & Interests Tag Masters (Dynamic from API / Fallback)
  const [availableSkills, setAvailableSkills] = useState([
    'Pendidikan', 'Desain Grafis', 'Public Speaking', 'IT & Media', 'Kesehatan Medis', 'Logistik', 'Komunikasi'
  ]);
  const [availableInterests, setAvailableInterests] = useState([
    'Pendidikan & Literasi', 'Kesehatan Masyarakat', 'Lingkungan Hidup', 'Tanggap Bencana', 'Ekonomi Kreatif'
  ]);

  const loadSkillsAndInterests = async () => {
    try {
      const [skillsRes, interestsRes] = await Promise.allSettled([
        axios.get(`${API_URL}/skills`),
        axios.get(`${API_URL}/interests`)
      ]);

      if (skillsRes.status === 'fulfilled' && skillsRes.value.data) {
        const raw = skillsRes.value.data.data || skillsRes.value.data;
        if (Array.isArray(raw) && raw.length > 0) {
          const list = raw.map(item => typeof item === 'string' ? item : item.name).filter(Boolean);
          if (list.length > 0) setAvailableSkills(list);
        }
      }

      if (interestsRes.status === 'fulfilled' && interestsRes.value.data) {
        const raw = interestsRes.value.data.data || interestsRes.value.data;
        if (Array.isArray(raw) && raw.length > 0) {
          const list = raw.map(item => typeof item === 'string' ? item : item.name).filter(Boolean);
          if (list.length > 0) setAvailableInterests(list);
        }
      }
    } catch (e) {
      console.log('Error fetching dynamic skills/interests:', e.message);
    }
  };

  // NetInfo listener for offline-first capabilities
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });

    // Check token on boot
    checkAuthToken();

    // Fetch and cache locations
    loadLocationsCache();

    // Fetch dynamic skills and interests
    loadSkillsAndInterests();

    return () => unsubscribe();
  }, []);

  // Monitor online status to trigger queue sync
  useEffect(() => {
    if (isOnline && token) {
      syncOfflineQueue();
    }
  }, [isOnline, token]);

  // Fallback Kecamatan list for Kota Magelang (33.71)
  const getFallbackKecamatan = () => [
    { code: '33.71.01', name: 'Kecamatan Magelang Selatan' },
    { code: '33.71.02', name: 'Kecamatan Magelang Tengah' },
    { code: '33.71.03', name: 'Kecamatan Magelang Utara' }
  ];

  // Load locations from API or cache
  const loadLocationsCache = async () => {
    try {
      setLoadingLocations(true);
      const cached = await AsyncStorage.getItem('gema_locations_cached');
      if (cached) {
        setDistricts(JSON.parse(cached));
      } else {
        setDistricts(getFallbackKecamatan());
      }

      // Fetch fresh data if online (Kota Magelang parent_code=33.71)
      if (isOnline) {
        try {
          const response = await axios.get(`${API_URL}/locations?parent_code=33.71`);
          if (response.data && response.data.status) {
            const list = response.data.data;
            setDistricts(list);
            await AsyncStorage.setItem('gema_locations_cached', JSON.stringify(list));
          }
        } catch (netErr) {
          console.log('Location API fetch failed, using fallback list');
        }
      }
    } catch (e) {
      console.log('Error loading locations:', e.message);
      setDistricts(prev => prev.length ? prev : getFallbackKecamatan());
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch subdistricts for a chosen district
  const fetchSubdistricts = async (districtCode) => {
    if (!districtCode) return;
    const localFallbackSubs = [
      { code: `${districtCode}.01`, name: 'Desa Krajan' },
      { code: `${districtCode}.02`, name: 'Desa Rejo' },
      { code: `${districtCode}.03`, name: 'Desa Makmur' },
      { code: `${districtCode}.04`, name: 'Desa Indah' },
      { code: `${districtCode}.05`, name: 'Desa Mulya' },
    ];
    try {
      setLoadingLocations(true);
      if (isOnline) {
        try {
          const response = await axios.get(`${API_URL}/locations?parent_code=${districtCode}`);
          if (response.data && response.data.status) {
            setSubdistricts(response.data.data);
            await AsyncStorage.setItem(`gema_subdistricts_cached_${districtCode}`, JSON.stringify(response.data.data));
            return;
          }
        } catch (netErr) {
          console.log('Subdistrict API fetch failed, trying cache/fallback');
        }
      }
      
      const cached = await AsyncStorage.getItem(`gema_subdistricts_cached_${districtCode}`);
      if (cached) {
        setSubdistricts(JSON.parse(cached));
      } else {
        setSubdistricts(localFallbackSubs);
      }
    } catch (e) {
      console.log('Error fetching subdistricts:', e.message);
      setSubdistricts(localFallbackSubs);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Auto-Save Volunteer Form draft locally
  useEffect(() => {
    if (screen === 'VOLUNTEER_FORM') {
      saveDraft();
    }
  }, [phone, birthdate, gender, occupation, skills, interests, motivation, addressDetail]);

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

  // Auth Operations
  const checkAuthToken = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync('gema_auth_token');
      if (savedToken) {
        setToken(savedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const savedUser = await AsyncStorage.getItem('gema_auth_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setScreen('DASHBOARD');
        if (isOnline) {
          fetchUserProfile(savedToken);
        }
      } else {
        setScreen('AUTH');
      }
    } catch (e) {
      setScreen('AUTH');
    }
  };

  const isOfficerUser = (userObj) => {
    if (!userObj) return false;
    const roleName = (userObj.roles?.[0]?.name || userObj.role || '').toUpperCase();
    return (
      roleName.includes('ADMIN') ||
      roleName.includes('DPD') ||
      roleName.includes('DPC') ||
      roleName.includes('PENGURUS')
    );
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.data && res.data.status) {
        setUser(res.data.data);
        await AsyncStorage.setItem('gema_auth_user', JSON.stringify(res.data.data));
        setScreen('DASHBOARD');
        fetchTasksAndVolunteers(authToken, res.data.data);
      }
    } catch (e) {
      console.log('Fetch profile error:', e.message);
      setScreen('AUTH');
    }
  };

  const fetchTasksAndVolunteers = async (authToken, currentUser, fromD, toD) => {
    try {
      const targetToken = authToken || token;
      const targetUser = currentUser || user;
      if (!targetToken) return;

      const params = {};
      const fDate = fromD !== undefined ? fromD : taskFromDate;
      const tDate = toD !== undefined ? toD : taskToDate;
      if (fDate) params.from_date = fDate;
      if (tDate) params.to_date = tDate;

      const taskRes = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${targetToken}` },
        params
      });
      if (taskRes.data && taskRes.data.status) {
        const tData = Array.isArray(taskRes.data.data) ? taskRes.data.data : (taskRes.data.data.data || []);
        setAssignedTasks(tData);
      }

      if (isOfficerUser(targetUser)) {
        const volPendingRes = await axios.get(`${API_URL}/volunteers?status=PENDING`, {
          headers: { Authorization: `Bearer ${targetToken}` }
        });
        if (volPendingRes.data && volPendingRes.data.status) {
          const pData = Array.isArray(volPendingRes.data.data) ? volPendingRes.data.data : (volPendingRes.data.data.data || []);
          setPendingVolunteers(pData);
        }

        const volApprovedRes = await axios.get(`${API_URL}/volunteers?status=APPROVED`, {
          headers: { Authorization: `Bearer ${targetToken}` }
        });
        if (volApprovedRes.data && volApprovedRes.data.status) {
          const aData = Array.isArray(volApprovedRes.data.data) ? volApprovedRes.data.data : (volApprovedRes.data.data.data || []);
          setApprovedVolunteers(aData);
        }
      }
    } catch (e) {
      console.log('Error fetching tasks/volunteers in mobile:', e.message);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/tasks/${taskId}/start`);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Task berhasil diterima dan sedang berjalan.');
        fetchTasksAndVolunteers();
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memproses terima task.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/tasks/${taskId}/end`);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Task telah diselesaikan!');
        fetchTasksAndVolunteers();
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memproses selesaikan task.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVolunteerMobile = async (volId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/volunteer/approve/${volId}`);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Relawan berhasil disetujui!');
        fetchTasksAndVolunteers();
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memproses approval.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectVolunteerMobile = async (volId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/volunteer/reject/${volId}`);
      if (res.data && res.data.status) {
        Alert.alert('Berhasil', 'Relawan telah ditolak.');
        fetchTasksAndVolunteers();
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal memproses penolakan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskMobile = async () => {
    if (!taskTitleInput.trim() || !selectedVolunteerId) {
      Alert.alert('Validasi', 'Mohon isi judul task dan pilih relawan penerima tugas.');
      return;
    }
    try {
      setSubmittingTask(true);
      const selectedVol = approvedVolunteers.find(v => v.id === selectedVolunteerId);
      const payload = {
        title: taskTitleInput.trim(),
        description: taskDescInput.trim(),
        assigned_to_volunteer_id: selectedVolunteerId,
        district_code: selectedVol?.user?.district_code || user?.district_code || '33.71.01',
        status: 'PENDING'
      };
      const res = await axios.post(`${API_URL}/tasks`, payload);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Penugasan task berhasil dikirim ke relawan!');
        setAssignModalVisible(false);
        setTaskTitleInput('');
        setTaskDescInput('');
        setSelectedVolunteerId('');
        fetchTasksAndVolunteers();
      }
    } catch (e) {
      Alert.alert('Error', 'Gagal membuat penugasan task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validasi', 'Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      delete axios.defaults.headers.common['Authorization'];
      const res = await axios.post(`${API_URL}/login`, { username, password });
      if (res.data && res.data.status) {
        const authToken = res.data.meta.token;
        const loggedUser = res.data.data;
        
        setToken(authToken);
        setUser(loggedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        await SecureStore.setItemAsync('gema_auth_token', authToken);
        await AsyncStorage.setItem('gema_auth_user', JSON.stringify(loggedUser));
        
        Alert.alert('Sukses', 'Berhasil masuk ke aplikasi.');
        setScreen('DASHBOARD');
      }
    } catch (e) {
      console.error("=== LOGIN DEBUG ERROR ===");
      console.error("Status:", e.response?.status);
      console.error("Data:", JSON.stringify(e.response?.data, null, 2));
      console.error("Message:", e.message);
      console.error("=========================");

      const errors = e.response?.data?.message;
      let errorMsg = 'Gagal login, periksa koneksi internet Anda.';
      if (errors && typeof errors === 'object') {
        errorMsg = Object.values(errors).flat().join('\n');
      } else if (typeof errors === 'string') {
        errorMsg = errors;
      }
      const codeMsg = e.response?.status ? ` [HTTP ${e.response.status}]` : '';
      Alert.alert('Gagal Login', `${errorMsg}${codeMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !name || !email || !identityNumber || !registerDistrict || !registerSubdistrict) {
      Alert.alert('Validasi', 'Mohon lengkapi seluruh field pendaftaran akun.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        username,
        name,
        email,
        identity_number: identityNumber,
        password,
        password_confirmation: password,
        district_code: registerDistrict.code,
        subdistrict_code: registerSubdistrict.code
      };
      
      const res = await axios.post(`${API_URL}/register`, data);
      if (res.data && res.data.status) {
        Alert.alert('Sukses', 'Registrasi akun berhasil! Silakan login.');
        setAuthTab('LOGIN');
        setPassword('');
      }
    } catch (e) {
      const errors = e.response?.data?.message;
      let errorMsg = 'Registrasi gagal, coba lagi.';
      if (errors && typeof errors === 'object') {
        errorMsg = Object.values(errors).flat().join('\n');
      } else if (typeof errors === 'string') {
        errorMsg = errors;
      }
      Alert.alert('Gagal Registrasi', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('gema_auth_token');
      await AsyncStorage.removeItem('gema_auth_user');
      await clearDraft();
      setUser(null);
      setToken(null);
      setUsername('');
      setPassword('');
      setName('');
      setEmail('');
      setIdentityNumber('');
      setRegisterDistrict('');
      setRegisterSubdistrict('');
      setScreen('AUTH');
    } catch (e) {
      console.log('Logout error:', e);
    }
  };

  // Form Operations
  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Submit Volunteer Profile
  const handleSubmitProfile = async () => {
    if (!phone || !birthdate || !occupation || skills.length === 0 || interests.length === 0 || !motivation || !addressDetail) {
      Alert.alert('Validasi', 'Mohon lengkapi seluruh field profil volunteer.');
      return;
    }

    const payload = {
      full_name: user?.name || name || 'Relawan Gema',
      nickname: user?.username || username || 'Relawan',
      phone,
      birthdate,
      gender,
      occupation,
      skills,
      interests,
      motivation,
      address_detail: addressDetail,
      coverage_area: coverageArea.filter(item => item.rt.trim() || item.rw.trim()),
      photo_1: photoKtp,
      photo_2: photoFree1,
      photo_3: photoFree2,
      photo_4: photoFree3
    };

    if (!isOnline) {
      // Offline-first: Queue for submission later
      try {
        setLoading(true);
        await AsyncStorage.setItem('gema_volunteer_queue', JSON.stringify(payload));
        Alert.alert(
          'Offline Mode',
          'Koneksi internet tidak terdeteksi. Pendaftaran Anda telah disimpan secara offline dan akan disinkronisasikan otomatis saat jaringan terhubung.'
        );
        setScreen('SUCCESS');
      } catch (e) {
        Alert.alert('Error', 'Gagal menyimpan data offline.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/volunteer/profile`, payload);
      if (res.data && res.data.status) {
        await clearDraft();
        // Refresh User profile in cache
        if (token) {
          fetchUserProfile(token);
        }
        setScreen('SUCCESS');
      }
    } catch (e) {
      const errors = e.response?.data?.message;
      let errorMsg = 'Gagal menyimpan profil volunteer. Coba lagi.';
      if (errors && typeof errors === 'object') {
        errorMsg = Object.values(errors).flat().join('\n');
      } else if (typeof errors === 'string') {
        errorMsg = errors;
      }
      Alert.alert('Gagal Submit', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Queue Syncing in background
  const syncOfflineQueue = async () => {
    try {
      const queueData = await AsyncStorage.getItem('gema_volunteer_queue');
      if (queueData) {
        setSyncingOffline(true);
        const payload = JSON.parse(queueData);
        const res = await axios.post(`${API_URL}/volunteer/profile`, payload);
        if (res.data && res.data.status) {
          await AsyncStorage.removeItem('gema_volunteer_queue');
          Alert.alert('Sinkronisasi Sukses', 'Pendaftaran volunteer offline Anda berhasil disinkronisasikan ke server.');
          if (token) {
            fetchUserProfile(token);
          }
        }
      }
    } catch (e) {
      console.log('Sync offline error:', e.message);
    } finally {
      setSyncingOffline(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={PRIMARY_BLUE} />
      
      {/* Online Status Banner */}
      {!isOnline && (
        <View style={[styles.statusBanner, { backgroundColor: ORANGE }]}>
          <Text style={styles.statusText}>Mode Offline-First Teraktifkan</Text>
        </View>
      )}
      {syncingOffline && (
        <View style={[styles.statusBanner, { backgroundColor: TEAL }]}>
          <Text style={styles.statusText}>Menyinkronkan data offline...</Text>
        </View>
      )}

      {/* Main Container */}
      <View style={styles.container}>
        {screen === 'SPLASH' && (
          <View style={styles.splashScreen}>
            <Animated.View style={[styles.splashLogoWrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Image source={require('./assets/logo_2.png')} style={styles.splashLogo} resizeMode="contain" />
            </Animated.View>
            <Text style={styles.splashTitle}>GEMA GERAKAN MUDA MAGELANG</Text>
            <View style={styles.splashLoaderContainer}>
              <ActivityIndicator size="large" color={PRIMARY_BLUE} style={{ marginTop: 20 }} />
            </View>
          </View>
        )}

        {screen === 'AUTH' && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.authContainer}
          >
            <ScrollView
              contentContainerStyle={styles.authScrollContainer}
              keyboardShouldPersistTaps="handled"
              style={styles.transparentBg}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_BLUE]} />
              }
            >
              {authTab === 'LOGIN' ? (
                // --- LOGIN SCREEN ---
                <View style={styles.flex1}>
                  <LinearGradient
                    colors={['#21439A', '#1a3580']}
                    style={styles.authHeaderGradient}
                  >
                    <TouchableOpacity style={styles.settingsBtn} onPress={() => Alert.alert('Pengaturan', 'Fitur konfigurasi sistem sedang dalam pengembangan.')}>
                      <Feather name="settings" size={20} color={WHITE} />
                    </TouchableOpacity>

                    <Text style={styles.authGradientTitle}>GERAKAN MUDA MAGELANG</Text>
                  </LinearGradient>

                  <View style={styles.authCardWrapper}>
                    <View style={styles.card}>
                      <View style={styles.cardLogoContainer}>
                        <Image source={require('./assets/gema_logo.png')} style={styles.cardLogo} resizeMode="contain" />
                      </View>
                      <Text style={styles.cardWelcomeTitle}>Selamat Datang Kembali!</Text>
                      <Text style={styles.cardWelcomeSubtitle}>Silakan masuk untuk melanjutkan</Text>

                      <Text style={styles.inputLabel}>Username</Text>
                      <TextInput
                        style={styles.cleanTextInput}
                        placeholder="Masukkan username"
                        value={username}
                        onChangeText={setUsername}
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

                      <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => Alert.alert('Lupa Password', 'Silakan hubungi administrator DPD GEMA untuk menyetel ulang password Anda.')}>
                        <Text style={styles.forgotPasswordText}>Lupa password?</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.primaryAuthBtn} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                          <ActivityIndicator color={WHITE} />
                        ) : (
                          <Text style={styles.primaryAuthBtnText}>MASUK SEKARANG</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.toggleAuthContainerInside} onPress={() => setAuthTab('REGISTER')}>
                        <Text style={styles.toggleAuthLabel}>
                          Belum punya akun? <Text style={styles.toggleAuthAction}>Daftar sekarang</Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <RegisterScreen
                  setAuthTab={setAuthTab}
                  handleRegister={handleRegister}
                  loading={loading}
                  name={name}
                  setName={setName}
                  identityNumber={identityNumber}
                  setIdentityNumber={setIdentityNumber}
                  username={username}
                  setUsername={setUsername}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  registerDistrict={registerDistrict}
                  setRegisterDistrict={setRegisterDistrict}
                  registerSubdistrict={registerSubdistrict}
                  setRegisterSubdistrict={setRegisterSubdistrict}
                  showDistrictModal={showDistrictModal}
                  setShowDistrictModal={setShowDistrictModal}
                  showSubdistrictModal={showSubdistrictModal}
                  setShowSubdistrictModal={setShowSubdistrictModal}
                  districtSearch={districtSearch}
                  setDistrictSearch={setDistrictSearch}
                  subdistrictSearch={subdistrictSearch}
                  setSubdistrictSearch={setSubdistrictSearch}
                  districts={districts}
                  subdistricts={subdistricts}
                  loadingLocations={loadingLocations}
                  fetchSubdistricts={fetchSubdistricts}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        {screen === 'DASHBOARD' && (
          <View style={styles.dashboardContainer}>
            {/* Header Gradient ONLY ON BERANDA TAB */}
            {dashboardTab === 'home' && (
              <Header
                user={user}
                isOfficer={isOfficerUser(user)}
                pendingVolunteersCount={pendingVolunteers.length}
                onOpenNotif={() => setDashboardTab('notif')}
                onOpenProfile={() => setDashboardTab('profile')}
              />
            )}

            {/* Scrollable Tab Content */}
            <ScrollView
              style={styles.transparentBg}
              contentContainerStyle={styles.dashboardTabContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_BLUE]} />
              }
            >
              {dashboardTab === 'home' && (
                <HomeScreen
                  user={user}
                  isOfficer={isOfficerUser(user)}
                  assignedTasks={assignedTasks}
                  pendingVolunteers={pendingVolunteers}
                  onOpenAssignModal={() => setAssignModalVisible(true)}
                  onApproveVol={handleApproveVolunteerMobile}
                  onRejectVol={handleRejectVolunteerMobile}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                  onGoToApprovalTab={() => setDashboardTab('notif')}
                  onOpenVolunteerForm={async () => {
                    await loadDraft();
                    setScreen('VOLUNTEER_FORM');
                  }}
                  apiUrl={API_URL}
                  token={token}
                />
              )}

              {dashboardTab === 'activity' && (
                <TasksScreen
                  user={user}
                  isOfficer={isOfficerUser(user)}
                  assignedTasks={assignedTasks}
                  taskFromDate={taskFromDate}
                  taskToDate={taskToDate}
                  showTaskFromPicker={showTaskFromPicker}
                  showTaskToPicker={showTaskToPicker}
                  setTaskFromDate={setTaskFromDate}
                  setTaskToDate={setTaskToDate}
                  setShowTaskFromPicker={setShowTaskFromPicker}
                  setShowTaskToPicker={setShowTaskToPicker}
                  onApplyFilter={() => fetchTasksAndVolunteers(token, user, taskFromDate, taskToDate)}
                  onResetFilter={() => {
                    setTaskFromDate('');
                    setTaskToDate('');
                    fetchTasksAndVolunteers(token, user, '', '');
                  }}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                />
              )}

              {(dashboardTab === 'relawan' || dashboardTab === 'notif') && (
                <ApprovalScreen
                  isOfficer={true}
                  pendingVolunteers={pendingVolunteers}
                  assignedTasks={assignedTasks}
                  onApproveVol={handleApproveVolunteerMobile}
                  onRejectVol={handleRejectVolunteerMobile}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                  apiUrl={API_URL}
                  token={token}
                  user={user}
                />
              )}

              {dashboardTab === 'canvassing' && (
                <CanvassingScreen
                  apiUrl={API_URL}
                  token={token}
                  user={user}
                />
              )}

              {dashboardTab === 'kegiatan' && (
                <TasksScreen
                  user={user}
                  isOfficer={isOfficerUser(user)}
                  assignedTasks={assignedTasks}
                  taskFromDate={taskFromDate}
                  taskToDate={taskToDate}
                  showTaskFromPicker={showTaskFromPicker}
                  showTaskToPicker={showTaskToPicker}
                  setTaskFromDate={setTaskFromDate}
                  setTaskToDate={setTaskToDate}
                  setShowTaskFromPicker={setShowTaskFromPicker}
                  setShowTaskToPicker={setShowTaskToPicker}
                  onApplyFilter={() => fetchTasksAndVolunteers(token, user, taskFromDate, taskToDate)}
                  onResetFilter={() => {
                    setTaskFromDate('');
                    setTaskToDate('');
                    fetchTasksAndVolunteers(token, user, '', '');
                  }}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                />
              )}

              {dashboardTab === 'profile' && (
                <ProfileScreen
                  user={user}
                  isOfficer={isOfficerUser(user)}
                  onLogout={handleLogout}
                />
              )}
            </ScrollView>

            {/* Fixed Floating Action Button (+) for Officers & Volunteers */}
            {(dashboardTab === 'home' || dashboardTab === 'notif') && (
              <FloatingFAB
                onPress={() => {
                  if (isOfficerUser(user)) {
                    setAssignModalVisible(true);
                  } else {
                    setCanvassingModalVisible(true);
                  }
                }}
              />
            )}

            {/* Global Canvassing Modal */}
            <CanvassingModal
              visible={canvassingModalVisible}
              onClose={() => setCanvassingModalVisible(false)}
              apiUrl={API_URL}
              token={token}
              user={user}
              onCanvassingSaved={() => fetchTasksAndVolunteers()}
            />

            {/* Bottom Navigation Tab Bar Component */}
            <BottomNav
              dashboardTab={dashboardTab}
              setDashboardTab={setDashboardTab}
              isOfficer={isOfficerUser(user)}
              pendingVolunteersCount={pendingVolunteers.length}
            />
          </View>
        )}

        {screen === 'VOLUNTEER_FORM' && (
          <VolunteerFormScreen
            user={user}
            token={token}
            apiUrl={API_URL}
            availableSkills={availableSkills}
            availableInterests={availableInterests}
            onSuccess={() => {
              fetchUserProfile(token);
              setScreen('DASHBOARD');
            }}
            onCancel={() => setScreen('DASHBOARD')}
          />
        )}

        {screen === 'SUCCESS' && (
          <View style={styles.successScreen}>
            <View style={styles.successCircleWrapper}>
              <View style={styles.successCheckCircle}>
                <Feather name="check" size={32} color={WHITE} />
              </View>
            </View>
            <Text style={styles.successTitle}>Profil Berhasil Disimpan!</Text>
            <Text style={styles.successSubtitle}>
              Data profil volunteer Anda berhasil disimpan. Selamat bergabung menjadi bagian dari GEMA Volunteer!
            </Text>
            <TouchableOpacity
              style={styles.primaryAuthBtn}
              onPress={() => {
                if (token) {
                  fetchUserProfile(token);
                }
                setScreen('DASHBOARD');
              }}
            >
              <Text style={styles.primaryAuthBtnText}>KE DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Separate Component: Modal Penugasan Task Baru (Mobile) */}
        <AssignTaskModal
          visible={assignModalVisible}
          onClose={() => setAssignModalVisible(false)}
          approvedVolunteers={approvedVolunteers}
          user={user}
          apiUrl={API_URL}
          onTaskCreated={() => fetchTasksAndVolunteers()}
        />
      </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  flex1: {
    flex: 1,
  },
  statusBanner: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  splashScreen: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  splashLogoWrapper: {
    marginBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 280,
    height: 280,
  },
  splashLoaderContainer: {
    marginTop: 40,
    height: 50,
    justifyContent: 'center',
  },
  splashTitle: {
    color: PRIMARY_BLUE,
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  splashSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  authContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  authScrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  authHeaderGradient: {
    paddingTop: 50,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  authHeaderGradientSmall: {
    paddingTop: 40,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  authLogoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#060e24',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authLogo: {
    width: '100%',
    height: '100%',
  },
  authGradientTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 4,
  },
  authGradientSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
  },
  authCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -28,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#21439A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  cardLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  cardLogo: {
    width: 280,
    height: 120,
  },
  cardWelcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  cardWelcomeSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 22,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_GRAY,
    marginBottom: 6,
    marginTop: 12,
  },
  inputRow: {
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
  inputRowIcon: {
    marginRight: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: DARK_GRAY,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: PRIMARY_BLUE,
    fontSize: 13,
    fontWeight: '600',
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
  dashboardContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  dashboardHeaderGradient: {
    paddingTop: 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#004AD7',
  },
  glassHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  glassHeaderCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  glassHeaderCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
  },
  glassBadgeGreen: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  glassBadgeRed: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  glassBadgeGreenText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  glassHeaderCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassHeaderCardCol: {
    flex: 1,
    alignItems: 'center',
  },
  glassIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  glassColLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 2,
  },
  glassColValue: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
  },
  dashboardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardWelcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: WHITE,
  },
  dashboardUserLevel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 4,
  },
  dashboardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardHeaderActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
    borderWidth: 1.5,
    borderColor: '#21439A',
  },
  headerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
  dashboardTabContent: {
    padding: 20,
    paddingBottom: 110,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK_GRAY,
  },
  cardDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  cardDetailVal: {
    color: DARK_GRAY,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  statusBadgeText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  placeholderTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(33, 67, 154, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarLargeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
  },
  profileNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  profileEmailText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileLevelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  profileRowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileRowLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  profileRowVal: {
    fontSize: 13,
    color: DARK_GRAY,
    fontWeight: '500',
    textAlign: 'right',
  },
  modernLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: WHITE,
    marginTop: 10,
    marginBottom: 10,
  },
  modernLogoutBtnText: {
    color: ERROR_RED,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bottomNavTabBar: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    paddingVertical: 10,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 16,
    right: 16,
    height: 66,
    // Premium soft shadow to float elegantly over content
    shadowColor: '#21439A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomNavTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavTabIcon: {
    fontSize: 20,
    marginBottom: 2,
    color: '#6B7280',
  },
  bottomNavTabLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  bottomNavTabActiveColor: {
    color: PRIMARY_BLUE,
  },
  bottomNavTabActiveLabel: {
    color: PRIMARY_BLUE,
    fontWeight: '700',
  },
  fabButtonFixed: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  formHeaderGradient: {
    paddingTop: 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  progressStepperContainer: {
    width: '100%',
  },
  progressStepperTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStepperStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressStepperLabelText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressStepperTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
  },
  progressStepperFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 3,
  },
  stepDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: LIGHT_BG,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    width: 20,
    backgroundColor: PRIMARY_BLUE,
  },
  stepDotCompleted: {
    backgroundColor: PRIMARY_BLUE,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  stepHeaderContainer: {
    marginBottom: 16,
  },
  stepHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_GRAY,
    marginBottom: 4,
  },
  stepHeaderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  fixedFormFooter: {
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    flexDirection: 'row',
    gap: 10,
  },
  formFooterBackBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFooterBackBtnText: {
    fontSize: 14,
    color: DARK_GRAY,
    fontWeight: '600',
  },
  successCircleWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  successCheckCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheckIcon: {
    color: WHITE,
    fontSize: 36,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK_GRAY,
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 44,
  },
  inlineModal: {
    backgroundColor: WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LIGHT_GRAY,
    padding: 12,
    marginTop: 5,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PRIMARY_BLUE,
    marginBottom: 8,
  },
  modalScroll: {
    maxHeight: 250,
  },
  modalSearchInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    color: DARK_GRAY,
    backgroundColor: '#F9FAFB',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
  },
  modalItemText: {
    fontSize: 15,
    color: DARK_GRAY,
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 5,
  },
  closeModalText: {
    color: ORANGE,
    fontWeight: 'bold',
  },
  datePickerTrigger: {
    backgroundColor: WHITE,
    borderRadius: 12,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerText: {
    color: DARK_GRAY,
    fontSize: 14,
  },
  datePickerPlaceholder: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  radioGroup: {
    marginTop: 8,
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 4,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: PRIMARY_BLUE,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_BLUE,
  },
  radioLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  radioLabelSelected: {
    color: DARK_GRAY,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  tagText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '500',
  },
  tagTextActive: {
    color: WHITE,
    fontWeight: '700',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  photoBox: {
    width: '48%',
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: DARK_GRAY,
    marginTop: 6,
  },
  photoBoxSub: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
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
    fontSize: 10,
    color: PRIMARY_BLUE,
    fontWeight: '600',
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
  emptyTextSubtle: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  pickerWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    maxHeight: 140,
  },
  volSelectItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  volSelectItemActive: {
    backgroundColor: PRIMARY_BLUE,
  },
  volSelectItemText: {
    fontSize: 12,
    color: DARK_GRAY,
    fontWeight: '500',
  },
  volSelectItemTextActive: {
    color: WHITE,
    fontWeight: '700',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSubmitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
  },
  modalSubmitBtnText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 13,
  },
  coverageSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  coverageRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coverageInputGroup: {
    flex: 1,
    marginRight: 10,
  },
  coverageInputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    marginBottom: 4,
  },
  coverageInput: {
    backgroundColor: WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: DARK_GRAY,
  },
  coverageDeleteBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCoverageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: PRIMARY_BLUE,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  addCoverageBtnText: {
    color: PRIMARY_BLUE,
    fontWeight: '700',
    fontSize: 13,
  },
});
