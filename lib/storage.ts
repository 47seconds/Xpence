import AsyncStorage from '@react-native-async-storage/async-storage';

export type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  note: string;
  created_at: string;
};

const STORAGE_KEY = 'expenses_transactions';

export const storage = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading transactions:', error);
      return [];
    }
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    try {
      const transactions = await this.getTransactions();
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };
      transactions.push(newTransaction);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },
};
