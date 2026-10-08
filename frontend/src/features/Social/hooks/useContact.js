import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../../../lib/apiClient.js';
import { useToastStore } from '../../../stores/toastStore.js';

export const useContacts = (userId) => {
  const [contacts,      setContacts]      = useState([]);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [contactsError, setContactsError] = useState(null);

  // Clear results synchronously with the term (instead of an effect) so the
  // debounced search effect only handles non-empty queries.
  const updateSearchTerm = (value) => {
    setSearchTerm(value);
    if (!String(value).trim()) setSearchResults([]);
  };

  // ── Load friends from DB ──────────────────────────────────────────────────
  const reloadContacts = async () => {
    if (!userId) return;
    setContactsError(null);
    try {
      const data = await apiGet(`/api/contacts/${userId}`);
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      setContactsError(err);
      if (import.meta.env.DEV) console.error('Error loading contacts:', err);
    }
  };

  useEffect(() => {
    reloadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Debounced user search ─────────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const data = await apiGet(
          `/api/users/search?query=${encodeURIComponent(searchTerm)}&excludeId=${userId}`
        );
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (import.meta.env.DEV) console.error('Search error:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, userId]);

  // ── Add friend ────────────────────────────────────────────────────────────
  const handleAddFriend = async (friendUser, setActiveContact) => {
    setContacts(prev => [friendUser, ...prev]);
    setActiveContact(friendUser);
    setSearchTerm('');
    setSearchResults([]);
    try {
      await apiPost('/api/friends/add', { userId, friendId: friendUser.id });
    } catch (err) {
      useToastStore.getState().addToast('Could not save friend — will retry on refresh.', 'error');
      if (import.meta.env.DEV) console.error('Failed to save friend:', err);
    }
  };

  return {
    contacts,
    setContacts,
    searchTerm,
    setSearchTerm: updateSearchTerm,
    searchResults,
    handleAddFriend,
    contactsError,
    reloadContacts,
  };
};