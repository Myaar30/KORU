import { useMemo, useState } from 'react';
import { PLAYER_PROFILES } from '../constants/mockData';

export const useMatchmaking = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Filtro Inteligente: Solo muestra perfiles que coincidan con el criterio seleccionado
  const filteredProfiles = useMemo(() => {
    if (!activeFilter) return PLAYER_PROFILES;
    return PLAYER_PROFILES.filter(p => 
      p.game === activeFilter || p.style === activeFilter || p.role === activeFilter
    );
  }, [activeFilter]);

  const currentProfile = filteredProfiles[currentIndex];

  const handleNextProfile = (action: string) => {
    if (action === 'Aceptar' && currentProfile?.name === 'LalitoPro777') {
      alert('¡MATCH! LalitoPro777 también quiere jugar contigo.');
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const resetFilter = () => {
    setActiveFilter(null);
    setCurrentIndex(0);
  };

  return {
    currentProfile,
    handleNextProfile,
    isQueueEmpty: currentIndex >= filteredProfiles.length,
    setActiveFilter,
    activeFilter,
    resetFilter
  };

  
};