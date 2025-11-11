export function convertToUTC(timeBR: string): string {
    if (!/^\d{2}:\d{2}$/.test(timeBR)) {
        throw new Error("Formato de hora inválido. Use HH:MM");
    }

    const [hours, minutes] = timeBR.split(":").map(Number);

    if (hours >= 24 || minutes >= 60) {
        throw new Error("Formato de hora inválido. Use HH:MM");
    }

    // Cria uma data UTC
    const dateUTC = new Date(Date.UTC(1970, 0, 1, hours, minutes));

    // Add 3 hours to convert from BRT to UTC
    dateUTC.setUTCHours(dateUTC.getUTCHours() + 3);

    const hoursUTC = String(dateUTC.getUTCHours()).padStart(2, "0");
    const minutesUTC = String(dateUTC.getUTCMinutes()).padStart(2, "0");

    return `${hoursUTC}:${minutesUTC}`;
}

export function convertToBRT(timeUTC: string): string {
    if (!/^\d{2}:\d{2}$/.test(timeUTC)) {
        throw new Error("Formato de hora inválido. Use HH:MM");
    }

    const [hours, minutes] = timeUTC.split(":").map(Number);

    if (hours >= 24 || minutes >= 60) {
        throw new Error("Formato de hora inválido. Use HH:MM");
    }

    const dateUTC = new Date(Date.UTC(1970, 0, 1, hours, minutes));

    // Subtract 3 hours to convert from UTC to BRT
    dateUTC.setUTCHours(dateUTC.getUTCHours() - 3);

    const hoursBRT = String(dateUTC.getUTCHours()).padStart(2, "0");
    const minutesBRT = String(dateUTC.getUTCMinutes()).padStart(2, "0");

    return `${hoursBRT}:${minutesBRT}`;
}

export function roundToNearestFiveMinutes(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const roundedMinutes = Math.round(minutes / 5) * 5;
    const adjustedHours = hours + Math.floor(roundedMinutes / 60);
    const finalMinutes = roundedMinutes % 60;
    return `${String(adjustedHours).padStart(2, "0")}:${String(finalMinutes).padStart(2, "0")}`;
}
