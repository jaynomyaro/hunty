import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedButton, ThemedCustomText, ThemedView } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { getAllHunts } from '@store/huntStore';
import { usePlayerStore, useWalletStore } from '@store/useStore';
import { useToast } from '@providers/ToastProvider';
import type { StoredHunt } from '@lib/types';

export default function HuntsScreen() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { currentProgress, setProgress } = usePlayerStore();
  const { network } = useWalletStore();
  const router = useRouter();
  const [hunts, setHunts] = useState<StoredHunt[]>([]);
  const [loadingHuntId, setLoadingHuntId] = useState<number | null>(null);

  useEffect(() => {
    getAllHunts().then((data) => {
      setHunts(data.filter((hunt) => hunt.status === 'Active'));
    });
  }, []);

  const handleJoinHunt = (hunt: StoredHunt) => {
    if (loadingHuntId !== null) return;

    if (network === 'mainnet') {
      showToast({
        message: 'Switch wallet to Stellar Testnet to join hunts.',
        type: 'warning',
      });
      router.push('/network/switch');
      return;
    }

    setLoadingHuntId(hunt.id);

    router.push({
      pathname: '/transaction/pending',
      params: {
        action: 'join',
        huntId: String(hunt.id),
        huntTitle: hunt.title,
      },
    });

    setTimeout(() => {
      setProgress({
        hunt_id: hunt.id,
        player: 'GD72...3W9A',
        current_clue_index: 0,
        completed: false,
        reward_claimed: false,
      });
      setLoadingHuntId(null);
    }, 50);
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header and Stats */}
      <View style={styles.header}>
        <ThemedCustomText variant="h1" color="primary" weight="800">
          Game Arcade
        </ThemedCustomText>
        <ThemedCustomText variant="body" color="text" style={styles.subtitle}>
          Embark on real-world treasure hunts, solve clues, and claim crypto rewards.
        </ThemedCustomText>
      </View>

      {/* Stats Board */}
      <View style={[styles.statsBoard, { backgroundColor: colors.border + '30', borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <ThemedCustomText variant="h2" color="primary" weight="700">
            3
          </ThemedCustomText>
          <ThemedCustomText variant="caption" color="text" style={{ opacity: 0.7 }}>
            Active Hunts
          </ThemedCustomText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedCustomText variant="h2" color="secondary" weight="700">
            350+
          </ThemedCustomText>
          <ThemedCustomText variant="caption" color="text" style={{ opacity: 0.7 }}>
            XLM Pooled
          </ThemedCustomText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedCustomText variant="h2" color="success" weight="700">
            1.2k
          </ThemedCustomText>
          <ThemedCustomText variant="caption" color="text" style={{ opacity: 0.7 }}>
            Active Players
          </ThemedCustomText>
        </View>
      </View>

      <ThemedCustomText variant="h3" color="text" weight="700" style={styles.sectionTitle}>
        Featured Hunts
      </ThemedCustomText>

      <View style={styles.listContainer}>
        {hunts.map((hunt) => {
          const isCurrent = currentProgress?.hunt_id === hunt.id;
          const isLoading = loadingHuntId === hunt.id;
          const rewardAmount =
            hunt.rewardType === 'Both'
              ? '100 XLM + NFT'
              : hunt.rewardType === 'NFT'
                ? 'Exclusive reward NFT'
                : '250 XLM';

          return (
            <View
              key={hunt.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.background,
                  borderColor: isCurrent ? colors.success : colors.border,
                  shadowColor: isCurrent ? colors.success : '#000',
                },
              ]}
            >
              <View style={styles.badgeRow}>
                <View style={[styles.difficultyBadge, { backgroundColor: colors.info + '20' }]}>
                  <ThemedCustomText variant="caption" color="info" weight="700">
                    Active
                  </ThemedCustomText>
                </View>

                <View style={[styles.rewardBadge, { backgroundColor: colors.secondary + '20' }]}>
                  <ThemedCustomText variant="caption" color="secondary" weight="700">
                    💰 {hunt.rewardType}
                  </ThemedCustomText>
                </View>
              </View>

              {/* Title & Description */}
              <ThemedCustomText variant="h3" color="text" weight="700" style={styles.cardTitle}>
                {hunt.title}
              </ThemedCustomText>
              
              <ThemedCustomText variant="body" color="text" style={styles.cardDesc}>
                {hunt.description}
              </ThemedCustomText>

              <View style={[styles.cardInfoRow, { borderTopColor: colors.border }]}>
                <View style={styles.infoCol}>
                  <ThemedCustomText variant="caption" color="text" style={{ opacity: 0.6 }}>
                    Clues / Tasks
                  </ThemedCustomText>
                  <ThemedCustomText variant="body" color="text" weight="600">
                    📍 {hunt.cluesCount} checkpoints
                  </ThemedCustomText>
                </View>

                <View style={styles.infoCol}>
                  <ThemedCustomText variant="caption" color="text" style={{ opacity: 0.6 }}>
                    Potential Reward
                  </ThemedCustomText>
                  <ThemedCustomText variant="body" color="primary" weight="700">
                    {rewardAmount}
                  </ThemedCustomText>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                {isCurrent ? (
                  <ThemedButton
                    text="View Hunt"
                    variant="success"
                    size="md"
                    fullWidth
                    onPress={() => router.push(`/hunt/${hunt.id}`)}
                  />
                ) : (
                  <ThemedButton
                    text={isLoading ? 'Joining...' : 'Join Hunt'}
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isLoading || loadingHuntId !== null}
                    loading={isLoading}
                    onPress={() => handleJoinHunt(hunt)}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 6,
    opacity: 0.8,
    fontSize: 15,
  },
  statsBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 28,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    opacity: 0.5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  listContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  rewardBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDesc: {
    opacity: 0.7,
    marginBottom: 16,
    fontSize: 14,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  infoCol: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
  },
});
