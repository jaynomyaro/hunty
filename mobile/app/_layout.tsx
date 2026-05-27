import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, type ErrorBoundaryProps, useRouter } from 'expo-router';i 
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hideSplashScreen, initializeSplashScreen } from '@utils/splashScreenManager';
import { ThemeProvider, useTheme } from '@providers/ThemeProvider';
import ReactQueryProvider from '@providers/ReactQueryProvider';
import { ThemedButton, ThemedCustomText } from '@components/themed';
import { useFonts } from '@app/hooks/useFonts';
import { useBackHandler } from '@hooks/useBackHandler';
import { MemoryDiagnosticsOverlay } from '@components/MemoryDiagnosticsOverlay';
import { StackHeader } from '@components/navigation/StackHeader';
import { Sentry, initializeSentry } from '@config/sentry';

initializeSplashScreen();
initializeSentry();

export const unstable_settings = { initialRouteName: '(tabs)' };

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    Sentry.Native.captureException(error);
  }, [error]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'bottom', 'left']}>
        <View style={styles.errorContainer}>
          <ThemedCustomText variant="h2" style={styles.errorTitle}>
            Something went wrong
          </ThemedCustomText>
          <ThemedCustomText variant="body" style={styles.errorMessage}>
            {error.message || 'Unexpected navigation error.'}
          </ThemedCustomText>
          <ThemedButton text="Try again" onPress={retry} variant="primary" size="md" />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </ThemeProvider>
    </ReactQueryProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [fontsLoaded, fontError] = useFonts();
  const [onboardingResolved, setOnboardingResolved] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void hideSplashScreen();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded && !fontError) return;

    let isMounted = true;

    const maybeShowOnboarding = async () => {
      try {
        const seen = await AsyncStorage.getItem('hunty_onboarding_seen');
        if (!seen && isMounted) {
          router.replace('/onboarding');
        }
      } finally {
        if (isMounted) {
          setOnboardingResolved(true);
        }
      }
    };

    void maybeShowOnboarding();

    return () => {
      isMounted = false;
    };
  }, [fontsLoaded, fontError, router]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return true;
    }

    return false;
  }, [router]);

  useBackHandler(handleBackPress);

  if ((!fontsLoaded && !fontError) || !onboardingResolved) {
    // Render an opaque background instead of null to prevent white flash
    // while fonts load and onboarding state resolves.
    return <View style={[styles.safeArea, { backgroundColor: colors.background }]} />;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top', 'right', 'bottom', 'left']}
    >
      <Stack
        screenOptions={{
          header: (props) => <StackHeader {...props} />,
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: colors.background },
          statusBarStyle: isDark ? 'light' : 'dark',
          animation: 'none',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="hunt/[id]" options={{ title: 'Hunt Details', animation: 'none' }} />
        <Stack.Screen name="transaction/pending" options={{ title: 'Transaction Pending', animation: 'none' }} />
        <Stack.Screen name="details" options={{ title: 'Details', animation: 'none' }} />
        <Stack.Screen name="nested" options={{ title: 'Nested', animation: 'none' }} />
      </Stack>
      <MemoryDiagnosticsOverlay />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  errorTitle: { textAlign: 'center' },
  errorMessage: { textAlign: 'center' },
});
