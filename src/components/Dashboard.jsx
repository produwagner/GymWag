import React from "react";
import { BarbellIcon, TrophyIcon, HistoryIcon, EditIcon } from "./Icons";

export default function Dashboard({ workoutData, history, onStartWorkout, onSetActiveTab, profile }) {
  // Simple weekly tracker (last 7 days)
  const getWeeklyProgress = () => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - idx));
      const dayName = days[d.getDay()];
      const dateString = d.toDateString();
      
      // Check if any workout in history occurred on this day
      const completedOnDay = history.some(item => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === dateString;
      });

      return {
        dayName,
        completed: completedOnDay,
        isToday: dateString === today.toDateString()
      };
    });
  };

  const weeklyProgress = getWeeklyProgress();
  
  // Calculate total stats
  const totalWorkouts = history.length;
  const totalWeight = history.reduce((acc, curr) => {
    // Sum all loads * sets
    return acc + (curr.exercises?.reduce((sum, ex) => sum + (parseFloat(ex.load) || 0) * (parseInt(ex.sets) || 3), 0) || 0);
  }, 0);

  const lastWorkout = history[0] ? new Date(history[0].date).toLocaleDateString("pt-BR") : "Nenhum";

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <header className="dash-header">
        <div>
          <span className="welcome-text">Bora treinar,</span>
          <h2 className="user-name">{profile?.name || "Wagner"}!</h2>
        </div>
        <div className="streak-badge glass">
          <TrophyIcon size={20} className="badge-icon" />
          <span>{totalWorkouts} treinos</span>
        </div>
      </header>

      {/* Weekly Progress Tracker */}
      <section className="section-container glass">
        <h3 className="section-title">Esta Semana</h3>
        <div className="week-grid">
          {weeklyProgress.map((day, idx) => (
            <div key={idx} className={`day-col ${day.isToday ? "today" : ""}`}>
              <span className="day-name">{day.dayName}</span>
              <div className={`day-dot ${day.completed ? "completed" : ""}`}>
                {day.completed && "✓"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Summary Card */}
      <section className="stats-row">
        <div className="stat-card glass">
          <HistoryIcon size={20} className="stat-icon purple" />
          <div className="stat-info">
            <span className="stat-value">{lastWorkout}</span>
            <span className="stat-label">Último Treino</span>
          </div>
        </div>
        <div className="stat-card glass">
          <BarbellIcon size={20} className="stat-icon lime" />
          <div className="stat-info">
            <span className="stat-value">{totalWeight.toLocaleString()} kg</span>
            <span className="stat-label">Volume Total</span>
          </div>
        </div>
      </section>

      {/* Routine list */}
      <section className="routines-section">
        <div className="section-header">
          <h3 className="section-title">Suas Fichas</h3>
          <button className="btn-link" onClick={() => onSetActiveTab("routines")}>
            <EditIcon size={16} /> Gerenciar
          </button>
        </div>
        
        <div className="routines-grid">
          {workoutData.routines.map((routine) => (
            <div key={routine.id} className="routine-card glass glass-interactive">
              <div className="routine-header">
                <div>
                  <h4 className="routine-name">{routine.name}</h4>
                  <span className="routine-qty">{routine.exercises.length} exercícios</span>
                </div>
                <div className="routine-tag">{routine.id}</div>
              </div>
              
              <div className="routine-preview">
                {routine.exercises.slice(0, 3).map((ex, i) => (
                  <div key={ex.id} className="preview-item">
                    <span>{ex.name}</span>
                    <span className="preview-sets">{ex.sets}x{ex.reps}</span>
                  </div>
                ))}
                {routine.exercises.length > 3 && (
                  <div className="preview-more">e mais {routine.exercises.length - 3} exercícios...</div>
                )}
              </div>

              <button className="btn btn-lime start-routine-btn" onClick={() => onStartWorkout(routine)}>
                <BarbellIcon size={18} /> Iniciar Treino {routine.id}
              </button>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px 16px;
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .welcome-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .user-name {
          font-size: 1.8rem;
          color: var(--color-text-primary);
          margin-top: -2px;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 99px;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--accent-lime);
          border: 1px solid rgba(19, 115, 51, 0.15);
          background: rgba(19, 115, 51, 0.05);
          margin-right: 48px; /* Evita colisão com o botão de tema */
        }

        .badge-icon {
          color: var(--accent-lime);
        }

        .section-container {
          padding: 16px;
        }

        .section-title {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          margin-bottom: 12px;
        }

        .week-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          text-align: center;
        }

        .day-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .day-col.today .day-name {
          color: var(--accent-purple);
          font-weight: 700;
        }

        .day-name {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .day-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          color: transparent;
          transition: all 0.3s ease;
        }

        .day-dot.completed {
          background: var(--accent-lime);
          border-color: var(--accent-lime);
          color: white;
          font-weight: bold;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-icon {
          padding: 8px;
          border-radius: 10px;
          background: var(--bg-primary);
        }

        .stat-icon.purple {
          color: var(--accent-purple);
          background: var(--accent-purple-glow);
        }

        .stat-icon.lime {
          color: var(--accent-lime);
          background: rgba(19, 115, 51, 0.08);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-title);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .routines-section {
          margin-top: 10px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
          transition: color 0.2s;
        }

        .btn-link:hover {
          color: var(--accent-purple);
        }

        .routines-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .routine-card {
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
        }

        .routine-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .routine-name {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          margin-bottom: 2px;
        }

        .routine-qty {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }

        .routine-tag {
          background: var(--accent-purple-glow);
          color: var(--accent-purple);
          border: 1px solid var(--border-hover);
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.1rem;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .routine-preview {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: var(--bg-primary);
          border-radius: 10px;
          border: 1px solid var(--border-color);
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .preview-sets {
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .preview-more {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-style: italic;
          margin-top: 2px;
        }

        .start-routine-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
