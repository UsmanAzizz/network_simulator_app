import { create } from 'zustand';

const useDialogStore = create((set) => ({
  isOpen: false,
  type: 'alert', // 'alert' | 'confirm'
  title: '',
  message: '',
  onConfirm: null,
  
  showAlert: (message, title = 'Informasi') => set({
    isOpen: true,
    type: 'alert',
    title,
    message,
    onConfirm: null
  }),

  showConfirm: (message, onConfirm, title = 'Konfirmasi') => set({
    isOpen: true,
    type: 'confirm',
    title,
    message,
    onConfirm
  }),

  closeDialog: () => set({ isOpen: false, onConfirm: null })
}));

export default useDialogStore;
