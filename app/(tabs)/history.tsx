import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage, Transaction } from '@/lib/storage';
import { useTheme } from '@/hooks/useTheme';
import SwipeWrapper from '@/components/SwipeWrapper';

export default function HistoryTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkTheme } = useTheme();

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const data = await storage.getTransactions();
      const sorted = [...data].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setTransactions(sorted);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.deleteTransaction(id);
              await loadTransactions();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionItem, isDarkTheme && styles.transactionItemDark]}>
      <View
        style={[
          styles.iconContainer,
          item.type === 'credit' ? styles.creditIcon : styles.debitIcon,
        ]}>
        {item.type === 'credit' ? (
          <ArrowDownCircle size={24} color="#059669" />
        ) : (
          <ArrowUpCircle size={24} color="#dc2626" />
        )}
      </View>

      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionNote, isDarkTheme && styles.transactionNoteDark]}>
          {item.note || 'No description'}
        </Text>
        <Text style={[styles.transactionDate, isDarkTheme && styles.transactionDateDark]}>
          {formatDate(item.created_at)} at {formatTime(item.created_at)}
        </Text>
      </View>

      <Text
        style={[
          styles.transactionAmount,
          item.type === 'credit' ? styles.creditAmount : styles.debitAmount,
        ]}>
        {item.type === 'credit' ? '+' : '-'}₹{Number(item.amount).toFixed(2)}
      </Text>

      <TouchableOpacity
        style={[styles.deleteButton, isDarkTheme && styles.deleteButtonDark]}
        onPress={() => handleDelete(item.id)}>
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SwipeWrapper currentTab="history">
      <View style={[styles.container, isDarkTheme && styles.containerDark]}>
        <View style={[styles.header, isDarkTheme && styles.headerDark]}>
          <Text style={[styles.title, isDarkTheme && styles.titleDark]}>Transaction History</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDarkTheme && styles.emptyTextDark]}>No transactions yet</Text>
            <Text style={[styles.emptySubtext, isDarkTheme && styles.emptySubtextDark]}>
              Add your first transaction to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SwipeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  titleDark: {
    color: '#e5e7eb',
  },
  listContent: {
    padding: 18,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  transactionItemDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  creditIcon: {
    backgroundColor: '#d1fae5',
  },
  debitIcon: {
    backgroundColor: '#fee2e2',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
  },
  transactionNoteDark: {
    color: '#e5e7eb',
  },
  transactionDate: {
    fontSize: 13,
    color: '#64748b',
  },
  transactionDateDark: {
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
  creditAmount: {
    color: '#059669',
  },
  debitAmount: {
    color: '#dc2626',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  deleteButtonDark: {
    backgroundColor: '#450a0a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyTextDark: {
    color: '#9ca3af',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptySubtextDark: {
    color: '#6b7280',
  },
});
