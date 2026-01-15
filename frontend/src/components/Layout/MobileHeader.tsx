import { useAuth } from '../../contexts/AuthContext';

export function MobileHeader() {
  const { logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Grocery Tracker</h1>
        <button
          onClick={logout}
          className="text-sm px-3 py-1 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
