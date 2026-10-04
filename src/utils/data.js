export function dataToText(data) {
  return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
}
