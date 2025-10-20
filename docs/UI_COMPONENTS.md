# 🧩 UI Компоненты LawerApp Telegram Mini App

## 📋 Обзор компонентов

**LawerApp** использует современную библиотеку UI компонентов, построенную на основе shadcn/ui, Tailwind CSS и нашей дизайн-системы. Все компоненты оптимизированы для Telegram Mini App и обеспечивают отличный пользовательский опыт.

---

## 🏗️ Архитектура компонентов

### **1. Component Structure**

#### **Структура компонентов:**
```
src/components/
├── ui/                    # Базовые UI компоненты
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   └── ...
├── features/              # Функциональные компоненты
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── AISuggestions.tsx
│   ├── documents/
│   │   ├── DocumentEditor.tsx
│   │   ├── DocumentViewer.tsx
│   │   └── DocumentGenerator.tsx
│   ├── payments/
│   │   ├── PaymentForm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   └── SubscriptionPlans.tsx
│   └── disputes/
│       ├── DisputeCard.tsx
│       ├── DisputeForm.tsx
│       └── DisputeTimeline.tsx
├── layout/                # Компоненты макета
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
└── common/                # Общие компоненты
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── Toast.tsx
    └── ...
```

---

## 🎨 Базовые UI компоненты

### **1. Button Component**

#### **Многофункциональная кнопка:**
```typescript
// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700",
        destructive: "bg-error text-white shadow-sm hover:bg-error-dark active:bg-error-darker",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100",
        secondary: "bg-secondary-500 text-white shadow-sm hover:bg-secondary-600 active:bg-secondary-700",
        ghost: "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
        link: "text-primary-500 underline-offset-4 hover:underline",
        telegram: "bg-[#0088cc] text-white shadow-sm hover:bg-[#0077b3] active:bg-[#006699]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### **Использование Button:**
```typescript
// Примеры использования
<Button variant="default" size="lg">
  Получить консультацию
</Button>

<Button variant="telegram" size="lg" loading={isLoading}>
  Оплатить через Telegram Stars
</Button>

<Button variant="outline" size="sm" leftIcon={<Icon name="download" />}>
  Скачать документ
</Button>

<Button variant="ghost" size="icon">
  <Icon name="menu" />
</Button>
```

### **2. Input Component**

#### **Продвинутое поле ввода:**
```typescript
// src/components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, onRightIconClick, ...props }, ref) => {
    const inputId = React.useId()
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-error focus:border-error focus:ring-error/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={onRightIconClick}
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### **3. Card Component**

#### **Универсальная карточка:**
```typescript
// src/components/ui/card.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-white shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        elevated: "border-gray-200 shadow-md hover:shadow-lg",
        outlined: "border-gray-300 shadow-none",
        filled: "border-transparent bg-gray-50",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "div"
    
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

## 🤖 AI компоненты

### **1. ChatInterface Component**

#### **Интерфейс чата с AI:**
```typescript
// src/components/features/ai/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageBubble } from './MessageBubble'
import { AISuggestions } from './AISuggestions'
import { useAIChat } from '@/hooks/useAIChat'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: LegalSource[]
  suggestions?: ChatSuggestion[]
}

interface ChatInterfaceProps {
  className?: string
  onDocumentGenerate?: (type: string) => void
  onConsultationSchedule?: () => void
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className,
  onDocumentGenerate,
  onConsultationSchedule
}) => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const {
    messages,
    sendMessage,
    clearHistory,
    context
  } = useAIChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage('')
    setIsLoading(true)

    try {
      await sendMessage(userMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: ChatSuggestion) => {
    switch (suggestion.action) {
      case 'generate_document':
        onDocumentGenerate?.(suggestion.metadata?.type)
        break
      case 'schedule_consultation':
        onConsultationSchedule?.()
        break
      case 'search_precedent':
        setMessage(suggestion.text)
        break
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">AI Юрист</h2>
          <p className="text-sm text-gray-500">
            {context ? `Область: ${context.area}` : 'Готов помочь с правовыми вопросами'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          disabled={messages.length === 0}
        >
          Очистить
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-lg font-medium mb-2">Добро пожаловать в LawerApp</h3>
            <p className="text-gray-500 mb-4">
              Задайте любой правовой вопрос, и я помогу вам разобраться
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage('Как вернуть товар ненадлежащего качества?')}
              >
                Пример вопроса
              </Button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} />
              {msg.role === 'assistant' && msg.suggestions && (
                <AISuggestions
                  suggestions={msg.suggestions}
                  onSuggestionClick={handleSuggestionClick}
                />
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span className="text-sm text-gray-500">AI думает...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Задайте ваш правовой вопрос..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            size="lg"
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### **2. MessageBubble Component**

#### **Пузырек сообщения:**
```typescript
// src/components/features/ai/MessageBubble.tsx
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface MessageBubbleProps {
  message: ChatMessage
  className?: string
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  className
}) => {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%]",
        isUser ? "order-2" : "order-1"
      )}>
        <Card className={cn(
          "p-4",
          isUser 
            ? "bg-primary-500 text-white border-primary-500" 
            : "bg-white border-gray-200"
        )}>
          <div className="space-y-3">
            {/* Message Content */}
            <div className="prose prose-sm max-w-none">
              {message.content.split('\n').map((line, index) => (
                <p key={index} className={cn(
                  "mb-2 last:mb-0",
                  isUser ? "text-white" : "text-gray-900"
                )}>
                  {line}
                </p>
              ))}
            </div>

            {/* Sources */}
            {isAssistant && message.sources && message.sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500">
                  Источники:
                </div>
                <div className="space-y-1">
                  {message.sources.map((source, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {source.title}
                      </Badge>
                      {source.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          Открыть
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={cn(
              "text-xs",
              isUser ? "text-primary-100" : "text-gray-400"
            )}>
              {formatDistanceToNow(message.timestamp, { 
                addSuffix: true, 
                locale: ru 
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

### **3. AISuggestions Component**

#### **Предложения AI:**
```typescript
// src/components/features/ai/AISuggestions.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AISuggestionsProps {
  suggestions: ChatSuggestion[]
  onSuggestionClick: (suggestion: ChatSuggestion) => void
  className?: string
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  className
}) => {
  if (!suggestions || suggestions.length === 0) return null

  const getSuggestionIcon = (action: string) => {
    switch (action) {
      case 'generate_document':
        return '📄'
      case 'schedule_consultation':
        return '📅'
      case 'search_precedent':
        return '🔍'
      default:
        return '💡'
    }
  }

  const getSuggestionVariant = (action: string) => {
    switch (action) {
      case 'generate_document':
        return 'default'
      case 'schedule_consultation':
        return 'secondary'
      case 'search_precedent':
        return 'outline'
      default:
        return 'ghost'
    }
  }

  return (
    <Card className={cn("p-4 mt-2", className)}>
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-3">
          Рекомендуемые действия:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant={getSuggestionVariant(suggestion.action)}
              size="sm"
              onClick={() => onSuggestionClick(suggestion)}
              className="text-xs"
            >
              <span className="mr-1">
                {getSuggestionIcon(suggestion.action)}
              </span>
              {suggestion.text}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
```

---

## 📄 Document компоненты

### **1. DocumentEditor Component**

#### **Редактор документов:**
```typescript
// src/components/features/documents/DocumentEditor.tsx
import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDocumentEditor } from '@/hooks/useDocumentEditor'

interface DocumentEditorProps {
  document: LegalDocument
  onSave: (content: string) => void
  onGenerate: () => void
  className?: string
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onSave,
  onGenerate,
  className
}) => {
  const [content, setContent] = useState(document.content)
  const [isEditing, setIsEditing] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  
  const {
    validateDocument,
    getAISuggestions,
    isGenerating,
    isValidating
  } = useDocumentEditor()

  const handleContentChange = useCallback(async (newContent: string) => {
    setContent(newContent)
    
    // Получаем предложения от AI
    const aiSuggestions = await getAISuggestions(newContent)
    setSuggestions(aiSuggestions)
  }, [getAISuggestions])

  const handleSave = async () => {
    const validation = await validateDocument(content)
    
    if (validation.isValid) {
      onSave(content)
      setIsEditing(false)
    } else {
      // Показываем ошибки валидации
      console.error('Validation errors:', validation.errors)
    }
  }

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    setContent(suggestion.content)
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Document Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{document.title}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{document.type}</Badge>
              <Badge variant="secondary">
                {document.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Предварительный просмотр' : 'Редактировать'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Генерирую...' : 'Перегенерировать'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Content */}
      <Card className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Введите содержимое документа..."
            />
            
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Предложения AI:
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 mb-2">
                            {suggestion.description}
                          </p>
                          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                            {suggestion.content}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="ml-2"
                        >
                          Применить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={isValidating}
              >
                {isValidating ? 'Проверяю...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {line}
              </p>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
```

### **2. DocumentViewer Component**

#### **Просмотрщик документов:**
```typescript
// src/components/features/documents/DocumentViewer.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DocumentViewerProps {
  document: LegalDocument
  onDownload?: () => void
  onPrint?: () => void
  onShare?: () => void
  className?: string
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onDownload,
  onPrint,
  onShare,
  className
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className={cn(
      "space-y-4",
      isFullscreen && "fixed inset-0 z-50 bg-white p-4",
      className
    )}>
      {/* Document Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{document.title}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline">{document.type}</Badge>
              <Badge variant="secondary">
                {document.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Создан: {new Date(document.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? 'Выйти' : 'Полный экран'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
            >
              Скачать
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPrint}
            >
              Печать
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
            >
              Поделиться
            </Button>
          </div>
        </div>
      </Card>

      {/* Document Content */}
      <Card className="p-6">
        <div className="prose prose-sm max-w-none">
          {document.content.split('\n').map((line, index) => (
            <p key={index} className="mb-3 last:mb-0">
              {line}
            </p>
          ))}
        </div>
      </Card>

      {/* Document Footer */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Документ сгенерирован AI • {document.confidence}% уверенности
          </div>
          <div>
            Версия {document.version} • {document.wordCount} слов
          </div>
        </div>
      </Card>
    </div>
  )
}
```

---

## 💳 Payment компоненты

### **1. PaymentForm Component**

#### **Форма оплаты:**
```typescript
// src/components/features/payments/PaymentForm.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PaymentFormProps {
  amount: number
  description: string
  onPayment: (method: PaymentMethod, data: PaymentData) => void
  className?: string
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  onPayment,
  className
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('telegram_stars')
  const [isProcessing, setIsProcessing] = useState(false)

  const paymentMethods = [
    {
      id: 'telegram_stars',
      name: 'Telegram Stars',
      description: 'Встроенная валюта Telegram',
      icon: '⭐',
      available: true
    },
    {
      id: 'yookassa',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: '💳',
      available: true
    },
    {
      id: 'sbp',
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: '🏦',
      available: true
    },
    {
      id: 'yoomoney',
      name: 'ЮMoney',
      description: 'Яндекс.Деньги',
      icon: '💰',
      available: true
    },
    {
      id: 'qiwi',
      name: 'QIWI',
      description: 'Популярный в России',
      icon: '📱',
      available: true
    }
  ]

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      await onPayment(selectedMethod, {
        amount,
        description,
        method: selectedMethod
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Payment Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Сумма к оплате</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{description}</span>
            <span className="text-2xl font-bold">
              {selectedMethod === 'telegram_stars' 
                ? `${amount} ⭐` 
                : `${amount} ₽`
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Способ оплаты</h3>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
          className="space-y-3"
        >
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-3">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        size="lg"
        className="w-full"
        variant={selectedMethod === 'telegram_stars' ? 'telegram' : 'default'}
      >
        {isProcessing ? 'Обрабатываю...' : `Оплатить ${amount} ${selectedMethod === 'telegram_stars' ? '⭐' : '₽'}`}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        🔒 Ваши платежные данные защищены и не сохраняются
      </div>
    </div>
  )
}
```

### **2. SubscriptionPlans Component**

#### **Планы подписки:**
```typescript
// src/components/features/payments/SubscriptionPlans.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void
  currentPlan?: SubscriptionPlan
  className?: string
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSelectPlan,
  currentPlan,
  className
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Бесплатный',
      price: 0,
      period: 'month',
      features: [
        '5 AI консультаций в месяц',
        'Базовые шаблоны документов',
        'Поддержка в чате'
      ],
      limitations: [
        'Ограниченное количество консультаций',
        'Без приоритетной поддержки'
      ],
      popular: false
    },
    {
      id: 'basic',
      name: 'Базовый',
      price: 990,
      period: 'month',
      features: [
        '50 AI консультаций в месяц',
        'Все шаблоны документов',
        'Приоритетная поддержка',
        'Экспорт в PDF/DOCX'
      ],
      limitations: [],
      popular: true
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 1990,
      period: 'month',
      features: [
        'Безлимитные AI консультации',
        'Персональный AI юрист',
        'Приоритетная поддержка 24/7',
        'Все форматы экспорта',
        'Аналитика использования',
        'Интеграция с внешними сервисами'
      ],
      limitations: [],
      popular: false
    }
  ]

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Выберите план подписки</h2>
        <p className="text-gray-600">
          Получите доступ к расширенным возможностям AI юриста
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "p-6 relative",
              plan.popular && "ring-2 ring-primary-500",
              selectedPlan?.id === plan.id && "ring-2 ring-primary-500"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Популярный
              </Badge>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold">
                {plan.price === 0 ? 'Бесплатно' : `${plan.price} ₽`}
              </div>
              {plan.price > 0 && (
                <div className="text-sm text-gray-500">в месяц</div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium mb-2">Включено:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {plan.limitations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Ограничения:</h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="text-gray-400">✗</span>
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setSelectedPlan(plan)
                onSelectPlan(plan)
              }}
              variant={plan.popular ? 'default' : 'outline'}
              className="w-full"
              disabled={currentPlan?.id === plan.id}
            >
              {currentPlan?.id === plan.id 
                ? 'Текущий план' 
                : plan.price === 0 
                  ? 'Начать бесплатно' 
                  : 'Выбрать план'
              }
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

## ⚖️ Dispute компоненты

### **1. DisputeCard Component**

#### **Карточка спора:**
```typescript
// src/components/features/disputes/DisputeCard.tsx
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface DisputeCardProps {
  dispute: Dispute
  onView: (dispute: Dispute) => void
  onEdit: (dispute: Dispute) => void
  className?: string
}

export const DisputeCard: React.FC<DisputeCardProps> = ({
  dispute,
  onView,
  onEdit,
  className
}) => {
  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: DisputePriority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={cn("p-6 hover:shadow-md transition-shadow", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{dispute.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {dispute.description}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStatusColor(dispute.status)}>
              {dispute.status}
            </Badge>
            <Badge className={getPriorityColor(dispute.priority)}>
              {dispute.priority}
            </Badge>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>#{dispute.id}</span>
            <span>
              Создан {formatDistanceToNow(dispute.createdAt, { 
                addSuffix: true, 
                locale: ru 
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📁 {dispute.documentsCount} документов</span>
            <span>💬 {dispute.commentsCount} комментариев</span>
          </div>
        </div>

        {/* Progress */}
        {dispute.status === 'in_progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span>{dispute.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dispute.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(dispute)}
            className="flex-1"
          >
            Просмотреть
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(dispute)}
            className="flex-1"
          >
            Редактировать
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

### **2. DisputeTimeline Component**

#### **Временная линия спора:**
```typescript
// src/components/features/disputes/DisputeTimeline.tsx
import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

interface DisputeTimelineProps {
  events: DisputeEvent[]
  className?: string
}

export const DisputeTimeline: React.FC<DisputeTimelineProps> = ({
  events,
  className
}) => {
  const getEventIcon = (type: DisputeEventType) => {
    switch (type) {
      case 'created':
        return '🆕'
      case 'status_changed':
        return '🔄'
      case 'document_added':
        return '📄'
      case 'comment_added':
        return '💬'
      case 'assigned':
        return '👤'
      case 'resolved':
        return '✅'
      default:
        return '📝'
    }
  }

  const getEventColor = (type: DisputeEventType) => {
    switch (type) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'status_changed':
        return 'bg-yellow-100 text-yellow-800'
      case 'document_added':
        return 'bg-green-100 text-green-800'
      case 'comment_added':
        return 'bg-purple-100 text-purple-800'
      case 'assigned':
        return 'bg-orange-100 text-orange-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">История спора</h3>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex space-x-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm">
                {getEventIcon(event.type)}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-2" />
              )}
            </div>

            {/* Event Content */}
            <div className="flex-1 pb-4">
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getEventColor(event.type)}>
                      {event.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(event.timestamp, { 
                        addSuffix: true, 
                        locale: ru 
                      })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600">{event.description}</p>
                    )}
                  </div>

                  {event.metadata && (
                    <div className="text-xs text-gray-500">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎯 Заключение

Данная библиотека UI компонентов обеспечивает:

### **✅ Современные компоненты:**
- **shadcn/ui основа** - современные, доступные компоненты
- **TypeScript поддержка** - полная типизация
- **Tailwind CSS** - utility-first стилизация
- **Telegram интеграция** - специальные компоненты для Telegram

### **✅ Функциональность:**
- **AI компоненты** - чат, сообщения, предложения
- **Document компоненты** - редактор, просмотрщик
- **Payment компоненты** - формы оплаты, планы подписки
- **Dispute компоненты** - карточки, временная линия

### **✅ Готовность к использованию:**
- **Готовые компоненты** - можно сразу использовать
- **Примеры использования** - детальные примеры
- **Адаптивность** - мобильный подход
- **Доступность** - WCAG 2.1 AA соответствие

**Следующий шаг**: Интеграция компонентов в приложение! 🚀

---

*UI компоненты подготовлены: 16 октября 2025*  
*Версия: 1.0*  
*Статус: Готово к использованию ✅*
