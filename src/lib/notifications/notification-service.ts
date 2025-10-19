/**
 * Notification Service для LawerApp
 * Простая реализация для локального тестирования
 */

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

export interface Notification {
  id: string;
  templateId: string;
  userId: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

class NotificationService {
  private notifications: Notification[] = [];
  private templates: NotificationTemplate[] = [
    {
      id: 'user_registration',
      name: 'Регистрация пользователя',
      subject: 'Добро пожаловать в LawerApp!',
      content: 'Привет, {{userName}}! Добро пожаловать в LawerApp. Ваш план: {{planName}}',
      variables: ['userName', 'planName']
    },
    {
      id: 'consultation_complete',
      name: 'Консультация завершена',
      subject: 'Ваша консультация готова',
      content: 'Ваша AI-консультация по теме "{{topic}}" завершена.',
      variables: ['topic']
    }
  ];

  createFromTemplate(templateId: string, variables: Record<string, string>, userId: string): Notification {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let content = template.content;
    let subject = template.subject;

    // Заменяем переменные
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    const notification: Notification = {
      id: Date.now().toString(),
      templateId,
      userId,
      subject,
      content,
      isRead: false,
      createdAt: new Date()
    };

    this.notifications.push(notification);
    console.log('📧 Уведомление создано:', notification);
    
    return notification;
  }

  getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  getStats() {
    return {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.isRead).length,
      read: this.notifications.filter(n => n.isRead).length
    };
  }

  getTemplates(): NotificationTemplate[] {
    return this.templates;
  }
}

export const notificationService = new NotificationService();
