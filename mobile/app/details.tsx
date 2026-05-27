import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, Text, Button } from 'react-native';
import { Link, useSearchParams, useRouter } from 'expo-router';
import { getHuntById, getHuntClues } from '@store/huntStore';
import { usePlayerStore } from '@store/useStore';
import type { Clue, StoredHunt } from '@lib/types';

export default function DetailsScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const huntId = Number(params.huntId);
  const [hunt, setHunt] = useState<StoredHunt | undefined>(undefined);
  const [clues, setClues] = useState<Clue[]>([]);
  const [loading, setLoading] = useState(true);
  const progress = usePlayerStore((state) => state.currentProgress);
  const setProgress = usePlayerStore((state) => state.setProgress);

  useEffect(() => {
    let isMounted = true;

    async function loadHunt() {
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

    loadHunt();

    return () => {
      isMounted = false;
    };
  }, [huntId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (!hunt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hunt Not Found</Text>
        <Text style={styles.subtitle}>Please go back and select an active hunt.</Text>
        <Button title="Back to Hunts" onPress={() => router.push('/(tabs)/hunts')} />
      </View>
    );
  }

  const isCurrentHunt = progress?.hunt_id === hunt.id;
  const currentIndex = isCurrentHunt ? progress.current_clue_index : 0;
  const completed = isCurrentHunt ? progress.completed : false;

  const handleStart = () => {
    setProgress({
      hunt_id: hunt.id,
      player: 'guest',
      current_clue_index: 0,
      completed: false,
      reward_claimed: false,
    });
    router.push(`/nested?huntId=${hunt.id}&clueIndex=0`);
  };

  const handleContinue = () => {
    router.push(`/nested?huntId=${hunt.id}&clueIndex=${currentIndex}`);
  };

  const clueRows = clues.map((clue: Clue, index: number) => {
    const isSolved = completed || index < currentIndex;
    const isCurrent = !completed && index === currentIndex;
    const statusLabel = completed
      ? 'Solved'
      : isSolved
      ? 'Solved'
      : isCurrent
      ? 'Current'
      : 'Locked';

    return {
      ...clue,
      statusLabel,
      displayLabel: `#${index + 1} ${clue.question}`,
      solved: isSolved,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hunt.title}</Text>
      <Text style={styles.subtitle}>{hunt.description}</Text>
      <Text style={styles.meta}>Total clues: {clues.length}</Text>
      {completed ? (
        <Text style={styles.completeText}>This hunt is complete. Great work!</Text>
      ) : (
        <Button
          title={isCurrentHunt ? `Continue clue ${currentIndex + 1}` : 'Start hunt'}
          onPress={isCurrentHunt ? handleContinue : handleStart}
        />
      )}
      <Text style={styles.sectionHeader}>Ordered clue list</Text>
      <FlatList
        data={clueRows}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.clueCard, item.solved && styles.solvedCard]}>
            <Text style={styles.clueLabel}>{item.displayLabel}</Text>
            <Text style={styles.clueStatus}>{item.statusLabel}</Text>
          </View>
        )}
      />
      <View style={styles.linkRow}>
        <Link href="/(tabs)/hunts" asChild>
          <Button title="Back to Hunts" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#555',
    marginBottom: 12,
  },
  meta: {
    color: '#777',
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  clueCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
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
