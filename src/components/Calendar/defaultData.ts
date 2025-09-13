import type { LessonElement, ScheduleElement } from './Calendar';

export const defaultSchedule: ScheduleElement[] = [
  {
    "startTime": "2025-08-23T22:30:00+00:00",
    "endTime": "2025-08-24T02:29:59+00:00"
  },
  {
    "startTime": "2025-08-25T01:30:00+00:00",
    "endTime": "2025-08-25T04:59:59+00:00"
  },
  {
    "startTime": "2025-08-25T11:00:00+00:00",
    "endTime": "2025-08-25T19:29:59+00:00"
  },
  {
    "startTime": "2025-08-27T02:30:00+00:00",
    "endTime": "2025-08-27T06:59:59+00:00"
  },
  {
    "startTime": "2025-08-28T23:00:00+00:00",
    "endTime": "2025-08-29T08:29:59+00:00"
  },
  {
    "startTime": "2025-08-30T22:30:00+00:00",
    "endTime": "2025-08-31T02:29:59+00:00"
  },
  {
    "startTime": "2025-09-01T01:30:00+00:00",
    "endTime": "2025-09-01T04:59:59+00:00"
  },
  {
    "startTime": "2025-09-16T08:00:00+00:00",
    "endTime": "2025-09-16T19:29:59+00:00"
  },
  {
    "startTime": "2025-09-19T06:00:00+00:00",
    "endTime": "2025-09-19T20:29:59+00:00"
  }
]


export const defaultLessons: LessonElement[] = [
  {
    "id": 52,
    "duration": 60,
    "startTime": "2025-08-30T13:30:00+00:00",
    "endTime": "2025-08-30T14:29:59+00:00",
    "student": "Alex"
  },
  {
    "id": 53,
    "duration": 60,
    "startTime": "2025-09-15T08:30:00+00:00",
    "endTime": "2025-09-15T09:29:59+00:00",
    "student": "Alex"
  },
  {
    "id": 54,
    "duration": 90,
    "startTime": "2025-09-18T10:30:00+00:00",
    "endTime": "2025-09-18T11:59:59+00:00",
    "student": "John"
  }
]
