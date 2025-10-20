# 📊 Мониторинг и аналитика LawerApp Telegram Mini App

## 📋 Обзор мониторинга

**LawerApp** использует современную систему мониторинга и аналитики, основанную на передовых технологиях 2025 года. Система обеспечивает полную видимость производительности, пользовательского опыта и бизнес-метрик в реальном времени.

---

## 🎯 Принципы мониторинга

### **1. Observability Stack**

#### **Современный стек наблюдаемости:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Observability Stack                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Metrics       │  │   Logs          │  │   Traces    │  │
│  │   (Prometheus)  │  │   (Loki)        │  │   (Jaeger)  │  │
│  │                 │  │                 │  │             │  │
│  │ • Performance   │  │ • Application   │  │ • Request   │  │
│  │ • Business      │  │ • Security      │  │   Flow      │  │
│  │ • Infrastructure│  │ • Audit         │  │ • Dependencies│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   APM           │  │   RUM           │  │   Synthetic │  │
│  │   (DataDog)     │  │   (Sentry)      │  │   (Pingdom) │  │
│  │                 │  │                 │  │             │  │
│  │ • Application   │  │ • User          │  │ • Uptime    │  │
│  │   Performance   │  │   Experience    │  │ • Performance│  │
│  │ • Error         │  │ • Real User     │  │ • Alerts    │  │
│  │   Tracking      │  │   Monitoring    │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **2. Monitoring Strategy**

#### **Стратегия мониторинга:**
- **Proactive Monitoring** - проактивный мониторинг
- **Real-time Alerts** - уведомления в реальном времени
- **Predictive Analytics** - предсказательная аналитика
- **Automated Response** - автоматическое реагирование

---

## 📈 Metrics & KPIs

### **1. Business Metrics**

#### **Ключевые бизнес-метрики:**
```typescript
// src/lib/analytics/business-metrics.ts
export interface BusinessMetrics {
  // User Metrics
  totalUsers: number
  activeUsers: number
  newUsers: number
  returningUsers: number
  userRetention: {
    day1: number
    day7: number
    day30: number
  }
  
  // Engagement Metrics
  sessionDuration: number
  pageViews: number
  bounceRate: number
  conversionRate: number
  
  // Revenue Metrics
  totalRevenue: number
  averageRevenuePerUser: number
  subscriptionConversion: number
  churnRate: number
  
  // Legal Service Metrics
  totalConsultations: number
  averageConsultationTime: number
  documentGenerationCount: number
  disputeResolutionRate: number
  
  // AI Performance Metrics
  aiResponseTime: number
  aiAccuracy: number
  userSatisfaction: number
  aiCostPerQuery: number
}

export class BusinessMetricsCollector {
  private analyticsService: AnalyticsService
  private timewebAnalytics: TimeWebAnalytics

  async collectMetrics(period: AnalyticsPeriod): Promise<BusinessMetrics> {
    const [
      userMetrics,
      engagementMetrics,
      revenueMetrics,
      legalMetrics,
      aiMetrics
    ] = await Promise.all([
      this.collectUserMetrics(period),
      this.collectEngagementMetrics(period),
      this.collectRevenueMetrics(period),
      this.collectLegalMetrics(period),
      this.collectAIMetrics(period)
    ])

    return {
      ...userMetrics,
      ...engagementMetrics,
      ...revenueMetrics,
      ...legalMetrics,
      ...aiMetrics
    }
  }

  private async collectUserMetrics(period: AnalyticsPeriod): Promise<Partial<BusinessMetrics>> {
    const users = await this.analyticsService.getUsers(period)
    
    return {
      totalUsers: users.total,
      activeUsers: users.active,
      newUsers: users.new,
      returningUsers: users.returning,
      userRetention: {
        day1: users.retention.day1,
        day7: users.retention.day7,
        day30: users.retention.day30
      }
    }
  }

  private async collectEngagementMetrics(period: AnalyticsPeriod): Promise<Partial<BusinessMetrics>> {
    const engagement = await this.analyticsService.getEngagement(period)
    
    return {
      sessionDuration: engagement.averageSessionDuration,
      pageViews: engagement.totalPageViews,
      bounceRate: engagement.bounceRate,
      conversionRate: engagement.conversionRate
    }
  }

  private async collectRevenueMetrics(period: AnalyticsPeriod): Promise<Partial<BusinessMetrics>> {
    const revenue = await this.analyticsService.getRevenue(period)
    
    return {
      totalRevenue: revenue.total,
      averageRevenuePerUser: revenue.averagePerUser,
      subscriptionConversion: revenue.subscriptionConversion,
      churnRate: revenue.churnRate
    }
  }

  private async collectLegalMetrics(period: AnalyticsPeriod): Promise<Partial<BusinessMetrics>> {
    const legal = await this.analyticsService.getLegalMetrics(period)
    
    return {
      totalConsultations: legal.consultations.total,
      averageConsultationTime: legal.consultations.averageTime,
      documentGenerationCount: legal.documents.generated,
      disputeResolutionRate: legal.disputes.resolutionRate
    }
  }

  private async collectAIMetrics(period: AnalyticsPeriod): Promise<Partial<BusinessMetrics>> {
    const ai = await this.timewebAnalytics.getAIMetrics(period)
    
    return {
      aiResponseTime: ai.responseTime,
      aiAccuracy: ai.accuracy,
      userSatisfaction: ai.satisfaction,
      aiCostPerQuery: ai.costPerQuery
    }
  }
}
```

### **2. Technical Metrics**

#### **Технические метрики:**
```typescript
// src/lib/monitoring/technical-metrics.ts
export interface TechnicalMetrics {
  // Performance Metrics
  responseTime: {
    p50: number
    p95: number
    p99: number
    average: number
  }
  throughput: number
  errorRate: number
  
  // Infrastructure Metrics
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  networkLatency: number
  
  // Database Metrics
  dbConnections: number
  dbQueryTime: number
  dbErrorRate: number
  
  // AI Service Metrics
  aiLatency: number
  aiThroughput: number
  aiErrorRate: number
  aiCostPerRequest: number
  
  // Security Metrics
  securityIncidents: number
  failedLogins: number
  blockedRequests: number
  dataBreaches: number
}

export class TechnicalMetricsCollector {
  private prometheusClient: PrometheusClient
  private timewebMonitoring: TimeWebMonitoring

  async collectMetrics(): Promise<TechnicalMetrics> {
    const [
      performance,
      infrastructure,
      database,
      ai,
      security
    ] = await Promise.all([
      this.collectPerformanceMetrics(),
      this.collectInfrastructureMetrics(),
      this.collectDatabaseMetrics(),
      this.collectAIMetrics(),
      this.collectSecurityMetrics()
    ])

    return {
      ...performance,
      ...infrastructure,
      ...database,
      ...ai,
      ...security
    }
  }

  private async collectPerformanceMetrics(): Promise<Partial<TechnicalMetrics>> {
    const metrics = await this.prometheusClient.query({
      query: 'http_request_duration_seconds',
      range: '5m'
    })

    return {
      responseTime: {
        p50: metrics.percentiles.p50,
        p95: metrics.percentiles.p95,
        p99: metrics.percentiles.p99,
        average: metrics.average
      },
      throughput: metrics.rate,
      errorRate: metrics.errorRate
    }
  }

  private async collectInfrastructureMetrics(): Promise<Partial<TechnicalMetrics>> {
    const metrics = await this.prometheusClient.query({
      query: 'node_cpu_seconds_total',
      range: '5m'
    })

    return {
      cpuUsage: metrics.cpu,
      memoryUsage: metrics.memory,
      diskUsage: metrics.disk,
      networkLatency: metrics.network
    }
  }

  private async collectDatabaseMetrics(): Promise<Partial<TechnicalMetrics>> {
    const metrics = await this.prometheusClient.query({
      query: 'postgresql_connections',
      range: '5m'
    })

    return {
      dbConnections: metrics.connections,
      dbQueryTime: metrics.queryTime,
      dbErrorRate: metrics.errorRate
    }
  }

  private async collectAIMetrics(): Promise<Partial<TechnicalMetrics>> {
    const metrics = await this.timewebMonitoring.getAIMetrics()

    return {
      aiLatency: metrics.latency,
      aiThroughput: metrics.throughput,
      aiErrorRate: metrics.errorRate,
      aiCostPerRequest: metrics.costPerRequest
    }
  }

  private async collectSecurityMetrics(): Promise<Partial<TechnicalMetrics>> {
    const metrics = await this.prometheusClient.query({
      query: 'security_incidents_total',
      range: '1h'
    })

    return {
      securityIncidents: metrics.incidents,
      failedLogins: metrics.failedLogins,
      blockedRequests: metrics.blockedRequests,
      dataBreaches: metrics.dataBreaches
    }
  }
}
```

---

## 🔍 Application Performance Monitoring (APM)

### **1. Real User Monitoring (RUM)**

#### **Мониторинг реальных пользователей:**
```typescript
// src/lib/monitoring/rum.ts
export class RealUserMonitoring {
  private sentryClient: SentryClient
  private timewebRUM: TimeWebRUM

  constructor() {
    this.sentryClient = new SentryClient({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0
    })

    this.timewebRUM = new TimeWebRUM({
      apiKey: process.env.TIMEWEB_RUM_API_KEY,
      endpoint: process.env.TIMEWEB_RUM_ENDPOINT
    })
  }

  async trackPageView(page: string, metadata: PageViewMetadata): Promise<void> {
    const pageView = {
      page,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: this.getConnectionInfo(),
      ...metadata
    }

    await Promise.all([
      this.sentryClient.captureMessage('Page View', {
        level: 'info',
        extra: pageView
      }),
      this.timewebRUM.trackPageView(pageView)
    ])
  }

  async trackUserAction(action: string, metadata: UserActionMetadata): Promise<void> {
    const userAction = {
      action,
      timestamp: new Date(),
      userId: metadata.userId,
      sessionId: metadata.sessionId,
      ...metadata
    }

    await Promise.all([
      this.sentryClient.addBreadcrumb({
        message: `User Action: ${action}`,
        level: 'info',
        data: userAction
      }),
      this.timewebRUM.trackUserAction(userAction)
    ])
  }

  async trackError(error: Error, context: ErrorContext): Promise<void> {
    const errorData = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    await Promise.all([
      this.sentryClient.captureException(error, {
        extra: errorData
      }),
      this.timewebRUM.trackError(errorData)
    ])
  }

  async trackPerformance(metric: PerformanceMetric): Promise<void> {
    const performanceData = {
      metric,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    await this.timewebRUM.trackPerformance(performanceData)
  }

  private getConnectionInfo(): ConnectionInfo {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    }
  }
}

// React Hook для RUM
export const useRUM = () => {
  const rum = useMemo(() => new RealUserMonitoring(), [])

  const trackPageView = useCallback((page: string, metadata: PageViewMetadata) => {
    rum.trackPageView(page, metadata)
  }, [rum])

  const trackUserAction = useCallback((action: string, metadata: UserActionMetadata) => {
    rum.trackUserAction(action, metadata)
  }, [rum])

  const trackError = useCallback((error: Error, context: ErrorContext) => {
    rum.trackError(error, context)
  }, [rum])

  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    rum.trackPerformance(metric)
  }, [rum])

  return {
    trackPageView,
    trackUserAction,
    trackError,
    trackPerformance
  }
}
```

### **2. Synthetic Monitoring**

#### **Синтетический мониторинг:**
```typescript
// src/lib/monitoring/synthetic.ts
export class SyntheticMonitoring {
  private pingdomClient: PingdomClient
  private timewebSynthetic: TimeWebSynthetic

  constructor() {
    this.pingdomClient = new PingdomClient({
      apiKey: process.env.PINGDOM_API_KEY
    })

    this.timewebSynthetic = new TimeWebSynthetic({
      apiKey: process.env.TIMEWEB_SYNTHETIC_API_KEY
    })
  }

  async setupChecks(): Promise<void> {
    const checks = [
      {
        name: 'LawerApp Homepage',
        url: 'https://lawerapp.com',
        type: 'http',
        interval: 5, // minutes
        locations: ['moscow', 'spb', 'ekaterinburg']
      },
      {
        name: 'AI Consultation API',
        url: 'https://api.lawerapp.com/legal/consultation',
        type: 'api',
        method: 'POST',
        body: JSON.stringify({
          message: 'Test consultation',
          context: { area: 'consumer', jurisdiction: 'russia' }
        }),
        interval: 10,
        locations: ['moscow', 'spb']
      },
      {
        name: 'Payment Processing',
        url: 'https://api.lawerapp.com/payments/process',
        type: 'api',
        method: 'POST',
        body: JSON.stringify({
          amount: 100,
          method: 'telegram_stars',
          description: 'Test payment'
        }),
        interval: 15,
        locations: ['moscow']
      }
    ]

    for (const check of checks) {
      await Promise.all([
        this.pingdomClient.createCheck(check),
        this.timewebSynthetic.createCheck(check)
      ])
    }
  }

  async getCheckResults(checkId: string): Promise<CheckResult[]> {
    const [pingdomResults, timewebResults] = await Promise.all([
      this.pingdomClient.getCheckResults(checkId),
      this.timewebSynthetic.getCheckResults(checkId)
    ])

    return [...pingdomResults, ...timewebResults]
  }

  async getUptimeStats(checkId: string, period: string): Promise<UptimeStats> {
    const [pingdomStats, timewebStats] = await Promise.all([
      this.pingdomClient.getUptimeStats(checkId, period),
      this.timewebSynthetic.getUptimeStats(checkId, period)
    ])

    return {
      uptime: (pingdomStats.uptime + timewebStats.uptime) / 2,
      downtime: (pingdomStats.downtime + timewebStats.downtime) / 2,
      averageResponseTime: (pingdomStats.averageResponseTime + timewebStats.averageResponseTime) / 2,
      incidents: [...pingdomStats.incidents, ...timewebStats.incidents]
    }
  }
}
```

---

## 📊 Analytics Dashboard

### **1. Real-time Dashboard**

#### **Дашборд в реальном времени:**
```typescript
// src/components/analytics/RealTimeDashboard.tsx
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useWebSocket } from '@/hooks/useWebSocket'

export const RealTimeDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { getRealTimeMetrics } = useAnalytics()
  const { subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getRealTimeMetrics()
        setMetrics(data)
      } catch (error) {
        console.error('Error loading metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()

    // Подписываемся на обновления в реальном времени
    const handleMetricsUpdate = (data: BusinessMetrics) => {
      setMetrics(data)
    }

    subscribe('metrics:update', handleMetricsUpdate)

    return () => {
      unsubscribe('metrics:update', handleMetricsUpdate)
    }
  }, [getRealTimeMetrics, subscribe, unsubscribe])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Не удалось загрузить метрики</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Аналитика в реальном времени</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Онлайн
          </Badge>
          <Button variant="outline" size="sm">
            Экспорт
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Активные пользователи"
          value={metrics.activeUsers}
          change={metrics.activeUsersChange}
          icon="👥"
        />
        <MetricCard
          title="Консультации"
          value={metrics.totalConsultations}
          change={metrics.consultationsChange}
          icon="💬"
        />
        <MetricCard
          title="Документы"
          value={metrics.documentGenerationCount}
          change={metrics.documentsChange}
          icon="📄"
        />
        <MetricCard
          title="Доход"
          value={`${metrics.totalRevenue} ₽`}
          change={metrics.revenueChange}
          icon="💰"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Активность пользователей</h3>
          <UserActivityChart data={metrics.userActivity} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Популярные области права</h3>
          <LegalAreasChart data={metrics.popularLegalAreas} />
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Последняя активность</h3>
        <RecentActivityList activities={metrics.recentActivities} />
      </Card>
    </div>
  )
}

const MetricCard: React.FC<{
  title: string
  value: number | string
  change?: number
  icon: string
}> = ({ title, value, change, icon }) => {
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500'
    return change > 0 ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (change?: number) => {
    if (!change) return ''
    return change > 0 ? '↗' : '↘'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${getChangeColor(change)}`}>
              {getChangeIcon(change)} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Card>
  )
}
```

### **2. Business Intelligence Dashboard**

#### **BI дашборд:**
```typescript
// src/components/analytics/BusinessIntelligenceDashboard.tsx
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useBusinessIntelligence } from '@/hooks/useBusinessIntelligence'

export const BusinessIntelligenceDashboard: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const { getBusinessMetrics, getPredictiveAnalytics } = useBusinessIntelligence()

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true)
      try {
        const data = await getBusinessMetrics(period)
        setMetrics(data)
      } catch (error) {
        console.error('Error loading business metrics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [period, getBusinessMetrics])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Бизнес-аналитика</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="1y">1 год</option>
          </Select>
          <Button variant="outline" size="sm">
            Экспорт отчета
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Общий доход"
          value={metrics?.totalRevenue || 0}
          target={1000000}
          unit="₽"
          trend={metrics?.revenueTrend}
        />
        <KPICard
          title="ARPU"
          value={metrics?.averageRevenuePerUser || 0}
          target={500}
          unit="₽"
          trend={metrics?.arpuTrend}
        />
        <KPICard
          title="Конверсия"
          value={metrics?.conversionRate || 0}
          target={15}
          unit="%"
          trend={metrics?.conversionTrend}
        />
        <KPICard
          title="Retention"
          value={metrics?.userRetention.day30 || 0}
          target={60}
          unit="%"
          trend={metrics?.retentionTrend}
        />
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Анализ доходов</h3>
          <RevenueChart data={metrics?.revenueData} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Источники доходов</h3>
          <RevenueSourcesChart data={metrics?.revenueSources} />
        </Card>
      </div>

      {/* User Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Анализ пользователей</h3>
          <UserAnalysisChart data={metrics?.userAnalysis} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cohort Analysis</h3>
          <CohortAnalysisChart data={metrics?.cohortAnalysis} />
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Прогнозная аналитика</h3>
        <PredictiveAnalytics data={metrics?.predictiveAnalytics} />
      </Card>
    </div>
  )
}

const KPICard: React.FC<{
  title: string
  value: number
  target: number
  unit: string
  trend?: TrendData
}> = ({ title, value, target, unit, trend }) => {
  const progress = (value / target) * 100
  const isOnTrack = progress >= 80

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">{title}</h4>
          <div className={`text-sm ${isOnTrack ? 'text-green-600' : 'text-yellow-600'}`}>
            {isOnTrack ? '✓' : '⚠'}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {value.toLocaleString()} {unit}
          </div>
          <div className="text-sm text-gray-500">
            Цель: {target.toLocaleString()} {unit}
          </div>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${isOnTrack ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {progress.toFixed(1)}% от цели
          </div>
        </div>

        {trend && (
          <div className="text-sm">
            <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trend.direction === 'up' ? '↗' : '↘'} {trend.percentage}%
            </span>
            <span className="text-gray-500 ml-1">за {trend.period}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
```

---

## 🚨 Alerting System

### **1. Smart Alerts**

#### **Умная система уведомлений:**
```typescript
// src/lib/monitoring/alerting.ts
export class SmartAlertingSystem {
  private alertManager: AlertManager
  private timewebAlerts: TimeWebAlerts
  private notificationService: NotificationService

  constructor() {
    this.alertManager = new AlertManager({
      webhookUrl: process.env.ALERT_WEBHOOK_URL
    })

    this.timewebAlerts = new TimeWebAlerts({
      apiKey: process.env.TIMEWEB_ALERTS_API_KEY
    })

    this.notificationService = new NotificationService()
  }

  async setupAlerts(): Promise<void> {
    const alerts = [
      // Performance Alerts
      {
        name: 'High Response Time',
        condition: 'http_request_duration_seconds > 2',
        severity: 'warning',
        channels: ['slack', 'email', 'telegram']
      },
      {
        name: 'High Error Rate',
        condition: 'http_requests_total{status=~"5.."} / http_requests_total > 0.05',
        severity: 'critical',
        channels: ['slack', 'email', 'telegram', 'pagerduty']
      },
      
      // Business Alerts
      {
        name: 'Low Conversion Rate',
        condition: 'conversion_rate < 0.1',
        severity: 'warning',
        channels: ['slack', 'email']
      },
      {
        name: 'High Churn Rate',
        condition: 'churn_rate > 0.2',
        severity: 'critical',
        channels: ['slack', 'email', 'telegram']
      },
      
      // AI Service Alerts
      {
        name: 'AI Service Down',
        condition: 'ai_service_health == 0',
        severity: 'critical',
        channels: ['slack', 'email', 'telegram', 'pagerduty']
      },
      {
        name: 'High AI Cost',
        condition: 'ai_cost_per_query > 0.1',
        severity: 'warning',
        channels: ['slack', 'email']
      },
      
      // Security Alerts
      {
        name: 'Security Incident',
        condition: 'security_incidents_total > 0',
        severity: 'critical',
        channels: ['slack', 'email', 'telegram', 'pagerduty']
      },
      {
        name: 'High Failed Login Rate',
        condition: 'failed_logins_total / login_attempts_total > 0.1',
        severity: 'warning',
        channels: ['slack', 'email']
      }
    ]

    for (const alert of alerts) {
      await Promise.all([
        this.alertManager.createAlert(alert),
        this.timewebAlerts.createAlert(alert)
      ])
    }
  }

  async handleAlert(alert: Alert): Promise<void> {
    // Логируем алерт
    console.log(`Alert triggered: ${alert.name}`, alert)

    // Отправляем уведомления
    for (const channel of alert.channels) {
      await this.sendNotification(channel, alert)
    }

    // Автоматические действия
    await this.executeAutomaticActions(alert)
  }

  private async sendNotification(channel: string, alert: Alert): Promise<void> {
    const message = this.formatAlertMessage(alert)

    switch (channel) {
      case 'slack':
        await this.notificationService.sendSlackMessage({
          channel: '#alerts',
          text: message,
          color: this.getSeverityColor(alert.severity)
        })
        break
      case 'email':
        await this.notificationService.sendEmail({
          to: 'alerts@lawerapp.com',
          subject: `[${alert.severity.toUpperCase()}] ${alert.name}`,
          body: message
        })
        break
      case 'telegram':
        await this.notificationService.sendTelegramMessage({
          chatId: process.env.TELEGRAM_ALERTS_CHAT_ID,
          text: message
        })
        break
      case 'pagerduty':
        await this.notificationService.sendPagerDutyAlert({
          summary: alert.name,
          severity: alert.severity,
          details: message
        })
        break
    }
  }

  private async executeAutomaticActions(alert: Alert): Promise<void> {
    switch (alert.name) {
      case 'High Response Time':
        // Масштабируем сервис
        await this.scaleService('api', 'up')
        break
      case 'High Error Rate':
        // Переключаемся на резервный сервис
        await this.switchToBackupService('ai')
        break
      case 'AI Service Down':
        // Переключаемся на резервный AI сервис
        await this.switchToBackupAIService()
        break
      case 'Security Incident':
        // Блокируем подозрительные IP
        await this.blockSuspiciousIPs()
        break
    }
  }

  private formatAlertMessage(alert: Alert): string {
    return `
🚨 *${alert.name}*
Severity: ${alert.severity.toUpperCase()}
Time: ${new Date().toISOString()}
Condition: ${alert.condition}
Value: ${alert.value}
    `.trim()
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger'
      case 'warning': return 'warning'
      case 'info': return 'good'
      default: return 'good'
    }
  }
}
```

### **2. Predictive Alerts**

#### **Предсказательные уведомления:**
```typescript
// src/lib/monitoring/predictive-alerts.ts
export class PredictiveAlertingSystem {
  private mlService: MLService
  private alertingSystem: SmartAlertingSystem

  constructor() {
    this.mlService = new MLService({
      apiKey: process.env.ML_SERVICE_API_KEY
    })
    this.alertingSystem = new SmartAlertingSystem()
  }

  async analyzeTrends(): Promise<void> {
    const metrics = await this.collectHistoricalMetrics()
    
    // Анализируем тренды
    const trends = await this.mlService.analyzeTrends(metrics)
    
    // Предсказываем проблемы
    const predictions = await this.mlService.predictIssues(trends)
    
    // Создаем предупреждения
    for (const prediction of predictions) {
      if (prediction.confidence > 0.8) {
        await this.createPredictiveAlert(prediction)
      }
    }
  }

  private async createPredictiveAlert(prediction: IssuePrediction): Promise<void> {
    const alert: Alert = {
      name: `Predicted: ${prediction.issueType}`,
      condition: prediction.condition,
      severity: prediction.severity,
      channels: ['slack', 'email'],
      value: prediction.expectedValue,
      confidence: prediction.confidence,
      predictedTime: prediction.estimatedTime
    }

    await this.alertingSystem.handleAlert(alert)
  }

  private async collectHistoricalMetrics(): Promise<HistoricalMetrics> {
    // Собираем исторические метрики за последние 30 дней
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      responseTime: await this.getMetricHistory('http_request_duration_seconds', startTime, endTime),
      errorRate: await this.getMetricHistory('error_rate', startTime, endTime),
      throughput: await this.getMetricHistory('throughput', startTime, endTime),
      userActivity: await this.getMetricHistory('user_activity', startTime, endTime),
      revenue: await this.getMetricHistory('revenue', startTime, endTime)
    }
  }
}
```

---

## 📱 Mobile Analytics

### **1. Mobile Performance Monitoring**

#### **Мониторинг мобильной производительности:**
```typescript
// src/lib/monitoring/mobile-analytics.ts
export class MobileAnalytics {
  private timewebMobile: TimeWebMobileAnalytics
  private sentryMobile: SentryMobile

  constructor() {
    this.timewebMobile = new TimeWebMobileAnalytics({
      apiKey: process.env.TIMEWEB_MOBILE_API_KEY
    })
    this.sentryMobile = new SentryMobile({
      dsn: process.env.SENTRY_MOBILE_DSN
    })
  }

  async trackMobilePerformance(): Promise<void> {
    // Отслеживаем производительность мобильного приложения
    const performanceMetrics = await this.collectMobilePerformanceMetrics()
    
    await Promise.all([
      this.timewebMobile.trackPerformance(performanceMetrics),
      this.sentryMobile.trackPerformance(performanceMetrics)
    ])
  }

  private async collectMobilePerformanceMetrics(): Promise<MobilePerformanceMetrics> {
    return {
      // App Launch Metrics
      appLaunchTime: performance.now(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint(),
      
      // Network Metrics
      networkLatency: this.getNetworkLatency(),
      dataUsage: this.getDataUsage(),
      
      // Device Metrics
      deviceInfo: this.getDeviceInfo(),
      batteryLevel: this.getBatteryLevel(),
      memoryUsage: this.getMemoryUsage(),
      
      // User Experience Metrics
      touchLatency: this.getTouchLatency(),
      scrollPerformance: this.getScrollPerformance(),
      crashRate: this.getCrashRate()
    }
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry ? fcpEntry.startTime : 0
  }

  private getLargestContentfulPaint(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint')
    return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0
  }

  private getNetworkLatency(): number {
    const navigationEntries = performance.getEntriesByType('navigation')
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming
      return nav.responseEnd - nav.requestStart
    }
    return 0
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    }
  }
}
```

---

## 🎯 Заключение

Данная система мониторинга и аналитики обеспечивает:

### **✅ Современные технологии:**
- **Observability Stack** - метрики, логи, трейсы
- **Real-time Monitoring** - мониторинг в реальном времени
- **Predictive Analytics** - предсказательная аналитика
- **Smart Alerting** - умная система уведомлений

### **✅ Полное покрытие:**
- **Business Metrics** - бизнес-метрики и KPI
- **Technical Metrics** - технические метрики
- **User Experience** - пользовательский опыт
- **Security Monitoring** - мониторинг безопасности

### **✅ Готовность к использованию:**
- **Real-time Dashboards** - дашборды в реальном времени
- **Automated Alerts** - автоматические уведомления
- **Mobile Analytics** - мобильная аналитика
- **Business Intelligence** - бизнес-аналитика

**Следующий шаг**: Внедрение системы мониторинга и настройка дашбордов! 📊

---

*Мониторинг и аналитика подготовлены: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готово к внедрению ✅*
