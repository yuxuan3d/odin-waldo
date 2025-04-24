import { useState, useRef, useEffect } from 'react'
import './App.css'
import DropdownMenu from './DropdownMenu.jsx'

function App() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const imageRef = useRef(null); // Ref for the trigger element
  const [popupVisible, setPopupVisible] = useState(false); // State to control the popup visibility
  const fadeTimerRef = useRef(null);

  useEffect(() => {

    console.log(document.getElementById('selected'));

    if (popupVisible) {
      document.getElementById('selected').className = 'select-card fade-out';
    } else {
      document.getElementById('selected').className = 'select-card fade-in';
    }
  }, [popupVisible]);

  const pokemonOptions = ['Pikachu', 'Bulbasaur', 'Charmander', 'Squirtle'];

  const handleImageClick = (event) => {
    // (The DropdownMenu component's effect handles clicks outside)
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
    setDropdownVisible(true); // Show dropdown
  };

  const handleSelectPokemon = (pokemon) => {
    setSelectedPokemon(pokemon);

    setPopupVisible(false)
    clearTimeout(fadeTimerRef.current);

    fadeTimerRef.current = setTimeout(() => {
      // Check if card still exists
      setPopupVisible(true); // Start the fade
      
    }, 3000);
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <>
      <body>
        <div className="navbar">
          <div className="navbar-item">
            <h1 className="navbar-title">Where's that Pokemon?</h1>
          </div>
          <div className="navbar-item">
            <button className="navbar-button">Start</button>
            <button className="navbar-button">Leaderboard</button>
          </div>
        </div>
        
          <div className='select-card' id='selected'>{selectedPokemon && <p>You selected: {selectedPokemon}</p>}</div>
        
        <img 
          ref={imageRef} // Assign ref here
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
            triggerRef={imageRef} // Pass the trigger ref
          />
        )}
      </body>
      
    </>
  )
}

export default App
