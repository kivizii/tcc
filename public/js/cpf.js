/**
 * Validação e formatação de CPF brasileiro.
 */
window.ZL = window.ZL || {};

window.ZL.normalizeCpf = function (value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
};

window.ZL.formatCpf = function (value) {
  const digits = window.ZL.normalizeCpf(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

window.ZL.validateCpf = function (value) {
  const cpf = window.ZL.normalizeCpf(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(cpf[i]) * (11 - i);
  }
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(cpf[10]);
};

window.ZL.maskCpfDisplay = function (value) {
  const cpf = window.ZL.normalizeCpf(value);
  if (cpf.length !== 11) return "";
  return `***.***.***-${cpf.slice(9, 11)}`;
};

window.ZL.bindCpfInput = function (input) {
  if (!input) return;
  input.addEventListener("input", () => {
    const pos = input.selectionStart;
    const before = input.value.length;
    input.value = window.ZL.formatCpf(input.value);
    const after = input.value.length;
    const next = Math.max(0, pos + (after - before));
    input.setSelectionRange(next, next);
  });
};
