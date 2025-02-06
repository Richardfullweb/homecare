import { useState } from 'react';

type Toast = {
  title: string;
  description: string;
  variant: 'default' | 'destructive' | 'success';
};

export const useToast = () => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (toast: Toast) => {
    setToast(toast);
    setTimeout(() => setToast(null), 5000);
  };

  return {
    toast,
    showToast,
  };
};
