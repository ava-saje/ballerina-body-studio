export function attachRestTimer(buttonEl, seconds) {
  let remaining = seconds;
  let intervalId = null;
  const originalLabel = `Rest ${seconds}s`;
  buttonEl.textContent = originalLabel;

  buttonEl.addEventListener("click", () => {
    if (intervalId) return;
    remaining = seconds;
    buttonEl.classList.add("timer-running");
    buttonEl.textContent = `${remaining}s`;
    intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        buttonEl.classList.remove("timer-running");
        buttonEl.textContent = originalLabel;
        return;
      }
      buttonEl.textContent = `${remaining}s`;
    }, 1000);
  });
}
