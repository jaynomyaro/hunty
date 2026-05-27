import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, ThemedCustomText, ThemedButton } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { useWalletStore } from '@store/useStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { network } = useWalletStore();

  const isMainnet = network === 'mainnet';

  return (
    <ThemedView style={styles.container}>
      <ThemedCustomText variant="h2">Settings</ThemedCustomText>
      <ThemedCustomText variant="body">Configure theme, accessibility, and app preferences.</ThemedCustomText>

      <View style={[styles.networkCard, { borderColor: colors.border, backgroundColor: colors.background }]}> 
        <ThemedCustomText variant="label" weight="700">Wallet network</ThemedCustomText>
        <ThemedCustomText variant="body">
          {network === 'unknown' ? 'Unknown' : network === 'mainnet' ? 'Stellar Mainnet' : 'Stellar Testnet'}
        </ThemedCustomText>
        {isMainnet ? (
          <>
            <ThemedCustomText variant="caption" color="warning">
              Hunty transactions require Testnet. Switch networks before joining or completing hunts.
            </ThemedCustomText>
            <ThemedButton text="How to switch" variant="ghost" onPress={() => router.push('/network/switch')} />
          </>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  networkCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
});
