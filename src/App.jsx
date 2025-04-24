import { useState, useRef, useEffect } from 'react'
import './App.css'
import DropdownMenu from './DropdownMenu.jsx'

const formatTime = (timeMs) => {
  const milliseconds = String(timeMs % 1000).padStart(3, '0');
  const totalSeconds = Math.floor(timeMs / 1000);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  return `${minutes}:${seconds}:${milliseconds}`; 
};

function App() {
  // State
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedPokemon, setSelectedPokemon] = useState(null);

  // Card fade State
  const [isCardVisible, setIsCardVisible] = useState(false); 
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Timer State
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Refs
  const imageRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const removeCardTimerRef = useRef(null); 
  const intervalRef = useRef(null); 
  const startTimeRef = useRef(null); 
  
  const handleSelectPokemon = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsCardVisible(true);
    setIsFadingOut(false); 

    // Clear previous timers
    clearTimeout(fadeTimerRef.current);
    clearTimeout(removeCardTimerRef.current);

    // Timer to start fade out
    fadeTimerRef.current = setTimeout(() => {
      setIsFadingOut(true);

 
      removeCardTimerRef.current = setTimeout(() => {
        setIsCardVisible(false); 
        setIsFadingOut(false); 
      }, 500); 

    }, 3000); 
  };

  useEffect(() => {
    return () => {
      clearTimeout(fadeTimerRef.current);
      clearTimeout(removeCardTimerRef.current);
    };
  }, []);
  

  const pokemonOptions = ['Pikachu', 'Bulbasaur', 'Charmander', 'Squirtle'];

  const handleImageClick = (event) => {
    if (dropdownVisible) {
        if (imageRef.current && imageRef.current.contains(event.target)) {
           setDropdownVisible(false);
        }
        return; 
    }
  
    setDropdownPosition({ 
        top: event.pageY, 
        left: event.pageX 
    });
    setDropdownVisible(true);
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
  };

  const handleStartTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = Date.now() - timeElapsed; // Adjust for potential pause
      intervalRef.current = setInterval(() => {
        const newTime = Date.now() - startTimeRef.current;
        setTimeElapsed(newTime);
      }, 50);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        console.log("Clearing timer interval on unmount");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  

  return (
    <>
        <div className="navbar">
          <div className="navbar-item">
            <h1 className="navbar-title">Where's that Pokemon?</h1>
          </div>
          <div className="navbar-item">
            <div id='timer'>
                {formatTime(timeElapsed)} 
            </div> 
            <button className="navbar-button" onClick={handleStartTimer}>Start</button>
            <button className="navbar-button">Leaderboard</button>
          </div>
        </div>
        
        {isCardVisible && (
        <div className={`select-card ${isFadingOut ? 'fade-out' : ''}`}>
          {selectedPokemon && <p>You selected: {selectedPokemon}</p>}
        </div>
      )}
        
        <img 
          ref={imageRef}
          src="pokemon.jpg" 
          alt="pokemon" 
          className="pokemon-image" 
          onClick={handleImageClick} 
          style={{ cursor: 'pointer' }} 
        />
        {dropdownVisible && (
          <DropdownMenu 
            items={pokemonOptions}
            position={dropdownPosition}
            onSelect={handleSelectPokemon}
            onClose={handleCloseDropdown}
            triggerRef={imageRef}
          />
        )}

    </>
  )
}

export default App
