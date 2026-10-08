import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiFetch } from '../../../lib/apiClient.js';
import { useAuth } from '../../../hooks/useAuth.jsx';
import { getAvatarUrl } from '../utils/avatar.js';
import { goalLabel, GOAL_TYPES } from '../../Onboarding/constants/goals.js';

// Raw goal enums (e.g. BUILD_MUSCLE) must never leak into the Bio textbox.
// Normalize once at load so both a saved enum and the user.goal fallback
// display as their human label ("Build Muscle").
const GOAL_KEYS = new Set(GOAL_TYPES.map((g) => g.key));
const prettyBio = (raw) => (GOAL_KEYS.has(raw) ? goalLabel(raw) : (raw || ''));

export const useProfile = () => {
  const navigate = useNavigate();
  const { user, loading, logout, setUser, refreshAuth } = useAuth();
  const USER_ID = user?.id || null;

  const [isLoading,      setIsLoading]      = useState(true);
  const [isSaving,       setIsSaving]       = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [toastVisible,   setToastVisible]   = useState(false);
  const [toastMessage,   setToastMessage]   = useState('');
  const [toastVariant,   setToastVariant]   = useState('success');
  const [sessions,       setSessions]       = useState([]);
  const [isDirty,        setIsDirty]        = useState(false);

  const [dailyStats, setDailyStats] = useState({
    calories_burned: 0,
    steps: 0,
    workout_duration_mins: 0,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email:    '',
    contact:  '',
    bio:      '',
    height_cm: '',
    weight_kg: '',
  });
  const [onboarding, setOnboarding] = useState(null);
  // Goal identity (dob/sex) — editable from My Account, stored on the
  // active fitness_goals row (NOT in users/user_profiles).
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [savedDob, setSavedDob] = useState('');
  const [savedSex, setSavedSex] = useState('');
  const [savedData,      setSavedData]      = useState({ ...formData });
  const [avatarSrc,      setAvatarSrc]      = useState(null);
  const [savedAvatarSrc, setSavedAvatarSrc] = useState(null);
  const [pendingAvatar,  setPendingAvatar]  = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const showToast = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastVisible(true);
  };

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  // ── Fetch sessions ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) return;
    const fetchSessions = async () => {
      try {
        const data = await apiGet('/api/security');
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        setSessions([]);
      }
    };
    fetchSessions();
  }, [USER_ID]);

  // ── Fetch today's activity stats ──────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) return;
    const fetchStats = async () => {
      try {
        setDailyStats(await apiGet(`/api/stats/daily/${USER_ID}`));
      } catch (err) {
        if (import.meta.env.DEV) console.error('Daily stats fetch error:', err);
      }
    };
    fetchStats();
  }, [USER_ID]);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!USER_ID) {
      if (!loading) setIsLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const dbData = await apiGet(`/api/profile/${USER_ID}`);

          const mapped = {
            fullName:  dbData.fullName || user?.name  || '',
            email:     dbData.email    || user?.email || '',
            contact:   dbData.contact  || '',
            bio:       prettyBio(dbData.bio || (/unspecified/i.test(user?.goal || '') ? '' : user?.goal)),
            height_cm: dbData.height_cm ?? dbData.onboarding?.heightCm ?? '',
            weight_kg: dbData.weight_kg ?? dbData.onboarding?.weightKg ?? '',
          };
          setFormData(mapped);
          setSavedData(mapped);
          setOnboarding(dbData.onboarding || null);
          // Normalize for inputs: date-only for <input type="date">, UPPER for chips/select.
          const ob = dbData.onboarding || null;
          const dobNorm = ob?.dob ? String(ob.dob).slice(0, 10) : '';
          const sexNorm = ob?.sex ? String(ob.sex).toUpperCase() : '';
          setDob(dobNorm);
          setSavedDob(dobNorm);
          setSex(sexNorm);
          setSavedSex(sexNorm);

          const src = dbData.avatar_url || user?.avatar || getAvatarUrl(USER_ID);
          setAvatarSrc(src);
          setSavedAvatarSrc(src);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Failed to fetch profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [USER_ID, loading, user]);

  // ── Track dirty state ──────────────────────────────────────────────────────
  // FIX: height_cm / weight_kg removed from the dirty check — they're
  // read-only on this page now and can never differ from savedData here.
  useEffect(() => {
    const formChanged =
      formData.fullName !== savedData.fullName ||
      formData.contact  !== savedData.contact  ||
      formData.bio      !== savedData.bio;
    const identityChanged = dob !== savedDob || sex !== savedSex;
    setIsDirty(formChanged || identityChanged || !!pendingAvatar);
  }, [formData, savedData, dob, savedDob, sex, savedSex, pendingAvatar]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleInputChange = (e, field) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (!isEditing) setIsEditing(true);
  };

  const doDiscard = () => {
    setFormData({ ...savedData });
    setDob(savedDob);
    setSex(savedSex);
    setPendingAvatar(null);
    setAvatarSrc(savedAvatarSrc);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    if (!isDirty) {
      doDiscard();
      return;
    }
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    doDiscard();
    setShowDiscardConfirm(false);
  };

  const cancelDiscard = () => setShowDiscardConfirm(false);

  const handleRevoke = async (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    try {
      await apiFetch(`/api/security/${sessionId}`, { method: 'DELETE' });
      showToast('Session revoked');
    } catch (err) {
      if (import.meta.env.DEV) console.error('Revoke session error:', err);
      const data = await apiGet('/api/security').catch(() => null);
      if (Array.isArray(data)) setSessions(data);
      showToast('Failed to revoke session', 'error');
    }
  };

  const handleSave = async () => {
    if (!USER_ID) return;
    setIsSaving(true);
    try {
      const avatarToSave = pendingAvatar
        ? pendingAvatar.value
        : (avatarSrc || savedAvatarSrc || null);

      // FIX: height_cm / weight_kg intentionally NOT included in this
      // request anymore — they're read-only on this page and are owned
      // by the BMI page. Sending them here (even unchanged) is unnecessary
      // now that the backend route no longer accepts/updates them.
      const body = {
        fullName:   formData.fullName,
        contact:    formData.contact,
        bio:        formData.bio,
        avatar_url: avatarToSave,
      };

      await apiFetch('/api/profile/update', {
        method: 'PUT',
        body:   JSON.stringify(body),
      });

      // Goal identity lives on the active fitness_goals row — PATCH it
      // separately so DOB/sex edits don't force a full goal rewrite.
      // Skipped users have no active goal: their fields stay disabled in UI.
      if (onboarding && (dob !== savedDob || sex !== savedSex)) {
        const g = await apiFetch(`/api/goals/active/${USER_ID}`, {
          method: 'PATCH',
          body:   JSON.stringify({ dob: dob || null, sex: sex || null }),
        });
        if (g?.goal) setOnboarding(g.goal);
        setSavedDob(dob);
        setSavedSex(sex);
      }

      setSavedData({ ...formData });
      setSavedAvatarSrc(avatarToSave);
      setPendingAvatar(null);
      setIsEditing(false);
      setIsDirty(false);

      setUser(prev => ({
        ...prev,
        name:       formData.fullName,
        avatar:     avatarToSave,
        avatar_url: avatarToSave,
      }));

      await refreshAuth();

      showToast('Profile saved');
    } catch (err) {
      if (import.meta.env.DEV) console.error('Save error:', err);
      showToast('Save failed — check your connection', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return {
    user, loading, USER_ID,
    isLoading, isSaving, isEditing, isDirty,
    toastVisible, toastMessage, toastVariant,
    sessions,
    dailyStats,
    formData, onboarding, setOnboarding, avatarSrc, pendingAvatar,
    dob, setDob, sex, setSex,
    setToastVisible, setAvatarSrc, setPendingAvatar, setIsEditing,
    handleInputChange, handleDiscard, confirmDiscard, cancelDiscard, showDiscardConfirm, handleRevoke, handleSave, handleLogout,
    showToast,
  };
};