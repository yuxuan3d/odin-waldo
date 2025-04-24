import { useState, useRef, useEffect } from 'react'
import './App.css'
import DropdownMenu from './DropdownMenu.jsx'

function App() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const imageRef = useRef(null); // Ref for the trigger element

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
  };

  const handleCloseDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <>
      <body>
        <div class="navbar">
          <div class="navbar-item">
            <h1 class="navbar-title">Where's that Pokemon?</h1>
          </div>
          <div class="navbar-item">
            <button class="navbar-button">Start</button>
            <button class="navbar-button">Leaderboard</button>
          </div>
        </div>
        {selectedPokemon && <p>You selected: {selectedPokemon}</p>}
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
