import { useState, useEffect } from 'react';
import { toastService, Toast } from '../services/toastService';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return {
    toasts,
    success: (title: string, message?: string, duration?: number) => 
      toastService.success(title, message, duration),
    error: (title: string, message?: string, duration?: number) => 
      toastService.error(title, message, duration),
    warning: (title: string, message?: string, duration?: number) => 
      toastService.warning(title, message, duration),
    info: (title: string, message?: string, duration?: number) => 
      toastService.info(title, message, duration),
    remove: (id: string) => toastService.remove(id),
    clear: () => toastService.clear()
  };
}
