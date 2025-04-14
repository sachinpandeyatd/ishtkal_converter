import SunCalc from 'suncalc';
import { DateTime, Duration } from 'luxon';
import { IshtkaalData, IshtkaalSegment } from './types';

export interface GhatiTime {
    ghati: number;
    pal: number;
    vipal: number;
}

const getDayOfWeek = (date: DateTime): number => {
    // Luxon: Monday=1, ..., Sunday=7. We need Sunday=0, ..., Saturday=6
    return date.weekday === 7 ? 0 : date.weekday;
}

const calculateSegment = (name: string, start: DateTime, end: DateTime): IshtkaalSegment => {
    return { name, start, end };
}

export const calculateAllIshtkaals = (date: DateTime, latitude: number, longitude: number): IshtkaalData => {
    const jsDate = date.toJSDate();
    const tomorrowJsDate = date.plus({ days: 1 }).toJSDate();

    // 1. Get Sunrise and Sunset Times using SunCalc
    const times = SunCalc.getTimes(jsDate, latitude, longitude);
    const tomorrowTimes = SunCalc.getTimes(tomorrowJsDate, latitude, longitude);

    const sunrise = DateTime.fromJSDate(times.sunrise);
    const sunset = DateTime.fromJSDate(times.sunset);
    const nextSunrise = DateTime.fromJSDate(tomorrowTimes.sunrise);

    if (!sunrise.isValid || !sunset.isValid || !nextSunrise.isValid) {
        throw new Error("Invalid date calculated from SunCalc.");
    }

     // Handle polar regions where sunrise/sunset might not occur
    if (sunrise >= sunset) { // Sun is down all day or up all day
       console.warn("Polar region detected or calculation issue: Sunrise >= Sunset");
        // Return minimal data or specific handling for polar day/night
        return {
            currentTime: date,
            location: { latitude, longitude },
            sunrise: calculateSegment("Sunrise", sunrise.isValid ? sunrise : date, sunrise.isValid ? sunrise : date), // Use 'date' as fallback if invalid
            sunset: calculateSegment("Sunset", sunset.isValid ? sunset : date, sunset.isValid ? sunset : date),
            nextSunrise: calculateSegment("Next Sunrise", nextSunrise.isValid ? nextSunrise : date.plus({days: 1}), nextSunrise.isValid ? nextSunrise : date.plus({days: 1})), // Add nextSunrise here
            dayDuration: Duration.fromMillis(0),
            nightDuration: (nextSunrise.isValid && sunset.isValid) ? nextSunrise.diff(sunset) : Duration.fromMillis(24 * 60 * 60 * 1000), // Estimate night if needed
            rahukaal: null,
            yamaganda: null,
            gulikaKaal: null,
            abhijitMuhurat: null,
            brahmaMuhurat: null,
            pradoshKaal: null,
       };
    }

    const dayDuration = sunset.diff(sunrise);
    const nightDuration = nextSunrise.diff(sunset);
    const dayOfWeek = getDayOfWeek(date); // 0=Sun, 1=Mon, ..., 6=Sat

    // --- Individual Kaal Calculations ---

    // Rahukaal (Day divided into 8 parts, 1.5 hours approx)
    let rahukaal: IshtkaalSegment | null = null;
    const dayPartDuration = dayDuration.as('milliseconds') / 8;
    const rahuStartPart = [7, 1, 6, 4, 5, 3, 2]; // Index based on dayOfWeek (Sun=0, Mon=1...)
    if (dayPartDuration > 0) {
        const rahuStartOffset = Duration.fromMillis(rahuStartPart[dayOfWeek] * dayPartDuration);
        const rahuEndOffset = Duration.fromMillis((rahuStartPart[dayOfWeek] + 1) * dayPartDuration);
        rahukaal = calculateSegment("Rahukaal", sunrise.plus(rahuStartOffset), sunrise.plus(rahuEndOffset));
    }


    // Yamaganda (Day divided into 8 parts)
    let yamaganda: IshtkaalSegment | null = null;
    const yamaStartPart = [4, 3, 2, 1, 0, 6, 5]; // Index based on dayOfWeek
     if (dayPartDuration > 0) {
        const yamaStartOffset = Duration.fromMillis(yamaStartPart[dayOfWeek] * dayPartDuration);
        const yamaEndOffset = Duration.fromMillis((yamaStartPart[dayOfWeek] + 1) * dayPartDuration);
        yamaganda = calculateSegment("Yamaganda Kaal", sunrise.plus(yamaStartOffset), sunrise.plus(yamaEndOffset));
    }

    // Gulika Kaal (Day divided into 8 parts)
    let gulikaKaal: IshtkaalSegment | null = null;
    const gulikaStartPart = [6, 5, 4, 3, 2, 1, 0]; // Index based on dayOfWeek
     if (dayPartDuration > 0) {
        const gulikaStartOffset = Duration.fromMillis(gulikaStartPart[dayOfWeek] * dayPartDuration);
        const gulikaEndOffset = Duration.fromMillis((gulikaStartPart[dayOfWeek] + 1) * dayPartDuration);
        gulikaKaal = calculateSegment("Gulika Kaal", sunrise.plus(gulikaStartOffset), sunrise.plus(gulikaEndOffset));
    }

    // Abhijit Muhurat (Centered around local noon, approx 48 mins)
    // Local noon = midpoint between sunrise and sunset
    let abhijitMuhurat: IshtkaalSegment | null = null;
    // const noon = sunrise.plus(dayDuration.as('milliseconds') / 2);
    // const abhijitDuration = Duration.fromObject({ minutes: 48 }); // Standard duration
    // Often considered the 8th Muhurta (day divided into 15 Muhurtas)
    const muhurtaDuration = dayDuration.as('milliseconds') / 15;
    if (muhurtaDuration > 0) {
        // Start of 8th Muhurta is after 7 Muhurtas
        const abhijitStart = sunrise.plus(Duration.fromMillis(7 * muhurtaDuration));
        const abhijitEnd = abhijitStart.plus(Duration.fromMillis(muhurtaDuration)); // Duration of one Muhurta
        // Alternative: Center 48 mins around noon
        // const abhijitStart = noon.minus(abhijitDuration.as('milliseconds') / 2);
        // const abhijitEnd = noon.plus(abhijitDuration.as('milliseconds') / 2);
        abhijitMuhurat = calculateSegment("Abhijit Muhurat", abhijitStart, abhijitEnd);
    }


    // Brahma Muhurat (Starts 2 Muhurtas before sunrise, lasts 48 mins)
    // 1 Muhurta = 48 minutes. Starts 96 mins before sunrise, ends 48 mins before.
    let brahmaMuhurat: IshtkaalSegment | null = null;
    const brahmaStart = sunrise.minus({ minutes: 96 });
    const brahmaEnd = sunrise.minus({ minutes: 48 });
    brahmaMuhurat = calculateSegment("Brahma Muhurat", brahmaStart, brahmaEnd);


    // Pradosh Kaal (Starts at sunset, lasts ~96 minutes or +/- 1.5 hours around sunset)
    let pradoshKaal: IshtkaalSegment | null = null;
    const pradoshDuration = Duration.fromObject({ minutes: 96 });
    // Definition 1: Starts at sunset
    const pradoshStart = sunset;
    const pradoshEnd = sunset.plus(pradoshDuration);
    // Definition 2: Centered around sunset (e.g., 48 mins before to 48 mins after)
    // const pradoshStart = sunset.minus({ minutes: 48 });
    // const pradoshEnd = sunset.plus({ minutes: 48 });
    pradoshKaal = calculateSegment("Pradosh Kaal", pradoshStart, pradoshEnd);

    return {
        currentTime: date, // Pass current time for reference
        location: { latitude, longitude },
        sunrise: calculateSegment("Sunrise", sunrise, sunrise), // Point in time
        sunset: calculateSegment("Sunset", sunset, sunset),   // Point in time
        nextSunrise: calculateSegment("Next Sunrise", nextSunrise, nextSunrise),
        dayDuration,
        nightDuration,
        rahukaal,
        yamaganda,
        gulikaKaal,
        abhijitMuhurat,
        brahmaMuhurat,
        pradoshKaal,
        // Add other calculated muhurtas here
    };
};

// Function to find current Ishtkaal
export const findCurrentIshtkaal = (now: DateTime, data: IshtkaalData): IshtkaalSegment | null => {
    const segments: (IshtkaalSegment | null)[] = [
        data.rahukaal, data.yamaganda, data.gulikaKaal,
        data.abhijitMuhurat, data.brahmaMuhurat, data.pradoshKaal
        // Add others
    ];

    for (const segment of segments) {
        if (segment && now >= segment.start && now < segment.end) {
            return segment;
        }
    }

    // Could add logic for general day/night periods if no specific kaal matches
    if (data.sunrise && data.sunset && now >= data.sunrise.start && now < data.sunset.start) {
        return calculateSegment("Day Time", data.sunrise.start, data.sunset.start);
    }
     if (data.sunset && data.nextSunrise && now >= data.sunset.start && now < data.nextSunrise.start) {
        return calculateSegment("Night Time", data.sunset.start, data.nextSunrise.start);
    }

    return null; // Or return a default segment like 'General Time'
};

export const convertToGhatiPalVipal = (targetTime: DateTime, sunriseTime: DateTime): GhatiTime | null => {
    // Validate inputs
    if (!targetTime || !targetTime.isValid || !sunriseTime || !sunriseTime.isValid) {
        console.error("Invalid DateTime object provided for Ghati conversion.");
        return null;
    }

    // Calculate total seconds elapsed since the most recent sunrise
    let totalSecondsSinceSunrise = targetTime.diff(sunriseTime).as('seconds');

    // Handle times before sunrise on the same calendar day
    // These times belong to the *previous* day's Ghati cycle.
    // We add the nominal number of seconds in a day (24 hours) to place it correctly within that cycle.
    if (totalSecondsSinceSunrise < 0) {
        totalSecondsSinceSunrise += 24 * 60 * 60; // Add seconds in a nominal 24-hour day
    }

    // Constants based on the provided logic (1 Ghati = 24 min = 1440 sec)
    const secondsPerGhati = 1440; // 24 minutes * 60 seconds/minute
    const secondsPerPal = 24;     // 1440 seconds/Ghati / 60 Pal/Ghati
    const secondsPerVipal = 0.4;  // 24 seconds/Pal / 60 Vipal/Pal

    // --- Perform Calculations ---

    // Calculate total Ghatis (including decimal part for intermediate steps)
    const totalGhatisDecimal = totalSecondsSinceSunrise / secondsPerGhati;
    let ghati = Math.floor(totalGhatisDecimal);

    // Calculate remaining seconds after accounting for whole Ghatis
    const remainingSecondsAfterGhatis = totalSecondsSinceSunrise % secondsPerGhati;
    // Alternative using decimal part: const remainingGhatis = totalGhatisDecimal - ghati;

    // Calculate total Pals from the remaining seconds
    const totalPalasDecimal = remainingSecondsAfterGhatis / secondsPerPal;
    let pal = Math.floor(totalPalasDecimal);

    // Calculate remaining seconds after accounting for whole Pals
    const remainingSecondsAfterPalas = remainingSecondsAfterGhatis % secondsPerPal;
    // Alternative using decimal part: const remainingPalas = totalPalasDecimal - pal;

    // Calculate total Vipalas from the remaining seconds
    // Using Math.round for Vipal as per the user's formula's intent for the final unit
    let vipal = Math.round(remainingSecondsAfterPalas / secondsPerVipal);

    // --- Handle potential rounding carry-over ---
    // If rounding vipal resulted in 60, increment pal and reset vipal
    if (vipal >= 60) {
        pal += Math.floor(vipal / 60);
        vipal %= 60;
    }

    // If incrementing pal resulted in 60, increment ghati and reset pal
    if (pal >= 60) {
        ghati += Math.floor(pal / 60);
        pal %= 60;
    }

    // Ensure Ghati also wraps around (0-59 range for a day cycle)
    ghati %= 60;

    return {
        ghati: ghati,
        pal: pal,
        vipal: vipal,
    };
};