import React, { useState } from 'react';
import { Toaster, toast as baseToast, ToastBar, Toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  loading: 'bg-gray-600 text-white',
} as const;

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  loading: <AlertCircle className="w-5 h-5 animate-ping" />,
} as const;

export default function CustomToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className: 'rounded-xl shadow-xl border text-sm',
      }}
    >
      {(t: Toast) => {
        const type = t.type as keyof typeof typeStyles;

        return (
          <ToastBar toast={t}>
            {({ message }) => (
              <div
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded-xl transition-all',
                  typeStyles[type] || 'bg-neutral-700 text-white'
                )}
              >
                {icons[type] || <Info className="w-5 h-5" />}
                <span>{message}</span>
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
}
