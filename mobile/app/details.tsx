import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedCustomText, ThemedView } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import type { Clue, StoredHunt } from '@lib/types';

export default function DetailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { huntId } = useLocalSearchParams<{ huntId?: string }>();
  const [hunt, setHunt] = useState<StoredHunt | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const { getCompletedClues } = usePlayerStore();

  const hId = Number(huntId);
  const completedClues = getCompletedClues(hId);
  const isComplete = clues.length > 0 && completedClues.size === clues.length;
  const progressPercent = useMemo(() => {
    if (clues.length === 0) return 0;
    return Math.round((completedClues.size / clues.length) * 100);
  }, [completedClues.size, clues.length]);

  useEffect(() => {
    const id = Number(huntId);
    Promise.all([getHuntById(id), getHuntClues(id)]).then(([hunt, clues]) => {
      if (hunt) setHunt(hunt);
      setClues(clues);
    });
  }, [huntId]);

  const handleStartHunt = () => {
    router.push(`/nested?huntId=${hId}&clueIndex=0`);
  };

  const handleResume = () => {
    const nextIncompleteIndex = clues.findIndex((_, i) => !completedClues.has(i));
    const resumeIndex = nextIncompleteIndex >= 0 ? nextIncompleteIndex : 0;
    router.push(`/nested?huntId=${hId}&clueIndex=${resumeIndex}`);
  };

  if (!hunt) return <View style={styles.container} />;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.primary + '12', borderBottomColor: colors.border }]}>
        <ThemedCustomText variant="h2" weight="800" style={styles.title}>{hunt.title}</ThemedCustomText>
        <ThemedCustomText variant="caption" color="primary" weight="700" style={styles.status}>{hunt.status}</ThemedCustomText>
      </View>

      <ThemedCustomText variant="body" style={styles.description}>{hunt.description}</ThemedCustomText>

      <View style={styles.metaContainer}>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Total Clues</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{clues.length}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Reward Type</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{hunt.rewardType}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Players</ThemedCustomText>
          <ThemedCustomText variant="h3" color="primary" weight="700">{Math.max(12, clues.length * 5)}</ThemedCustomText>
        </View>
        <View style={[styles.metaItem, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <ThemedCustomText variant="caption" style={styles.metaLabel}>Creator</ThemedCustomText>
          <ThemedCustomText variant="label" weight="700">GD72...3W9A</ThemedCustomText>
        </View>
      </View>

      {clues.length > 0 && (
        <View style={[styles.progressSection, { backgroundColor: colors.info + '12', borderLeftColor: colors.info }]}> 
          <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Your Progress</ThemedCustomText>
          <View style={styles.progressStats}>
            <ThemedCustomText variant="body" style={styles.progressText}>
              {completedClues.size} of {clues.length} clues solved ({progressPercent}%)
            </ThemedCustomText>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}> 
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercent}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionButtonsContainer}>
        {completedClues.size === 0 ? (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartHunt}
          >
            <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Start Hunt</ThemedCustomText>
          </Pressable>
        ) : isComplete ? (
          <View style={[styles.completedContainer, { borderColor: colors.success, backgroundColor: colors.success + '12' }]}> 
            <ThemedCustomText variant="label" color="success" weight="700">Hunt Completed</ThemedCustomText>
            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.primary }]}
              onPress={handleStartHunt}
            >
              <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Replay Hunt</ThemedCustomText>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleResume}
          >
            <ThemedCustomText variant="label" lightColor="#fff" darkColor="#fff" weight="700">Resume Hunt</ThemedCustomText>
          </Pressable>
        )}
      </View>

      <View style={styles.cluesSection}>
        <ThemedCustomText variant="label" weight="700" style={styles.sectionTitle}>Clues ({completedClues.size}/{clues.length})</ThemedCustomText>
        <FlatList
          scrollEnabled={false}
          data={clues}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const isCompleted = completedClues.has(index);
            return (
              <View
                style={[
                  styles.clueOverview,
                  { borderColor: isCompleted ? colors.success : colors.border, backgroundColor: isCompleted ? colors.success + '10' : colors.background },
                ]}
              >
                <ThemedCustomText variant="label" style={[styles.clueOverviewNum, isCompleted && { color: colors.success }]}> 
                  {isCompleted ? '✓' : '○'} #{index + 1}
                </ThemedCustomText>
                <ThemedCustomText
                  variant="caption"
                  style={[
                    styles.clueOverviewQuestion,
                    isCompleted && { color: colors.success, textDecorationLine: 'line-through' },
                  ]}
                  numberOfLines={2}
                >
                  {item.question}
                </ThemedCustomText>
                <ThemedCustomText variant="caption" color="warning" style={styles.cluePoints}>{item.points} pts</ThemedCustomText>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    marginBottom: 6,
  },
  status: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  metaItem: {
    width: '47%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  metaLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressStats: {
    gap: 8,
  },
  progressText: {
    opacity: 0.85,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  completedContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  cluesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clueOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  clueOverviewNum: {
    minWidth: 35,
  },
  clueOverviewQuestion: {
    flex: 1,
    lineHeight: 18,
  },
  cluePoints: {
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  spacer: {
    height: 20,
  },
});
