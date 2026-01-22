import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDateWithWeekday(dateStr: string) {
    // Handle cases where dateStr might be '2026-01-30' or ISO strings
    // Date constructor with YYYY-MM-DD can be tricky with timezones (utc vs local)
    // We append T12:00:00 to ensure we get the correct local date day
    const date = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));

    const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date).toUpperCase();
    const formattedDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);

    return {
        dayName,
        formattedDate,
        full: `${formattedDate}, ${dayName}`
    };
}

export function normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    // Automatically add 9 after DDD if it's a 10 digit number (DDD + 8 digits)
    if (cleaned.length === 10) {
        return cleaned.slice(0, 2) + '9' + cleaned.slice(2);
    }

    return cleaned;
}
