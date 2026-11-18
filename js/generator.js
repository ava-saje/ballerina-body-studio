import { EQUIPMENT_PRIORITY } from "./questions.js";

const DIFFICULTY_RULES = {
  beginner: { setsDelta: -1, restDelta: 10, valueMultiplier: 0.85, tempoNote: "Move slowly and with full control — pause at the hardest point of each rep." },
  intermediate: { setsDelta: 0, restDelta: 0, valueMultiplier: 1, tempoNote: "Keep a steady, controlled tempo throughout." },
  advanced: { setsDelta: 1, restDelta: -10, valueMultiplier: 1.15, tempoNote: "Add a slow 2-second pulse at the peak of every rep." }
};

const MIN_SETS = 2;
const MIN_REST = 10;

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

function buildRoundsForDuration(sequence, time) {
  if (time <= 20) {
    return [{ label: null, items: sequence }];
  }
  if (time <= 30) {
    return [
      { label: null, items: sequence },
      { label: "Finisher round", items: sequence.slice(0, 2) }
    ];
  }
  if (time <= 45) {
    return [
      { label: "Round 1", items: sequence },
      { label: "Round 2", items: sequence }
    ];
  }
  return [
    { label: "Round 1", items: sequence },
    { label: "Round 2", items: sequence },
    { label: "Finisher round", items: sequence.slice(0, 2) }
  ];
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

export function generateWorkout(answers, exercisesData, templatesData) {
  const { focus, time, equipment, level } = answers;
  const equipmentSet = Array.isArray(equipment) ? equipment : [equipment];
  const exerciseMap = byId(exercisesData.exercises);
  const { template, isExactMatch } = findTemplate(templatesData.templates, focus, equipmentSet);

  if (!template) {
    throw new Error("No matching workout template was found.");
  }

  const rounds = buildRoundsForDuration(template.sequence, time);
  const flatSequence = [];
  rounds.forEach((round) => {
    round.items.forEach((item, idx) => {
      flatSequence.push({
        ...scaleSequenceItem(item, level),
        roundLabel: idx === 0 ? round.label : null
      });
    });
  });

  const warmup = template.warmupIds.map((id) => exerciseMap.get(id));
  const cooldown = template.cooldownIds.map((id) => exerciseMap.get(id));

  const sequence = flatSequence.map((item) => {
    const exercise = exerciseMap.get(item.exerciseId);
    const alternatives = (exercise.alternatives || [])
      .map((id) => exerciseMap.get(id))
      .filter(Boolean);
    return {
      exercise,
      sets: item.sets,
      metric: item.metric,
      value: item.value,
      perSide: item.perSide,
      restSeconds: item.restSeconds,
      roundLabel: item.roundLabel,
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
