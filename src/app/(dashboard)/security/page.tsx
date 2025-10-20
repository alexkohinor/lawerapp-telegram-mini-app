'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Settings,
  Activity,
  FileText,
  Users,
  Lock
} from 'lucide-react';
import { SecurityTestResult, securityTestingService } from '@/lib/security/security-testing';
import { SecurityIncident, incidentResponseService } from '@/lib/security/incident-response';
import { mfaService } from '@/lib/security/mfa-service';
import MFASetup from '@/components/security/MFASetup';
import { useAuth } from '@/hooks/useAuth';

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'mfa' | 'testing' | 'incidents'>('overview');
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSecurityData();
    }
  }, [user?.id]);

  const loadSecurityData = async () => {
    setIsLoading(true);
    try {
      // Загружаем результаты тестов безопасности
      const results = await securityTestingService.runAllTests();
      setTestResults(results);

      // Загружаем инциденты
      const incidentList = incidentResponseService.getIncidents();
      setIncidents(incidentList);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await securityTestingService.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run security tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getSecurityScore = (): number => {
    if (testResults.length === 0) return 0;
    const passed = testResults.filter(r => r.status === 'passed').length;
    return Math.round((passed / testResults.length) * 100);
  };

  const getSecurityStatus = (): 'excellent' | 'good' | 'warning' | 'critical' => {
    const score = getSecurityScore();
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'contained': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isMFAEnabled = user?.id ? mfaService.isMFARequired(user.id) : false;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8" />
          Безопасность
        </h1>
        <p className="text-gray-600">
          Управление безопасностью системы и мониторинг инцидентов
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Обзор', icon: <Activity className="w-4 h-4" /> },
            { id: 'mfa', label: 'MFA', icon: <Lock className="w-4 h-4" /> },
            { id: 'testing', label: 'Тестирование', icon: <Settings className="w-4 h-4" /> },
            { id: 'incidents', label: 'Инциденты', icon: <AlertTriangle className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Общий уровень безопасности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(getSecurityStatus())}
                    <span className={`text-2xl font-bold ${getStatusColor(getSecurityStatus())}`}>
                      {getSecurityScore()}%
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {getSecurityScore() === 0 
                      ? 'Запустите тесты безопасности для получения оценки'
                      : `${testResults.filter(r => r.status === 'passed').length} из ${testResults.length} тестов пройдено`
                    }
                  </p>
                </div>
                <Button onClick={handleRunSecurityTests} disabled={isRunningTests}>
                  {isRunningTests ? 'Запуск тестов...' : 'Запустить тесты'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Lock className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">MFA</h3>
                    <p className="text-sm text-gray-600">
                      {isMFAEnabled ? 'Включена' : 'Отключена'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Тесты</h3>
                    <p className="text-sm text-gray-600">
                      {testResults.length} тестов выполнено
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Инциденты</h3>
                    <p className="text-sm text-gray-600">
                      {incidents.filter(i => i.status !== 'closed').length} активных
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Последние результаты тестов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.testName}</h4>
                          <p className="text-sm text-gray-600">{result.message}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        result.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {result.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* MFA Tab */}
      {activeTab === 'mfa' && (
        <MFASetup />
      )}

      {/* Testing Tab */}
      {activeTab === 'testing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Тестирование безопасности</CardTitle>
              <CardDescription>
                Автоматизированные тесты для проверки безопасности системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleRunSecurityTests} disabled={isRunningTests} className="mb-4">
                {isRunningTests ? 'Запуск тестов...' : 'Запустить все тесты'}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTestStatusIcon(result.status)}
                        <div>
                          <h4 className="font-medium text-gray-900">{result.testName}</h4>
                          <p className="text-sm text-gray-600">{result.message}</p>
                          <p className="text-xs text-gray-500">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === 'passed' ? 'bg-green-100 text-green-800' :
                          result.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          result.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          result.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {result.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Инциденты безопасности</CardTitle>
              <CardDescription>
                Мониторинг и управление инцидентами безопасности
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Нет зарегистрированных инцидентов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incidents.map(incident => (
                    <div key={incident.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{incident.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncidentSeverityColor(incident.severity)}`}>
                            {incident.severity}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Обнаружен: {incident.detectedAt.toLocaleString()}</span>
                        <span>Категория: {incident.category}</span>
                        <span>Сообщил: {incident.reportedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
