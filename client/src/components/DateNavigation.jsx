import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { getTodayISO, getTomorrowISO, getYesterdayISO, shiftDate } from '../utils/dateUtils';

export function DateNavigation({ selectedDate, onDateChange, onOpenAddTask }) {
  const todayISO = getTodayISO();
  const tomorrowISO = getTomorrowISO();
  const yesterdayISO = getYesterdayISO();

  const handlePrevDay = () => {
    onDateChange(shiftDate(selectedDate, -1));
  };

  const handleNextDay = () => {
    onDateChange(shiftDate(selectedDate, 1));
  };

  return (
    <div className="date-nav-card">
      <div className="date-nav-group">
        <button
          className="btn-icon"
          onClick={handlePrevDay}
          title="Previous Day"
          id="btn-prev-date"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="date-quick-tabs">
          <button
            className={`tab-btn ${selectedDate === yesterdayISO ? 'active' : ''}`}
            onClick={() => onDateChange(yesterdayISO)}
          >
            Yesterday
          </button>
          <button
            className={`tab-btn ${selectedDate === todayISO ? 'active' : ''}`}
            onClick={() => onDateChange(todayISO)}
          >
            Today
          </button>
          <button
            className={`tab-btn ${selectedDate === tomorrowISO ? 'active' : ''}`}
            onClick={() => onDateChange(tomorrowISO)}
          >
            Tomorrow
          </button>
        </div>

        <button
          className="btn-icon"
          onClick={handleNextDay}
          title="Next Day"
          id="btn-next-date"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="date-picker-wrapper">
          <Calendar size={16} style={{ color: 'var(--primary)' }} />
          <input
            type="date"
            className="date-picker-input"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            id="calendar-date-picker"
          />
        </div>

        <button
          className="btn-primary"
          onClick={onOpenAddTask}
          id="btn-add-task-main"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
