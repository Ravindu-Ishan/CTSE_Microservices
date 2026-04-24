import type { TicketMessage } from '@/lib/types/ticket';

interface MessageThreadProps {
  messages: TicketMessage[];
  currentUserId?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="py-10 text-center text-slate-500 text-sm">
        No messages yet. Be the first to reply.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isOwn = msg.authorId === currentUserId;
        const isStaff = msg.authorRole === 'STAFF';

        return (
          <div
            key={msg.id}
            className={['flex gap-3', isOwn ? 'flex-row-reverse' : ''].join(' ')}
          >
            {/* Avatar */}
            <div
              className={[
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                isStaff
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-700 text-slate-300',
              ].join(' ')}
            >
              {isStaff ? 'S' : 'U'}
            </div>

            {/* Bubble */}
            <div className={['flex flex-col max-w-[75%]', isOwn ? 'items-end' : ''].join(' ')}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500">
                  {isStaff ? 'Support Staff' : 'You'}
                </span>
                <span className="text-xs text-slate-600">{formatTime(msg.createdAt)}</span>
              </div>
              <div
                className={[
                  'px-4 py-3 rounded-xl text-sm leading-relaxed',
                  isOwn
                    ? 'bg-blue-500/15 text-slate-100 border border-blue-500/20'
                    : isStaff
                    ? 'bg-slate-700/60 text-slate-200 border border-slate-600/60'
                    : 'bg-slate-700 text-slate-200',
                ].join(' ')}
              >
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
