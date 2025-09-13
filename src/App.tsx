import { Calendar } from '@/components';
import { defaultSchedule, defaultLessons } from './components/Calendar/defaultData';

function App() {
  return (
    <>
      <Calendar
        startDate={(new Date()).toString()}
        view='week'
        schedule={defaultSchedule}
        lessons={defaultLessons}
        onSlotSelect={(slot: { startTime: Date; endTime: Date }) => console.log(slot)}
      />
    </>
  )
}

export default App
