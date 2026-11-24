export const QUESTIONS = [
  {
    id: "focus",
    eyebrow: "Focus",
    title: "What's your focus today?",
    multiSelect: false,
    options: [
      { value: "full-body", label: "Full-body sculpt", note: "Legs, glutes, core and upper body" },
      { value: "core", label: "Core & abs", note: "A strong, supported centre" },
      { value: "legs-glutes", label: "Legs & glutes", note: "Inner thighs, outer thighs and glutes" },
      { value: "arms-posture", label: "Arms & posture", note: "Toned arms and strong posture" }
    ]
  },
  {
    id: "time",
    eyebrow: "Time",
    title: "How much time do you have?",
    multiSelect: false,
    options: [
      { value: "20", label: "20 minutes", note: "Short and focused" },
      { value: "30", label: "30 minutes", note: "A solid session" },
      { value: "45", label: "45 minutes", note: "The full workout" },
      { value: "60", label: "1 hour", note: "Go all in" }
    ]
  },
  {
    id: "equipment",
    eyebrow: "Equipment",
    title: "What equipment do you have?",
    subtitle: "Choose everything available to you — we'll use the best of it.",
    multiSelect: true,
    options: [
      { value: "gym", label: "Fully-equipped gym", note: "Machines, cables, benches and weights" },
      { value: "dumbbells", label: "Dumbbells only", note: "Light to medium weights" },
      { value: "bands", label: "Resistance bands", note: "Loop or tube bands" },
      { value: "ankle-weights", label: "Ankle weights", note: "Light cuff weights" },
      { value: "none", label: "No equipment", note: "Just you and a little floor space" }
    ]
  },
  {
    id: "level",
    eyebrow: "Level",
    title: "What's your experience level?",
    multiSelect: false,
    options: [
      { value: "beginner", label: "Beginner", note: "New to exercise or easing back in" },
      { value: "intermediate", label: "Intermediate", note: "Comfortable with the basics" },
      { value: "advanced", label: "Advanced", note: "Strong and experienced" }
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
