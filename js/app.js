import { QUESTIONS } from "./questions.js";
import { generateWorkout } from "./generator.js";
import { renderResults } from "./render.js";

const views = {
  landing: document.getElementById("view-landing"),
  quiz: document.getElementById("view-quiz"),
  results: document.getElementById("view-results")
};

const questionContainer = document.getElementById("quiz-question-container");
const progressTrack = document.getElementById("quiz-progress");
const stepLabel = document.getElementById("quiz-step-label");
const backBtn = document.getElementById("quiz-back-btn");
const resultsContainer = document.getElementById("results-container");

QUESTIONS.forEach(() => {
  const segment = document.createElement("div");
  segment.className = "quiz-segment";
  progressTrack.appendChild(segment);
});
const progressSegments = Array.from(progressTrack.children);

let exercisesData = null;
let templatesData = null;

const state = {
  answers: { focus: null, time: null, equipment: [], level: null },
  questionIndex: 0
};

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle("hidden", key !== name);
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

async function loadData() {
  const [exercisesRes, templatesRes] = await Promise.all([
    fetch("data/exercises.json"),
    fetch("data/templates.json")
  ]);
  exercisesData = await exercisesRes.json();
  templatesData = await templatesRes.json();
}

function isAnswered(question) {
  const value = state.answers[question.id];
  if (question.multiSelect) return Array.isArray(value) && value.length > 0;
  return Boolean(value);
}

function renderQuestion() {
  const question = QUESTIONS[state.questionIndex];
  const isLast = state.questionIndex === QUESTIONS.length - 1;
  const currentValue = state.answers[question.id];
  const selectedSet = new Set(
    question.multiSelect ? (Array.isArray(currentValue) ? currentValue : []) : []
  );

  const optionsHtml = question.options
    .map((opt) => {
      const isSelected = question.multiSelect ? selectedSet.has(opt.value) : currentValue === opt.value;
      const indicatorClass = question.multiSelect ? "checkbox" : "radio";
      return `
      <button type="button" class="option-row ${isSelected ? "selected" : ""}" data-value="${opt.value}">
        <span class="option-text">
          <span class="option-label">${opt.label}</span>
          ${opt.note ? `<span class="option-note">${opt.note}</span>` : ""}
        </span>
        <span class="option-indicator ${indicatorClass}" aria-hidden="true"></span>
      </button>`;
    })
    .join("");

  const needsButton = question.multiSelect || isLast;
  const buttonLabel = isLast ? "Generate my workout ✦" : "Continue";

  questionContainer.innerHTML = `
    <p class="question-eyebrow">${question.eyebrow || ""}</p>
    <h2 class="question-title">${question.title}</h2>
    ${question.subtitle ? `<p class="question-subtitle">${question.subtitle}</p>` : ""}
    <div class="option-list">${optionsHtml}</div>
    ${
      needsButton
        ? `<button type="button" id="primary-btn" class="btn-primary generate-btn ${isAnswered(question) ? "visible" : ""}">${buttonLabel}</button>`
        : ""
    }
  `;

  questionContainer.querySelectorAll(".option-row").forEach((btn) => {
    btn.addEventListener("click", () => onOptionSelected(question, btn.dataset.value));
  });

  const primaryBtn = questionContainer.querySelector("#primary-btn");
  if (primaryBtn) {
    primaryBtn.addEventListener("click", handlePrimaryClick);
  }

  progressSegments.forEach((segment, i) => {
    segment.classList.toggle("filled", i <= state.questionIndex);
  });
  stepLabel.textContent = `Step ${state.questionIndex + 1} of ${QUESTIONS.length}`;
}

function onOptionSelected(question, value) {
  if (question.multiSelect) {
    const current = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
    const idx = current.indexOf(value);
    state.answers[question.id] = idx === -1 ? [...current, value] : current.filter((v) => v !== value);
    renderQuestion();
    return;
  }

  state.answers[question.id] = value;
  const isLast = state.questionIndex === QUESTIONS.length - 1;

  if (isLast) {
    renderQuestion();
    return;
  }

  setTimeout(() => {
    state.questionIndex += 1;
    renderQuestion();
  }, 180);
}

function handlePrimaryClick() {
  const isLast = state.questionIndex === QUESTIONS.length - 1;
  if (isLast) {
    handleGenerate();
    return;
  }
  state.questionIndex += 1;
  renderQuestion();
}

function handleBack() {
  if (state.questionIndex === 0) {
    showView("landing");
    return;
  }
  state.questionIndex -= 1;
  renderQuestion();
}

function answersToParams(answers) {
  const params = new URLSearchParams();
  params.set("focus", answers.focus);
  params.set("time", answers.time);
  params.set("equipment", (Array.isArray(answers.equipment) ? answers.equipment : [answers.equipment]).join(","));
  params.set("level", answers.level);
  return params;
}

function paramsToAnswers(params) {
  const focus = params.get("focus");
  const time = params.get("time");
  const equipmentRaw = params.get("equipment");
  const level = params.get("level");
  if (focus && time && equipmentRaw && level) {
    return { focus, time, equipment: equipmentRaw.split(",").filter(Boolean), level };
  }
  return null;
}

function generateAndShow(answers) {
  const workout = generateWorkout(
    { ...answers, time: Number(answers.time) },
    exercisesData,
    templatesData
  );
  const params = answersToParams(answers);
  const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", `?${params.toString()}`);
  renderResults(resultsContainer, workout, shareUrl);
  showView("results");
}

function handleGenerate() {
  generateAndShow(state.answers);
}

function startQuiz() {
  state.answers = { focus: null, time: null, equipment: [], level: null };
  state.questionIndex = 0;
  showView("quiz");
  renderQuestion();
}

function attachGlobalResultsHandlers() {
  resultsContainer.addEventListener("click", (e) => {
    if (e.target && e.target.id === "edit-preferences-btn") {
      state.questionIndex = 0;
      showView("quiz");
      renderQuestion();
    }
  });
}

async function init() {
  await loadData();

  document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
  backBtn.addEventListener("click", handleBack);
  attachGlobalResultsHandlers();

  const paramsAnswers = paramsToAnswers(new URLSearchParams(window.location.search));
  if (paramsAnswers) {
    state.answers = paramsAnswers;
    generateAndShow(paramsAnswers);
  } else {
    showView("landing");
  }
}

init();
