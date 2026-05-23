// Normalização de CPF para uso consistente em filtros/consultas.
// Este projeto armazena CPF formatado como: XXX.XXX.XXX-XX
export const onlyDigits = (value) => {
    return String(value ?? '').replace(/\D/g, '');
};
export const normalizeCPF = (value) => {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length !== 11) {
        return { digits };
    }
    const masked = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    return { digits, masked };
};
export const toCPFMaskedOrDigits = (value) => {
    const { digits, masked } = normalizeCPF(value);
    return masked ?? digits;
};
