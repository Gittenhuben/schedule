import styles from './Calendar.module.css';
import React, { useRef, useState, useEffect, useLayoutEffect, type ChangeEvent } from 'react';
import SelectInterval from './SelectInterval';
import SelectHour from './SelectHour';

const DESKTOP_WIDTH_MIN = 1260;
const MOBILE_WIDTH_MAX = 768;

type Slot = {
  intervalId: number,
  slotType: string,
  date: string,
  hourStart: number,
  minuteStart: number,
  hourEnd: number,
  minuteEnd: number
}

export type ScheduleElement = {
  startTime: string,
  endTime: string
}

export type LessonElement = {
  id: number,
  duration: number,
  startTime: string,
  endTime: string
  student: string
}

type TimeIntervalTypes = 'day' | '3days' | 'week';

function dateIntersect (date1Start: Date, date1End: Date, date2Start: Date, date2End: Date) {
  return (
    date1Start <= date2Start && date1End > date2Start ||
    date2Start <= date1Start && date2End > date1Start
  )
}

function markSlots(slots: Slot[], schedule: ScheduleElement[]) {
  return slots.map(slot => {
    let marked = false;
    let i = 0;
    while (!marked && i < schedule.length) {
      const scheduleStartDate = parseDateWithoutTimezone(schedule[i].startTime);
      const scheduleEndDate = parseDateWithoutTimezone(schedule[i].endTime);
      const slotDay = fixedDateOnly(slot.date);
      const slotStartDate = new Date(
        slotDay.getFullYear(),
        slotDay.getMonth(),
        slotDay.getDate(),
        slot.hourStart,
        slot.minuteStart
      );
      const slotEndDate = new Date(
        slotDay.getFullYear(),
        slotDay.getMonth(),
        slotDay.getDate(),
        slot.hourEnd,
        slot.minuteEnd
      );

      if (dateIntersect(scheduleStartDate, scheduleEndDate, slotStartDate, slotEndDate)) {
        marked = true;
        slot.slotType = 'available';
      }
      i++;
    }
    return slot;
  })
}


function generateTimeSlots(
  hourInterval: number,
  minuteInterval: number,
  day: string,
  hourStart: number,
  hourEnd: number
): Slot[] {
  const slots: Slot[] = [];
  let hourCurrent = hourStart;
  let minuteCurrent = 0;
  let counter = 0;
  if (hourInterval === 0 && minuteInterval === 0) {
    return [{
      intervalId: 0,
      hourStart: 0,
      minuteStart: 0,
      hourEnd: 24,
      minuteEnd: 0,
      slotType: 'na',
      date: day
    }];
  }
  while (hourCurrent * 60 + minuteCurrent < hourEnd * 60 - 1) {
    const hourEnd = Math.min(24, hourCurrent + hourInterval + (minuteCurrent + minuteInterval > 60 ? 1 : 0));
    const minuteEnd =
      hourEnd < 24 ? minuteCurrent + minuteInterval - (minuteCurrent + minuteInterval > 60 ? 60 : 0) : 0;
    slots.push({
      intervalId: counter++,
      hourStart: hourCurrent,
      minuteStart: minuteCurrent,
      hourEnd,
      minuteEnd,
      slotType: 'na',
      date: day
    });
    minuteCurrent += minuteInterval;
    if (minuteCurrent >= 60) {minuteCurrent -= 60; hourCurrent++;}
    hourCurrent += hourInterval;
  }
  return slots;
}

function getRowsCount(hourInterval: number, minuteInterval: number, hourStart: number, hourEnd: number) {
  if (hourInterval * 60 + minuteInterval > 0) {
    return Math.max(1, Math.ceil((hourEnd - hourStart) * 60 / (hourInterval * 60 + minuteInterval)));
  }
  return 1;
}

function generateNumbers(num: number) {
  const array = [];
  for(let i=0; i < num; i++) {
    array.push(i);
  }
  return array;
}

function withZero(num: number) {
  return num.toString().padStart(2, '0')
}

function fixedDateOnly(dateString: string) {
  const date = fixedDate(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fixedDate(dateString: string) {
  const date = new Date(dateString);
  const isValidDate = (date: Date) => !isNaN(date.getTime());
  if (!isValidDate) return new Date();
  return date;
}

function parseDateWithoutTimezoneDateOnly(dateString: string) {
  const date = parseDateWithoutTimezone(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDateWithoutTimezone(dateString: string) {
  const date = new Date(dateString);
  const isValidDate = (date: Date) => !isNaN(date.getTime());
  if (!isValidDate) return new Date(0);

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  return new Date(year, month, day, hours, minutes, seconds);
}

function formattedDate (dateString: string) {
  const date = fixedDateOnly(dateString);
  const weekday = date.toLocaleDateString(navigator.language, { weekday: 'long' });
  return `${date.toLocaleDateString()}\n${weekday}`;
};

function addDay (dateString: string, days: number) {
  const date = fixedDateOnly(dateString);
  date.setDate(date.getDate() + days);
  return date.toString();
}

function getSlotsRow (slots: Slot[], date: string, days: number, hour: number, minute: number) {
  return slots.filter(slot =>
    slot.hourStart === hour &&
    slot.minuteStart === minute &&
    fixedDateOnly(slot.date) >= fixedDateOnly(date) &&
    fixedDateOnly(slot.date) <= fixedDateOnly(addDay(date, days))
  ).sort((slot1, slot2) => fixedDateOnly(slot1.date).getTime() - fixedDateOnly(slot2.date).getTime())
}

function getLessonColumn (startTime: string, dateStart: string, daysCount: number) {
  const lessonDate = parseDateWithoutTimezoneDateOnly(startTime);
  
  let i = 0;
  while(i < daysCount) {
    if (fixedDateOnly(addDay(dateStart, i)).getTime() === lessonDate.getTime()) {
      return i + 2;
    }
    i++;
  }
  return -1;
}

function minutesIntersect (date1Start: number, date1End: number, date2Start: number, date2End: number) {
  return (
    date1Start <= date2Start && date1End > date2Start ||
    date2Start <= date1Start && date2End > date1Start
  )
}

function getLessonRows (
  startTime: string,
  endTime: string,
  hourInterval: number,
  minuteInterval: number,
  hourStart: number,
  hourEnd: number
) {
  const lessonDateStart = parseDateWithoutTimezone(startTime);
  const lessonDateEnd = parseDateWithoutTimezone(endTime);
  const lessonHourStart = lessonDateStart.getHours();
  const lessonHourEnd = lessonDateEnd.getHours();
  const lessonMinutesStart = lessonDateStart.getMinutes();
  const lessonMinutesEnd = lessonDateEnd.getMinutes();
  
  const lessonOnlyMinutesStart = lessonHourStart * 60 + lessonMinutesStart;
  const lessonOnlyMinutesEnd = lessonHourEnd * 60 + lessonMinutesEnd;
  const intervalOnlyMinutes = hourInterval * 60 + minuteInterval;

  let rowStart = -1;
  let rowEnd = -1;

  let startingIntervalId = Math.ceil(hourStart * 60 / (hourInterval * 60 + minuteInterval));
  let currentIntervalId = startingIntervalId;
  while (currentIntervalId < hourEnd * 60 / intervalOnlyMinutes && (rowStart === -1 || rowEnd === -1)) {
    if (rowStart == -1) {
      if (minutesIntersect(
          currentIntervalId * intervalOnlyMinutes,
          currentIntervalId * intervalOnlyMinutes + intervalOnlyMinutes,
          lessonOnlyMinutesStart,
          lessonOnlyMinutesEnd
      )) {
        rowStart = currentIntervalId - startingIntervalId + 2;
      }
    } else {
      if (rowEnd == -1) {
        if (!minutesIntersect(
            currentIntervalId * intervalOnlyMinutes,
            currentIntervalId * intervalOnlyMinutes + intervalOnlyMinutes,
            lessonOnlyMinutesStart,
            lessonOnlyMinutesEnd
        )) {
          rowEnd = currentIntervalId - startingIntervalId+ 2;
        }
      }
    }
    currentIntervalId++;
  }
  if (rowStart !== -1 && rowEnd === -1) {
    rowEnd = currentIntervalId - startingIntervalId + 2;
  }
  return [rowStart, rowEnd];
}

function getDaysCount(timeIntervalType: TimeIntervalTypes) {
  switch (timeIntervalType) {
    case 'day':
      return 1;
    case '3days':
      return 3;
    case 'week':
    default:
      return 7;
  }
}

interface CalendarProps {
  startDate: string;
  view: TimeIntervalTypes;
  schedule: ScheduleElement[];
  lessons: LessonElement[];
  onSlotSelect?: (slot: { startTime: Date; endTime: Date }) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  startDate, view, schedule, lessons, onSlotSelect
}) => {
  const [viewMode, setViewMode] = useState<TimeIntervalTypes>(view);
  const [dateStart, setDateStart] = useState(startDate);
  const [minuteInterval, setMinuteInterval] = useState(30);
  const [hourInterval, setHourInterval] = useState(0);
  const [hourStart, setHourStart] = useState(0);
  const [hourEnd, setHourEnd] = useState(24);

  const [menuData, setMenuData] = useState<{
    x: number; y: number, text1: string, text2: string, text3: string
  } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const slots = useRef<Slot[]>([]);
  const slotsTmp: Slot[] = [];
  for (let i = 0; i < getDaysCount(viewMode); i++) {
    slotsTmp.push(...generateTimeSlots(hourInterval, minuteInterval, addDay(dateStart, i), 0, 24));
  }
  slots.current = markSlots(slotsTmp, schedule);
  
  const handleResize = () => {
    if (window.innerWidth >= DESKTOP_WIDTH_MIN) {
      setViewMode('week');
    } else if (window.innerWidth >= MOBILE_WIDTH_MAX) {
      setViewMode('3days');
    } else {
      setViewMode('day');
    }
  };
  
  useLayoutEffect(() => {
    handleResize();
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function navigation(direction: number) {
    setDateStart(addDay(dateStart, getDaysCount(viewMode) * direction));
  }

  const handleIntervalChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newHourInterval = Math.floor(parseInt(event.target.value) / 60);
    setHourInterval(newHourInterval);
    setMinuteInterval(parseInt(event.target.value) - newHourInterval * 60);
  };

  const handleHourStartChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHourStart(parseInt(event.target.value));
  };

  const handleHourEndChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHourEnd(parseInt(event.target.value));
  };

  const handleSlotClick = (timeSlot: Slot) => {
    if (timeSlot.slotType === 'available') {
      const dateStart = new Date(
        fixedDate(timeSlot.date).getFullYear(),
        fixedDate(timeSlot.date).getMonth(),
        fixedDate(timeSlot.date).getDate(),
        timeSlot.hourStart,
        timeSlot.minuteStart
      );  
      const dateEnd = new Date(
        fixedDate(timeSlot.date).getFullYear(),
        fixedDate(timeSlot.date).getMonth(),
        fixedDate(timeSlot.date).getDate(),
        timeSlot.hourEnd,
        timeSlot.minuteEnd
      );

      alert(`${withZero(timeSlot.hourStart)}:${withZero(timeSlot.minuteStart)}`);
      if(onSlotSelect) {
        onSlotSelect({startTime: dateStart , endTime: dateEnd});
      }  
    }
  };
  
  const handleLessonSlotClick = (e: React.MouseEvent, lesson: LessonElement) => {

    const lessonStartHours = parseDateWithoutTimezone(lesson.startTime).getHours();
    const lessonStartMinutes = parseDateWithoutTimezone(lesson.startTime).getMinutes();
    
    if (calendarRef.current) {
      
      const rect = calendarRef.current.getBoundingClientRect();
      setTimeout(() => setMenuData({
        x: e.clientX - rect.left + 36,
        y: e.clientY - rect.top + 36,
        text1: lesson.student,
        text2: lesson.duration.toString() + ' min',
        text3: `${lessonStartHours}:${lessonStartMinutes}`
      }), 100);
    }

    if(onSlotSelect) {
      onSlotSelect({
        startTime: parseDateWithoutTimezone(lesson.startTime),
        endTime: parseDateWithoutTimezone(lesson.endTime)
      });
    }
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuData &&
        (!calendarRef.current?.contains(e.target as Node) ||
        (menuRef.current && !menuRef.current.contains(e.target as Node)))
      ) {
        setMenuData(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuData]);


  return (
    <div ref={calendarRef}>
      <h1 className='text-4xl font-bold mb-4'>Schedule</h1>
      <div className={styles['nav-container']}>
        <div className={styles['nav-subcontainer']}>
          <SelectHour text='From:' defaultValue={'0'} handleChange={handleHourStartChange}/>
          <SelectHour text='To:' defaultValue={'24'} handleChange={handleHourEndChange}/>
        </div>
        <SelectInterval
          text='Interval:'
          defaultValue={ (minuteInterval + hourInterval * 60).toString() }
          handleChange={handleIntervalChange}
        />
        <div className={styles['nav-subcontainer']}>
          <button
            className={styles['nav-button']}
            type='button'
            onClick={() => navigation(-1)}
          >
            &#x27F5;
          </button>
          <button
            className={styles['nav-button']}
            type='button'
            onClick={() => navigation(1)}
          >
            &#x27F6;
          </button>
        </div>
      </div>
      <div className={styles["schedule-container"]}>
        <div
          className={styles["schedule-grid"]}
          style={{
            gridTemplateColumns: `80px repeat(${getDaysCount(viewMode)}, 1fr)`,
            gridTemplateRows:
              `40px repeat(${getRowsCount(hourInterval, minuteInterval, hourStart, hourEnd)}, 30px)`
          }}
        >
          <div className={styles["time-header"]}>Time</div>
          {generateNumbers(getDaysCount(viewMode)).map(i => (
            <div key={i} className={styles["day-header"]}>{formattedDate(addDay(dateStart, i))}</div>
          ))}
          {generateTimeSlots(hourInterval, minuteInterval, '', hourStart, hourEnd).map(timeSlot => (
            <React.Fragment key={timeSlot.intervalId}>
              <div className={styles["time-slot"]}>
                { `${withZero(timeSlot.hourStart)}:${withZero(timeSlot.minuteStart)}` }
              </div>
              
              {getSlotsRow(
                slots.current,
                dateStart,
                getDaysCount(viewMode),
                timeSlot.hourStart,
                timeSlot.minuteStart
              ).map((slot, index) => (
                <div
                  key={index}
                  onClick={() => handleSlotClick(slot) }
                  className={
                    `${styles['schedule-cell']} ` +
                    `${slot.slotType === 'available' ? `${styles.available} bg-green-200` : 'bg-gray-100'}`
                  }
                >
                </div>
              ))}
              
            </React.Fragment>
          ))}
          {lessons.map((lesson, index) => {
            const column = getLessonColumn(lesson.startTime, dateStart, getDaysCount(viewMode));
            const [rowStart, rowEnd] = getLessonRows(
              lesson.startTime,
              lesson.endTime,
              hourInterval,
              minuteInterval,
              hourStart,
              hourEnd
            );
            if (column >= 0 && rowStart >= 0) return (
              <div
                key={index}
                className={`${styles.lesson} bg-red-300`}
                onClick={(e) => handleLessonSlotClick(e, lesson)}
                style={{
                  gridColumnStart: column,
                  gridColumnEnd: column + 1,
                  gridRow: `${rowStart} / ${rowEnd}`
                }}
              >
                {lesson.student}
                <div className="lesson-duration">
                  {lesson.duration} min
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {menuData && (
        <div 
          ref={menuRef}
          className={styles["context-menu"]}
          style={{
            left: menuData.x,
            top: menuData.y,
          }}
        >
          <div className={styles["context-menu-item"]}>
            {menuData.text1}
          </div>
          <div className={styles["context-menu-item"]}>
            {menuData.text2}
          </div>
          <div className={styles["context-menu-item"]}>
            {menuData.text3}
          </div>
        </div>
      )}
    </div>  
  );
};
