import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@providers/ThemeProvider';
import { ThemedCustomText } from '@components/themed';

type ToastType = 'info' | 'success' | 'warning' | 'error';

type ToastInput = {
  message: string;
  type?: ToastType;
  durationMs?: number;
};

type ToastState = {
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(({ message, type = 'info', durationMs = 4200 }: ToastInput) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    setToast({ message, type });
    hideTimerRef.current = setTimeout(() => {
      setToast(null);
      hideTimerRef.current = null;
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const typeColor =
    toast?.type === 'success'
      ? colors.success
      : toast?.type === 'warning'
        ? colors.warning
        : toast?.type === 'error'
          ? colors.error
          : colors.info;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <SafeAreaView pointerEvents="none" style={styles.overlay} edges={['top']}>
          <View style={[styles.toast, { backgroundColor: typeColor }]}> 
            <ThemedCustomText variant="label" lightColor="#ffffff" darkColor="#ffffff" weight="700">
              {toast.message}
            </ThemedCustomText>
          </View>
        </SafeAreaView>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  toast: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
});

