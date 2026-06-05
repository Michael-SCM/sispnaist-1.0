"use strict";
// Normalização de CPF para uso consistente em filtros/consultas.
// Este projeto armazena CPF formatado como: XXX.XXX.XXX-XX
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCPFMaskedOrDigits = exports.normalizeCPF = exports.onlyDigits = void 0;
const onlyDigits = (value) => {
    return String(value ?? '').replace(/\D/g, '');
};
exports.onlyDigits = onlyDigits;
const normalizeCPF = (value) => {
    const digits = (0, exports.onlyDigits)(value).slice(0, 11);
    if (digits.length !== 11) {
        return { digits };
    }
    const masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    return { digits, masked };
};
exports.normalizeCPF = normalizeCPF;
const toCPFMaskedOrDigits = (value) => {
    const { digits, masked } = (0, exports.normalizeCPF)(value);
    return masked ?? digits;
};
exports.toCPFMaskedOrDigits = toCPFMaskedOrDigits;
