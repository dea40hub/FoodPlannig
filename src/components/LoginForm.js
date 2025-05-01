import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Il nome del cameriere è obbligatorio.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Chiamata API reale per verificare/creare il cameriere
      const response = await fetch('/api/camerieri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: username.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore durante il login');
      }

      // Salva l'ID e il nome del cameriere in localStorage
      localStorage.setItem('loggedInUser', data.nome);
      localStorage.setItem('loggedInUserId', data.id);

      navigate('/sala'); // Reindirizza alla pagina della sala
    } catch (err) {
      setError(err.message || 'Errore durante il login. Riprova.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login Cameriere</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Nome Cameriere</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              placeholder="Inserisci il tuo nome"
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{width: '100%'}} // Aggiunto stile inline per compatibilità
            disabled={isLoading}
          >
            {isLoading ? 'Accesso in corso...' : 'Entra'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;

