import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { HuntyRefreshControl } from '@components/HuntyRefreshControl';
import { useRefreshByUser } from '@hooks/useRefreshByUser';

// Placeholder for hunt data fetching
const fetchHunts = async () => [];

export default function HomeFeed() {
  const { data: hunts, refetch } = useQuery({
    queryKey: ['hunts'],
    queryFn: fetchHunts,
  });

  const { isRefreshing, onRefresh } = useRefreshByUser(refetch);

  return (
    <View style={styles.container}>
      <FlatList
        data={hunts}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
        refreshControl={
          <HuntyRefreshControl 
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>No active hunts found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    color: '#0f172a',
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    textAlign: 'center',
    color: '#64748b',
  },
});