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
  const [foundPokemonMarkers, setFoundPokemonMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [username, setUsername] = useState(''); // For username input

  // Score state
  const [scoreCardVis, setScoreCardVis] = useState(false); // For score input

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]); // For leaderboard data
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false); // For leaderboard visibility


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
      try {
        const response = await fetch('http://localhost:3000/api/pokemon');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure data has the expected fields before setting state
        const validatedData = data.map(p => ({
            id: p.id, // Keep the DB id
            name: p.name,
            xPercent: p.xPercent,
            yPercent: p.yPercent,
            tolerance: p.tolerance,
        }));
        setTargetPokemonList(validatedData); 
      } catch (e) {
        console.error("Failed to fetch Pokemon data:", e);
        setError(e.message); 
      } finally {
        setIsLoading(false); 
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
    let foundPokemonDetails = null;

    if (clickedTargetPokemonName && chosenPokemon === clickedTargetPokemonName) {
      foundPokemonDetails = targetPokemonList.find(p => p.name === chosenPokemon);
    
    
      if (clickedTargetPokemonName && chosenPokemon === clickedTargetPokemonName) {
        if (targetPokemonList.length === 1) {
          displayMessageCard(`Congratulations! You found all Pokemon!`)
          // Stop timer, show final score, etc.
          setIsRunning(false)
          const newMarker = {
            id: `found-${foundPokemonDetails.id}`, // Create a unique ID for the marker
            xPercent: foundPokemonDetails.xPercent,
            yPercent: foundPokemonDetails.yPercent,
            imgSrc: '/marker.png' // Path to your marker image in the public folder
          };
          setFoundPokemonMarkers(prevMarkers => [...prevMarkers, newMarker]);
          setScoreCardVis(true)
        } else {
          // Correct Pokemon chosen for the clicked target location
          displayMessageCard(`Correct! Found ${chosenPokemon}`)
          const newMarker = {
            id: `found-${foundPokemonDetails.id}`, // Create a unique ID for the marker
            xPercent: foundPokemonDetails.xPercent,
            yPercent: foundPokemonDetails.yPercent,
            imgSrc: '/marker.png' // Path to your marker image in the public folder
          };
          setFoundPokemonMarkers(prevMarkers => [...prevMarkers, newMarker]);
        }
        // Update the target list to mark as found
        setTargetPokemonList(prevList =>
          prevList.filter(p => p.name !== chosenPokemon)
        );
      } else {
        displayMessageCard(`Miss!`);
      }
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

  if (isLoading) {
    return <div>Loading Pokemon...</div>;
  }

  if (error) {
    return <div>Error loading Pokemon: {error}</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/submitScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username:username, score: timeElapsed }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Score submitted:', data);
      setScoreCardVis(false);
    } catch (error) {      
      console.error("Error submitting score:", error);
      alert('Failed to submit score');
    }

    // Fetch leaderboard after submitting score
    try {
      const response = await fetch('http://localhost:3000/api/leaderboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLeaderboard(data);
      setIsLeaderboardVisible(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      alert('Failed to fetch leaderboard');
    }
  }
  

  return (
    <>
      <div className='card-container' style={{ visibility: scoreCardVis ? 'visible' : 'hidden' }}>
        <div className='score-card'>
          <form>
            <div>Your score: {formatTime(timeElapsed)}</div>
            <label htmlFor='username'>Name: </label>
            <input type="text" name='username' onChange={(e) => setUsername(e.target.value)}/>
            <button onClick={handleSubmit}>Submit</button>
          </form>
        </div>
      </div>
      <div className='card-container' style={{ visibility: isLeaderboardVisible ? 'visible' : 'hidden' }}>
        <div className='score-card'>
          <div>Leaderboard</div>
          <table>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Time</th>
            </tr>
            {leaderboard.map((score, index) => (
              <tr>
                <td>{index + 1}</td>
                <td>{score.userId}</td>
                <td>{formatTime(score.score)}</td>
              </tr>
            ))}
          </table>
          <button onClick={() => setIsLeaderboardVisible(false)}>Close</button>
        </div>
      </div>
      
        <div className="navbar">
          <div className="navbar-item">
            <h1 className="navbar-title">Where's that Pokemon?</h1>
          </div>
          <div className="navbar-item">
            <div id='timer'>
                {formatTime(timeElapsed)} 
            </div> 
            <button className="navbar-button" onClick={() => setIsLeaderboardVisible(true)}>Leaderboard</button>
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
          markers={foundPokemonMarkers}
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
