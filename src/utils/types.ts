import { DateTime, Duration } from 'luxon';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface IshtkaalSegment {
  name: string;
  start: DateTime;
  end: DateTime;
}

// Can add more properties like Tithi, Nakshatra if using an API
export interface IshtkaalData {
  currentTime: DateTime;
  location: LocationCoords;
  sunrise: IshtkaalSegment; // Point in time
  sunset: IshtkaalSegment;  // Point in time
  nextSunrise: IshtkaalSegment; // Point in time
  dayDuration: Duration;
  nightDuration: Duration;
  rahukaal: IshtkaalSegment | null;
  yamaganda: IshtkaalSegment | null;
  gulikaKaal: IshtkaalSegment | null;
  abhijitMuhurat: IshtkaalSegment | null;
  brahmaMuhurat: IshtkaalSegment | null;
  pradoshKaal: IshtkaalSegment | null;
  // Add other calculated kaals/muhurtas here
}