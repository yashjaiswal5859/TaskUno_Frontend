import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getTasks } from '../features/tasks/taskSlice';
import Loader from '../components/Loader';
import { Task } from '../types';

interface DayData {
  date: string;
  tasks: Task[];
}

const Scheduler: React.FC = () => {
  const [monthDays, setMonthDays] = useState<DayData[]>([]);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf('month'));

  const { tasks, isLoading } = useAppSelector((state) => state.taskData);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  useEffect(() => {
    const days: DayData[] = [];
    const daysInCurrentMonth = startDate.daysInMonth();

    for (let i = 0; i < daysInCurrentMonth; i += 1) {
      const currentDate = startDate.add(i, 'day');
      const currentObject: DayData = {
        date: currentDate.format('MMMM D, YYYY'),
        tasks: [],
      };
      days.push(currentObject);
    }

    tasks &&
      tasks.forEach((item) => {
        if (item.dueDate) {
          const currentDate = dayjs(item.dueDate).format('MMMM D, YYYY');
          const dateObj = days.find((d) => d.date === currentDate);
          if (dateObj) {
            dateObj.tasks.push(item);
          }
        }
      });
    setMonthDays(days);
  }, [tasks, startDate]);

  const goToNextMonth = () => {
    const nextMonth = startDate.add(1, 'month');
    setStartDate(nextMonth);
    updateTaskData(nextMonth);
  };

  const goToPreviousMonth = () => {
    const previousMonth = startDate.add(-1, 'month');
    setStartDate(previousMonth);
    updateTaskData(previousMonth);
  };

  const updateTaskData = (month: Dayjs) => {
    const days: DayData[] = [];
    const daysInCurrentMonth = month.daysInMonth();
    for (let i = 0; i < daysInCurrentMonth; i += 1) {
      const currentDate = month.add(i, 'day');
      const currentObject: DayData = {
        date: currentDate.format('MMMM D, YYYY'),
        tasks: [],
      };
      days.push(currentObject);
    }

    tasks &&
      tasks.forEach((item) => {
        if (item.dueDate) {
          const currentDate = dayjs(item.dueDate).format('MMMM D, YYYY');
          const dateObj = days.find((d) => d.date === currentDate);
          if (dateObj) {
            dateObj.tasks.push(item);
          }
        }
      });
    setMonthDays(days);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-10"
    >
      <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 mb-4 md:mb-0">📅 Scheduler</h1>
          <div className="flex items-center gap-4">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
              onClick={goToPreviousMonth}
            >
              ← Prev
            </button>
            <span className="text-xl font-semibold text-white">
              {dayjs(startDate).format('MMMM YYYY')}
            </span>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition"
              onClick={goToNextMonth}
            >
              Next →
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center font-bold text-indigo-400">{d}</div>
          ))}
          {/* Padding for first day of month */}
          {(() => {
            const firstDay = dayjs(startDate).day();
            return Array.from({ length: firstDay }).map((_, i) => (
              <div key={`pad-${i}`} />
            ));
          })()}
          {monthDays.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-700 border border-gray-600 rounded-lg p-2 min-h-[100px] flex flex-col"
            >
              <div className="text-xs font-semibold text-gray-300 mb-2">
                {dayjs(item.date).format('D')}
              </div>
              <div className="flex-1 space-y-1 overflow-y-auto">
                {item.tasks.length ? (
                  item.tasks.map((task, tIdx) => (
                    <div
                      key={tIdx}
                      className="bg-indigo-600 text-white rounded px-2 py-1 text-xs font-medium shadow"
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-xs italic">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Scheduler;

