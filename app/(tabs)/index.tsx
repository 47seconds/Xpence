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
  ScrollView,
  Dimensions,
} from 'react-native';
import { Plus, TrendingUp, TrendingDown, Moon, Sun } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage, Transaction } from '@/lib/storage';
import { useTheme } from '@/hooks/useTheme';

const { width, height } = Dimensions.get('window');

const quotes = [
  "All Roads Lead to Rome",
  "Once a spectator,\n always a spectator",
  "Omniscience is\n equal to omnipotence",
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
  const { isDarkTheme, toggleTheme } = useTheme();

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
    <ScrollView style={[styles.container, isDarkTheme && styles.containerDark]} contentContainerStyle={styles.scrollContent}>
      {/* Background Gradient Effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={styles.themeToggle}
        onPress={toggleTheme}
        activeOpacity={0.7}>
        {isDarkTheme ? (
          <Sun size={20} color={isDarkTheme ? '#fbbf24' : '#6b7280'} />
        ) : (
          <Moon size={20} color={isDarkTheme ? '#fbbf24' : '#6b7280'} />
        )}
      </TouchableOpacity>
      
      {/* Quote Header */}
      <View style={styles.quoteContainer}>
        <Text style={[styles.quoteText, isDarkTheme && styles.quoteTextDark]}>{quote}</Text>
      </View>

      {/* Balance Card */}
      <View style={[styles.balanceCard, isDarkTheme && styles.balanceCardDark]}>
        <View style={styles.balanceHeader}>
          <Text style={[styles.balanceLabel, isDarkTheme && styles.balanceLabelDark]}>Current Balance</Text>
        </View>
        <Text
          style={[
            styles.balanceAmount,
            totalPool < 0 ? styles.negative : styles.positive,
          ]}>
          ₹{Math.abs(totalPool).toFixed(2)}
        </Text>
      </View>

      {/* Add Transaction Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <Plus size={24} color="#fff" strokeWidth={3} />
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, isDarkTheme && styles.footerTextDark]}>made with ❤️ by 47seconds</Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkTheme && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkTheme && styles.modalTitleDark]}>New Transaction</Text>
              <Text style={[styles.modalSubtitle, isDarkTheme && styles.modalSubtitleDark]}>Add your income or expense</Text>
            </View>

            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'credit' && styles.typeButtonActive,
                ]}
                onPress={() => setType('credit')}
                activeOpacity={0.8}>
                <TrendingUp size={20} color={type === 'credit' ? '#fff' : '#10b981'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'credit' && styles.typeButtonTextActive,
                  ]}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'debit' && styles.typeButtonActive,
                ]}
                onPress={() => setType('debit')}
                activeOpacity={0.8}>
                <TrendingDown size={20} color={type === 'debit' ? '#fff' : '#ef4444'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'debit' && styles.typeButtonTextActive,
                  ]}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkTheme && styles.inputLabelDark]}>Amount</Text>
              <TextInput
                style={[styles.input, isDarkTheme && styles.inputDark]}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={isDarkTheme ? "#6b7280" : "#9ca3af"}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, isDarkTheme && styles.inputLabelDark]}>Description</Text>
              <TextInput
                style={[styles.input, styles.noteInput, isDarkTheme && styles.inputDark]}
                placeholder="What was this for?"
                value={note}
                onChangeText={setNote}
                multiline
                placeholderTextColor={isDarkTheme ? "#6b7280" : "#9ca3af"}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
                activeOpacity={0.8}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.buttonText, styles.submitButtonText]}>
                    Add Transaction
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.05,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  quoteContainer: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.5,
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  quoteTextDark: {
    color: '#e5e7eb',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  balanceCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  balanceLabelDark: {
    color: '#9ca3af',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  positive: {
    color: '#10b981',
  },
  negative: {
    color: '#ef4444',
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerTextDark: {
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: height * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  modalContentDark: {
    backgroundColor: '#1e293b',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  modalTitleDark: {
    color: '#e5e7eb',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: 'sans-serif',
  },
  modalSubtitleDark: {
    color: '#9ca3af',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#e5e7eb',
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    fontWeight: '500',
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#e5e7eb',
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
  },
  submitButtonText: {
    color: '#ffffff',
  },
});
