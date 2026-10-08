import { useState, useRef } from 'react';
import { useToastStore } from '../../../stores/toastStore.js';

export const useAvatar = ({ setAvatarSrc, setPendingAvatar }) => {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Presets are local `preset:<id>` tokens (offline gradient + initials).
  const handleSelectPreset = (presetId) => {
    setPendingAvatar({ type: 'preset', value: presetId });
    setUploadPreview(null);
    setAvatarSrc(presetId);
    setShowAvatarPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      useToastStore.getState().addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      useToastStore.getState().addToast('Image must be under 5 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setUploadPreview(base64);
      setPendingAvatar({ type: 'upload', value: base64 });
      setAvatarSrc(base64);
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setUploadPreview(null);
    setPendingAvatar(null);
    setAvatarSrc(null);
  };

  return {
    showAvatarPicker,
    setShowAvatarPicker,
    uploadPreview,
    fileInputRef,
    handleSelectPreset,
    handleFileChange,
    handleRemoveAvatar,
  };
};