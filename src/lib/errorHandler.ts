import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: Date;
}

export class AppError extends Error {
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(message: string, context: ErrorContext = {}, originalError?: Error) {
    super(message);
    this.name = 'AppError';
    this.context = context;
    this.originalError = originalError;
  }
}

export const handleError = (
  error: unknown,
  context: string,
  options: {
    showToast?: boolean;
    logToConsole?: boolean;
    additionalContext?: ErrorContext;
  } = {}
): AppError => {
  const {
    showToast = true,
    logToConsole = true,
    additionalContext = {}
  } = options;

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, additionalContext, error);
  } else if (typeof error === 'string') {
    appError = new AppError(error, additionalContext);
  } else {
    appError = new AppError('An unknown error occurred', additionalContext);
  }

  // Add context information
  appError.context = {
    ...appError.context,
    ...additionalContext,
    component: context,
    timestamp: new Date()
  };

  // Log to console in development
  if (logToConsole && process.env.NODE_ENV === 'development') {
    console.error(`[${context}] Error:`, appError);
    if (appError.originalError) {
      console.error('Original error:', appError.originalError);
    }
  }

  // Show user-friendly toast
  if (showToast) {
    toast({
      title: "Error",
      description: getErrorMessage(appError),
      variant: "destructive",
    });
  }

  // In production, you might want to send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Add error reporting service (e.g., Sentry)
    // reportError(appError);
  }

  return appError;
};

export const getErrorMessage = (error: AppError | Error | unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Specific error handlers for common scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, context);
    return fallback;
  }
};

export const handleThemeError = (error: unknown, themeName: string): void => {
  handleError(error, 'ThemeLoader', {
    showToast: true,
    additionalContext: {
      action: 'loadTheme',
      component: 'ThemeLoader'
    }
  });
};

export const handleExportError = (error: unknown): void => {
  handleError(error, 'PowerPointExporter', {
    showToast: true,
    additionalContext: {
      action: 'exportToPowerPoint',
      component: 'PowerPointExporter'
    }
  });
};

export const handleLLMError = (error: unknown): void => {
  handleError(error, 'LLMContext', {
    showToast: true,
    additionalContext: {
      action: 'generateText',
      component: 'LLMContext'
    }
  });
};
