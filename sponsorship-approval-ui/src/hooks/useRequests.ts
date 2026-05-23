import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../services/api';
import type { SponsorshipRequest, SponsorshipRequestInput, SponsorshipType } from '../types';
import { EMPTY_REQUEST_INPUT } from '../types';

export function useRequests(token: string, displayName: string) {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [types, setTypes] = useState<SponsorshipType[]>([]);
  const [input, setInput] = useState<SponsorshipRequestInput>({
    ...EMPTY_REQUEST_INPUT,
    requestorName: displayName,
  });

  const load = useCallback(async () => {
    const data = await api.getMyRequests(token);
    setRequests(data);
  }, [token]);

  const loadTypes = useCallback(async () => {
    const loaded = await api.sponsorshipTypes(token);
    const activeTypes = loaded.filter((t) => t.isActive);
    setTypes(activeTypes);
    setInput((prev) =>
      !prev.sponsorshipTypeId && activeTypes[0]
        ? { ...prev, sponsorshipTypeId: activeTypes[0].id }
        : prev,
    );
  }, [token]);

  useEffect(() => {
    load().catch(() => {});
    loadTypes().catch(() => {});
  }, [load, loadTypes]);

  const saveDraft = async (event: FormEvent, onError: (msg: string) => void) => {
    event.preventDefault();
    onError('');
    try {
      await api.createRequest(token, input);
      setInput({
        ...EMPTY_REQUEST_INPUT,
        requestorName: displayName,
        sponsorshipTypeId: input.sponsorshipTypeId,
      });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to save draft.');
    }
  };

  return { requests, types, input, setInput, load, saveDraft };
}
