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
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { SettingsSection } from "@components/settings/SettingsSection";
import { SettingsRow } from "@components/settings/SettingsRow";
import { DisconnectWalletModal } from "@components/settings/DisconnectWalletModal";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "@providers/ThemeProvider";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { enabled: notificationsEnabled, toggle: toggleNotifications } =
    useNotifications();

  const [showDisconnect, setShowDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setShowDisconnect(false);
      router.replace("/");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>

        <SettingsSection title="Appearance">
          <SettingsRow
            icon="color-palette-outline"
            label="Theme"
            description="Light, Dark, or System default"
            type="navigate"
            onPress={() => router.push("/settings/theme")}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            description="Job alerts, messages, and updates"
            type="toggle"
            value={notificationsEnabled}
            onToggle={toggleNotifications}
          />
        </SettingsSection>

        <SettingsSection title="Wallet">
          <SettingsRow
            icon="wallet-outline"
            label="Connected Wallet"
            description="View your linked address"
            type="navigate"
            onPress={() => router.push("/settings/wallet")}
          />
          <SettingsRow
            icon="log-out-outline"
            label="Disconnect Wallet"
            description="Sign out and unlink this device"
            type="destructive"
            onPress={() => setShowDisconnect(true)}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsRow
            icon="document-text-outline"
            label="Documentation"
            type="link"
            onPress={() => Linking.openURL("https://docs.hunty.com")}
          />
          <SettingsRow
            icon="help-circle-outline"
            label="Help Center"
            type="link"
            onPress={() => Linking.openURL("https://support.hunty.com")}
          />
          <SettingsRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            type="link"
            onPress={() => Linking.openURL("https://hunty.com/privacy")}
          />
          <SettingsRow
            icon="newspaper-outline"
            label="Terms of Service"
            type="link"
            onPress={() => Linking.openURL("https://hunty.com/terms")}
          />
        </SettingsSection>

        <Text style={[styles.version, { color: colors.border }]}>Hunty v1.0.0 · development build</Text>
      </ScrollView>

      <DisconnectWalletModal
        visible={showDisconnect}
        onCancel={() => setShowDisconnect(false)}
        onConfirm={handleDisconnect}
        isLoading={disconnecting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  networkCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 4,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 28,
    marginTop: 8,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
