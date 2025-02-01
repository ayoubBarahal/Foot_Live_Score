import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const App = () => {
  const [competitions, setCompetitions] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://www.sofascore.com/api/v1/config/default-unique-tournaments/MA/football')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur de récupération des compétitions');
        }
        return response.json();
      })
      .then(data => {
        console.log(data); 
        if (data && data.uniqueTournaments) {
          const filteredCompetitions = data.uniqueTournaments.filter(competition =>
            [
              "UEFA Champions League",
              "Premier League",
              "LaLiga",
              "Bundesliga",
              "Serie A",
              "Ligue 1"
            ].includes(competition.name)
          );
          setCompetitions(filteredCompetitions); 
        } else {
          setError("Aucune compétition trouvée.");
        }
        setLoading(false); 
      })
      .catch(err => {
        setError('Une erreur est survenue lors de la récupération des compétitions.');
        setLoading(false);
      });
  }, []);

  const handleNavigateToGames = (competition) => {
    navigate('/games', { state: { competition } });
  };

  if (loading) {
    return <div className="loading">Chargement...</div>; 
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Foot Live Score</h1>
        <p>Découvrez toutes les compétitions de football disponibles</p>
      </header>

      <div className="competitions-container">
        {competitions.map(competition => (
          <div 
            className="competition-card" 
            key={competition.id}
            onClick={() => handleNavigateToGames(competition)}
            style={{ cursor: 'pointer' }}
          >
            <div className="competition-header">
              <h2>{competition.name}</h2>
              <span className="category">{competition.category.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop: '50px'}}>
      <p>Made By Me Ayoub (Barca Fan)</p>
      </div>
    </div>
  );
};

export default App;