'use client';

import { useState, FormEvent } from 'react';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

export default function MessageInput({ onSend, placeholder = 'Write a reply…', disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      setError('Message cannot be empty.');
      return;
    }
    if (trimmed.length > 5000) {
      setError('Max 5000 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSend(trimmed);
      setContent('');
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError('');
        }}
        placeholder={placeholder}
        rows={3}
        error={error}
        disabled={disabled || loading}
        maxLength={5000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{content.length}/5000</span>
        <Button type="submit" loading={loading} disabled={disabled} size="sm">
          Send Reply
        </Button>
      </div>
    </form>
  );
}
