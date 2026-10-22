import { config } from './config.js';

/**
 * Sends the participation form data to the backend.
 *
 * TODO (API integration): set config.form.endpoint and align payload format, headers
 * (e.g. CSRF token) and error handling with the actual backend contract.
 * Client-side validation is UX only. Server-side validation is mandatory and must be
 * implemented in the backend.
 *
 * @param {FormData} formData
 * @returns {Promise<void>} resolves on success, rejects on any transport or server error
 */
export async function submitParticipation(formData) {
  // Without a configured endpoint the data is intentionally not transmitted anywhere.
  if (!config.form.endpoint) return;

  const response = await fetch(config.form.endpoint, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Participation request failed with status ${response.status}`);
  }
}
