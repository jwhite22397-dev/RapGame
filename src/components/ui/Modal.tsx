import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div
        className={clsx(
          'relative w-full bg-dark-900 rounded-t-3xl sm:rounded-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-slide-up sm:animate-scale-in',
          'border border-dark-800',
          {
            'sm:max-w-sm': size === 'sm',
            'sm:max-w-md': size === 'md',
            'sm:max-w-lg': size === 'lg',
            'sm:max-w-[95vw] sm:max-h-[95vh]': size === 'full',
          }
        )}
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-dark-700 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-dark-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet content */}
      <div
        className={clsx(
          'relative w-full bg-dark-900 rounded-t-3xl',
          'max-h-[85vh] overflow-y-auto',
          'animate-slide-up',
          'border-t border-dark-800',
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-dark-900">
          <div className="w-10 h-1 bg-dark-700 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-5 py-3 border-b border-dark-800">
            <h2 className="text-lg font-semibold text-white text-center">{title}</h2>
          </div>
        )}
        
        {/* Body */}
        <div className="p-5 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
