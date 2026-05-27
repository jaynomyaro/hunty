import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, FlatList } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import type { StoredHunt, Clue } from '@lib/types';

export default function DetailsScreen() {
  const router = useRouter();
  const { huntId } = useSearchParams();
  const [hunt, setHunt] = useState<StoredHunt | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const { getCompletedClues } = usePlayerStore();

  const hId = Number(huntId);
  const completedClues = getCompletedClues(hId);
  const isComplete = completedClues.size === clues.length && clues.length > 0;

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hunt Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{hunt.title}</Text>
        <Text style={styles.status}>{hunt.status}</Text>
      </View>

      {/* Hunt Description */}
      <Text style={styles.description}>{hunt.description}</Text>

      {/* Hunt Metadata */}
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total Clues</Text>
          <Text style={styles.metaValue}>{clues.length}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Reward Type</Text>
          <Text style={styles.metaValue}>{hunt.rewardType}</Text>
        </View>
      </View>

      {/* Progress Section */}
      {completedClues.size > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>
              {completedClues.size} of {clues.length} clues solved
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${(completedClues.size / clues.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {completedClues.size === 0 ? (
          <Pressable
            style={styles.primaryButton}
            onPress={handleStartHunt}
          >
            <Text style={styles.primaryButtonText}>🎯 Start Hunt</Text>
          </Pressable>
        ) : isComplete ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>✓ Hunt Completed!</Text>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleStartHunt}
            >
              <Text style={styles.secondaryButtonText}>Replay Hunt</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.primaryButton}
            onPress={handleResume}
          >
            <Text style={styles.primaryButtonText}>▶ Resume Hunt</Text>
          </Pressable>
        )}
      </View>

      {/* Clues Overview */}
      <View style={styles.cluesSection}>
        <Text style={styles.sectionTitle}>Clues ({completedClues.size}/{clues.length})</Text>
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
                  isCompleted && styles.completedClueOverview,
                ]}
              >
                <Text
                  style={[
                    styles.clueOverviewNum,
                    isCompleted && styles.completedClueNum,
                  ]}
                >
                  {isCompleted ? '✓' : '○'} #{index + 1}
                </Text>
                <Text
                  style={[
                    styles.clueOverviewQuestion,
                    isCompleted && styles.completedClueQuestion,
                  ]}
                  numberOfLines={2}
                >
                  {item.question}
                </Text>
                <Text style={styles.cluePoints}>{item.points} pts</Text>
              </View>
            );
          }}
        />
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  status: {
    fontSize: 12,
    color: '#17a2b8',
    fontWeight: '600',
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e8f4f8',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  progressStats: {
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#d0e8ef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#17a2b8',
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completedContainer: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4caf50',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 8,
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
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  completedClueOverview: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  clueOverviewNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 35,
  },
  completedClueNum: {
    color: '#2e7d32',
  },
  clueOverviewQuestion: {
    flex: 1,
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  completedClueQuestion: {
    color: '#2e7d32',
    textDecorationLine: 'line-through',
  },
  cluePoints: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ff9800',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  spacer: {
    height: 20,
  },
});
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  solvedCard: {
    backgroundColor: '#e6f7e6',
  },
  clueLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  clueStatus: {
    color: '#444',
  },
  completeText: {
    color: '#0a7d3e',
    marginBottom: 14,
    fontWeight: '600',
  },
  linkRow: {
    marginTop: 22,
  },
});
