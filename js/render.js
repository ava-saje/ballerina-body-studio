import { FOCUS_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS } from "./questions.js";
import { attachRestTimer } from "./timer.js";

const GUIDE_URL = "https://stan.store/avasaje/p/the-strong--sculpted-method";

const MUSCLE_LABELS = {
  glutes: "Glutes",
  hamstrings: "Hamstrings",
  "single-leg": "Single-Leg",
  calves: "Calves",
  flexibility: "Flexibility",
  "upper-abs": "Upper Abs",
  "lower-abs": "Lower Abs",
  obliques: "Obliques",
  stability: "Stability",
  biceps: "Biceps",
  triceps: "Triceps",
  shoulders: "Shoulders",
  back: "Back"
};

function formatAmount(item) {
  const amount = item.metric === "seconds" ? `${item.value} sec` : `${item.value} reps`;
  return item.perSide ? `${amount} each side` : amount;
}

function exerciseBlock(exercise, stepLabel = "") {
  return `
    <li class="exercise-row">
      <div class="exercise-row-top">
        ${stepLabel ? `<span class="exercise-step">${stepLabel}</span>` : ""}
        <span class="exercise-name">${exercise.name}</span>
      </div>
      <p class="exercise-instructions">${exercise.instructions}</p>
    </li>`;
}

function sequenceBlock(item, index) {
  const timerId = `rest-timer-${index}`;
  const choices = [item.exercise, ...item.alternatives];
  const hasAlternatives = choices.length > 1;
  const muscleLabel = MUSCLE_LABELS[item.exercise.muscle] || "";

  return `
    <li class="exercise-row" data-index="${index}">
      <div class="exercise-row-top">
        <span class="exercise-step">${String(index + 1).padStart(2, "0")}</span>
        <span class="exercise-heading">
          <span class="exercise-name" id="exercise-name-${index}">${item.exercise.name}</span>
          ${muscleLabel ? `<span class="muscle-tag" id="muscle-tag-${index}">${muscleLabel}</span>` : ""}
        </span>
        <span class="exercise-amount">${item.sets} × ${formatAmount(item)}</span>
      </div>
      <p class="exercise-instructions" id="exercise-instructions-${index}">${item.exercise.instructions}</p>
      <div class="row-actions">
        <button class="rest-timer-btn" id="${timerId}" type="button" data-rest="${item.restSeconds}">Rest ${item.restSeconds}s</button>
        ${hasAlternatives ? `<button class="swap-btn" type="button" data-index="${index}">Swap exercise</button>` : ""}
      </div>
    </li>`;
}

export function renderResults(container, workout, shareUrl) {
  const warmupHtml = workout.warmup.map((ex, i) => exerciseBlock(ex, `W${i + 1}`)).join("");
  const sequenceHtml = workout.sequence.map((item, i) => sequenceBlock(item, i)).join("");
  const cooldownHtml = workout.cooldown.map((ex, i) => exerciseBlock(ex, `C${i + 1}`)).join("");

  container.innerHTML = `
    <article class="workout-card">
      <p class="eyebrow">${FOCUS_LABELS[workout.focusArea] || ""}</p>
      <h1 class="workout-title">${workout.name}</h1>
      <p class="workout-meta">${workout.requestedTime} min · ${EQUIPMENT_LABELS[workout.equipment] || ""} · ${LEVEL_LABELS[workout.difficulty] || ""}</p>
      <p class="workout-intro">${workout.intro}</p>
      <p class="workout-tempo">${workout.tempoNote}</p>
      ${workout.isClosestMatch ? '<p class="closest-match-note">We matched you to our closest routine for this combination.</p>' : ""}

      <h2 class="section-label"><span>Warm-up</span><span class="section-count">${workout.warmup.length} moves</span></h2>
      <ul class="exercise-list">${warmupHtml}</ul>

      <h2 class="section-label"><span>The workout</span><span class="section-count">${workout.sequence.length} exercises</span></h2>
      <ul class="exercise-list">${sequenceHtml}</ul>

      <h2 class="section-label"><span>Cooldown</span><span class="section-count">${workout.cooldown.length} stretches</span></h2>
      <ul class="exercise-list">${cooldownHtml}</ul>

      <p class="disclaimer">This workout is for general fitness purposes and isn't a substitute for medical advice. Stop if anything feels painful, modify where needed, and check with a doctor before starting a new exercise routine.</p>

      <div class="results-actions">
        <button id="regenerate-btn" class="btn-primary" type="button">Regenerate</button>
        <div class="results-actions-row">
          <button id="start-over-btn" class="btn-secondary" type="button">Start over</button>
          <button id="share-btn" class="btn-secondary" type="button">Share this workout</button>
        </div>
      </div>
    </article>

    <section class="guide-promo">
      <img class="guide-cover-image" src="assets/guide-cover.jpg" alt="The Slim &amp; Sculpted Method guide cover">
      <h2 class="guide-heading">Ready for your full ballerina body routine?</h2>
      <p class="guide-copy">Your personalised workout is just the beginning. Discover The Slim &amp; Sculpted Method for my complete approach to training, with more detailed workouts and structured routines.</p>
      <a href="${GUIDE_URL}" class="btn-primary guide-btn">Explore The Slim &amp; Sculpted Method</a>
    </section>
  `;

  container.querySelectorAll(".rest-timer-btn").forEach((btn) => {
    attachRestTimer(btn, Number(btn.dataset.rest));
  });

  const choicePointers = new Map();
  container.querySelectorAll(".swap-btn").forEach((btn) => {
    const index = Number(btn.dataset.index);
    const item = workout.sequence[index];
    const choices = [item.exercise, ...item.alternatives];
    choicePointers.set(index, 0);

    btn.addEventListener("click", () => {
      const current = choicePointers.get(index);
      const next = (current + 1) % choices.length;
      choicePointers.set(index, next);
      const choice = choices[next];
      document.getElementById(`exercise-name-${index}`).textContent = choice.name;
      document.getElementById(`exercise-instructions-${index}`).textContent = choice.instructions;
      const muscleTagEl = document.getElementById(`muscle-tag-${index}`);
      if (muscleTagEl) muscleTagEl.textContent = MUSCLE_LABELS[choice.muscle] || "";
    });
  });

  const shareBtn = container.querySelector("#share-btn");
  shareBtn.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: workout.name, text: "I made this workout on The Ballerina Body Studio", url: shareUrl });
        return;
      } catch (err) {
        /* user cancelled or share failed, fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareBtn.textContent = "Link copied!";
      setTimeout(() => { shareBtn.textContent = "Share this workout"; }, 2000);
    } catch (err) {
      shareBtn.textContent = "Copy failed — long-press the address bar";
    }
  });
}
