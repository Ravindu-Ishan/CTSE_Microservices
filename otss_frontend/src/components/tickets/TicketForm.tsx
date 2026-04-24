'use client';

import { useState, FormEvent } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { TicketCategory, TicketPriority, CreateTicketDto } from '@/lib/types/ticket';

interface TicketFormProps {
  onSubmit: (data: Omit<CreateTicketDto, 'createdBy'>) => Promise<void>;
  loading?: boolean;
}

const categoryOptions = [
  { value: 'IT', label: 'IT — Technical issues, bugs' },
  { value: 'BILLING', label: 'Billing — Payments, refunds' },
  { value: 'ACCESS', label: 'Access — Account, login issues' },
  { value: 'OTHER', label: 'Other' },
];

const priorityOptions = [
  { value: 'LOW', label: 'Low — Not urgent' },
  { value: 'MEDIUM', label: 'Medium — Affects gameplay' },
  { value: 'HIGH', label: 'High — Blocking progress' },
  { value: 'URGENT', label: 'Urgent — Critical account issue' },
];

interface FormState {
  title: string;
  description: string;
  category: TicketCategory | '';
  priority: TicketPriority;
}

interface FieldErrors {
  title?: string;
  description?: string;
  category?: string;
}

export default function TicketForm({ onSubmit, loading }: TicketFormProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    else if (form.title.length > 200) e.title = 'Max 200 characters.';
    if (!form.description.trim()) e.description = 'Description is required.';
    else if (form.description.length > 2000) e.description = 'Max 2000 characters.';
    if (!form.category) e.category = 'Please select a category.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      title: form.title,
      description: form.description,
      category: form.category as TicketCategory,
      priority: form.priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Title"
        value={form.title}
        onChange={(e) => {
          setForm((f) => ({ ...f, title: e.target.value }));
          setErrors((er) => ({ ...er, title: undefined }));
        }}
        error={errors.title}
        placeholder="Brief summary of your issue"
        maxLength={200}
      />

      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => {
          setForm((f) => ({ ...f, description: e.target.value }));
          setErrors((er) => ({ ...er, description: undefined }));
        }}
        error={errors.description}
        placeholder="Describe the issue in detail — what happened, when, and what you expected."
        rows={5}
        maxLength={2000}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={form.category}
          onChange={(e) => {
            setForm((f) => ({ ...f, category: e.target.value as TicketCategory }));
            setErrors((er) => ({ ...er, category: undefined }));
          }}
          error={errors.category}
          placeholder="Select a category"
        />
        <Select
          label="Priority"
          options={priorityOptions}
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TicketPriority }))}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" loading={loading} size="lg">
          Submit Ticket
        </Button>
      </div>
    </form>
  );
}
