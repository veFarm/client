export function secondsToDHMS(_seconds: number) {
  let seconds = _seconds;

  const days = Math.floor(seconds / 86400); // 1 day = 24 * 60 * 60 seconds
  seconds %= 86400;

  const hours = Math.floor(seconds / 3600); // 1 hour = 60 * 60 seconds
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return { d: days, m: minutes, h: hours, s: seconds };
}
