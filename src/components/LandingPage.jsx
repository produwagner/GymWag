import React, { useState, useEffect } from "react";
import { BarbellIcon } from "./Icons";

export default function LandingPage({ deferredPrompt, onEnterApp }) {
  const [showModal, setShowModal] = useState(false);
  const [appName, setAppName] = useState("GymRot");
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Detect if mobile (Android, etc.)
    const mobile = /android|webos|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(mobile);

    // Detect if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsInstalled(true);
      onEnterApp(); // Auto-enter if already standalone
    }
  }, [onEnterApp]);

  const handleInstallClick = () => {
    setShowModal(true);
  };

  const confirmInstallation = () => {
    if (!deferredPrompt) {
      onEnterApp();
      return;
    }

    const dynamicManifest = {
      name: appName.trim() || "GymRot",
      short_name: appName.trim().substring(0, 12) || "GymRot",
      description: "Seu acompanhador de treinos de hipertrofia.",
      start_url: ".",
      display: "standalone",
      background_color: "#090d16",
      theme_color: "#8b5cf6",
      orientation: "portrait",
      icons: [
        {
          src: "favicon.svg",
          sizes: "192x192 512x512",
          type: "image/svg+xml",
          purpose: "any maskable"
        }
      ]
    };

    // Serialize to Blob and set as manifest Link URL
    const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], { type: "application/json" });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    
    const manifestElement = document.getElementById("pwa-manifest");
    if (manifestElement) {
      manifestElement.setAttribute("href", manifestUrl);
    }

    // Small delay to allow the browser to register the new manifest before prompt
    setTimeout(() => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação");
        } else {
          console.log("Usuário recusou a instalação");
        }
        setShowModal(false);
        onEnterApp();
      });
    }, 150);
  };

  if (isInstalled) return null;

  return (
    <div className="landing-container animate-fade-in">
      <div className="landing-content glass">
        <div className="landing-logo-wrapper">
          <div className="landing-logo-circle">
            <BarbellIcon size={36} className="landing-logo-icon" />
          </div>
          <h1 className="landing-title">Gym<span>Rot</span></h1>
          <p className="landing-subtitle">Seu treino, no seu ritmo.</p>
        </div>

        <p className="landing-description">
          Gerencie suas rotinas ABCD, registre cargas em tempo real e utilize o timer de descanso inteligente offline de forma simples e rápida.
        </p>

        <div className="landing-actions">
          {/* Always show the Install button on landing page */}
          <button className="btn btn-primary btn-large" onClick={handleInstallClick}>
            Instalar Aplicativo
          </button>

          <button className="btn btn-secondary btn-large" onClick={onEnterApp}>
            Acessar no Navegador
          </button>
        </div>

        <div className="landing-footer">
          Ficha ABCD Inteligente • Funciona Offline
        </div>
      </div>

      {/* Modal - Name Choice or iOS/Android/Desktop Instructions */}
      {showModal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="modal-content glass animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {isIOS ? (
              <>
                <h3 className="modal-title">Como Instalar no iPhone</h3>
                <p className="modal-text">
                  Como a Apple não permite a instalação direta pelo navegador, siga os passos abaixo:
                </p>
                <ol className="ios-instructions-list">
                  <li>Toque no ícone de <strong>Compartilhar</strong> <span className="ios-icon">⎋</span> (na barra inferior).</li>
                  <li>Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                  <li>Escolha o nome desejado para o seu app e toque em <strong>Adicionar</strong>.</li>
                </ol>
                <div className="modal-actions">
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setShowModal(false); onEnterApp(); }}>
                    Entendi, Acessar Treino
                  </button>
                </div>
              </>
            ) : deferredPrompt ? (
              <>
                <h3 className="modal-title">Personalize o seu App</h3>
                <p className="modal-text">
                  Escolha o nome que será exibido na tela inicial do seu celular:
                </p>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="custom-app-name">Nome do Aplicativo</label>
                  <input
                    id="custom-app-name"
                    type="text"
                    className="input-field"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Ex: Treino do Wagner"
                    maxLength={20}
                    autoFocus
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={confirmInstallation} disabled={!appName.trim()}>
                    Confirmar & Instalar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="modal-title">
                  {isMobile ? "Instalar no Android" : "Instalar no Computador"}
                </h3>
                <p className="modal-text">
                  Para instalar este aplicativo no seu dispositivo, siga os passos no seu navegador:
                </p>
                <ol className="ios-instructions-list">
                  {isMobile ? (
                    <>
                      <li>Toque no ícone de <strong>menu (três pontos <span className="ios-icon">⋮</span>)</strong> no canto superior direito do navegador.</li>
                      <li>Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
                      <li>Confirme para ter o atalho na sua tela de início.</li>
                    </>
                  ) : (
                    <>
                      <li>Procure o ícone de <strong>Instalação</strong> (um monitor com seta para baixo ou símbolo de <span className="ios-icon">+</span>) no lado direito da barra de endereços do seu navegador.</li>
                      <li>Ou clique no menu do navegador (três pontos <span className="ios-icon">⋮</span>) e selecione <strong>Instalar GymRot...</strong> ou <strong>Instalar página como aplicativo</strong>.</li>
                    </>
                  )}
                </ol>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Fechar
                  </button>
                  <button className="btn btn-primary" onClick={() => { setShowModal(false); onEnterApp(); }}>
                    Acessar no Navegador
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Landing Page Scoped Styles */}
      <style>{`
        .landing-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        .landing-content {
          width: 100%;
          max-width: 400px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px; /* Google-like rounded container */
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .landing-logo-wrapper {
          margin-bottom: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .landing-logo-circle {
          width: 72px;
          height: 72px;
          border-radius: 24px; /* Soft square Google style */
          background-color: var(--accent-purple);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(11, 87, 208, 0.2);
        }

        .landing-logo-icon {
          color: white;
        }

        .landing-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1;
        }

        .landing-title span {
          color: var(--accent-purple);
        }

        .landing-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-top: 6px;
          font-weight: 500;
        }

        .landing-description {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 35px;
        }

        .landing-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 30px;
        }

        .btn-large {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          border-radius: 100px;
        }

        .landing-footer {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(31, 31, 31, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal-content {
          width: 100%;
          max-width: 380px;
          padding: 28px 24px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .modal-title {
          font-size: 1.25rem;
          color: var(--color-text-primary);
          margin-bottom: 12px;
          text-align: left;
          font-weight: 700;
        }

        .modal-text {
          font-size: 0.88rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
          margin-bottom: 20px;
          text-align: left;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        .modal-actions button {
          flex: 1;
        }

        /* iOS Instructions */
        .ios-instructions-list {
          text-align: left;
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          padding-left: 20px;
          margin-bottom: 24px;
        }

        .ios-instructions-list li {
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .ios-icon {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid var(--border-color);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 1rem;
          color: var(--color-text-primary);
        }
      `}</style>
    </div>
  );
}
