import { useState } from "react";
import { Dashboard } from './components/Dashboard';
import { LoginModal } from './components/LoginModal';

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <div className="min-h-screen">
      {!isAuth && <LoginModal onSuccess={() => setIsAuth(true)} />}
      {isAuth && <Dashboard />}
    </div>
  );
}

export default App;