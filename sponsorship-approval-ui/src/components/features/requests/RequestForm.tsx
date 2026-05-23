import type { FormEvent } from 'react';
import { FileClock, Plus } from 'lucide-react';
import type { SponsorshipRequestInput, SponsorshipType } from '../../../types';
import SectionTitle from '../../ui/SectionTitle';
import FormSection from './FormSection';

interface RequestFormProps {
  input: SponsorshipRequestInput;
  types: SponsorshipType[];
  onChange: (input: SponsorshipRequestInput) => void;
  onSubmit: (event: FormEvent) => void;
}

const inputCls =
  'w-full rounded-[7px] border border-[#c7d0d2] bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function RequestForm({
  input,
  types,
  onChange,
  onSubmit,
}: RequestFormProps) {
  const patch = (field: keyof SponsorshipRequestInput, value: string | number) =>
    onChange({ ...input, [field]: value });

  return (
    <form
      className="grid gap-[18px] rounded-lg border border-surface-line bg-surface-card p-[18px] shadow-panel"
      onSubmit={onSubmit}
    >
      <SectionTitle icon={<Plus size={20} />} title="New Request Form" />

      <FormSection title="Basic Information">
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Request title
          <input
            className={inputCls}
            value={input.title}
            onChange={(e) => patch('title', e.target.value)}
            required
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-[7px] text-[13px] font-bold text-muted">
            Requestor
            <input
              className={inputCls}
              value={input.requestorName}
              onChange={(e) => patch('requestorName', e.target.value)}
              required
            />
          </label>
          <label className="grid gap-[7px] text-[13px] font-bold text-muted">
            Department
            <input
              className={inputCls}
              value={input.department}
              onChange={(e) => patch('department', e.target.value)}
              required
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Sponsorship Details">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-[7px] text-[13px] font-bold text-muted">
            Sponsorship type
            <select
              className={inputCls}
              value={input.sponsorshipTypeId}
              onChange={(e) => patch('sponsorshipTypeId', e.target.value)}
              required
            >
              <option value="">Select type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-[7px] text-[13px] font-bold text-muted">
            Event date
            <input
              className={inputCls}
              type="date"
              value={input.eventDate}
              onChange={(e) => patch('eventDate', e.target.value)}
              required
            />
          </label>
        </div>
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Event / organisation
          <input
            className={inputCls}
            value={input.eventOrOrganisationName}
            onChange={(e) => patch('eventOrOrganisationName', e.target.value)}
            required
          />
        </label>
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Requested amount
          <input
            className={inputCls}
            type="number"
            min="1"
            value={input.requestedAmount || ''}
            onChange={(e) => patch('requestedAmount', Number(e.target.value))}
            required
          />
        </label>
      </FormSection>

      <FormSection title="Business Justification">
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Purpose / justification
          <textarea
            className={`${inputCls} min-h-[96px] resize-y`}
            value={input.purpose}
            onChange={(e) => patch('purpose', e.target.value)}
            required
          />
        </label>
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Expected business benefit
          <textarea
            className={`${inputCls} min-h-[96px] resize-y`}
            value={input.expectedBusinessBenefit}
            onChange={(e) => patch('expectedBusinessBenefit', e.target.value)}
          />
        </label>
        <label className="grid gap-[7px] text-[13px] font-bold text-muted">
          Remarks
          <textarea
            className={`${inputCls} min-h-[96px] resize-y`}
            value={input.remarks}
            onChange={(e) => patch('remarks', e.target.value)}
          />
        </label>
      </FormSection>

      <button
        type="submit"
        className="inline-flex w-full min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded-[7px] border border-transparent bg-primary px-3 py-2 text-sm font-extrabold text-white hover:bg-primary-strong"
      >
        <FileClock size={18} /> Save Draft
      </button>
    </form>
  );
}
