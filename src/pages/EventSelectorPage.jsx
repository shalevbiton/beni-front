import React, { useState } from 'react';

// נתוני דמה (Mock Data) - בהמשך תמשוך את זה מ-Supabase
const mockSchedule = [
  {
    id: 'day1',
    title: 'יום ראשון - 10.05.2026',
    parts: {
      morning: {
        title: 'חלק בוקר (09:00 - 13:00)',
        events: Array.from({ length: 6 }, (_, i) => ({ id: `m${i+1}`, name: `סדנת בוקר ${i+1}`, time: '10:00', location: 'אולם A' }))
      },
      afternoon: {
        title: 'חלק צהריים (14:00 - 18:00)',
        events: Array.from({ length: 6 }, (_, i) => ({ id: `a${i+1}`, name: `הרצאת צהריים ${i+1}`, time: '15:00', location: 'אולם B' }))
      }
    }
  },
  // אפשר להוסיף עוד ימים כאן...
];

const EventSelectorPage = () => {
  // סטייט ששומר את הבחירות. המבנה: { "day1-morning": "m3", "day1-afternoon": "a1" }
  const [selectedEvents, setSelectedEvents] = useState({});

  // פונקציית בחירת אירוע
  const handleSelect = (dayId, partKey, eventId) => {
    setSelectedEvents((prev) => ({
      ...prev,
      [`${dayId}-${partKey}`]: eventId // דורס את הבחירה הקודמת לאותו יום+חלק
    }));
  };

  const handleSubmit = () => {
    console.log("הבחירות שנשמרו לשליחה ל-DB:", selectedEvents);
    alert("הבחירות נשמרו בהצלחה! פתח קונסול כדי לראות.");
  };

  return (
    <div dir="rtl" className="min-h-screen p-8 text-white animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">הרשמה ללוז היומי</h1>
          <p className="text-gray-400">בחר אירוע אחד לכל חלק ביום</p>
        </div>

        {mockSchedule.map((day) => (
          <div key={day.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">{day.title}</h2>
            
            {/* מיפוי על חלקי היום (בוקר, צהריים) */}
            {Object.entries(day.parts).map(([partKey, partData]) => (
              <div key={partKey} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-blue-300 mb-4">{partData.title}</h3>
                
                {/* גריד של 6 כרטיסיות */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {partData.events.map((event) => {
                    const isSelected = selectedEvents[`${day.id}-${partKey}`] === event.id;
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleSelect(day.id, partKey, event.id)}
                        className={`cursor-pointer transition-all duration-300 p-5 rounded-xl border ${
                          isSelected 
                            ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{event.name}</h4>
                          {/* אינדיקטור בחירה (V) */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-500'}`}>
                            {isSelected && <span className="text-white text-sm font-bold">✓</span>}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1 mt-3">
                          <p>🕒 {event.time}</p>
                          <p>📍 {event.location}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* כפתור שמירה תחתון */}
        <div className="flex justify-center mt-8 pb-10">
          <button 
            onClick={handleSubmit}
            className="btn-primary py-4 px-12 rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            אשר ושמור מערכת שעות
          </button>
        </div>

      </div>
    </div>
  );
};

export default EventSelectorPage;
