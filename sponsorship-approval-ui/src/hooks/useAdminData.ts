import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { SponsorshipRequest, SponsorshipType, WorkflowHistory } from '../types';

export function useAdminData(token: string) {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [types, setTypes] = useState<SponsorshipType[]>([]);
  const [history, setHistory] = useState<WorkflowHistory[]>([]);

  const load = useCallback(async () => {
    const [allRequests, allTypes] = await Promise.all([
      api.adminRequests(token),
      api.adminSponsorshipTypes(token),
    ]);
    setRequests(allRequests);
    setTypes(allTypes);
  }, [token]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const loadHistory = async (requestId: string) => {
    const data = await api.requestHistory(token, requestId);
    setHistory(data);
  };

  const createType = async (name: string) => {
    if (!name.trim()) return;
    await api.createType(token, name);
    await load();
  };

  const toggleType = async (type: SponsorshipType) => {
    await api.updateType(token, { ...type, isActive: !type.isActive });
    await load();
  };

  return { requests, types, history, load, loadHistory, createType, toggleType };
}
