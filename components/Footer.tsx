import React from 'react';

interface BottomNavBarProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

// --- NEW Icon Components ---

const HomeIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="homeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" /> 
                <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
        </defs>
        {active ? (
            <path fill="url(#homeGradient)" d="M12.71,2.29a1,1,0,0,0-1.42,0l-9,9a1,1,0,0,0,0,1.42A1,1,0,0,0,3,13H4v7a1,1,0,0,0,1,1H9a1,1,0,0,0,1-1V16a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1v5a1,1,0,0,0,1,1h4a1,1,0,0,0,1-1V13h1a1,1,0,0,0,1-1,1,1,0,0,0-.29-.71Z"/>
        ) : (
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        )}
    </svg>
);

const CallIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" viewBox="0 0 24 24">
       <defs>
            <linearGradient id="callGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" /> 
                <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
        </defs>
        {active ? (
            <path fill="url(#callGradient)" d="M20.4,17.15a3.78,3.78,0,0,1-2.25.86,13.41,13.41,0,0,1-6.43-2.22,18.45,18.45,0,0,1-6.28-6.28A13.41,13.41,0,0,1,3,3.09,3.78,3.78,0,0,1,3.85.84,1,1,0,0,1,5.2,1.6L7.5,6.5a1,1,0,0,1-.43,1.16L5.3,9.13a13.3,13.3,0,0,0,5.57,5.57l1.47-1.77a1,1,0,0,1,1.16-.43l4.9,2.3A1,1,0,0,1,20.4,17.15Z" />
        ) : (
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        )}
    </svg>
);

const ChatIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="chatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
        </defs>
        {active ? (
            <path fill="url(#chatGradient)" d="M20,2H4A2,2,0,0,0,2,4V16a2,2,0,0,0,2,2H18l4,4V4A2,2,0,0,0,20,2ZM12,11H11a1,1,0,0,1,0-2h1a1,1,0,0,1,0,2Zm4,0H15a1,1,0,0,1,0-2h1a1,1,0,0,1,0,2ZM8,11H7A1,1,0,0,1,7,9H8a1,1,0,0,1,0,2Z" />
        ) : (
            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        )}
    </svg>
);

const ProfileIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="profileGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
        {active ? (
            <path fill="url(#profileGradient)" d="M12,12A5,5,0,1,0,7,7,5,5,0,0,0,12,12Zm0,2c-2.67,0-8,1.34-8,4v2H20V18C20,15.34,14.67,14,12,14Z" />
        ) : (
            <>
                <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
        )}
    </svg>
);
// --- End Icon Components ---

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => {
    const textClasses = isActive ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-500 dark:text-slate-400';
    return (
        <button 
            onClick={onClick} 
            className={`relative flex-1 flex flex-col items-center justify-center h-full transition-colors duration-300 ease-in-out pt-1`}
            aria-label={`Go to ${label} page`}
            aria-current={isActive ? 'page' : undefined}
        >
            <div className={`transition-transform duration-300 ease-in-out ${isActive ? '-translate-y-1' : ''}`}>
                {icon}
            </div>
            <span className={`text-xs font-bold transition-all duration-300 ease-in-out ${textClasses} ${isActive ? 'opacity-100' : 'opacity-90'}`}>{label}</span>
            <div className={`absolute bottom-1 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 ease-in-out ${isActive ? 'w-6' : 'w-0'}`} aria-hidden="true"></div>
        </button>
    );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeIndex, setActiveIndex }) => {
  const navItems = [
    { index: 0, label: 'Home', icon: HomeIcon },
    { index: 1, label: 'Calls', icon: CallIcon },
    { index: 2, label: 'Chats', icon: ChatIcon },
    { index: 3, label: 'Profile', icon: ProfileIcon },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-cyan-50 dark:from-slate-950 dark:to-cyan-950/40 backdrop-blur-sm border-t border-cyan-100 dark:border-cyan-900/50 z-40">
      <div className="h-full flex justify-around items-center">
        {navItems.map(item => (
          <NavItem
            key={item.index}
            label={item.label}
            isActive={activeIndex === item.index}
            onClick={() => setActiveIndex(item.index)}
            icon={<item.icon active={activeIndex === item.index} />}
          />
        ))}
      </div>
    </footer>
  );
};

export default React.memo(BottomNavBar);