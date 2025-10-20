import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = 'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  
  const variantClasses = {
    default: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400',
    filled: 'border-transparent bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:bg-gray-600',
    outlined: 'border-2 border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400',
  };

  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          errorClasses,
          'min-h-[80px] px-3 py-2 text-sm',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
