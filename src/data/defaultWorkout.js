export const defaultWorkout = {
  id: "default-abcd",
  name: "Ficha ABCD - Intermediário II",
  objective: "Hipertrofia",
  routines: [
    {
      id: "A",
      name: "Treino A - Peito, Ombros e Tríceps",
      exercises: [
        {
          id: "a1",
          name: "Supino Reto Vertical",
          sets: 4,
          reps: "12",
          rest: 120, // em segundos
          load: "", // carga em kg (preenchida pelo usuário)
          observations: "Aumentar intervalo para priorizar força."
        },
        {
          id: "a2",
          name: "Supino Inclinado Articulado",
          sets: 3,
          reps: "10",
          rest: 90,
          load: "",
          observations: "Controle na fase excêntrica (descida)."
        },
        {
          id: "a3",
          name: "Crucifixo Máquina (Pec Deck)",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Alongamento máximo no peitoral."
        },
        {
          id: "a4",
          name: "Desenvolvimento Máquina",
          sets: 3,
          reps: "10",
          rest: 90,
          load: "",
          observations: "Foco em deltoide anterior."
        },
        {
          id: "a5",
          name: "Elevação Lateral",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Subida explosiva, descida lenta."
        },
        {
          id: "a6",
          name: "Tríceps Pulley Barra",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Cotovelos fixos ao lado do corpo."
        },
        {
          id: "a7",
          name: "Tríceps Testa Barra",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Pode ser feito no banco ou na polia baixa."
        },
        {
          id: "a8",
          name: "Abdominal Supra (Polia ou Solo)",
          sets: 3,
          reps: "15",
          rest: 60,
          load: "",
          observations: "Foco no controle abdominal."
        }
      ]
    },
    {
      id: "B",
      name: "Treino B - Pernas Anterior e Panturrilhas",
      exercises: [
        {
          id: "b1",
          name: "Agachamento Smith",
          sets: 4,
          reps: "12",
          rest: 150,
          load: "",
          observations: "Intervalo maior para garantir a carga de trabalho."
        },
        {
          id: "b2",
          name: "Afundo com Halteres",
          sets: 3,
          reps: "10",
          rest: 90,
          load: "",
          observations: "Foco unilateral. Controlar equilíbrio."
        },
        {
          id: "b3",
          name: "Leg 45",
          sets: 3,
          reps: "10",
          rest: 120,
          load: "",
          observations: "Amplitude máxima, sem bater os joelhos."
        },
        {
          id: "b4",
          name: "Abdução Máquina",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Foco em glúteo médio."
        },
        {
          id: "b5",
          name: "Panturrilha em Pé (Leg Press)",
          sets: 3,
          reps: "15",
          rest: 60,
          load: "",
          observations: "Joelhos estendidos para focar no Gastrocnêmio."
        },
        {
          id: "b6",
          name: "Panturrilha Sentado",
          sets: 3,
          reps: "15",
          rest: 60,
          load: "",
          observations: "Foco no Sóleo. Segurar 1s no alongamento."
        }
      ]
    },
    {
      id: "C",
      name: "Treino C - Costas, Ombro Posterior e Bíceps",
      exercises: [
        {
          id: "c1",
          name: "Puxada Alta Pronada",
          sets: 3,
          reps: "10-12",
          rest: 90,
          load: "",
          observations: "Foco no latíssimo do dorso."
        },
        {
          id: "c2",
          name: "Puxada Alta Supinada",
          sets: 3,
          reps: "10-12",
          rest: 90,
          load: "",
          observations: "Maior ação do bíceps e trapézio inferior."
        },
        {
          id: "c3",
          name: "Remada Baixa Neutra",
          sets: 3,
          reps: "10-12",
          rest: 90,
          load: "",
          observations: "Contrair bem as costas no final."
        },
        {
          id: "c4",
          name: "Crucifixo Inverso (Máquina ou Halteres)",
          sets: 3,
          reps: "12",
          rest: 60,
          load: "",
          observations: "Isolamento de deltoide posterior."
        },
        {
          id: "c5",
          name: "Remada Alta na Polia Baixa",
          sets: 3,
          reps: "10-12",
          rest: 60,
          load: "",
          observations: "Puxar a barra até a linha do peito."
        },
        {
          id: "c6",
          name: "Encolhimento com Halteres",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Elevação vertical pura (não rodar os ombros)."
        },
        {
          id: "c7",
          name: "Rosca Direta Barra",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Evitar usar embalo do corpo."
        },
        {
          id: "c8",
          name: "Rosca Martelo Barra H",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Foco em braquiorradial (antebraço)."
        }
      ]
    },
    {
      id: "D",
      name: "Treino D - Posterior de Coxa, Glúteos e Coxas",
      exercises: [
        {
          id: "d1",
          name: "Agachamento Sumô",
          sets: 3,
          reps: "12",
          rest: 120,
          load: "",
          observations: "Foco em adutores e glúteos."
        },
        {
          id: "d2",
          name: "Elevação de Quadril Máquina (Hip Thrust)",
          sets: 3,
          reps: "10-12",
          rest: 90,
          load: "",
          observations: "Contração máxima de glúteo no topo."
        },
        {
          id: "d3",
          name: "Flexora Deitado",
          sets: 3,
          reps: "10-12",
          rest: 60,
          load: "",
          observations: "Isquiotibiais na posição de alongamento."
        },
        {
          id: "d4",
          name: "Flexora em Pé",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Execução unilateral concentrada."
        },
        {
          id: "d5",
          name: "Leg 180 (Foco em Quadríceps)",
          sets: 3,
          reps: "10",
          rest: 90,
          load: "",
          observations: "Pés baixos na plataforma para recrutar quadríceps."
        },
        {
          id: "d6",
          name: "Adução Máquina",
          sets: 3,
          reps: "10",
          rest: 60,
          load: "",
          observations: "Foco em adutores internos da coxa."
        },
        {
          id: "d7",
          name: "Abdominal Infra / Elevação Pernas",
          sets: 3,
          reps: "15",
          rest: 60,
          load: "",
          observations: "Foco na porção inferior do abdômen."
        }
      ]
    }
  ]
};
