import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Games.css';

const Games = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Initialisation à la date d'aujourd'hui
  const location = useLocation();
  const navigate = useNavigate();
  const competition = location.state?.competition;

  // Définir fetchMatches en dehors de useEffect et utiliser useCallback pour éviter sa redéfinition à chaque rendu
  const fetchMatches = useCallback(async (date) => {
    try {
      const response = await fetch(`https://www.sofascore.com/api/v1/sport/football/scheduled-events/${date}`);
      if (!response.ok) {
        throw new Error('Erreur de récupération des matches');
      }
      const data = await response.json();
      
      const filteredMatches = data.events.filter(match => 
        match.tournament.uniqueTournament.name === competition.name
      );
      
      setMatches(filteredMatches);
      setLoading(false);
    } catch (err) {
      setError(`Une erreur est survenue lors de la récupération des matches pour la date ${date}`);
      setLoading(false);
    }
  }, [competition]); // Ajout de 'competition' dans les dépendances du useCallback

  useEffect(() => {
    if (!competition) {
      navigate('/');
      return;
    }

    fetchMatches(selectedDate);

    const interval = setInterval(() => fetchMatches(selectedDate), 60000);
    
    return () => clearInterval(interval);
  }, [competition, selectedDate, fetchMatches, navigate]); // Ajout de 'fetchMatches' dans les dépendances

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  if (!competition) {
    return null;
  }

  if (loading) {
    return <div className="loading">Chargement des matches...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const getMatchStatus = (status) => {
    switch (status.type) {
      case 'inprogress':
        return status.description;
      case 'notstarted':
        return 'À venir';
      case 'finished':
        return 'Terminé';
      default:
        return status.description;
    }
  };

  const getStatusColor = (status) => {
    switch (status.type) {
      case 'inprogress':
        return 'orange'; 
      case 'notstarted':
        return 'green'; 
      case 'finished':
        return 'red'; 
      default:
        return 'gray';
    }
  };

  return (
    <div className="games">
      <header className="games-header">
        <h1>{competition.name}</h1>
        <p>Matches en direct</p>
      </header>

      <div className="date-selector">
        <label htmlFor="date">Choisir la date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

      <div className="matches-container">
        {matches.length === 0 ? (
          <div className="no-matches">
            Aucun match en direct pour cette compétition à la date {selectedDate} 
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.customId} className="match-card" style={{ borderColor: getStatusColor(match.status) }}>
              <div className="match-header">
                <span className="tournament-name">{match.tournament.name}</span>
                <span className={`match-status ${match.status.type}`} style={{ color: getStatusColor(match.status) }}>
                  {getMatchStatus(match.status)}
                </span>
              </div>
              
              <div className="teams-container">
                <div className="team">
                  <span className="team-name">{match.homeTeam.name}</span>
                </div>
                
                <div className="score-container">
                  <span className="score">
                    {match.status.type === 'notstarted' ? '- -' : `${match.homeScore?.display || '0'} - ${match.awayScore?.display || '0'}`}
                  </span>
                </div>

                <div className="team">
                  <span className="team-name">{match.awayTeam.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Games;
