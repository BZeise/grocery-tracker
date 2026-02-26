import { useUser } from '../../contexts/AuthContext';

export function MobileHeader() {
  const { currentUser, clearUser } = useUser();

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-10">
      <div className="px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Grocery Tracker</h1>
          {currentUser && (
            <p className="text-blue-200 text-xs">{currentUser.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={clearUser}
          className="text-sm px-3 py-1 bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
