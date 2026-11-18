export const QUESTIONS = [
  {
    id: "focus",
    title: "What's your focus today?",
    multiSelect: false,
    options: [
      { value: "full-body", label: "Full-body sculpt" },
      { value: "core", label: "Core & abs" },
      { value: "legs-glutes", label: "Legs & glutes" },
      { value: "arms-posture", label: "Arms & posture" }
    ]
  },
  {
    id: "time",
    title: "How much time do you have?",
    multiSelect: false,
    options: [
      { value: "20", label: "20 minutes" },
      { value: "30", label: "30 minutes" },
      { value: "45", label: "45 minutes" },
      { value: "60", label: "1 hour" }
    ]
  },
  {
    id: "equipment",
    title: "What equipment do you have?",
    subtitle: "Choose everything available to you — we'll use the best of it.",
    multiSelect: true,
    options: [
      { value: "gym", label: "Fully-equipped gym" },
      { value: "dumbbells", label: "Dumbbells only" },
      { value: "bands", label: "Resistance bands" },
      { value: "ankle-weights", label: "Ankle weights" },
      { value: "none", label: "No equipment" }
    ]
  },
  {
    id: "level",
    title: "What's your experience level?",
    multiSelect: false,
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" }
    ]
  }
];

export const FOCUS_LABELS = {
  "full-body": "Full-body sculpt",
  "core": "Core & abs",
  "legs-glutes": "Legs & glutes",
  "arms-posture": "Arms & posture"
};

export const EQUIPMENT_LABELS = {
  gym: "Fully-equipped gym",
  dumbbells: "Dumbbells only",
  bands: "Resistance bands",
  "ankle-weights": "Ankle weights",
  none: "No equipment"
};

export const EQUIPMENT_PRIORITY = ["gym", "dumbbells", "bands", "ankle-weights", "none"];

export const LEVEL_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced"
};
