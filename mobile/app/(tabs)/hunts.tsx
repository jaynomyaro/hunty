import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, Text, Button } from 'react-native';
import { Link } from 'expo-router';
import { getAllHunts } from '@store/huntStore';
import type { StoredHunt } from '@lib/types';

export default function HuntsScreen() {
  const [activeHunts, setActiveHunts] = useState<StoredHunt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getAllHunts()
      .then((hunts) => {
        if (!isMounted) return;
        setActiveHunts(hunts.filter((hunt) => hunt.status === 'Active'));
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Hunts</Text>
      <Text style={styles.subtitle}>Tap a hunt to view the ordered clue list and solve clues one by one.</Text>
      <FlatList
        data={activeHunts}
        keyExtractor={(item: StoredHunt) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.huntTitle}>{item.title}</Text>
            <Text style={styles.huntDescription}>{item.description}</Text>
            <Text style={styles.huntMeta}>Clues: {item.cluesCount}</Text>
            <Link href={`/details?huntId=${item.id}`} asChild>
              <Button title="Open Hunt" />
            </Link>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No active hunts available right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    gap: 8,
  },
  huntTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  huntDescription: {
    color: '#444',
    marginBottom: 8,
  },
  huntMeta: {
    color: '#666',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 24,
  },
});
