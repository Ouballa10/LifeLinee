export function registerSW() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !import.meta.env.PROD
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(async () => {
        await navigator.serviceWorker.ready;

        const reloadFlag = "lifeline.sw.controller.reload";

        if (!navigator.serviceWorker.controller && !window.sessionStorage.getItem(reloadFlag)) {
          window.sessionStorage.setItem(reloadFlag, "1");
          window.location.reload();
          return;
        }

        window.sessionStorage.removeItem(reloadFlag);
      })
      .catch((error) => {
        console.error("LifeLine service worker registration failed.", error);
      });
  });
}
