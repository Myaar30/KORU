import { useContext, useEffect, useRef, useState } from 'react';
import Swiper from 'react-native-deck-swiper';
import { AuthContext } from '../src/context/AuthContext';
import { crearPerfilesDePrueba, iniciarBaseDeDatos, obtenerPerfiles } from '../src/database/db';

export const useMatchmaking = () => {
  const { usuarioActivo } = useContext(AuthContext) as any;

  const [PLAYER_PROFILES, setPlayerProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef<Swiper<any>>(null);

  // 1. EL NUEVO ESTADO DEL FILTRO: Guarda las opciones que elijas en los botones tipo píldora
  const [filtrosActivos, setFiltrosActivos] = useState({
    rol: null,
    estilo: null,
    rango: null,
    juego: null
  });

  useEffect(() => {
    const cargarUsuariosDeBaseDeDatos = async () => {
      setIsLoading(true);
      try {
        const db = await iniciarBaseDeDatos();
        await crearPerfilesDePrueba(db);
        const perfilesDeLaBD = await obtenerPerfiles(db);
        
        const perfilesMapeados = perfilesDeLaBD.map((perfil: any) => ({
          id: perfil.id,
          name: perfil.nombre,
          level: Math.floor(Math.random() * 50) + 20, 
          compatibility: (Math.floor(Math.random() * 30) + 65) / 100,
          profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil.nombre)}&background=7C3AED&color=fff&size=256`,
          verified: perfil.id % 2 === 0, 
          style: 'Competitivo', // En el futuro, esto se lee desde SQLite
          role: perfil.rolPrimario || 'Fill',
          availability: 'Noche',
          rank: perfil.juegoPrincipal === 'Valorant' ? 'Inmortal / Radiante' : 'Diamante / Master',
          countryName: 'Chile',
          countryISO: 'cl',
          karma: 1100 + (perfil.id * 45),
          victorias: `${Math.floor(Math.random() * 15) + 55}%`,
          partidas: Math.floor(Math.random() * 400) + 150,
          onlineStatus: 'En línea',
          last_act: 'Ahora',
          juegoPrincipal: perfil.juegoPrincipal,
          games: [
            { id: '1', logo: perfil.juegoPrincipal === 'Valorant' ? 'https://img.icons8.com/color/48/valorant.png' : 'https://img.icons8.com/color/48/league-of-legends.png' }
          ]
        }));

        // 2. EL MOTOR DE BÚSQUEDA INTELIGENTE
        const listaFiltrada = perfilesMapeados.filter((p: any) => {
          // Regla 1: No mostrar tu propio perfil
          if (usuarioActivo && p.id === usuarioActivo.id) return false;

          // Regla 2: Aplicar las reglas de tu modal si están activas
          if (filtrosActivos.rol && p.role !== filtrosActivos.rol) return false;
          if (filtrosActivos.estilo && p.style !== filtrosActivos.estilo) return false;
          if (filtrosActivos.rango && p.rank !== filtrosActivos.rango) return false;
          if (filtrosActivos.juego && p.juegoPrincipal !== filtrosActivos.juego) return false;

          return true; // Pasa la prueba y entra a la baraja
        });

        setPlayerProfiles(listaFiltrada);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error cargando el matchmaking desde SQLite:", error);
      } finally {
        setIsLoading(false);
      }
    };

    cargarUsuariosDeBaseDeDatos();
  }, [filtrosActivos, usuarioActivo]); // Se vuelve a calcular si tocas el filtro o cambias de cuenta

  const handleNextProfile = (action: string) => {
    setCurrentIndex(prev => prev + 1);
  };

  const resetFilter = () => {
    // Limpia el filtro volviendo todo a null
    setFiltrosActivos({ rol: null, estilo: null, rango: null, juego: null });
    setCurrentIndex(0);
  };

  return {
    PLAYER_PROFILES,
    currentProfile: PLAYER_PROFILES[currentIndex],
    swiperRef,
    handleNextProfile,
    isQueueEmpty: currentIndex >= PLAYER_PROFILES.length,
    isLoading,
    filtrosActivos, // Exportamos los filtros actuales para que tu modal los vea
    setFiltrosActivos, // Exportamos la función para que tu modal los cambie
    resetFilter
  };
};