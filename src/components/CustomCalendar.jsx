import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';


export default function CustomCalendar({
    value = '',
    onChange,
    placeholder = 'DD/MM/YYYY',
    className = '',
    label = '',
    error = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const calendarRef = useRef(null);

    // Parse value on mount and when it changes
    useEffect(() => {
        if (value) {
            const parts = value.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const year = parseInt(parts[2]);
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                    setSelectedDate(new Date(year, month, day));
                    setCurrentMonth(month);
                    setCurrentYear(year);
                }
            }
        }
    }, [value]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
                setViewMode('days');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
        onChange?.(formatDate(newDate));
        setIsOpen(false);
        setViewMode('days');
    };

    const handleMonthSelect = (monthIndex) => {
        setCurrentMonth(monthIndex);
        setViewMode('days');
    };

    const handleYearSelect = (year) => {
        setCurrentYear(year);
        setViewMode('months');
    };

    const previousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const renderDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth &&
                selectedDate.getFullYear() === currentYear;

            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear;

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`p-2 text-sm rounded hover:bg-brand-50 transition ${isSelected ? 'bg-brand-700 text-white hover:bg-brand-800' : ''
                        } ${isToday && !isSelected ? 'border border-brand-700 text-brand-700' : ''}`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const renderMonths = () => {
        return monthNames.map((month, index) => {
            const isSelected = currentMonth === index;
            return (
                <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`p-3 text-sm rounded hover:bg-brand-50 transition ${isSelected ? 'bg-brand-700 text-white hover:bg-brand-800' : ''
                        }`}
                >
                    {month.substring(0, 3)}
                </button>
            );
        });
    };

    const renderYears = () => {
        const currentYearValue = currentYear;
        const startYear = Math.floor(currentYearValue / 12) * 12;
        const years = [];

        for (let i = 0; i < 12; i++) {
            const year = startYear + i;
            const isSelected = currentYear === year;
            years.push(
                <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`p-3 text-sm rounded hover:bg-brand-50 transition ${isSelected ? 'bg-brand-700 text-white hover:bg-brand-800' : ''
                        }`}
                >
                    {year}
                </button>
            );
        }

        return years;
    };

    const previousYearRange = () => {
        setCurrentYear(currentYear - 12);
    };

    const nextYearRange = () => {
        setCurrentYear(currentYear + 12);
    };

    return (
        <div className="relative" ref={calendarRef}>
            {label && (
                <label className="text-gray-500 block text-sm mb-1">{label}</label>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={value}
                    readOnly
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder={placeholder}
                    className={`w-full border rounded px-3 py-2 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition ${error ? 'border-red-500' : 'border-gray-200'
                        } ${className}`}
                />
                <Calendar
                    size={18}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
            </div>

            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={viewMode === 'years' ? previousYearRange : previousMonth}
                            className="p-1 hover:bg-gray-100 rounded transition"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex gap-2">
                            {viewMode === 'days' && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('months')}
                                        className="px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium transition"
                                    >
                                        {monthNames[currentMonth]}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewMode('years')}
                                        className="px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium transition"
                                    >
                                        {currentYear}
                                    </button>
                                </>
                            )}
                            {viewMode === 'months' && (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('years')}
                                    className="px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium transition"
                                >
                                    {currentYear}
                                </button>
                            )}
                            {viewMode === 'years' && (
                                <span className="px-3 py-1 text-sm font-medium">
                                    {Math.floor(currentYear / 12) * 12} - {Math.floor(currentYear / 12) * 12 + 11}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={viewMode === 'years' ? nextYearRange : nextMonth}
                            className="p-1 hover:bg-gray-100 rounded transition"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Body */}
                    {viewMode === 'days' && (
                        <>
                            {/* Day names */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {/* Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderDays()}
                            </div>
                        </>
                    )}

                    {viewMode === 'months' && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderMonths()}
                        </div>
                    )}

                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderYears()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
