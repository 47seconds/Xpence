import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage, Transaction } from '@/lib/storage';

const quotes = [
  "All Roads Lead to Rome",
  "Once a spectator, always a spectator",
  "Omniscience is equal to omnipotence",
];

export default function HomeTab() {
  const [totalPool, setTotalPool] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [quote, setQuote] = useState('');
  const quoteInitialized = useRef(false);

  useEffect(() => {
    if (!quoteInitialized.current) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      quoteInitialized.current = true;
    }
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const transactions = await storage.getTransactions();

      const total = transactions.reduce((sum, transaction: Transaction) => {
        return transaction.type === 'credit'
          ? sum + Number(transaction.amount)
          : sum - Number(transaction.amount);
      }, 0);

      setTotalPool(total);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    setSubmitting(true);
    try {
      await storage.addTransaction({
        type,
        amount: Number(amount),
        note: note.trim(),
      });

      await loadTransactions();
      setModalVisible(false);
      setAmount('');
      setNote('');
      setType('credit');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Total Balance</Text>
        <Text
          style={[
            styles.amount,
            totalPool < 0 ? styles.negative : styles.positive,
          ]}>
          ₹{totalPool.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>made by 47seconds</Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>

            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'credit' && styles.typeButtonActive,
                ]}
                onPress={() => setType('credit')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'credit' && styles.typeButtonTextActive,
                  ]}>
                  Credit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'debit' && styles.typeButtonActive,
                ]}
                onPress={() => setType('debit')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'debit' && styles.typeButtonTextActive,
                  ]}>
                  Debit
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Note"
              value={note}
              onChangeText={setNote}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    Add
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    position: 'absolute',
    top: 80,
    paddingHorizontal: 40,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  amount: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#dc2626',
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  footerText: {
    fontSize: 9,
    color: '#cbd5e1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#0f172a',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  noteInput: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  submitButtonText: {
    color: '#fff',
  },
});
