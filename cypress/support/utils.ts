/**
 * Pick a response based on an index. Fallback to last response in the array.
 * @param {T | T[]} response Response or array of responses.
 * @param {number} index Index to pick the response from.
 * @return Response.
 */
export function responseHandler<T>(response: T | T[], index: number): T {
  return !Array.isArray(response)
    ? response
    : response[index] || response[response.length - 1];
}
