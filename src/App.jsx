import { useState, useRef, useEffect } from 'react'
import './App.css'
import DropdownMenu from './DropdownMenu.jsx'
import PositionableImage from './PositionalImage.jsx'

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
  const [selectedPokemonMessage, setSelectedPokemonMessage] = useState(null); //
  const [clickedTargetPokemonName, setClickedTargetPokemonName] = useState(null);

  // Card fade State
  const [isCardVisible, setIsCardVisible] = useState(false); 
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Timer State
  const [isRunning, setIsRunning] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);


  const [targetPokemonList, setTargetPokemonList] = useState([
    { name: "Exeggutor", xPercent: 49.5, yPercent: 43, tolerance: 3, id: 'target-1', found: false },
    { name: "Slowpoke", xPercent: 84, yPercent: 85.5, tolerance: 3, id: 'target-2', found: false },
    { name: "Snorlax", xPercent: 58.5, yPercent: 29, tolerance: 2, id: 'target-3', found: false },
  ]);

  const [markers, setMarkers] = useState(
    targetPokemonList.map(p => ({
        id: p.id,
        xPercent: p.xPercent,
        yPercent: p.yPercent,
        size: 125, // Example size
        color: 'rgba(255, 0, 0, 0.4)' // Example color
    }))
);

  // Refs
  const imageRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const removeCardTimerRef = useRef(null); 
  const intervalRef = useRef(null); 
  const startTimeRef = useRef(null); 
  
  const displayMessageCard  = (pokemon) => {
    setSelectedPokemonMessage(pokemon);
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
        setSelectedPokemonMessage(null);
      }, 500); 

    }, 2000); 
  };

  useEffect(() => {
    return () => {
      clearTimeout(fadeTimerRef.current);
      clearTimeout(removeCardTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
       
        setTimeElapsed(Date.now() - startTimeRef.current);
      }, 50); 
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRunning])

  const handleDropdownSelection = (chosenPokemon) => {
    if (clickedTargetPokemonName && chosenPokemon === clickedTargetPokemonName) {
      if (targetPokemonList.length === 1) {
        displayMessageCard(`Congratulations! You found all Pokemon!`)
        // Stop timer, show final score, etc.
        setIsRunning(false)
      } else {
        // Correct Pokemon chosen for the clicked target location
        displayMessageCard(`Correct! Found ${chosenPokemon}`)
      }
      // Update the target list to mark as found
      setTargetPokemonList(prevList =>
        prevList.filter(p => p.name !== chosenPokemon)
      );
    } else {
      displayMessageCard(`Miss!`);
    }

    setDropdownVisible(false);
    setClickedTargetPokemonName(null);
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
    setClickedTargetPokemonName(null)
  };

  // Handle image clicks
  const handleImageClick = (clickData) => {
    let foundTargetName = null;

    for (const targetPokemon of targetPokemonList) {
      const dx = Math.abs(clickData.clickXPercent - targetPokemon.xPercent);
      const dy = Math.abs(clickData.clickYPercent - targetPokemon.yPercent);

      // Check if within tolerance (can be rectangular or circular)
      // Simple rectangular tolerance:
      if (dx < targetPokemon.tolerance && dy < targetPokemon.tolerance) {
        foundTargetName = targetPokemon.name;
        break; // Stop checking once a target is hit
      }
     
    }
    setClickedTargetPokemonName(foundTargetName);

    // Always set dropdown position and visibility
    setDropdownPosition({
      top: clickData.originalEvent.pageY,
      left: clickData.originalEvent.pageX
    });

    setDropdownVisible(true);
  };
  

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
            <button className="navbar-button">Leaderboard</button>
          </div>
        </div>
        
        {isCardVisible && (
        <div className={`select-card ${isFadingOut ? 'fade-out' : ''}`}>
          {selectedPokemonMessage && <p>You selected: {selectedPokemonMessage}</p>}
        </div>
      )}
        <div> {/* Add a ref container if needed for dropdown closing */}
        <PositionableImage
          src="pokemon.jpg"
          alt="pokemon"
          markers={markers} // Pass markers array
          onImageClick={handleImageClick} // Pass the handler
        />
      </div>
      
        {dropdownVisible && (
          <DropdownMenu 
            items={targetPokemonList.map(p => p.name)} // Use the names of the target Pokemon
            position={dropdownPosition}
            onSelect={handleDropdownSelection}
            onClose={handleCloseDropdown}
            triggerRef={imageRef}
          />
        )}
    </>
  )
}

export default App
