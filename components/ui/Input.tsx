// components/ui/Input.tsx
import { clsx } from 'clsx';
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  function Input({ className, error, ...props }, ref) {
    return (
      <div className="space-y-1">
        <input ref={ref} className={clsx(inputClass, error && 'border-red-400 focus:ring-red-400', className)} {...props} />
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  function Textarea({ className, error, ...props }, ref) {
    return (
      <div className="space-y-1">
        <textarea ref={ref} className={clsx(inputClass, 'resize-y min-h-[80px]', error && 'border-red-400', className)} {...props} />
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }>(
  function Select({ className, error, children, ...props }, ref) {
    return (
      <div className="space-y-1">
        <select ref={ref} className={clsx(inputClass, error && 'border-red-400', className)} {...props}>{children}</select>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    );
  }
);

export function FormField({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default Input;
