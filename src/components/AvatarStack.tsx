import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SquadMemberProgress } from '../types/study';

interface UserAvatarProps {
  displayName: string;
  photoURL?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  ringClassName?: string;
}

const SIZE_MAP = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-11 w-11 text-sm',
};

const PALETTE = [
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-sky-600 text-white',
  'bg-violet-600 text-white',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'ST';
}

export function UserAvatar({
  displayName,
  photoURL,
  size = 'sm',
  ringClassName = 'ring-2 ring-white dark:ring-slate-900',
}: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const sizeCls = SIZE_MAP[size];

  if (!photoURL || imgFailed) {
    return (
      <div
        title={displayName}
        aria-label={displayName}
        className={`${sizeCls} ${ringClassName} ${getColorForName(displayName)} inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold select-none`}
      >
        {getInitials(displayName)}
      </div>
    );
  }

  return (
    <img
      src={photoURL}
      alt={displayName}
      title={displayName}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className={`${sizeCls} ${ringClassName} inline-block shrink-0 rounded-full object-cover bg-slate-200 dark:bg-slate-800`}
    />
  );
}

interface TaskCompleterAvatarsProps {
  completers: SquadMemberProgress[];
  currentUid: string;
  compact?: boolean;
}

export function TaskCompleterAvatars({
  completers,
  currentUid,
  compact = false,
}: TaskCompleterAvatarsProps) {
  const [showNames, setShowNames] = useState(false);

  if (completers.length === 0) {
    return null;
  }

  // Sort so current user is first if they completed it, then alphabetical
  const sorted = [...completers].sort((a, b) => {
    if (a.uid === currentUid) return -1;
    if (b.uid === currentUid) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  const maxVisible = 5;
  const visible = sorted.slice(0, maxVisible);
  const extra = sorted.length - maxVisible;
  const namesSummary = sorted
    .map((m) => (m.uid === currentUid ? `${m.displayName} (আপনি)` : m.displayName))
    .join(', ');

  return (
    <div
      className="relative inline-flex items-center shrink-0"
      onMouseEnter={() => setShowNames(true)}
      onMouseLeave={() => setShowNames(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowNames((prev) => !prev);
        }}
        aria-label={`সম্পন্ন করেছেন: ${namesSummary}`}
        className="group flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <div className="flex items-center -space-x-2 transition-all duration-150 group-hover:space-x-0.5">
          <AnimatePresence initial={false}>
            {visible.map((member) => (
              <motion.div
                key={member.uid}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="relative"
              >
                <UserAvatar
                  displayName={member.displayName}
                  photoURL={member.photoURL}
                  size={compact ? 'xs' : 'sm'}
                  ringClassName={
                    member.uid === currentUid
                      ? 'ring-2 ring-emerald-500 dark:ring-emerald-400'
                      : 'ring-2 ring-white dark:ring-slate-900'
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {extra > 0 && (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 ring-2 ring-white dark:ring-slate-900">
              +{extra}
            </span>
          )}
        </div>
      </button>

      {showNames && (
        <div
          role="tooltip"
          className="absolute bottom-full right-0 mb-2 z-30 w-max max-w-[230px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 shadow-lg pointer-events-none"
        >
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
            সম্পন্ন করেছেন ({sorted.length})
          </div>
          <div className="leading-snug">{namesSummary}</div>
        </div>
      )}
    </div>
  );
}
