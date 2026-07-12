import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isTeacher: false,
      login: (key) => {
        if (key === '787898') {
          set({ isTeacher: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isTeacher: false }),
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
    }
  )
);

export default useAuthStore;
