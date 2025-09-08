import React from 'react';

interface BottomNavBarProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

// --- NEW Professional Icon Set (Heroicons Style) ---

const HomeIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        {active ? (
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v6.101a2.25 2.25 0 01-2.25 2.25H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.25a2.25 2.25 0 01-2.25-2.25v-6.101c.02-.03.044-.058.07-.084L12 5.432z" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
        )}
    </svg>
);

const CallIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        {active ? (
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.298-.083.465a7.48 7.48 0 003.429 3.429c.167.081.364.052.465-.083l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C6.542 22.5 1.5 17.458 1.5 9.75V4.5z" clipRule="evenodd" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.213-.992-.58-1.358l-3.976-3.976c-.367-.367-.842-.58-1.358-.58h-1.372a2.25 2.25 0 00-2.25 2.25v1.372c0 .516.213.992.58 1.358l3.976 3.976c.367.367.842.58 1.358.58h1.372" />
        )}
    </svg>
);

const ChatIcon: React.FC<{ active: boolean }> = ({ active }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        {active ? (
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72.372a3.523 3.523 0 01-1.029.223l-3.771-.03c-1.132-.01-2.096-.804-2.288-1.836a4.84 4.84 0 01-.044-.462V8.511c0-1.136.847-2.1 1.98-2.193l3.72-.372a3.523 3.523 0 011.029-.223l3.771.03c1.132.01 2.096.804 2.288 1.836.033.162.044.327.044.462zM4.5 13.5a3 3 0 00-3 3v4.5a3 3 0 003 3h4.5a3 3 0 003-3v-4.5a3 3 0 00-3-3h-4.5z" />
        )}
    </svg>
);


const ProfileIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-0.5" fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        {active ? (
            <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        )}
    </svg>
);
// --- End Icon Set ---


const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeIndex, setActiveIndex }) => {
  const navItems = [
    { index: 0, label: 'Home', icon: HomeIcon, activeColor: 'text-cyan-500' },
    { index: 1, label: 'Calls', icon: CallIcon, activeColor: 'text-green-500' },
    { index: 2, label: 'Chats', icon: ChatIcon, activeColor: 'text-blue-500' },
    { index: 3, label: 'Profile', icon: ProfileIcon, activeColor: 'text-purple-500' },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-cyan-50 dark:from-slate-950 dark:to-cyan-950/40 backdrop-blur-sm border-t border-cyan-100 dark:border-cyan-900/50 z-40">
      <div className="h-full flex justify-around items-center">
        {navItems.map(item => {
            const isActive = activeIndex === item.index;
            const Icon = item.icon;
            const textClasses = isActive ? `${item.activeColor} font-bold` : 'text-slate-500 dark:text-slate-400 font-medium';
            
            return (
                 <button 
                    key={item.index}
                    onClick={() => setActiveIndex(item.index)} 
                    className={`relative flex-1 flex flex-col items-center justify-center h-full transition-all duration-300 ease-in-out pt-1 ${textClasses}`}
                    aria-label={`Go to ${item.label} page`}
                    aria-current={isActive ? 'page' : undefined}
                >
                    <div className={`transition-transform duration-300 ease-in-out ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                       <Icon active={isActive} />
                    </div>
                    <span className={`text-xs transition-all duration-300 ease-in-out`}>{item.label}</span>
                </button>
            )
        })}
      </div>
    </footer>
  );
};

export default React.memo(BottomNavBar);