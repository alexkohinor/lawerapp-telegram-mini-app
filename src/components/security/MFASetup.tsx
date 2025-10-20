'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MFAMethod, mfaService } from '@/lib/security/mfa-service';
import { useAuth } from '@/hooks/useAuth';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  CheckCircle, 
  XCircle, 
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface MFASetupProps {
  onSetupComplete?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onSetupComplete }) => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<MFAMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState<MFAMethod['type']>('sms');
  const [newMethodName, setNewMethodName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingMethodId, setPendingMethodId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserMethods();
    }
  }, [user?.id]);

  const loadUserMethods = async () => {
    if (!user?.id) return;
    
    try {
      const userMethods = mfaService.getUserMethods(user.id);
      setMethods(userMethods);
    } catch (err) {
      console.error('Failed to load MFA methods:', err);
      setError('Не удалось загрузить методы аутентификации');
    }
  };

  const handleAddMethod = async () => {
    if (!user?.id || !newMethodName.trim()) {
      setError('Введите название метода');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newMethod = await mfaService.addMFAMethod(user.id, newMethodType, newMethodName);
      setMethods(prev => [...prev, newMethod]);
      setNewMethodName('');
      setShowAddMethod(false);
      setSuccess('Метод аутентификации добавлен');
    } catch (err: any) {
      setError(err.message || 'Не удалось добавить метод');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableMethod = async (methodId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const method = methods.find(m => m.id === methodId);
      if (!method) {
        throw new Error('Метод не найден');
      }

      // Инициируем MFA для верификации
      const challengeId = await mfaService.initiateMFA(user.id, method.type);
      setChallengeId(challengeId);
      setPendingMethodId(methodId);
      setShowVerification(true);
      setSuccess('Код отправлен для верификации');
    } catch (err: any) {
      setError(err.message || 'Не удалось включить метод');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!challengeId || !verificationCode.trim()) {
      setError('Введите код верификации');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await mfaService.verifyMFA(challengeId, verificationCode);
      
      if (pendingMethodId && user?.id) {
        await mfaService.enableMFAMethod(user.id, pendingMethodId);
        await loadUserMethods();
      }

      setShowVerification(false);
      setChallengeId(null);
      setPendingMethodId(null);
      setVerificationCode('');
      setSuccess('Метод аутентификации успешно включен');
      onSetupComplete?.();
    } catch (err: any) {
      setError(err.message || 'Неверный код верификации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMethod = async (methodId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      await mfaService.disableMFAMethod(user.id, methodId);
      await loadUserMethods();
      setSuccess('Метод аутентификации отключен');
    } catch (err: any) {
      setError(err.message || 'Не удалось отключить метод');
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (type: MFAMethod['type']) => {
    switch (type) {
      case 'sms':
        return <Smartphone className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'totp':
        return <Key className="w-5 h-5" />;
      case 'backup_codes':
        return <Shield className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const getMethodName = (type: MFAMethod['type']) => {
    switch (type) {
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      case 'totp':
        return 'TOTP (Google Authenticator)';
      case 'backup_codes':
        return 'Резервные коды';
      default:
        return 'Неизвестный метод';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Двухфакторная аутентификация
          </CardTitle>
          <CardDescription>
            Дополнительная защита вашего аккаунта с помощью двухфакторной аутентификации
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-4">
            {methods.map(method => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getMethodIcon(method.type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{getMethodName(method.type)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {method.isEnabled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Включен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <XCircle className="w-3 h-3" />
                          Отключен
                        </span>
                      )}
                      {method.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                          <CheckCircle className="w-3 h-3" />
                          Проверен
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isEnabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisableMethod(method.id)}
                      disabled={isLoading}
                    >
                      Отключить
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleEnableMethod(method.id)}
                      disabled={isLoading}
                    >
                      Включить
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {methods.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>У вас пока нет настроенных методов аутентификации</p>
                <p className="text-sm">Добавьте первый метод для защиты аккаунта</p>
              </div>
            )}

            {!showAddMethod && (
              <Button
                variant="outline"
                onClick={() => setShowAddMethod(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить метод аутентификации
              </Button>
            )}

            {showAddMethod && (
              <Card>
                <CardHeader>
                  <CardTitle>Добавить новый метод</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип метода
                    </label>
                    <select
                      value={newMethodType}
                      onChange={(e) => setNewMethodType(e.target.value as MFAMethod['type'])}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                      <option value="totp">TOTP (Google Authenticator)</option>
                      <option value="backup_codes">Резервные коды</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название метода
                    </label>
                    <Input
                      value={newMethodName}
                      onChange={(e) => setNewMethodName(e.target.value)}
                      placeholder="Например: Мой телефон"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddMethod}
                      disabled={isLoading || !newMethodName.trim()}
                    >
                      Добавить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddMethod(false);
                        setNewMethodName('');
                        setError(null);
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showVerification && (
              <Card>
                <CardHeader>
                  <CardTitle>Верификация метода</CardTitle>
                  <CardDescription>
                    Введите код, который был отправлен вам для подтверждения
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Код верификации
                    </label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Введите код"
                      type="text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyCode}
                      disabled={isLoading || !verificationCode.trim()}
                    >
                      Подтвердить
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVerification(false);
                        setChallengeId(null);
                        setPendingMethodId(null);
                        setVerificationCode('');
                        setError(null);
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MFASetup;
