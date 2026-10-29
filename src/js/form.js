import { config } from './config.js';
import { submitParticipation } from './participation-api.js';

/*
 * Conventions for [data-form] forms:
 * - every validated field has an id and an error element with id "<field id>-error"
 *   (radio groups use "<name>-error") referenced via aria-describedby
 * - optional per-field messages: data-error-required, data-error-format
 * - status messages go to [data-form-status] (role="status")
 * - the submit button contains [data-submit-label] and may define data-loading-label
 * - marathon groups use [data-marathon-group] (1–3 checkboxes named "marathons")
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const PLZ_PATTERN = /^\d{5}$/;
const MARATHON_MAX = 3;

const messages = {
  required: 'Bitte fülle dieses Feld aus.',
  requiredChoice: 'Bitte wähle eine Option aus.',
  requiredCheckbox: 'Bitte bestätige dieses Feld.',
  email: 'Bitte gib eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de.',
  tooShort: (min) => `Bitte gib mindestens ${min} Zeichen ein.`,
  tooLong: (max) => `Bitte gib höchstens ${max} Zeichen ein.`,
  format: 'Bitte prüfe das Format deiner Eingabe.',
  plz: 'Bitte gib eine gültige Postleitzahl mit 5 Ziffern ein.',
  age: 'Du musst mindestens 18 Jahre alt sein, um teilzunehmen.',
  marathons: 'Bitte wähle 1 bis 3 Marathons aus.',
  summary: (count) => (count === 1
    ? 'Bitte prüfe deine Angaben: Ein Feld ist noch nicht korrekt ausgefüllt.'
    : `Bitte prüfe deine Angaben: ${count} Felder sind noch nicht korrekt ausgefüllt.`),
  submitting: 'Deine Angaben werden übermittelt …',
  success: 'Vielen Dank! Du wirst zur Bestätigung weitergeleitet.',
  failure: 'Deine Teilnahme konnte gerade nicht übermittelt werden. Bitte versuche es in einigen Minuten erneut.',
};

function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function adultCutoffDate() {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return cutoff;
}

function isAtLeast18(value) {
  const birth = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;
  return birth <= adultCutoffDate();
}

function getFields(form) {
  const seenRadioGroups = new Set();

  return [...form.elements].filter((element) => {
    if (!element.matches('input, select, textarea') || !element.willValidate) return false;
    if (element.name === 'marathons') return false;
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

  if ((field.dataset.validate === 'plz' || field.name === 'postalCode') && value && !PLZ_PATTERN.test(value)) {
    return dataset.errorFormat || messages.plz;
  }

  if ((field.type === 'date' || field.dataset.validate === 'age') && value && !isAtLeast18(value)) {
    return dataset.errorFormat || messages.age;
  }

  if (validity.tooShort) return messages.tooShort(field.minLength);
  if (validity.tooLong) return messages.tooLong(field.maxLength);
  if (validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow) {
    return dataset.errorFormat || messages.format;
  }
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

function getMarathonBoxes(group) {
  return [...group.querySelectorAll('input[type="checkbox"][name="marathons"]')];
}

function validateMarathonGroup(group) {
  const boxes = getMarathonBoxes(group);
  const checkedCount = boxes.filter((box) => box.checked).length;
  const errorElement = document.getElementById('marathons-error');
  const message = checkedCount < 1 || checkedCount > MARATHON_MAX ? messages.marathons : '';

  boxes.forEach((box) => {
    if (message) {
      box.setAttribute('aria-invalid', 'true');
    } else {
      box.removeAttribute('aria-invalid');
    }
  });

  if (errorElement) {
    errorElement.textContent = message;
  }

  group.toggleAttribute('data-invalid', Boolean(message));
  return !message;
}

function syncMarathonLimit(group) {
  const boxes = getMarathonBoxes(group);
  const atLimit = boxes.filter((box) => box.checked).length >= MARATHON_MAX;

  boxes.forEach((box) => {
    if (!box.checked) {
      box.disabled = atLimit;
    }
  });
}

function initMarathonGroup(group) {
  syncMarathonLimit(group);

  group.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="checkbox"][name="marathons"]')) return;
    syncMarathonLimit(group);
    if (group.hasAttribute('data-invalid')) {
      validateMarathonGroup(group);
    }
  });
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

function constrainBirthdateField(field) {
  field.max = formatISODate(adultCutoffDate());
  field.min ||= '1900-01-01';
}

function initForm(form) {
  const statusElement = form.querySelector('[data-form-status]');
  const successUrl = form.dataset.successUrl || config.form.successUrl;
  const marathonGroup = form.querySelector('[data-marathon-group]');

  form.noValidate = true;

  form.querySelectorAll('input[type="date"][data-validate="age"]').forEach(constrainBirthdateField);

  if (marathonGroup) {
    initMarathonGroup(marathonGroup);
  }

  // Validate on blur once a value exists, then re-validate live while a field is invalid.
  form.addEventListener('focusout', (event) => {
    const field = event.target;
    if (!field.matches?.('input, select, textarea') || !field.willValidate) return;
    if (field.name === 'marathons') return;
    if (field.value.trim() !== '' || field.hasAttribute('aria-invalid')) {
      validateField(field);
    }
  });

  const revalidate = (event) => {
    const field = event.target;
    if (field.name === 'marathons') return;
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
    const marathonInvalid = marathonGroup ? !validateMarathonGroup(marathonGroup) : false;
    const invalidCount = invalidFields.length + (marathonInvalid ? 1 : 0);

    if (invalidCount) {
      setStatus(statusElement, 'error', messages.summary(invalidCount));
      if (marathonInvalid && invalidFields.length === 0) {
        getMarathonBoxes(marathonGroup)[0]?.focus();
      } else {
        invalidFields[0]?.focus();
      }
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
