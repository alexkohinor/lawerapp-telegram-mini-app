/**
 * Incident Response Plan
 * Основано на SECURITY_GUIDELINES.md - Incident Response Plan
 */

import { securityMonitoring } from '@/lib/monitoring/security-monitoring';
import { SecurityEvent } from '@/lib/monitoring/security-monitoring';
import { generateId } from '@/lib/utils';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'investigating' | 'contained' | 'resolved' | 'closed';
  category: 'data_breach' | 'unauthorized_access' | 'malware' | 'ddos' | 'phishing' | 'insider_threat' | 'other';
  detectedAt: Date;
  reportedBy: string;
  assignedTo?: string;
  affectedUsers?: string[];
  affectedSystems?: string[];
  evidence?: IncidentEvidence[];
  actions?: IncidentAction[];
  timeline?: IncidentTimelineEntry[];
  resolution?: string;
  lessonsLearned?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentEvidence {
  id: string;
  type: 'log' | 'screenshot' | 'file' | 'network_traffic' | 'user_report';
  description: string;
  data: string;
  collectedAt: Date;
  collectedBy: string;
}

export interface IncidentAction {
  id: string;
  type: 'containment' | 'investigation' | 'remediation' | 'communication' | 'recovery';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo: string;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  details?: string;
}

export interface IncidentResponseTeam {
  id: string;
  name: string;
  role: 'incident_commander' | 'security_analyst' | 'technical_lead' | 'communications' | 'legal' | 'executive';
  contactInfo: {
    email: string;
    phone?: string;
    slack?: string;
  };
  isAvailable: boolean;
}

/**
 * План реагирования на инциденты безопасности
 * Реализует структурированный подход к обработке инцидентов
 */
export class IncidentResponseService {
  private incidents: Map<string, SecurityIncident> = new Map();
  private responseTeam: IncidentResponseTeam[] = [];

  constructor() {
    this.initializeResponseTeam();
  }

  /**
   * Инициализирует команду реагирования на инциденты
   */
  private initializeResponseTeam(): void {
    this.responseTeam = [
      {
        id: '1',
        name: 'Security Team Lead',
        role: 'incident_commander',
        contactInfo: {
          email: 'security@lawerapp.com',
          phone: '+7-xxx-xxx-xxxx',
          slack: '@security-lead',
        },
        isAvailable: true,
      },
      {
        id: '2',
        name: 'Security Analyst',
        role: 'security_analyst',
        contactInfo: {
          email: 'analyst@lawerapp.com',
          slack: '@security-analyst',
        },
        isAvailable: true,
      },
      {
        id: '3',
        name: 'Technical Lead',
        role: 'technical_lead',
        contactInfo: {
          email: 'tech@lawerapp.com',
          slack: '@tech-lead',
        },
        isAvailable: true,
      },
      {
        id: '4',
        name: 'Communications Manager',
        role: 'communications',
        contactInfo: {
          email: 'comms@lawerapp.com',
          slack: '@comms-manager',
        },
        isAvailable: true,
      },
    ];
  }

  /**
   * Создает новый инцидент безопасности
   * @param incidentData Данные инцидента
   * @returns Созданный инцидент
   */
  async createIncident(incidentData: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      ...incidentData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.incidents.set(incident.id, incident);

    // Логируем создание инцидента
    securityMonitoring.logEvent(
      SecurityEvent.INCIDENT_CREATED,
      incident.reportedBy,
      { 
        incidentId: incident.id, 
        severity: incident.severity, 
        category: incident.category 
      },
      incident.severity
    );

    // Автоматически назначаем действия в зависимости от серьезности
    await this.autoAssignActions(incident);

    // Уведомляем команду реагирования
    await this.notifyResponseTeam(incident);

    return incident;
  }

  /**
   * Обновляет статус инцидента
   * @param incidentId ID инцидента
   * @param status Новый статус
   * @param updatedBy Кто обновил
   * @param notes Дополнительные заметки
   */
  async updateIncidentStatus(
    incidentId: string,
    status: SecurityIncident['status'],
    updatedBy: string,
    notes?: string
  ): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const oldStatus = incident.status;
    incident.status = status;
    incident.updatedAt = new Date();

    // Добавляем запись в timeline
    incident.timeline = incident.timeline || [];
    incident.timeline.push({
      id: generateId(),
      timestamp: new Date(),
      action: `Status changed from ${oldStatus} to ${status}`,
      performedBy: updatedBy,
      details: notes,
    });

    // Логируем изменение статуса
    securityMonitoring.logEvent(
      SecurityEvent.INCIDENT_STATUS_CHANGED,
      updatedBy,
      { 
        incidentId, 
        oldStatus, 
        newStatus: status,
        notes 
      },
      incident.severity
    );

    // Если инцидент решен, запускаем процесс закрытия
    if (status === 'resolved') {
      await this.initiateIncidentClosure(incident);
    }
  }

  /**
   * Добавляет действие к инциденту
   * @param incidentId ID инцидента
   * @param action Действие
   */
  async addIncidentAction(incidentId: string, action: Omit<IncidentAction, 'id'>): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const newAction: IncidentAction = {
      ...action,
      id: generateId(),
    };

    incident.actions = incident.actions || [];
    incident.actions.push(newAction);
    incident.updatedAt = new Date();

    // Добавляем запись в timeline
    incident.timeline = incident.timeline || [];
    incident.timeline.push({
      id: generateId(),
      timestamp: new Date(),
      action: `Action added: ${newAction.description}`,
      performedBy: newAction.assignedTo,
      details: `Type: ${newAction.type}, Status: ${newAction.status}`,
    });
  }

  /**
   * Добавляет доказательство к инциденту
   * @param incidentId ID инцидента
   * @param evidence Доказательство
   */
  async addIncidentEvidence(incidentId: string, evidence: Omit<IncidentEvidence, 'id'>): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const newEvidence: IncidentEvidence = {
      ...evidence,
      id: generateId(),
    };

    incident.evidence = incident.evidence || [];
    incident.evidence.push(newEvidence);
    incident.updatedAt = new Date();

    // Добавляем запись в timeline
    incident.timeline = incident.timeline || [];
    incident.timeline.push({
      id: generateId(),
      timestamp: new Date(),
      action: `Evidence added: ${newEvidence.description}`,
      performedBy: newEvidence.collectedBy,
      details: `Type: ${newEvidence.type}`,
    });
  }

  /**
   * Получает инцидент по ID
   * @param incidentId ID инцидента
   * @returns Инцидент или null
   */
  getIncident(incidentId: string): SecurityIncident | null {
    return this.incidents.get(incidentId) || null;
  }

  /**
   * Получает все инциденты
   * @param filters Фильтры
   * @returns Массив инцидентов
   */
  getIncidents(filters?: {
    status?: SecurityIncident['status'];
    severity?: SecurityIncident['severity'];
    category?: SecurityIncident['category'];
  }): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filters) {
      if (filters.status) {
        incidents = incidents.filter(i => i.status === filters.status);
      }
      if (filters.severity) {
        incidents = incidents.filter(i => i.severity === filters.severity);
      }
      if (filters.category) {
        incidents = incidents.filter(i => i.category === filters.category);
      }
    }

    return incidents.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Автоматически назначает действия в зависимости от серьезности
   * @param incident Инцидент
   */
  private async autoAssignActions(incident: SecurityIncident): Promise<void> {
    const actions: Omit<IncidentAction, 'id'>[] = [];

    // Базовые действия для всех инцидентов
    actions.push({
      type: 'investigation',
      description: 'Initial investigation and assessment',
      status: 'pending',
      assignedTo: this.getTeamMemberByRole('security_analyst')?.name || 'Security Team',
    });

    // Дополнительные действия в зависимости от серьезности
    if (incident.severity === 'critical' || incident.severity === 'high') {
      actions.push({
        type: 'containment',
        description: 'Immediate containment measures',
        status: 'pending',
        assignedTo: this.getTeamMemberByRole('incident_commander')?.name || 'Security Team',
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 минут
      });

      actions.push({
        type: 'communication',
        description: 'Notify stakeholders and affected users',
        status: 'pending',
        assignedTo: this.getTeamMemberByRole('communications')?.name || 'Communications Team',
      });
    }

    // Действия в зависимости от категории
    if (incident.category === 'data_breach') {
      actions.push({
        type: 'legal',
        description: 'Legal assessment and compliance review',
        status: 'pending',
        assignedTo: this.getTeamMemberByRole('legal')?.name || 'Legal Team',
      });
    }

    // Добавляем действия к инциденту
    for (const action of actions) {
      await this.addIncidentAction(incident.id, action);
    }
  }

  /**
   * Уведомляет команду реагирования об инциденте
   * @param incident Инцидент
   */
  private async notifyResponseTeam(incident: SecurityIncident): Promise<void> {
    const teamMembers = this.responseTeam.filter(member => member.isAvailable);
    
    for (const member of teamMembers) {
      // В реальной системе здесь будет отправка уведомлений
      console.log(`Notifying ${member.name} (${member.role}) about incident ${incident.id}`);
    }
  }

  /**
   * Инициирует процесс закрытия инцидента
   * @param incident Инцидент
   */
  private async initiateIncidentClosure(incident: SecurityIncident): Promise<void> {
    // Добавляем действие по закрытию
    await this.addIncidentAction(incident.id, {
      type: 'recovery',
      description: 'Post-incident review and lessons learned',
      status: 'pending',
      assignedTo: this.getTeamMemberByRole('incident_commander')?.name || 'Security Team',
    });

    // Логируем начало процесса закрытия
    securityMonitoring.logEvent(
      SecurityEvent.INCIDENT_CLOSURE_INITIATED,
      'system',
      { incidentId: incident.id },
      'low'
    );
  }

  /**
   * Получает члена команды по роли
   * @param role Роль
   * @returns Член команды или null
   */
  private getTeamMemberByRole(role: IncidentResponseTeam['role']): IncidentResponseTeam | null {
    return this.responseTeam.find(member => member.role === role) || null;
  }

  /**
   * Генерирует отчет об инциденте
   * @param incidentId ID инцидента
   * @returns Отчет в текстовом формате
   */
  generateIncidentReport(incidentId: string): string {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    let report = `# Security Incident Report\n\n`;
    report += `**Incident ID:** ${incident.id}\n`;
    report += `**Title:** ${incident.title}\n`;
    report += `**Severity:** ${incident.severity}\n`;
    report += `**Status:** ${incident.status}\n`;
    report += `**Category:** ${incident.category}\n`;
    report += `**Detected At:** ${incident.detectedAt.toISOString()}\n`;
    report += `**Reported By:** ${incident.reportedBy}\n\n`;
    
    report += `**Description:**\n${incident.description}\n\n`;
    
    if (incident.affectedUsers && incident.affectedUsers.length > 0) {
      report += `**Affected Users:** ${incident.affectedUsers.length}\n`;
    }
    
    if (incident.affectedSystems && incident.affectedSystems.length > 0) {
      report += `**Affected Systems:** ${incident.affectedSystems.join(', ')}\n\n`;
    }
    
    if (incident.actions && incident.actions.length > 0) {
      report += `**Actions Taken:**\n`;
      incident.actions.forEach(action => {
        report += `- ${action.type}: ${action.description} (${action.status})\n`;
      });
      report += `\n`;
    }
    
    if (incident.timeline && incident.timeline.length > 0) {
      report += `**Timeline:**\n`;
      incident.timeline.forEach(entry => {
        report += `- ${entry.timestamp.toISOString()}: ${entry.action} by ${entry.performedBy}\n`;
      });
      report += `\n`;
    }
    
    if (incident.resolution) {
      report += `**Resolution:**\n${incident.resolution}\n\n`;
    }
    
    if (incident.lessonsLearned) {
      report += `**Lessons Learned:**\n${incident.lessonsLearned}\n\n`;
    }
    
    return report;
  }
}

export const incidentResponseService = new IncidentResponseService();
