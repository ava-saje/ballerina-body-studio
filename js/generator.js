import { EQUIPMENT_PRIORITY } from "./questions.js";

const DIFFICULTY_RULES = {
  beginner: { setsDelta: -1, restDelta: 10, valueMultiplier: 0.85, tempoNote: "Move slowly and with full control — pause at the hardest point of each rep." },
  intermediate: { setsDelta: 0, restDelta: 0, valueMultiplier: 1, tempoNote: "Keep a steady, controlled tempo throughout." },
  advanced: { setsDelta: 1, restDelta: -10, valueMultiplier: 1.15, tempoNote: "Add a slow 2-second pulse at the peak of every rep." }
};

const MIN_SETS = 2;
const MIN_REST = 10;

const FOCUS_MAX_EXERCISES = {
  "legs-glutes": 6,
  "arms-posture": 8,
  core: 7,
  "full-body": 6
};

function roundToNearest(value, step) {
  return Math.max(step, Math.round(value / step) * step);
}

function scaleSequenceItem(item, difficulty) {
  const rule = DIFFICULTY_RULES[difficulty];
  const sets = Math.max(MIN_SETS, item.sets + rule.setsDelta);
  const restSeconds = Math.max(MIN_REST, item.restSeconds + rule.restDelta);
  const rawValue = item.value * rule.valueMultiplier;
  const value = item.metric === "seconds" ? roundToNearest(rawValue, 5) : roundToNearest(rawValue, 1);
  return { ...item, sets, restSeconds, value };
}

// Longer durations never add more exercises than the focus area's cap allows.
// Extra time first fills the sequence up to that cap, then adds sets instead of more exercises.
function buildSequenceForDuration(sequence, time, maxCount) {
  const extraSlots = Math.max(0, maxCount - sequence.length);
  let extraToAdd = 0;
  if (time >= 45) extraToAdd = extraSlots;
  else if (time >= 30) extraToAdd = Math.min(2, extraSlots);
  return [...sequence, ...sequence.slice(0, extraToAdd)];
}

function durationSetsBonus(time) {
  if (time >= 60) return 2;
  if (time >= 45) return 1;
  return 0;
}

function findTemplate(templates, focus, equipmentSet) {
  for (const tier of EQUIPMENT_PRIORITY) {
    if (!equipmentSet.includes(tier)) continue;
    const match = templates.find((t) => t.focusArea === focus && t.equipment === tier);
    if (match) return { template: match, isExactMatch: true };
  }
  const noneMatch = templates.find((t) => t.focusArea === focus && t.equipment === "none");
  if (noneMatch) return { template: noneMatch, isExactMatch: false };
  const anyMatch = templates.find((t) => t.focusArea === focus);
  return { template: anyMatch, isExactMatch: false };
}

function byId(list) {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return map;
}

export function generateWorkout(answers, exercisesData, templatesData, options = {}) {
  const { randomize = false } = options;
  const { focus, time, equipment, level } = answers;
  const equipmentSet = Array.isArray(equipment) ? equipment : [equipment];
  const exerciseMap = byId(exercisesData.exercises);
  const { template, isExactMatch } = findTemplate(templatesData.templates, focus, equipmentSet);

  if (!template) {
    throw new Error("No matching workout template was found.");
  }

  const maxCount = FOCUS_MAX_EXERCISES[template.focusArea] || template.sequence.length;
  const fullSequence = buildSequenceForDuration(template.sequence, time, maxCount);
  const setsBonus = durationSetsBonus(time);
  const flatSequence = fullSequence.map((item) =>
    scaleSequenceItem({ ...item, sets: item.sets + setsBonus }, level)
  );

  const warmup = template.warmupIds.map((id) => exerciseMap.get(id));
  const cooldown = template.cooldownIds.map((id) => exerciseMap.get(id));

  const sequence = flatSequence.map((item) => {
    const exercise = exerciseMap.get(item.exerciseId);
    let choiceIds = [item.exerciseId, ...(exercise.alternatives || [])];
    if (randomize && choiceIds.length > 1) {
      const pick = Math.floor(Math.random() * choiceIds.length);
      choiceIds = [choiceIds[pick], ...choiceIds.filter((_, i) => i !== pick)];
    }
    const chosenExercise = exerciseMap.get(choiceIds[0]);
    const alternatives = choiceIds.slice(1).map((id) => exerciseMap.get(id)).filter(Boolean);
    return {
      exercise: chosenExercise,
      sets: item.sets,
      metric: item.metric,
      value: item.value,
      perSide: item.perSide,
      restSeconds: item.restSeconds,
      alternatives
    };
  });

  return {
    name: template.name,
    focusArea: template.focusArea,
    equipment: template.equipment,
    requestedTime: time,
    difficulty: level,
    intro: template.intro,
    tempoNote: DIFFICULTY_RULES[level].tempoNote,
    warmup,
    sequence,
    cooldown,
    isClosestMatch: !isExactMatch
  };
}
