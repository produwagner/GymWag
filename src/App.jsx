import React, { useState, useEffect } from "react";
import { defaultWorkout } from "./data/defaultWorkout";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import ActiveWorkout from "./components/ActiveWorkout";
import RoutineManager from "./components/RoutineManager";
import History from "./components/History";
import { BarbellIcon, CalendarIcon, HistoryIcon, SettingsIcon, SunIcon, MoonIcon } from "./components/Icons";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, routines, history
  const [activeWorkoutRoutine, setActiveWorkoutRoutine] = useState(null); // active training routine
  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      return true;
    }
    return sessionStorage.getItem("gymrot_session_entered") === "true" || sessionStorage.getItem("fittrack_session_entered") === "true";
  });

  // Theme State
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("gymrot_theme") || localStorage.getItem("fittrack_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // PWA Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.deferredPrompt || null);

  // App Data State
  const [workoutData, setWorkoutData] = useState(() => {
    const saved = localStorage.getItem("gymrot_workout_data") || localStorage.getItem("fittrack_workout_data");
    return saved ? JSON.parse(saved) : defaultWorkout;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("gymrot_history") || localStorage.getItem("fittrack_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Apply theme class to body
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("gymrot_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Listen to beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };

    const handleCustomPromptEvent = (e) => {
      setDeferredPrompt(e.detail);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-available", handleCustomPromptEvent);

    // Register PWA service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register(import.meta.env.BASE_URL + "sw.js")
          .then((registration) => {
            console.log("Service Worker registrado com sucesso:", registration.scope);
          })
          .catch((err) => {
            console.log("Falha ao registrar o Service Worker:", err);
          });
      });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-available", handleCustomPromptEvent);
    };
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    localStorage.setItem("gymrot_workout_data", JSON.stringify(workoutData));
  }, [workoutData]);

  useEffect(() => {
    localStorage.setItem("gymrot_history", JSON.stringify(history));
  }, [history]);

  const handleEnterApp = () => {
    setHasEnteredApp(true);
    sessionStorage.setItem("gymrot_session_entered", "true");
  };

  const handleStartWorkout = (routine) => {
    setActiveWorkoutRoutine(routine);
  };

  const handleSaveWorkout = (sessionData) => {
    // Add new session to history
    setHistory((prev) => [sessionData, ...prev]);

    // Update loads in the workout data so they are pre-loaded next time
    const updatedRoutines = workoutData.routines.map((routine) => {
      if (routine.id !== sessionData.routineId) return routine;
      
      return {
        ...routine,
        exercises: routine.exercises.map((ex) => {
          // Find matching exercise in finished session
          const finishedEx = sessionData.exercises.find((fe) => fe.name === ex.name);
          if (finishedEx && finishedEx.setsData) {
            // Find max load or last set load
            const loads = finishedEx.setsData.map((s) => s.load).filter(Boolean);
            if (loads.length > 0) {
              return {
                ...ex,
                load: loads[loads.length - 1] // Save last set's load
              };
            }
          }
          return ex;
        })
      };
    });

    setWorkoutData((prev) => ({
      ...prev,
      routines: updatedRoutines
    }));

    setActiveWorkoutRoutine(null);
    setActiveTab("dashboard");
  };

  const handleCancelWorkout = () => {
    if (window.confirm("Deseja realmente cancelar este treino? Os dados digitados serão perdidos.")) {
      setActiveWorkoutRoutine(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Render navigation tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            workoutData={workoutData}
            history={history}
            onStartWorkout={handleStartWorkout}
            onSetActiveTab={setActiveTab}
          />
        );
      case "routines":
        return (
          <RoutineManager
            workoutData={workoutData}
            onUpdateWorkoutData={setWorkoutData}
          />
        );
      case "history":
        return (
          <History
            history={history}
            onClearHistory={handleClearHistory}
          />
        );
      default:
        return (
          <Dashboard
            workoutData={workoutData}
            history={history}
            onStartWorkout={handleStartWorkout}
            onSetActiveTab={setActiveTab}
          />
        );
    }
  };

  // If they are on the landing page, show it
  if (!hasEnteredApp) {
    return (
      <>
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
        <LandingPage
          deferredPrompt={deferredPrompt}
          onEnterApp={handleEnterApp}
        />
      </>
    );
  }

  // If in an active workout session
  if (activeWorkoutRoutine) {
    return (
      <div className="app-container">
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Alternar tema">
          {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
        <ActiveWorkout
          routine={activeWorkoutRoutine}
          history={history}
          onSaveWorkout={handleSaveWorkout}
          onCancelWorkout={handleCancelWorkout}
        />
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Alternar tema">
        {theme === "dark" ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      </button>

      {/* Main View Area */}
      <main className="app-main-content">
        {renderTabContent()}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <BarbellIcon size={20} />
          <span>Treinar</span>
        </button>

        <button
          className={`nav-item ${activeTab === "routines" ? "active" : ""}`}
          onClick={() => setActiveTab("routines")}
        >
          <SettingsIcon size={20} />
          <span>Fichas</span>
        </button>

        <button
          className={`nav-item ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <CalendarIcon size={20} />
          <span>Histórico</span>
        </button>
      </nav>

      {/* Bottom Nav Scoped Styles */}
      <style>{`
        .app-main-content {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 20px;
        }

        .bottom-nav {
          position: fixed;
          bottom: 16px;
          left: 16px;
          right: 16px;
          height: 66px;
          max-width: 448px; /* 480px minus padding */
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-around;
          border-radius: 24px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
          z-index: 99;
          
          /* Liquidglass Effect */
          background: var(--nav-bg);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--nav-border);
          transition: all 0.3s ease;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          transition: all 0.2s;
          padding: 8px 16px;
          border-radius: 12px;
        }

        .nav-item:hover {
          color: var(--color-text-primary);
        }

        .nav-item.active {
          color: var(--accent-purple);
        }
      `}</style>
    </div>
  );
}
