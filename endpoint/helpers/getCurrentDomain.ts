export function getCurrentDomain() {
  //return 'localhost.lottery'
  return window.location.hostname || document.location.host || ''
}