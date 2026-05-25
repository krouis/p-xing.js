export function initHelp(
  triggerBtn: HTMLButtonElement,
  dialog: HTMLDialogElement,
): void {
  dialog.innerHTML = `
    <div class="dialog-header">
      <h2 class="dialog-title">How to play</h2>
      <button class="dialog-close" aria-label="Close help">&times;</button>
    </div>
    <div class="dialog-body">
      <div class="help-content">
        <div class="help-section">
          <p>
            p-xing.js is a pixel crossing puzzle. The numbers beside each row
            and column tell you how many filled pixels appear in that line.
            A clue like <strong>3&thinsp;1</strong> means three filled pixels,
            then a gap, then one filled pixel.
          </p>
        </div>
        <div class="help-section">
          <p>Fill the pixels that belong to the picture. Cross the pixels you know are empty.</p>
        </div>
        <div class="help-section">
          <h3>Desktop</h3>
          <dl class="help-controls">
            <dt>left click</dt><dd>fill pixel</dd>
            <dt>right click</dt><dd>cross pixel</dd>
            <dt>drag</dt><dd>repeat same action</dd>
            <dt>Ctrl+Z&thinsp;/&thinsp;U</dt><dd>undo</dd>
            <dt>R</dt><dd>restart</dd>
            <dt>?</dt><dd>toggle help</dd>
          </dl>
        </div>
        <div class="help-section">
          <h3>Mobile</h3>
          <dl class="help-controls">
            <dt>touch</dt><dd>fill pixel</dd>
            <dt>long press</dt><dd>cross pixel</dd>
          </dl>
        </div>
        <div class="help-section">
          <p>The timer starts on your first move. Good luck!</p>
        </div>
      </div>
    </div>
  `;

  const closeBtn = dialog.querySelector<HTMLButtonElement>(".dialog-close");

  triggerBtn.addEventListener("click", () => {
    dialog.showModal();
  });

  closeBtn?.addEventListener("click", () => {
    dialog.close();
  });

  // Close when clicking the backdrop
  dialog.addEventListener("click", (e: MouseEvent) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });

  // Return focus to the trigger button
  dialog.addEventListener("close", () => {
    triggerBtn.focus();
  });
}
