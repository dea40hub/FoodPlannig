import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

interface LoginFormData {
  email: string;
  password: string;
  ruolo: "cameriere" | "cassa" | "cucina";
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
      companyId: string;
      companyName: string;
    };
  };
  errors: string[];
  timestamp: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    ruolo: "cameriere",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Pulisce l'errore quando l'utente inizia a digitare
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginWithAPI({
        email: formData.email,
        password: formData.password,
      });

      // Salva l'intero payload di risposta con dati aggiuntivi per la gestione dell'applicazione
      const completeUserData = {
        // Dati del payload completo dell'API
        ...response,
        // Dati aggiuntivi per la gestione dell'applicazione
        ruoloSelezionato: formData.ruolo, // Il ruolo selezionato nel form (cameriere/cassa/cucina)
        loginTime: new Date().toISOString(),
        // Dati derivati per facilità d'uso
        nomeCompleto: `${response.data.user.firstName} ${response.data.user.lastName}`,
        isLoggedIn: true,
      };

      // Salva tutti i dati completi
      sessionStorage.setItem("userSession", JSON.stringify(completeUserData));

      // Mantiene anche il formato precedente per compatibilità (se necessario)
      const legacyUserData = {
        nome: `${response.data.user.firstName} ${response.data.user.lastName}`,
        ruolo: formData.ruolo,
        email: response.data.user.email,
        userId: response.data.user.id,
        companyId: response.data.user.companyId,
        companyName: response.data.user.companyName,
        roles: response.data.user.roles,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem(
        "currentCameriere",
        JSON.stringify(legacyUserData)
      );

      // Accesso rapido ai dati più utilizzati
      sessionStorage.setItem("authToken", response.data.accessToken);
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      sessionStorage.setItem("companyId", response.data.user.companyId);
      sessionStorage.setItem("companyName", response.data.user.companyName);
      sessionStorage.setItem("userId", response.data.user.id);
      sessionStorage.setItem("userEmail", response.data.user.email);
      sessionStorage.setItem(
        "userRoles",
        JSON.stringify(response.data.user.roles)
      );

      // Reindirizza in base al ruolo selezionato
      switch (formData.ruolo) {
        case "cassa":
          navigate("/cassa");
          break;
        case "cucina":
          navigate("/cucina");
          break;
        case "cameriere":
        default:
          navigate("/sala");
          break;
      }
    } catch (err) {
      console.error("Errore durante il login:", err);
      setError(
        err instanceof Error ? err.message : "Errore durante il login. Riprova."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Chiamata API reale per il login
  const loginWithAPI = async (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    try {
      const response = await fetch(
        "https://apiwhrtest.dea40.it/api/Auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }
      );

      // Controlla se la risposta è ok
      if (!response.ok) {
        // Gestisce diversi tipi di errore HTTP
        switch (response.status) {
          case 401:
            throw new Error(
              "Credenziali non valide. Controlla email e password."
            );
          case 403:
            throw new Error("Accesso non autorizzato.");
          case 404:
            throw new Error("Servizio di autenticazione non trovato.");
          case 500:
            throw new Error("Errore del server. Riprova più tardi.");
          default:
            throw new Error(
              `Errore di connessione (${response.status}). Riprova.`
            );
        }
      }

      const data: LoginResponse = await response.json();

      // Verifica se il login è andato a buon fine
      if (!data.success) {
        throw new Error(data.message || "Login fallito.");
      }

      // Verifica che i dati necessari siano presenti
      if (!data.data?.accessToken || !data.data?.user) {
        throw new Error("Risposta del server incompleta.");
      }

      return data;
    } catch (error) {
      // Gestisce errori di rete
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Impossibile connettersi al server. Controlla la connessione internet."
        );
      }
      // Rilancia altri errori
      throw error;
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <h1 className={styles.title}>Vendolo Gestione Ristorante</h1>
          <p className={styles.subtitle}>Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Inserisci la tua email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Inserisci la tua password"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="ruolo" className={styles.label}>
              Seleziona Ruolo
            </label>
            <select
              id="ruolo"
              name="ruolo"
              value={formData.ruolo}
              onChange={handleInputChange}
              className={styles.select}
              required
              disabled={isLoading}
            >
              <option value="cameriere">Cameriere</option>
              <option value="cassa">Operatore Cassa</option>
              <option value="cucina">Operatore Cucina</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.loadingSpinner}>
                <span>Accedendo...</span>
              </div>
            ) : (
              "Accedi"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Inserisci le tue credenziali per accedere
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
