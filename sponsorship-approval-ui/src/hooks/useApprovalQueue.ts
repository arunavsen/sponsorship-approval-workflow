import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import type { SponsorshipRequest } from '../types';

export function useApprovalQueue(token: string, mode: 'manager' | 'finance') {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const isManager = mode === 'manager';

  const load = useCallback(async () => {
    const pending = isManager
      ? await api.managerPending(token)
      : await api.financePending(token);
    setRequests(pending);
    setSelectedId((current) => current || pending[0]?.id || '');
  }, [token, isManager]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const selected = requests.find((r) => r.id === selectedId) ?? requests[0];

  const decide = async (
    request: SponsorshipRequest,
    approved: boolean,
    onError: (msg: string) => void,
  ) => {
    try {
      const note = remarks[request.id] ?? '';
      if (isManager) {
        if (approved) await api.managerApprove(token, request.id, note);
        else await api.managerReject(token, request.id, note);
      } else if (approved) {
        await api.financeApprove(token, request.id, note);
      } else {
        await api.financeReject(token, request.id, note);
      }
      setSelectedId('');
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Approval action failed.');
    }
  };

  const setRemark = (id: string, value: string) =>
    setRemarks((prev) => ({ ...prev, [id]: value }));

  return { requests, selected, selectedId, setSelectedId, remarks, setRemark, load, decide };
}
