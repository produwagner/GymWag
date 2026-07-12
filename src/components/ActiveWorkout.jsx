import React, { useState, useEffect } from "react";
import { CheckIcon, ClockIcon, InfoIcon, PlayIcon } from "./Icons";
import Timer from "./Timer";
import { exerciseGifs } from "../data/exerciseGifs";

export default function ActiveWorkout({ routine, history, onSaveWorkout, onCancelWorkout }) {
  const [exercisesState, setExercisesState] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);
  const [startTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedGifExId, setExpandedGifExId] = useState(null);

  const toggleGif = (exId) => {
    setExpandedGifExId(prev => (prev === exId ? null : exId));
  };

  useEffect(() => {
    // Look up previous loads from history for each exercise in this routine
    const getPreviousLoad = (exerciseName) => {
      // Find the most recent workout in history that contains this exercise
      for (const session of history) {
        const found = session.exercises?.find(
          (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
        );
        if (found && found.setsData) {
          // Get the load of the first set (or maximum load)
          const loads = found.setsData.map(s => s.load).filter(Boolean);
          if (loads.length > 0) return loads[0];
        }
      }
      return "";
    };

    // Initialize state for each exercise and its sets
    const initialExercises = routine.exercises.map((ex) => {
      const prevLoad = getPreviousLoad(ex.name);
      
      return {
        ...ex,
        // Create an array for sets data
        setsData: Array.from({ length: ex.sets }).map((_, idx) => ({
          setNum: idx + 1,
          load: prevLoad || ex.load || "",
          reps: ex.reps.includes("-") ? ex.reps.split("-")[1] : ex.reps, // take upper range if range
          completed: false
        }))
      };
    });

    setExercisesState(initialExercises);
  }, [routine, history]);

  // Handle checking/unchecking a set
  const handleSetCheck = (exIdx, setIdx) => {
    const updated = [...exercisesState];
    const set = updated[exIdx].setsData[setIdx];
    const newCompletedState = !set.completed;
    
    set.completed = newCompletedState;
    setExercisesState(updated);

    // If marked completed, start the rest timer
    if (newCompletedState) {
      // Find if this is the last set of the last exercise
      const isLastExercise = exIdx === exercisesState.length - 1;
      const isLastSet = setIdx === updated[exIdx].setsData.length - 1;
      
      if (!(isLastExercise && isLastSet)) {
        setActiveTimer({
          duration: updated[exIdx].rest || 60,
          exerciseName: updated[exIdx].name
        });
      }
    }
  };

  const handleSetDataChange = (exIdx, setIdx, field, value) => {
    const updated = [...exercisesState];
    updated[exIdx].setsData[setIdx][field] = value;
    setExercisesState(updated);
  };

  const handleFinishWorkout = () => {
    setIsFinishing(true);
  };

  const handleSaveConfirm = () => {
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationMin = Math.round(durationMs / 60000);

    const completedExercises = exercisesState.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      setsData: ex.setsData.map((s) => ({
        setNum: s.setNum,
        load: s.load,
        reps: s.reps,
        completed: s.completed
      }))
    }));

    onSaveWorkout({
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      duration: durationMin,
      notes: notes,
      exercises: completedExercises
    });
  };

  return (
    <div className="active-workout-container animate-fade-in">
      {/* Timer overlay if active */}
      {activeTimer && (
        <Timer
          duration={activeTimer.duration}
          onFinish={() => setActiveTimer(null)}
          onCancel={() => setActiveTimer(null)}
        />
      )}

      {/* Header */}
      <header className="active-workout-header">
        <div>
          <span className="routine-tag-large">{routine.id}</span>
          <h2 className="routine-title-large">{routine.name}</h2>
        </div>
        <button className="btn-cancel" onClick={onCancelWorkout}>
          Desistir
        </button>
      </header>

      {/* Exercises List */}
      {!isFinishing ? (
        <>
          <div className="exercises-list-wrapper">
            {exercisesState.map((ex, exIdx) => (
              <div key={ex.id} className="exercise-workout-card glass">
                <div className="ex-card-header">
                  <div className="ex-card-title-container">
                    <h4 className="ex-card-title">{ex.name}</h4>
                    {exerciseGifs[ex.name] && (
                      <button
                        className={`btn-show-gif ${expandedGifExId === ex.id ? "active" : ""}`}
                        onClick={() => toggleGif(ex.id)}
                        title="Ver execução em 3D"
                        type="button"
                      >
                        <PlayIcon size={12} />
                      </button>
                    )}
                  </div>
                  <div className="ex-card-meta">
                    <ClockIcon size={14} /> <span>{ex.rest}s descanso</span>
                  </div>
                </div>

                {ex.observations && (
                  <div className="ex-card-observations">
                    <InfoIcon size={14} /> <span>{ex.observations}</span>
                  </div>
                )}

                {expandedGifExId === ex.id && exerciseGifs[ex.name] && (
                  <div className="exercise-gif-drawer animate-slide-down">
                    <img
                      src={exerciseGifs[ex.name]}
                      alt={ex.name}
                      className="exercise-gif"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Sets Header */}
                <div className="sets-grid-header">
                  <span>SÉRIE</span>
                  <span>CARGA (KG)</span>
                  <span>REPETIÇÕES</span>
                  <span>STATUS</span>
                </div>

                {/* Sets Rows */}
                <div className="sets-rows">
                  {ex.setsData.map((set, setIdx) => (
                    <div key={setIdx} className={`set-row ${set.completed ? "completed" : ""}`}>
                      <span className="set-number-label">{set.setNum}ª</span>
                      
                      <div className="input-with-suffix">
                        <input
                          type="number"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className="set-input load"
                          value={set.load}
                          disabled={set.completed}
                          onChange={(e) => handleSetDataChange(exIdx, setIdx, "load", e.target.value)}
                          placeholder="0"
                        />
                        <span className="suffix">kg</span>
                      </div>

                      <div className="input-with-suffix">
                        <input
                          type="number"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          className="set-input reps"
                          value={set.reps}
                          disabled={set.completed}
                          onChange={(e) => handleSetDataChange(exIdx, setIdx, "reps", e.target.value)}
                          placeholder="0"
                        />
                        <span className="suffix">reps</span>
                      </div>

                      <button
                        className={`btn-check-set ${set.completed ? "checked" : ""}`}
                        onClick={() => handleSetCheck(exIdx, setIdx)}
                      >
                        <CheckIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-lime finish-workout-btn" onClick={handleFinishWorkout}>
            Finalizar Treino
          </button>
        </>
      ) : (
        /* Finish Workout Screen */
        <div className="finish-workout-card glass animate-slide-up">
          <h3 className="finish-title">Treino Concluído!</h3>
          <p className="finish-desc">Deseja adicionar alguma anotação sobre o treino de hoje?</p>

          <div className="form-group">
            <label className="form-label" htmlFor="workout-notes">Observações / Como se sentiu</label>
            <textarea
              id="workout-notes"
              className="input-field textarea-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino muito produtivo. Consegui aumentar 2kg no agachamento."
              rows={4}
            />
          </div>

          <div className="finish-actions">
            <button className="btn btn-secondary" onClick={() => setIsFinishing(false)}>
              Voltar ao Treino
            </button>
            <button className="btn btn-primary" onClick={handleSaveConfirm}>
              Salvar Treino
            </button>
          </div>
        </div>
      )}

      <style>{`
        .active-workout-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 20px 16px;
          min-height: 100vh;
        }

        .active-workout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .routine-tag-large {
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--accent-purple);
          background: rgba(11, 87, 208, 0.08);
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 4px;
        }

        .routine-title-large {
          font-size: 1.5rem;
          color: var(--color-text-primary);
        }

        .btn-cancel {
          background: rgba(197, 34, 31, 0.05);
          border: 1px solid rgba(197, 34, 31, 0.2);
          color: var(--status-error);
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          margin-right: 48px; /* Evita colisão com o botão de tema */
        }

        .btn-cancel:hover {
          background: rgba(197, 34, 31, 0.1);
        }

        .exercises-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .exercise-workout-card {
          padding: 16px;
        }

        .ex-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .ex-card-title {
          font-size: 1.1rem;
          color: var(--color-text-primary);
          max-width: 70%;
        }

        .ex-card-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .ex-card-observations {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--accent-lime);
          background: rgba(19, 115, 51, 0.05);
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .sets-grid-header {
          display: grid;
          grid-template-columns: 0.6fr 1.2fr 1.2fr 0.8fr;
          gap: 8px;
          font-size: 0.7rem;
          color: var(--color-text-muted);
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .sets-rows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .set-row {
          display: grid;
          grid-template-columns: 0.6fr 1.2fr 1.2fr 0.8fr;
          gap: 8px;
          align-items: center;
          padding: 8px;
          border-radius: 10px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .set-row.completed {
          background: rgba(19, 115, 51, 0.05);
          border-color: rgba(19, 115, 51, 0.15);
        }

        .set-number-label {
          font-family: var(--font-title);
          font-weight: 700;
          color: var(--color-text-secondary);
          padding-left: 4px;
        }

        .input-with-suffix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .set-input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 8px 8px;
          color: var(--color-text-primary);
          text-align: right;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          transition: border-color 0.2s;
        }

        .set-input.load {
          padding-right: 28px;
        }

        .set-input.reps {
          padding-right: 42px;
        }

        .set-input:disabled {
          color: var(--color-text-muted);
          border-color: transparent;
          background: transparent;
        }

        .set-input:focus {
          outline: none;
          border-color: var(--accent-purple);
        }

        .suffix {
          position: absolute;
          right: 8px;
          font-size: 0.75rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .btn-check-set {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          justify-self: center;
        }

        .btn-check-set:hover {
          border-color: var(--accent-lime);
          color: var(--accent-lime);
        }

        .btn-check-set.checked {
          background: var(--status-success);
          border-color: var(--status-success);
          color: white;
        }

        .finish-workout-btn {
          width: 100%;
          padding: 15px;
          margin-top: 10px;
          font-size: 1.1rem;
          border-radius: 12px;
        }

        /* Finish Card */
        .finish-workout-card {
          padding: 24px;
          text-align: center;
        }

        .finish-title {
          font-size: 1.6rem;
          color: var(--color-text-primary);
          margin-bottom: 8px;
        }

        .finish-desc {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
        }

        .textarea-field {
          resize: none;
        }

        .finish-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .finish-actions button {
          flex: 1;
        }

        .ex-card-title-container {
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 80%;
        }

        .btn-show-gif {
          background: rgba(11, 87, 208, 0.06);
          border: 1px solid rgba(11, 87, 208, 0.15);
          color: var(--accent-purple);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .btn-show-gif:hover {
          background: rgba(11, 87, 208, 0.15);
          transform: scale(1.08);
        }

        .btn-show-gif.active {
          background: var(--accent-purple);
          border-color: var(--accent-purple);
          color: white;
          transform: rotate(90deg); /* Rotaciona o play para indicar expansão/drawer aberto */
        }

        .exercise-gif-drawer {
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px;
          margin-top: 8px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .dark-theme .exercise-gif-drawer {
          background: rgba(255, 255, 255, 0.01);
        }

        .exercise-gif {
          max-width: 100%;
          max-height: 180px;
          border-radius: 8px;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .dark-theme .exercise-gif {
          filter: invert(0.9) hue-rotate(180deg);
          mix-blend-mode: normal; /* mix-blend-mode multiply com invert às vezes fica cinza, normal é mais nítido em dark */
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
