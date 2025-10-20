'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateDisputeForm } from '@/components/forms/CreateDisputeForm';
import { CreateDisputeRequest } from '@/lib/validations/dispute';
import { useTelegramWebApp } from '@/lib/telegram/telegram-auth';

export default function CreateDisputePage() {
  const router = useRouter();
  const { showAlert, notificationFeedback } = useTelegramWebApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateDisputeRequest) => {
    setIsLoading(true);
    
    try {
      // API вызов для создания спора
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        notificationFeedback('success');
        showAlert('Спор успешно создан!', () => {
          router.push('/disputes');
        });
      } else {
        throw new Error(result.error || 'Ошибка создания спора');
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
      notificationFeedback('error');
      showAlert('Ошибка при создании спора. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Создание спора</h1>
                <p className="text-sm text-gray-600">Заполните форму для создания нового спора</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-4">
          <CreateDisputeForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
