# 🤝 Руководство по участию в разработке

Спасибо за интерес к участию в разработке LawerApp Telegram Mini App! 

## 📋 Как внести вклад

### 1. Форк и клонирование
```bash
# Форкните репозиторий на GitHub
# Затем клонируйте ваш форк
git clone https://github.com/your-username/lawerapp-telegram-mini-app.git
cd lawerapp-telegram-mini-app
```

### 2. Настройка окружения
```bash
# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env.local
# Заполните необходимые переменные

# Настройка базы данных
npx prisma generate
npx prisma db push
```

### 3. Создание ветки
```bash
# Создайте feature ветку
git checkout -b feature/your-feature-name

# Или bugfix ветку
git checkout -b bugfix/issue-description
```

## 🎯 Типы вкладов

### 🐛 Исправление багов
- Используйте префикс `bugfix/` для веток
- Опишите проблему в commit message
- Добавьте тесты для предотвращения регрессий

### ✨ Новые функции
- Используйте префикс `feature/` для веток
- Обсудите крупные изменения в Issues
- Добавьте документацию для новых функций

### 📚 Улучшение документации
- Исправления в README, комментариях, типах
- Улучшение примеров кода
- Переводы на другие языки

### 🧪 Тесты
- Добавление unit тестов
- Интеграционные тесты
- E2E тесты

## 📝 Стандарты кода

### TypeScript
- Используйте строгую типизацию
- **ЗАПРЕЩЕНО** использовать `any`
- Добавляйте типы для всех функций и компонентов

### React
- Используйте функциональные компоненты
- Применяйте React.memo для оптимизации
- Следуйте правилам хуков

### Стили
- Используйте Tailwind CSS классы
- Следуйте дизайн-системе Telegram
- Адаптируйте под мобильные устройства

### Git
- Используйте conventional commits
- Пишите понятные commit messages
- Делайте атомарные коммиты

## 🧪 Тестирование

### Запуск тестов
```bash
# Все тесты
npm run test

# В watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage
```

### Написание тестов
```typescript
// Пример unit теста
describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## 📋 Pull Request процесс

### 1. Подготовка
- Убедитесь, что все тесты проходят
- Проверьте код линтером: `npm run lint`
- Проверьте типы: `npm run type-check`

### 2. Создание PR
- Опишите изменения в PR description
- Укажите связанные Issues
- Добавьте скриншоты для UI изменений

### 3. Code Review
- Отвечайте на комментарии ревьюеров
- Вносите необходимые изменения
- Поддерживайте конструктивную дискуссию

## 🏗️ Архитектура

### Структура проекта
```
src/
├── app/           # Next.js App Router
├── components/    # React компоненты
├── lib/          # Core libraries
├── hooks/        # Custom hooks
├── store/        # State management
└── types/        # TypeScript типы
```

### Принципы
- **Clean Architecture** - разделение слоев
- **DRY** - не повторяйте код
- **SOLID** - следуйте принципам
- **KISS** - делайте просто

## 🔧 Инструменты разработки

### Обязательные
- VS Code с расширениями:
  - TypeScript
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Рекомендуемые
- Prisma Studio для работы с БД
- React DevTools
- Telegram WebApp DevTools

## 📞 Получение помощи

- 💬 **Discord**: [Ссылка на Discord]
- 📧 **Email**: dev@lawerapp.com
- 🐛 **Issues**: GitHub Issues
- 📚 **Документация**: [docs/](docs/)

## 🎉 Признание

Все участники будут упомянуты в:
- README.md
- CHANGELOG.md
- Release notes

Спасибо за ваш вклад! 🚀
