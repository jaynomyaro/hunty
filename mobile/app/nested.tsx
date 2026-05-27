import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import { CluesList } from '@components/CluesList';
import type { StoredHunt, Clue } from '@lib/types';

export default function NestedScreen() {
  const router = useRouter();
  const { huntId, clueIndex } = useSearchParams();
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
    <View style={styles.container}>
      {/* Main Clue Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hunt && <Text style={styles.huntTitle}>{hunt.title}</Text>}
        <Text style={styles.header}>
          Clue {idx + 1} of {clues.length}
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${((idx + 1) / clues.length) * 100}%` },
            ]}
          />
        </View>

        <Text style={styles.question}>{clue.question}</Text>

        {clue.hint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintLabel}>💡 Hint:</Text>
            <Text style={styles.hintText}>{clue.hint}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Your answer..."
          placeholderTextColor="#bbb"
          value={answer}
          onChangeText={setAnswer}
          autoCapitalize="none"
          autoCorrect={false}
          editable={true}
        />

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.navButton, idx === 0 && styles.disabledButton]}
            onPress={handlePreviousClue}
            disabled={idx === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </Pressable>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {isLast ? '🏁 Finish' : '✓ Submit'}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.navButton,
              (idx === clues.length - 1 || !completedClues.has(idx)) &&
                styles.disabledButton,
            ]}
            onPress={handleNextClue}
            disabled={idx === clues.length - 1 || !completedClues.has(idx)}
          >
            <Text style={styles.navButtonText}>Next →</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Hunt</Text>
        </Pressable>
      </ScrollView>

      {/* Clues List Drill-down */}
      {showCluesDropdown && clues.length > 0 && (
        <CluesList
          clues={clues}
          currentIndex={idx}
          completedIndices={completedClues}
          onSelectClue={handleNavigateToClue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  huntTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
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
    backgroundColor: '#17a2b8',
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    lineHeight: 28,
    color: '#1a1a1a',
  },
  hintContainer: {
    backgroundColor: '#fffbf0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  hintLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flex: 1.2,
    backgroundColor: '#28a745',
    paddingVertical: 11,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 13,
    color: '#17a2b8',
    fontWeight: '500',
  },
});
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#444',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  feedback: {
    marginBottom: 12,
    color: '#cc0000',
  },
  linkRow: {
    marginTop: 18,
  },
});
