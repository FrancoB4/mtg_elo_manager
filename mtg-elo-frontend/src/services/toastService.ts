type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

type ToastListener = (toasts: Toast[]) => void;

class ToastService {
  private toasts: Toast[] = [];
  private listeners: ToastListener[] = [];

  subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  show(type: ToastType, title: string, message?: string, duration: number = 5000): string {
    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    this.toasts.push(toast);
    this.notify();

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, duration);
    }

    return toast.id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show('info', title, message, duration);
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }

  getToasts(): Toast[] {
    return [...this.toasts];
  }
}

export const toastService = new ToastService();
export default toastService;
