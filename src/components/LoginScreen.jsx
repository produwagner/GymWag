import React, { useState } from "react";
import { 
  SyncIcon, 
  HelpCircleIcon, 
  SunIcon, 
  MoonIcon,
  BarbellIcon,
  UserIcon
} from "./Icons";
import { 
  requestAccessToken, 
  initTokenClient, 
  fetchGoogleUserInfo,
  getOrCreateFolder,
  getOrCreateSpreadsheet
} from "../services/googleDriveService";
import { GOOGLE_CLIENT_ID } from "../config";

export default function LoginScreen({
  theme,
  onToggleTheme,
  googleSyncSettings,
  onUpdateGoogleSyncSettings,
  onUpdateProfile,
  profile
}) {
  const [customClientId, setCustomClientId] = useState(googleSyncSettings.clientId || "");
  const [showHelp, setShowHelp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const envClientId = GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const activeClientId = envClientId || customClientId;

  const handleConnectGoogle = () => {
    if (!activeClientId) {
      setErrorMsg("Por favor, insira o Google Client ID para continuar.");
      return;
    }

    setIsConnecting(true);
    setErrorMsg("");

    try {
      initTokenClient(
        activeClientId,
        async (tokenResponse) => {
          try {
            const token = tokenResponse.access_token;
            const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
            
            // 1. Fetch user info
            const userInfo = await fetchGoogleUserInfo(token);
            
            // 2. Setup Folder and Sheets
            const folderId = await getOrCreateFolder(token);
            const spreadsheetId = await getOrCreateSpreadsheet(token, folderId);

            // 3. Save sync settings
            onUpdateGoogleSyncSettings({
              connected: true,
              token,
              tokenExpiry: expiryTime,
              email: userInfo.email,
              userName: userInfo.name,
              picture: userInfo.picture,
              folderId,
              spreadsheetId,
              clientId: envClientId ? "" : customClientId
            });

            // 4. Update profile name if it was default
            if (userInfo.given_name && (!profile.name || profile.name === "Wagner")) {
              onUpdateProfile({
                ...profile,
                name: userInfo.given_name
              });
            }
          } catch (err) {
            console.error("Setup error during login:", err);
            setErrorMsg("Falha ao configurar planilha no Drive: " + err.message);
            setIsConnecting(false);
          }
        },
        (error) => {
          console.error("GIS Auth Error:", error);
          setErrorMsg("Erro de autenticação com o Google: " + error.message);
          setIsConnecting(false);
        }
      );

      requestAccessToken();
    } catch (err) {
      setErrorMsg("Erro ao inicializar cliente do Google: " + err.message);
      setIsConnecting(false);
    }
  };

  return (
    <div className="login-screen-container animate-fade-in">
      {/* Floating Theme Button */}
      <button type="button" className="theme-toggle-btn" onClick={onToggleTheme}>
        {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>

      <div className="login-card glass animate-slide-up">
        {/* App Logo */}
        <div className="login-logo-wrapper">
          <div className="login-logo-circle">
            <BarbellIcon size={36} className="login-logo-icon" />
          </div>
          <h1 className="login-title">Gym<span>Wag</span></h1>
          <p className="login-subtitle">Treino & Sincronização em Nuvem</p>
        </div>

        <p className="login-description">
          Para acessar o GymWag e salvar automaticamente suas fichas, peso, altura e histórico de treinos no seu Google Drive, conecte-se com sua conta Google.
        </p>

        {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

        <div className="login-form-area">
          {/* Client ID Entry if not in env */}
          {!envClientId && (
            <div className="input-group login-client-group">
              <div className="label-with-help">
                <label>Google Client ID</label>
                <button 
                  type="button" 
                  className="btn-help-icon" 
                  onClick={() => setShowHelp(!showHelp)}
                  title="Ajuda para configurar credencial"
                >
                  <HelpCircleIcon size={18} />
                </button>
              </div>
              <input 
                type="text" 
                value={customClientId} 
                onChange={(e) => setCustomClientId(e.target.value)} 
                placeholder="Cole seu Client ID aqui"
              />
            </div>
          )}

          {/* Help Block */}
          {showHelp && !envClientId && (
            <div className="help-box glass animate-slide-up">
              <h4>Como criar seu Client ID no Google:</h4>
              <ol>
                <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer">Google Cloud Console</a>.</li>
                <li>Crie um projeto e configure a "Tela de consentimento OAuth" com os escopos de <code>drive.file</code> e <code>spreadsheets</code>.</li>
                <li>Crie uma credencial de <strong>"ID do cliente OAuth"</strong> para <strong>"Aplicativo da Web"</strong>.</li>
                <li>Em "Origens JavaScript autorizadas", adicione o endereço em que você abre o app (Ex: <code>http://localhost:5173</code>).</li>
                <li>Copie o ID gerado e cole no campo acima.</li>
              </ol>
            </div>
          )}

          {/* Connect Button */}
          <button 
            type="button" 
            className="btn btn-primary login-connect-btn"
            onClick={handleConnectGoogle}
            disabled={isConnecting || (!envClientId && !customClientId)}
          >
            {isConnecting ? (
              <>
                <SyncIcon size={18} className="spinner-animation" />
                Conectando...
              </>
            ) : (
              <>
                {/* Simplified Google 'G' logo inside SVG */}
                <svg className="google-logo-svg" width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2A5.6 5.6 0 0 1 8.35 13a5.6 5.6 0 0 1 5.64-5.6c1.478 0 2.812.56 3.824 1.488l3.14-3.14A9.97 9.97 0 0 0 13.99 2C8.472 2 4 6.47 4 12c0 5.53 4.472 10 9.99 10 5.753 0 9.605-4.045 9.605-9.773 0-.663-.06-1.3-.18-1.942H12.24Z" />
                </svg>
                Entrar com o Google
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .login-screen-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--bg-primary);
          position: relative;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .login-logo-wrapper {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-logo-circle {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          background-color: var(--accent-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 12px rgba(19, 115, 51, 0.2);
        }

        .login-logo-icon {
          color: white;
        }

        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .login-title span {
          color: var(--accent-purple);
        }

        .login-subtitle {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }

        .login-description {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.45;
          margin-bottom: 24px;
        }

        .login-error-banner {
          width: 100%;
          padding: 10px 12px;
          background-color: rgba(197, 34, 31, 0.08);
          color: var(--status-error);
          border: 1px solid rgba(197, 34, 31, 0.15);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 20px;
          text-align: left;
        }

        .login-form-area {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-client-group {
          text-align: left;
        }

        .label-with-help {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .label-with-help label {
          font-size: 0.78rem;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .btn-help-icon {
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }

        .login-client-group input {
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--color-text-primary);
          font-family: var(--font-body);
          font-size: 0.88rem;
          outline: none;
          width: 100%;
        }

        .login-client-group input:focus {
          border-color: var(--border-focus);
        }

        .help-box {
          padding: 12px;
          background-color: var(--bg-card-hover);
          font-size: 0.75rem;
          text-align: left;
        }

        .help-box h4 {
          margin-bottom: 4px;
          font-weight: 600;
        }

        .help-box ol {
          padding-left: 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .help-box a {
          color: var(--accent-purple);
          text-decoration: underline;
        }

        .login-connect-btn {
          width: 100%;
          padding: 14px;
          font-size: 0.95rem;
          border-radius: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .google-logo-svg {
          background: white;
          border-radius: 50%;
          padding: 2px;
        }
      `}</style>
    </div>
  );
}
