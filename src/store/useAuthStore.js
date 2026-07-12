import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isTeacher: false,
      teacherName: '',
      teacherId: '',
      isViewer: false,
      viewingTeacherId: '',
      login: (key) => {
        if (key === '787898') {
          const tName = 'Usman Aziz, S.Kom.';
          const tId = 'usman_aziz';
          set({ isTeacher: true, teacherName: tName, teacherId: tId, isViewer: false, viewingTeacherId: '' });
          
          if (typeof window !== 'undefined') {
            const onlineStr = localStorage.getItem('online_teachers');
            let online = onlineStr ? JSON.parse(onlineStr) : {};
            online[tId] = { name: tName, lastActive: Date.now() };
            localStorage.setItem('online_teachers', JSON.stringify(online));
          }
          return true;
        }
        return false;
      },
      logout: () => {
        const { teacherId } = get();
        if (typeof window !== 'undefined' && teacherId) {
          const onlineStr = localStorage.getItem('online_teachers');
          if (onlineStr) {
            let online = JSON.parse(onlineStr);
            delete online[teacherId];
            localStorage.setItem('online_teachers', JSON.stringify(online));
          }
          localStorage.removeItem('broadcast_' + teacherId);
        }
        set({ isTeacher: false, teacherName: '', teacherId: '' });
      },
      joinClass: (tId) => {
        set({ isViewer: true, viewingTeacherId: tId, isTeacher: false, teacherName: '', teacherId: '' });
      },
      leaveClass: () => {
        set({ isViewer: false, viewingTeacherId: '' });
      }
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
    }
  )
);

export default useAuthStore;
