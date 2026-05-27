import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Button, TextInput } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import type { Clue, StoredHunt } from '@lib/types';

export default function NestedScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const huntId = Number(params.huntId);
  const clueIndex = Number(params.clueIndex);
  const [hunt, setHunt] = useState<StoredHunt | undefined>(undefined);
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(true);
  const progress = usePlayerStore((state) => state.currentProgress);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const updateClueIndex = usePlayerStore((state) => state.updateClueIndex);
  const markCompleted = usePlayerStore((state) => state.markCompleted);

  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadClueData() {
      setLoading(true);
      const selectedHunt = await getHuntById(huntId);
      if (!isMounted) return;
      setHunt(selectedHunt);
      if (selectedHunt) {
        const huntClues = await getHuntClues(selectedHunt.id);
        if (!isMounted) return;
        setClues(huntClues);
      }
      if (isMounted) setLoading(false);
    }

    loadClueData();

    return () => {
      isMounted = false;
    };
  }, [huntId]);

  useEffect(() => {
    if (!hunt || !clues.length) return;
    if (!progress || progress.hunt_id !== hunt.id) {
      setProgress({
        hunt_id: hunt.id,
        player: 'guest',
        current_clue_index: clueIndex,
        completed: false,
        reward_claimed: false,
      });
      return;
    }

    if (progress.current_clue_index !== clueIndex && !progress.completed) {
      updateClueIndex(clueIndex);
    }
  }, [clueIndex, clues.length, hunt, progress, setProgress, updateClueIndex]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  const clue = clues[clueIndex];

  if (!hunt || !clue) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Clue not found</Text>
        <Text style={styles.subtitle}>Open the hunt details and select a valid clue.</Text>
        <Button title="Back to Hunt" onPress={() => router.push('/(tabs)/hunts')} />
      </View>
    );
  }

  const isLastClue = clueIndex === clues.length - 1;

  const handleSubmit = () => {
    if (answer.trim().toLowerCase() !== clue.answer.trim().toLowerCase()) {
      setFeedback('Incorrect answer. Try again.');
      return;
    }

    setFeedback('Correct!');
    const nextIndex = clueIndex + 1;

    if (isLastClue) {
      markCompleted();
      router.push(`/details?huntId=${hunt.id}`);
      return;
    }

    updateClueIndex(nextIndex);
    router.replace(`/nested?huntId=${hunt.id}&clueIndex=${nextIndex}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clue {clueIndex + 1}</Text>
      <Text style={styles.subtitle}>{clue.question}</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Enter your answer"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Answer input"
      />
      {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}
      <Button title={isLastClue ? 'Submit and Complete Hunt' : 'Submit Answer'} onPress={handleSubmit} />
      <View style={styles.linkRow}>
        <Button title="Back to Hunt" onPress={() => router.push(`/details?huntId=${hunt.id}`)} />
      </View>
    </View>
  );
}

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
