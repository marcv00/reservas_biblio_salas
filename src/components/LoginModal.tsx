import { useState } from "react";
import { apiService } from "../services/api";

export const LoginModal = ({ onSuccess }: { onSuccess: () => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    const ok = await apiService.login(username, password);

    if (ok) {
      onSuccess();
    } else {
      alert("Credenciales incorrectas");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-xl font-bold">Admin Login</h2>

        <input
          placeholder="Usuario"
          className="w-full border p-2 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "..." : "Entrar"}
        </button>
      </div>
    </div>
  );
};