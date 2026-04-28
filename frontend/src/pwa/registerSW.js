export function registerSW() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !import.meta.env.PROD
  ) {
    return;
  }

  window.addEventListener("load", () => {
    const reloadFlag = "lifeline.sw.controller.reload";

    navigator.serviceWorker
      .getRegistrations()
      .then(async (registrations) => {
        await Promise.all(
          registrations
            .filter((registration) => !registration.active?.scriptURL.endsWith("/lifeline-sw.js"))
            .map((registration) => registration.unregister())
        );

        return navigator.serviceWorker.register("/lifeline-sw.js");
      })
      .then(async () => {
        if (navigator.serviceWorker.controller) {
          window.sessionStorage.removeItem(reloadFlag);
          return;
        }

        if (window.sessionStorage.getItem(reloadFlag)) {
          return;
        }

        window.sessionStorage.setItem(reloadFlag, "1");

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            window.sessionStorage.removeItem(reloadFlag);
            window.location.reload();
          },
          { once: true }
        );

        await navigator.serviceWorker.ready;
      })
      .catch((error) => {
        console.error("LifeLine service worker registration failed.", error);
      });
  });
}
