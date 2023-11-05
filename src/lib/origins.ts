export function isContainerApp() {
  return process.env.CONTAINER_APP === window.location.origin;
}
