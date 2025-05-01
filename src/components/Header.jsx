import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const [cameriereNome, setCameriereNome] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Recupera il nome del cameriere dal localStorage
    const nome = localStorage.getItem('loggedInUser');
    if (nome) {
      setCameriereNome(nome);
    } else {
      // Se non c'è un utente loggato, reindirizza al login
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedInUserId');
    navigate('/');
  };

  return (
    <header className="header">
      <h1>Gestione Sala</h1>
      <div className="header-user">
        <span>Cameriere: <strong>{cameriereNome}</strong></span>
        <button
          onClick={handleLogout}
          className="btn btn-danger"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;

