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

  // Pokemon Data State
  const [targetPokemonList, setTargetPokemonList] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


useEffect(() => {
  if (targetPokemonList.length > 0) {
    setMarkers(
      targetPokemonList.map(p => ({
        id: p.id.toString(), // Use DB id as key (convert to string if needed)
        xPercent: p.xPercent,
        yPercent: p.yPercent,
        size: 125,
        color: 'rgba(255, 0, 0, 0.4)'
      }))
    );
  } else {
    setMarkers([]); // Clear markers if list is empty
  }
}, [targetPokemonList]);

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
    const fetchPokemonData = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Reset error
      console.log("Fetching Pokemon data from API...");
      try {
        const response = await fetch('http://localhost:3000/api/pokemon');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data received:", data);
        // Ensure data has the expected fields before setting state
        const validatedData = data.map(p => ({
            id: p.id, // Keep the DB id
            name: p.name,
            xPercent: p.xPercent,
            yPercent: p.yPercent,
            tolerance: p.tolerance,
            // Add found: false if needed for game logic (though we remove items now)
        }));
        setTargetPokemonList(validatedData); // Update state with fetched data
      } catch (e) {
        console.error("Failed to fetch Pokemon data:", e);
        setError(e.message); // Set error state
      } finally {
        setIsLoading(false); // End loading regardless of success/failure
      }
    };

    fetchPokemonData();
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
        <div>
        <PositionableImage
          src="pokemon.jpg"
          alt="pokemon"
          markers={markers}
          onImageClick={handleImageClick} 
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
