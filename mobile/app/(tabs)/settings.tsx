import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView, ThemedCustomText, ThemedButton, ThemedInput } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { useWalletStore } from '@store/useStore';
import { useToast } from '@providers/ToastProvider';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { network, watchOnlyAddress, setWatchOnlyAddress, clearWatchOnlyAddress } = useWalletStore();
  const [inputAddress, setInputAddress] = useState(watchOnlyAddress);

  const isMainnet = network === 'mainnet';
  const isValidWatchAddress = useMemo(() => /^G[A-Z2-7]{55}$/.test(inputAddress.trim()), [inputAddress]);

  const handleSaveWatchAddress = () => {
    if (!isValidWatchAddress) {
      showToast({ message: 'Enter a valid Stellar public G-address.', type: 'warning' });
      return;
    }

    setWatchOnlyAddress(inputAddress.trim());
    showToast({ message: 'Watch-only mode enabled for profile history.', type: 'success' });
  };

  const handleClearWatchAddress = () => {
    clearWatchOnlyAddress();
    setInputAddress('');
    showToast({ message: 'Watch-only address removed.', type: 'info' });
  };

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

      <View style={[styles.networkCard, { borderColor: colors.border, backgroundColor: colors.background }]}> 
        <ThemedCustomText variant="label" weight="700">Watch-only profile</ThemedCustomText>
        <ThemedCustomText variant="caption">
          Add a public Stellar G-address to view hunt history without connecting a signing wallet.
        </ThemedCustomText>
        <ThemedInput
          placeholder="G..."
          value={inputAddress}
          onChangeText={setInputAddress}
          autoCapitalize="characters"
          autoCorrect={false}
          error={inputAddress.length > 0 && !isValidWatchAddress ? 'Invalid Stellar public key format.' : undefined}
        />
        <ThemedButton text="Save watch address" onPress={handleSaveWatchAddress} disabled={!isValidWatchAddress} />
        {watchOnlyAddress ? (
          <ThemedButton text="Clear watch address" variant="ghost" onPress={handleClearWatchAddress} />
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
