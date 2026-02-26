import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/AuthContext';
import { getUsers } from '../../services/api';
import type { User } from '../../types';

export function UserSelector() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectUser } = useUser();

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Could not load users. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Grocery Price Tracker
        </h1>
        <p className="text-center text-gray-500 mb-6">Who are you?</p>
        {isLoading && (
          <div className="text-center text-gray-400">Loading...</div>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        {!isLoading && !error && (
          <div className="flex flex-col gap-3">
            {users.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => { selectUser(user); }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors"
              >
                {user.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
