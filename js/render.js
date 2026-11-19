import { FOCUS_LABELS, EQUIPMENT_LABELS, LEVEL_LABELS } from "./questions.js";
import { attachRestTimer } from "./timer.js";

const GUIDE_URL = "#";

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

function exerciseBlock(exercise, extra = "") {
  return `
    <li class="exercise-row">
      <details>
        <summary>
          <span class="exercise-name">${exercise.name}</span>
          ${extra ? `<span class="exercise-extra">${extra}</span>` : ""}
        </summary>
        <p class="exercise-instructions">${exercise.instructions}</p>
      </details>
    </li>`;
}

function sequenceBlock(item, index) {
  const timerId = `rest-timer-${index}`;
  const choices = [item.exercise, ...item.alternatives];
  const hasAlternatives = choices.length > 1;
  const muscleLabel = MUSCLE_LABELS[item.exercise.muscle] || "";

  return `
    <li class="exercise-card" data-index="${index}">
      <details open>
        <summary>
          <span class="exercise-step">${index + 1}</span>
          <span class="exercise-heading">
            <span class="exercise-name" id="exercise-name-${index}">${item.exercise.name}</span>
            ${muscleLabel ? `<span class="muscle-tag" id="muscle-tag-${index}">${muscleLabel}</span>` : ""}
          </span>
        </summary>
        <p class="exercise-meta">${item.sets} sets · ${formatAmount(item)}</p>
        <p class="exercise-instructions" id="exercise-instructions-${index}">${item.exercise.instructions}</p>
        <div class="row-actions">
          <button class="rest-timer-btn" id="${timerId}" type="button" data-rest="${item.restSeconds}">Rest ${item.restSeconds}s</button>
          ${hasAlternatives ? `<button class="swap-btn" type="button" data-index="${index}">Swap exercise ↻</button>` : ""}
        </div>
      </details>
    </li>`;
}

export function renderResults(container, workout, shareUrl) {
  const warmupHtml = workout.warmup.map((ex) => exerciseBlock(ex)).join("");
  const sequenceHtml = workout.sequence.map((item, i) => sequenceBlock(item, i)).join("");
  const cooldownHtml = workout.cooldown.map((ex) => exerciseBlock(ex)).join("");

  container.innerHTML = `
    <article class="workout-card">
      <p class="eyebrow">${FOCUS_LABELS[workout.focusArea] || ""}</p>
      <h1 class="workout-title">${workout.name}</h1>
      <div class="workout-meta">
        <span>${workout.requestedTime} min</span>
        <span>${EQUIPMENT_LABELS[workout.equipment] || ""}</span>
        <span>${LEVEL_LABELS[workout.difficulty] || ""}</span>
      </div>
      <p class="workout-intro">${workout.intro}</p>
      <p class="workout-tempo">${workout.tempoNote}</p>
      ${workout.isClosestMatch ? '<p class="closest-match-note">We matched you to our closest routine for this combination.</p>' : ""}

      <h2 class="section-label">Warm-up</h2>
      <ul class="exercise-list">${warmupHtml}</ul>

      <h2 class="section-label">The workout</h2>
      <ul class="exercise-list">${sequenceHtml}</ul>

      <h2 class="section-label">Cooldown</h2>
      <ul class="exercise-list">${cooldownHtml}</ul>

      <p class="disclaimer">This workout is for general fitness purposes and isn't a substitute for medical advice. Stop if anything feels painful, modify where needed, and check with a doctor before starting a new exercise routine.</p>

      <div class="results-actions">
        <button id="edit-preferences-btn" class="btn-secondary" type="button">Change my preferences</button>
        <button id="share-btn" class="btn-secondary" type="button">Share this workout</button>
      </div>
    </article>

    <section class="guide-promo">
      <div class="guide-cover-placeholder" aria-hidden="true">BALLERINA<br>BODY<br>GUIDE</div>
      <h2 class="guide-heading">Ready for your full ballerina body routine?</h2>
      <p class="guide-copy">Your personalised workout is just the beginning. Discover The Ballerina Body Guide for my complete approach to training, with more detailed workouts and structured routines.</p>
      <a href="${GUIDE_URL}" class="btn-primary guide-btn">Explore The Ballerina Body Guide</a>
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
