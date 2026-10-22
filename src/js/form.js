import { config } from './config.js';
import { submitParticipation } from './participation-api.js';

/*
 * Conventions for [data-form] forms:
 * - every validated field has an id and an error element with id "<field id>-error"
 *   (radio groups use "<name>-error") referenced via aria-describedby
 * - optional per-field messages: data-error-required, data-error-format
 * - status messages go to [data-form-status] (role="status")
 * - the submit button contains [data-submit-label] and may define data-loading-label
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

const messages = {
  required: 'Bitte füllen Sie dieses Feld aus.',
  requiredChoice: 'Bitte wählen Sie eine Option aus.',
  requiredCheckbox: 'Bitte bestätigen Sie dieses Feld.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.',
  tooShort: (min) => `Bitte geben Sie mindestens ${min} Zeichen ein.`,
  tooLong: (max) => `Bitte geben Sie höchstens ${max} Zeichen ein.`,
  format: 'Bitte prüfen Sie das Format Ihrer Eingabe.',
  summary: (count) => (count === 1
    ? 'Bitte prüfen Sie Ihre Angaben: Ein Feld ist noch nicht korrekt ausgefüllt.'
    : `Bitte prüfen Sie Ihre Angaben: ${count} Felder sind noch nicht korrekt ausgefüllt.`),
  submitting: 'Ihre Angaben werden übermittelt …',
  success: 'Vielen Dank! Sie werden zur Bestätigung weitergeleitet.',
  failure: 'Ihre Teilnahme konnte gerade nicht übermittelt werden. Bitte versuchen Sie es in einigen Minuten erneut.',
};

function getFields(form) {
  const seenRadioGroups = new Set();

  return [...form.elements].filter((element) => {
    if (!element.matches('input, select, textarea') || !element.willValidate) return false;
    if (element.type !== 'radio') return true;
    if (seenRadioGroups.has(element.name)) return false;
    seenRadioGroups.add(element.name);
    return true;
  });
}

function getGroup(field) {
  return field.type === 'radio'
    ? [...field.form.querySelectorAll(`input[type="radio"][name="${CSS.escape(field.name)}"]`)]
    : [field];
}

function getErrorElement(field) {
  const id = field.type === 'radio' ? `${field.name}-error` : `${field.id}-error`;
  return document.getElementById(id);
}

function getErrorMessage(field) {
  const { validity, dataset } = field;
  const value = field.value.trim();
  const isTextLike = !['checkbox', 'radio'].includes(field.type) && field.tagName !== 'SELECT';

  if (validity.valueMissing || (field.required && isTextLike && value === '')) {
    if (dataset.errorRequired) return dataset.errorRequired;
    if (field.type === 'checkbox') return messages.requiredCheckbox;
    if (field.type === 'radio' || field.tagName === 'SELECT') return messages.requiredChoice;
    return messages.required;
  }

  if (field.type === 'email' && value && (validity.typeMismatch || !EMAIL_PATTERN.test(value))) {
    return dataset.errorFormat || messages.email;
  }

  if (validity.tooShort) return messages.tooShort(field.minLength);
  if (validity.tooLong) return messages.tooLong(field.maxLength);
  if (!validity.valid) return dataset.errorFormat || messages.format;

  return '';
}

function validateField(field) {
  const message = getErrorMessage(field);
  const errorElement = getErrorElement(field);

  getGroup(field).forEach((element) => {
    if (message) {
      element.setAttribute('aria-invalid', 'true');
    } else {
      element.removeAttribute('aria-invalid');
    }
  });

  if (errorElement) {
    errorElement.textContent = message;
  }

  return !message;
}

function setStatus(statusElement, type, message) {
  if (!statusElement) return;

  statusElement.classList.remove('notice-success', 'notice-error', 'notice-info');
  if (type) statusElement.classList.add(`notice-${type}`);
  statusElement.textContent = message;
}

function setSubmitting(form, isSubmitting) {
  const button = form.querySelector('[type="submit"]');
  const label = button?.querySelector('[data-submit-label]');

  form.toggleAttribute('data-submitting', isSubmitting);

  if (isSubmitting) {
    form.setAttribute('aria-busy', 'true');
  } else {
    form.removeAttribute('aria-busy');
  }

  if (!button) return;

  button.disabled = isSubmitting;
  button.toggleAttribute('data-loading', isSubmitting);

  if (label) {
    label.dataset.defaultLabel ??= label.textContent;
    label.textContent = isSubmitting
      ? button.dataset.loadingLabel || label.dataset.defaultLabel
      : label.dataset.defaultLabel;
  }
}

function initForm(form) {
  const statusElement = form.querySelector('[data-form-status]');
  const successUrl = form.dataset.successUrl || config.form.successUrl;

  form.noValidate = true;

  // Validate on blur once a value exists, then re-validate live while a field is invalid.
  form.addEventListener('focusout', (event) => {
    const field = event.target;
    if (!field.matches?.('input, select, textarea') || !field.willValidate) return;
    if (field.value.trim() !== '' || field.hasAttribute('aria-invalid')) {
      validateField(field);
    }
  });

  const revalidate = (event) => {
    const field = event.target;
    if (field.willValidate && getGroup(field).some((element) => element.hasAttribute('aria-invalid'))) {
      validateField(field);
    }
  };
  form.addEventListener('input', revalidate);
  form.addEventListener('change', revalidate);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.hasAttribute('data-submitting')) return;

    const invalidFields = getFields(form).filter((field) => !validateField(field));

    if (invalidFields.length) {
      setStatus(statusElement, 'error', messages.summary(invalidFields.length));
      invalidFields[0].focus();
      return;
    }

    setSubmitting(form, true);
    setStatus(statusElement, 'info', messages.submitting);

    try {
      await submitParticipation(new FormData(form));
      setStatus(statusElement, 'success', messages.success);
      window.location.assign(successUrl);
    } catch (error) {
      console.error(error);
      setSubmitting(form, false);
      setStatus(statusElement, 'error', messages.failure);
    }
  });

  // Reset the loading state when the page is restored from the back/forward cache.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setSubmitting(form, false);
      setStatus(statusElement, '', '');
    }
  });
}

export function initForms() {
  document.querySelectorAll('form[data-form]').forEach(initForm);
}
