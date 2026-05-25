export function initApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;
  app.innerHTML =
    "<h1>p-xing.js</h1><p>pixel crossing · daily puzzle arcade</p>";
}
