import { useState, useRef } from 'react';
import { useToastStore } from '../../../../stores/toastStore.js';
import { compressAvatarFile } from '../utils/compressAvatar.js';

// Avatar edits stay as a local draft until the user confirms them, so the
// profile photo never changes (or saves) by accident.
// Draft shape: { type: 'upload', value: <base64> } | { type: 'remove' } | null
export const useAvatar = () => {
  const [uploadPreview, setUploadPreview] = useState(null);
  const [draftAvatar, setDraftAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again still fires onChange.
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      useToastStore.getState().addToast('Please select an image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      useToastStore.getState().addToast('Image must be under 5 MB.', 'error');
      return;
    }

    // Downscale before saving: the backend caps avatar_url at 200KB, and raw
    // photo base64 would be rejected — previously the avatar never persisted.
    compressAvatarFile(file)
      .then((base64) => {
        setUploadPreview(base64);
        setDraftAvatar({ type: 'upload', value: base64 });
      })
      .catch((err) => {
        useToastStore.getState().addToast(err?.message || 'Could not process that image.', 'error');
      });
  };

  const handleRemoveAvatar = () => {
    setUploadPreview(null);
    setDraftAvatar({ type: 'remove' });
  };

  const clearDraft = () => {
    setUploadPreview(null);
    setDraftAvatar(null);
  };

  return {
    uploadPreview,
    draftAvatar,
    fileInputRef,
    handleFileChange,
    handleRemoveAvatar,
    clearDraft,
  };
};
