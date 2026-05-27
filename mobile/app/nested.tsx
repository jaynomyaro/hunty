import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedCustomText, ThemedView } from '@components/themed';
import { useTheme } from '@providers/ThemeProvider';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import { CluesList } from '@components/CluesList';
import type { Clue, StoredHunt } from '@lib/types';

export default function NestedScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { huntId, clueIndex } = useLocalSearchParams<{ huntId?: string; clueIndex?: string }>();
  const [hunt, setHunt] = useState<StoredHunt | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [answer, setAnswer] = useState('');
  const [showCluesDropdown, setShowCluesDropdown] = useState(true);
  const { markClueCompleted, getCompletedClues } = usePlayerStore();

  const hId = Number(huntId);
  const idx = Number(clueIndex) || 0;
  const clue = clues[idx];
  const isLast = idx === clues.length - 1;
  const completedClues = getCompletedClues(hId);

  useEffect(() => {
    Promise.all([getHuntById(hId), getHuntClues(hId)]).then(([hunt, clues]) => {
      if (hunt) setHunt(hunt);
      setClues(clues);
    });
  }, [hId]);

  useEffect(() => {
    setAnswer('');
  }, [idx]);

  const handleSubmit = () => {
    if (!clue) return;
    const correct = answer.trim().toLowerCase() === clue.answer.trim().toLowerCase();
    if (!correct) {
      Alert.alert('Incorrect', 'Try again');
      return;
    }

    // Mark clue as completed in store
    markClueCompleted(hId, idx);

    if (isLast) {
      Alert.alert('Complete!', 'You finished the hunt!');
      router.replace(`/details?huntId=${hId}`);
    } else {
      // Navigate to next clue
      router.replace(`/nested?huntId=${hId}&clueIndex=${idx + 1}`);
    }
  };

  const handleNavigateToClue = (clueIdx: number) => {
    router.replace(`/nested?huntId=${hId}&clueIndex=${clueIdx}`);
  };

  const handlePreviousClue = () => {
    if (idx > 0) {
      handleNavigateToClue(idx - 1);
    }
  };

  const handleNextClue = () => {
    if (idx < clues.length - 1 && completedClues.has(idx)) {
      handleNavigateToClue(idx + 1);
    }
  };

  if (!clue) return <View style={styles.container} />;

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hunt && <ThemedCustomText variant="caption" style={styles.huntTitle}>{hunt.title}</ThemedCustomText>}
        <ThemedCustomText variant="label" style={styles.header}>
          Clue {idx + 1} of {clues.length}
        </ThemedCustomText>
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}> 
          <View
            style={[
              styles.progressBar,
              { width: `${((idx + 1) / clues.length) * 100}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>

        <ThemedCustomText variant="h3" weight="700" style={styles.question}>{clue.question}</ThemedCustomText>

        {clue.hint && (
          <View style={[styles.hintContainer, { borderLeftColor: colors.warning, backgroundColor: colors.warning + '14' }]}> 
            <ThemedCustomText variant="caption" color="warning" weight="700">Hint</ThemedCustomText>
            <ThemedCustomText variant="caption" style={styles.hintText}>{clue.hint}</ThemedCustomText>
          </View>
        )}

        <TextInput
          placeholder="Your answer..."
          placeholderTextColor="#bbb"
          value={answer}
          onChangeText={setAnswer}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.navButton, { backgroundColor: colors.info }, idx === 0 && styles.disabledButton]}
            onPress={handlePreviousClue}
            disabled={idx === 0}
          >
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">Previous</ThemedCustomText>
          </Pressable>

          <Pressable style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">
              {isLast ? '🏁 Finish' : '✓ Submit'}
            </ThemedCustomText>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              { backgroundColor: colors.info },
              (idx === clues.length - 1 || !completedClues.has(idx)) &&
                styles.disabledButton,
            ]}
            onPress={handleNextClue}
            disabled={idx === clues.length - 1 || !completedClues.has(idx)}
          >
            <ThemedCustomText variant="caption" lightColor="#fff" darkColor="#fff" weight="700">Next</ThemedCustomText>
          </Pressable>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedCustomText variant="caption" color="primary" weight="700">Back to Hunt</ThemedCustomText>
        </Pressable>
      </ScrollView>

      {showCluesDropdown && clues.length > 0 && (
        <CluesList
          clues={clues}
          currentIndex={idx}
          completedIndices={completedClues}
          onSelectClue={handleNavigateToClue}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  huntTitle: {
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
  },
  question: {
    marginBottom: 20,
    lineHeight: 28,
  },
  hintContainer: {
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  hintText: {
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1.2,
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
