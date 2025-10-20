import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppState, TelegramUser, Dispute, CreateDisputeRequest, UpdateDisputeRequest } from '@/types';

interface AppStore extends AppState {
  // Auth actions
  setUser: (user: TelegramUser | null) => void;
  
  // Disputes actions
  setDisputes: (disputes: Dispute[]) => void;
  setCurrentDispute: (dispute: Dispute | null) => void;
  addDispute: (dispute: Dispute) => void;
  updateDispute: (id: string, updates: Partial<Dispute>) => void;
  removeDispute: (id: string) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        disputes: [],
        currentDispute: null,
        isLoading: false,
        error: null,

        // Auth actions
        login: (user: TelegramUser) => {
          set({ user, isAuthenticated: true });
        },
        
        logout: () => {
          set({ 
            user: null, 
            isAuthenticated: false, 
            disputes: [], 
            currentDispute: null 
          });
        },
        
        setUser: (user: TelegramUser | null) => {
          set({ 
            user, 
            isAuthenticated: !!user 
          });
        },

        // Disputes actions
        loadDisputes: async () => {
          set({ isLoading: true, error: null });
          try {
            // Здесь будет API вызов для загрузки споров
            // const disputes = await api.getDisputes();
            // set({ disputes, isLoading: false });
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load disputes',
              isLoading: false 
            });
          }
        },
        
        createDispute: async (disputeData: CreateDisputeRequest) => {
          set({ isLoading: true, error: null });
          try {
            // Здесь будет API вызов для создания спора
            // const newDispute = await api.createDispute(disputeData);
            // set(state => ({ 
            //   disputes: [...state.disputes, newDispute],
            //   isLoading: false 
            // }));
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create dispute',
              isLoading: false 
            });
          }
        },
        
        updateDispute: async (id: string, updates: UpdateDisputeRequest) => {
          set({ isLoading: true, error: null });
          try {
            // Здесь будет API вызов для обновления спора
            // const updatedDispute = await api.updateDispute(id, updates);
            // set(state => ({
            //   disputes: state.disputes.map(d => d.id === id ? updatedDispute : d),
            //   currentDispute: state.currentDispute?.id === id ? updatedDispute : state.currentDispute,
            //   isLoading: false
            // }));
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update dispute',
              isLoading: false 
            });
          }
        },
        
        deleteDispute: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            // Здесь будет API вызов для удаления спора
            // await api.deleteDispute(id);
            // set(state => ({
            //   disputes: state.disputes.filter(d => d.id !== id),
            //   currentDispute: state.currentDispute?.id === id ? null : state.currentDispute,
            //   isLoading: false
            // }));
            set({ isLoading: false });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to delete dispute',
              isLoading: false 
            });
          }
        },
        
        setDisputes: (disputes: Dispute[]) => {
          set({ disputes });
        },
        
        setCurrentDispute: (dispute: Dispute | null) => {
          set({ currentDispute: dispute });
        },
        
        addDispute: (dispute: Dispute) => {
          set(state => ({ 
            disputes: [...state.disputes, dispute] 
          }));
        },
        
        updateDispute: (id: string, updates: Partial<Dispute>) => {
          set(state => ({
            disputes: state.disputes.map(d => 
              d.id === id ? { ...d, ...updates } : d
            ),
            currentDispute: state.currentDispute?.id === id 
              ? { ...state.currentDispute, ...updates } 
              : state.currentDispute
          }));
        },
        
        removeDispute: (id: string) => {
          set(state => ({
            disputes: state.disputes.filter(d => d.id !== id),
            currentDispute: state.currentDispute?.id === id ? null : state.currentDispute
          }));
        },

        // UI actions
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
        
        setError: (error: string | null) => {
          set({ error });
        },
        
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'lawerapp-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'lawerapp-store',
    }
  )
);
