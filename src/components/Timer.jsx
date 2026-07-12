import React, { useEffect, useState, useRef } from "react";
import { PlayIcon, PauseIcon, SkipIcon, ClockIcon } from "./Icons";

export default function Timer({ duration, onFinish, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  // Play a soft beep sound using Web Audio API (no external file needed!)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Beep 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.3);

      // Beep 2 (delayed)
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6 note
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.4);
      }, 300);

      // Vibrate device if supported
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.log("Audio contexts not supported/allowed yet by browser policy:", e);
    }
  };

  useEffect(() => {
    setTimeLeft(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      playBeep();
      onFinish();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, onFinish]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const add30Seconds = () => {
    setTimeLeft((prev) => prev + 30);
  };

  const skipTimer = () => {
    clearInterval(timerRef.current);
    onFinish();
  };

  // Circular progress calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timer-overlay animate-fade-in">
      <div className="timer-modal glass animate-slide-up">
        <div className="timer-header">
          <ClockIcon size={20} className="timer-header-icon" />
          <span>Timer de Descanso</span>
        </div>

        {/* Circular Countdown */}
        <div className="timer-circle-container">
          <svg className="timer-svg" width="140" height="140">
            <circle
              className="timer-circle-bg"
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="6"
            />
            <circle
              className="timer-circle-progress"
              cx="70"
              cy="70"
              r={radius}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="timer-digits">{formatTime(timeLeft)}</div>
        </div>

        <div className="timer-controls">
          <button className="btn btn-secondary btn-circle" onClick={toggleTimer}>
            {isActive ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
          </button>
          
          <button className="btn btn-primary btn-pill" onClick={add30Seconds}>
            +30s
          </button>

          <button className="btn btn-secondary btn-circle" onClick={skipTimer}>
            <SkipIcon size={20} />
          </button>
        </div>

        <button className="btn-cancel-timer" onClick={onCancel}>
          Pular Descanso
        </button>
      </div>

      <style>{`
        .timer-overlay {
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
          z-index: 100;
          padding: 20px;
        }

        .timer-modal {
          width: 100%;
          max-width: 320px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .timer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-text-secondary);
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 20px;
        }

        .timer-header-icon {
          color: var(--accent-purple);
        }

        .timer-circle-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .timer-svg {
          transform: rotate(-90deg);
        }

        .timer-circle-bg {
          fill: none;
          stroke: #f1f3f4;
        }

        .timer-circle-progress {
          fill: none;
          stroke: var(--accent-purple);
          transition: stroke-dashoffset 1s linear;
        }

        .timer-digits {
          position: absolute;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          font-family: var(--font-title);
          letter-spacing: -0.02em;
        }

        .timer-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          width: 100%;
          justify-content: center;
        }

        .btn-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          padding: 0;
        }

        .btn-pill {
          padding: 10px 20px;
          font-size: 0.95rem;
          border-radius: 99px;
        }

        .btn-cancel-timer {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 0.85rem;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s;
        }

        .btn-cancel-timer:hover {
          color: var(--status-error);
        }
      `}</style>
    </div>
  );
}
