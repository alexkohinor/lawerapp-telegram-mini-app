import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface DialogContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <DialogContext.Provider value={{ isOpen, open, close }}>
      {children}
    </DialogContext.Provider>
  );
};

interface DialogTriggerProps {
  children: ReactNode;
  asChild?: boolean;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  asChild = false,
}) => {
  const { open } = useContext(DialogContext)!;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        open();
      },
    });
  }

  return (
    <button onClick={open}>
      {children}
    </button>
  );
};

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => {
  const { isOpen, close } = useContext(DialogContext)!;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />
      
      {/* Content */}
      <div className={clsx(
        'relative z-50 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}>
        <button
          onClick={close}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx(
      'flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0',
      className
    )}>
      {children}
    </div>
  );
};

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h2 className={clsx(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}>
      {children}
    </h2>
  );
};

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={clsx(
      'text-sm text-gray-500 dark:text-gray-400',
      className
    )}>
      {children}
    </p>
  );
};

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div className={clsx(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0',
      className
    )}>
      {children}
    </div>
  );
};
