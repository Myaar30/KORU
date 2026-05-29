import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Eye, Filter, Heart, MapPin, RotateCcw, Star, Target, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountryFlag from "react-native-country-flag";
import * as Progress from 'react-native-progress';

import { COLORS } from '../../constants/theme';
import { useMatchmaking } from '../../hooks/useMatchmaking';

const { width, height } = Dimensions.get('window');

// --- DATOS DINÁMICOS PARA EL FILTRO ---
const GAMES = ['Valorant', 'LoL', 'CS2', 'Dota 2'];
const RANKS = ['Hierro', 'Plata', 'Platino', 'Diamante', 'Radiante/Challenger'];
const TIMES = ['Mañana', 'Tarde', 'Noche', 'Madrugada'];
const KARMAS = ['Todos', 'No Tóxico', 'Buen Compañero'];

const ROLES_BY_GAME: any = {
  'Valorant': ['Duelista', 'Iniciador', 'Controlador', 'Centinela'],
  'LoL': ['Top', 'Jungla', 'Mid', 'ADC', 'Support'],
  'CS2': ['Entry', 'AWPer', 'Support', 'IGL', 'Lurker'],
  'Dota 2': ['Carry', 'Mid', 'Offlane', 'Soft Supp', 'Hard Supp']
};

export default function MatchScreen() {
  const { currentProfile, handleNextProfile, isQueueEmpty, setActiveFilter, activeFilter, resetFilter } = useMatchmaking();

  // --- ESTADOS DEL MODAL DE FILTROS ---
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    game: '',
    role: '',
    rank: '',
    time: '',
    karma: ''
  });

  // Función auxiliar para seleccionar un filtro temporalmente
  const toggleFilter = (category: string, value: string) => {
    setTempFilters(prev => {
      const newState = { ...prev, [category]: prev[category as keyof typeof prev] === value ? '' : value };
      // Si cambiamos de juego, reseteamos el rol porque las posiciones cambian
      if (category === 'game') newState.role = '';
      return newState;
    });
  };

  // Función para aplicar los filtros (Cierra el modal y manda la info al Hook)
  const applyFilters = () => {
    setFilterVisible(false);
    console.log('Filtros aplicados:', tempFilters);
    // Aquí le pasaremos el objeto completo a tu hook en el futuro
    setActiveFilter(tempFilters.game || 'Filtro Activo'); 
  };

  if (isQueueEmpty || !currentProfile) {
    return (
      <SafeAreaView style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>Buscando nuevos compañeros de equipo...</Text>
        <TouchableOpacity style={styles.resetDemoButton} onPress={resetFilter}>
          <Text style={styles.resetDemoText}>Reiniciar Demo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderGameItem = ({ item }: { item: any }) => (
    <View style={styles.gameItemContainer}>
      {item.id === 'more' ? (
        <View style={styles.moreGamesBox}><Text style={styles.moreGamesText}>{item.label}</Text></View>
      ) : (
        <View style={styles.gameLogoPlaceholder}>
          <Image source={{ uri: item.logo }} style={styles.gameLogo} resizeMode="contain" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={resetFilter}>
          <RotateCcw color={COLORS.textSecondary} size={24} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{activeFilter ? `FILTRO: ${activeFilter.toUpperCase()}` : 'MATCHMAKING'}</Text>
          <Text style={styles.headerSubtitle}>Encuentra tu próximo dúo</Text>
        </View>

        {/* BOTÓN QUE ABRE EL MODAL DE FILTROS */}
        <TouchableOpacity 
          style={[styles.headerIcon, activeFilter && { backgroundColor: COLORS.purple, borderRadius: 10, padding: 2 }]} 
          onPress={() => setFilterVisible(true)} 
        >
          <Filter color={activeFilter ? COLORS.textMain : COLORS.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      {/* 2. TARJETA DE PERFIL */}
      <LinearGradient
        colors={[COLORS.purple, COLORS.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradientWrapper}
      >
        <View style={styles.profileCardInner}>
          
          <View style={styles.topSection}>
            <View style={styles.compatibilityContainer}>
              <Progress.Circle progress={currentProfile.compatibility} size={64} thickness={4} color={COLORS.blue} unfilledColor={COLORS.cardBackground} borderWidth={0} />
              <View style={styles.compatibilityTextWrapper}>
                <Text style={styles.compatibilityValue}>{`${(currentProfile.compatibility * 100)}%`}</Text>
                <Text style={styles.compatibilityLabel}>COMPATIBILIDAD</Text>
              </View>
            </View>
            <View style={styles.photoWrapper}>
              <Image source={{ uri: currentProfile.profilePic }} style={styles.profilePhoto} resizeMode="cover" />
            </View>
          </View>

          <ScrollView style={styles.scrollInfo} showsVerticalScrollIndicator={false}>
            <View style={styles.basicInfoRow}>
              <View>
                <View style={styles.nameAndVerified}>
                  <Text style={styles.playerName}>{currentProfile.name}</Text>
                  {currentProfile.verified && <CheckCircle2 color={COLORS.purple} size={18} style={styles.verifiedIcon} />}
                </View>
                <Text style={[styles.playerLevel, { color: COLORS.purple }]}>{`Nivel ${currentProfile.level}`}</Text>
              </View>
              <View style={styles.karmaContainer}>
                <Text style={styles.karmaLabel}>KARMA</Text>
                <View style={styles.karmaValueRow}>
                  <Star color={COLORS.blue} fill={COLORS.blue} size={14} style={styles.karmaStar} />
                  <Text style={styles.karmaValue}>{currentProfile.karma.toLocaleString()}</Text>
                </View>
                <Text style={styles.notoxicText}>No tóxico</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {currentProfile.style && (
                <View style={styles.tag}><Text style={styles.tagText}>{currentProfile.style}</Text></View>
              )}
              {currentProfile.role && (
                <View style={[styles.tag, { borderColor: COLORS.blue }]}><Text style={styles.tagText}>{currentProfile.role}</Text></View>
              )}
              {currentProfile.availability && (
                <View style={[styles.tag, { borderColor: COLORS.textSecondary }]}><Text style={styles.tagText}>🕒 {currentProfile.availability}</Text></View>
              )}
            </View>
            
            <View style={styles.rankLocationRow}>
              <View style={styles.rankBadge}>
                <Target color={COLORS.rankDiamond} size={14} style={styles.targetIcon} />
                <Text style={styles.rankText}>{currentProfile.rank}</Text>
              </View>
              <View style={styles.countryBadge}>
                <MapPin color={COLORS.textSecondary} size={14} style={styles.countryIcon} />
                <CountryFlag isoCode={currentProfile.countryISO} size={12} style={styles.flagIcon} />
                <Text style={styles.countryName}>{currentProfile.countryName}</Text>
              </View>
            </View>

            <View style={styles.statsBar}>
              <View style={styles.statItem}><Text style={styles.statLabel}>VICTORIAS</Text><Text style={styles.statValue}>{currentProfile.victorias}</Text></View>
              <View style={styles.statItem}><Text style={styles.statLabel}>PARTIDAS</Text><Text style={styles.statValue}>{currentProfile.partidas}</Text></View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ÚLTIMA ACT.</Text>
                <View style={styles.onlineStatusRow}>
                  {currentProfile.onlineStatus === 'En línea' && <View style={styles.onlineIndicatorDot} />}
                  <Text style={[styles.statValue, { color: currentProfile.onlineStatus === 'En línea' ? COLORS.onlineGreen : COLORS.textMain }]}>{currentProfile.last_act}</Text>
                </View>
              </View>
            </View>

            <View style={styles.gamesSection}>
              <Text style={styles.gamesSectionTitle}>JUEGOS QUE JUEGA</Text>
              <FlatList horizontal data={currentProfile.games} keyExtractor={(item) => item.id} showsHorizontalScrollIndicator={false} renderItem={renderGameItem} contentContainerStyle={styles.gamesListScrollContent} />
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      {/* 3. BOTONES DE ACCIÓN */}
      <View style={styles.actionButtonsRow}>
        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity style={styles.circleActionButtonGlowRed} onPress={() => handleNextProfile('Rechazar')}>
            <X color={COLORS.actionRed} size={32} />
          </TouchableOpacity>
          <Text style={styles.actionLabelTextRed}>RECHAZAR</Text>
        </View>

        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity style={styles.circleActionButtonGlowPurple} onPress={() => alert('Abriendo perfil completo...')}>
            <Eye color={COLORS.purple} size={32} />
          </TouchableOpacity>
          <Text style={styles.actionLabelTextPurple}>VER PERFIL</Text>
        </View>

        <View style={styles.actionButtonWrapper}>
          <TouchableOpacity style={styles.circleActionButtonGlowBlue} onPress={() => handleNextProfile('Aceptar')}>
            <Heart color={COLORS.blue} size={32} />
          </TouchableOpacity>
          <Text style={styles.actionLabelTextBlue}>ACEPTAR</Text>
        </View>
      </View>

      {/* 4. MODAL DE FILTROS EMERGENTE */}
      <Modal visible={isFilterVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros de Búsqueda</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <X color={COLORS.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              
              {/* FILTRO: JUEGO */}
              <Text style={styles.filterSectionTitle}>Juego Principal</Text>
              <View style={styles.pillsContainer}>
                {GAMES.map(game => (
                  <TouchableOpacity 
                    key={game} 
                    style={[styles.filterPill, tempFilters.game === game && styles.activePillBorder]}
                    onPress={() => toggleFilter('game', game)}
                  >
                    <Text style={[styles.filterPillText, tempFilters.game === game && {color: COLORS.blue}]}>{game}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* FILTRO: POSICIÓN (DINÁMICO) */}
              <Text style={styles.filterSectionTitle}>Posición / Rol</Text>
              {tempFilters.game ? (
                <View style={styles.pillsContainer}>
                  {ROLES_BY_GAME[tempFilters.game]?.map((role: string) => (
                    <TouchableOpacity 
                      key={role} 
                      style={[styles.filterPill, tempFilters.role === role && styles.activePillBorder]}
                      onPress={() => toggleFilter('role', role)}
                    >
                      <Text style={[styles.filterPillText, tempFilters.role === role && {color: COLORS.blue}]}>{role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyFilterText}>Selecciona un juego primero para ver los roles.</Text>
              )}

              {/* FILTRO: RANGO */}
              <Text style={styles.filterSectionTitle}>Rango Mínimo</Text>
              <View style={styles.pillsContainer}>
                {RANKS.map(rank => (
                  <TouchableOpacity 
                    key={rank} 
                    style={[styles.filterPill, tempFilters.rank === rank && styles.activePillBorder]}
                    onPress={() => toggleFilter('rank', rank)}
                  >
                    <Text style={[styles.filterPillText, tempFilters.rank === rank && {color: COLORS.blue}]}>{rank}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* FILTRO: HORARIO */}
              <Text style={styles.filterSectionTitle}>Horario de Juego</Text>
              <View style={styles.pillsContainer}>
                {TIMES.map(time => (
                  <TouchableOpacity 
                    key={time} 
                    style={[styles.filterPill, tempFilters.time === time && styles.activePillBorder]}
                    onPress={() => toggleFilter('time', time)}
                  >
                    <Text style={[styles.filterPillText, tempFilters.time === time && {color: COLORS.blue}]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* FILTRO: KARMA */}
              <Text style={styles.filterSectionTitle}>Nivel de Karma</Text>
              <View style={styles.pillsContainer}>
                {KARMAS.map(karma => (
                  <TouchableOpacity 
                    key={karma} 
                    style={[styles.filterPill, tempFilters.karma === karma && styles.activePillBorder]}
                    onPress={() => toggleFilter('karma', karma)}
                  >
                    <Text style={[styles.filterPillText, tempFilters.karma === karma && {color: COLORS.blue}]}>{karma}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            {/* BOTONES DEL MODAL */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={() => setTempFilters({game: '', role: '', rank: '', time: '', karma: ''})}>
                <Text style={styles.clearButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <LinearGradient colors={[COLORS.purple, COLORS.blue]} style={styles.applyButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 10 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  emptyText: { color: COLORS.blue, fontSize: 18, textAlign: 'center', marginBottom: 20 },
  resetDemoButton: { padding: 12, backgroundColor: COLORS.purple, borderRadius: 10 },
  resetDemoText: { color: COLORS.textMain, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginVertical: 10, height: 50 },
  headerIcon: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textMain, letterSpacing: 1 },
  headerSubtitle: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  
  cardGradientWrapper: { 
    width: '94%', alignSelf: 'center', borderRadius: 22, padding: 2, marginVertical: 5, 
    height: height * 0.63, 
    shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10 
  },
  
  profileCardInner: { flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 20, overflow: 'hidden' },
  topSection: { flexDirection: 'row', height: '42%', padding: 15, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  compatibilityContainer: { position: 'absolute', top: 15, left: 15, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  compatibilityTextWrapper: { position: 'absolute', alignItems: 'center' },
  compatibilityValue: { fontSize: 16, fontWeight: '800', color: COLORS.blue },
  compatibilityLabel: { fontSize: 7, color: COLORS.textSecondary, marginTop: -2 },
  photoWrapper: { width: 140, height: 140, borderRadius: 70, borderColor: COLORS.blue, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  profilePhoto: { width: 136, height: 136, borderRadius: 68 },
  scrollInfo: { flex: 1 },
  basicInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 5 },
  nameAndVerified: { flexDirection: 'row', alignItems: 'center' },
  playerName: { fontSize: 22, fontWeight: 'bold', color: COLORS.textMain, marginRight: 6 },
  verifiedIcon: { marginTop: -2 },
  playerLevel: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  karmaContainer: { alignItems: 'flex-end' },
  karmaLabel: { fontSize: 9, color: COLORS.textSecondary, letterSpacing: 0.5 },
  karmaValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  karmaStar: { marginRight: 4 },
  karmaValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.textMain },
  notoxicText: { fontSize: 9, color: COLORS.blue, marginTop: 2 },
  tagsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.purple, marginRight: 8, marginBottom: 5 },
  tagText: { color: COLORS.textMain, fontSize: 10, fontWeight: '700' },
  rankLocationRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5 },
  rankBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  targetIcon: { marginRight: 5 },
  rankText: { fontSize: 14, color: COLORS.textMain },
  countryBadge: { flexDirection: 'row', alignItems: 'center' },
  countryIcon: { marginRight: 5 },
  flagIcon: { width: 20, height: 14, borderRadius: 2, marginRight: 6 },
  countryName: { fontSize: 14, color: COLORS.textSecondary },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#0F0F1A', paddingVertical: 15, marginVertical: 10, borderColor: '#1A1A2A', borderTopWidth: 1, borderBottomWidth: 1 },
  statItem: { flex: 1, alignItems: 'center', borderRightWidth: 1, borderColor: '#1A1A2A' },
  statLabel: { fontSize: 9, color: COLORS.textSecondary, marginBottom: 5, letterSpacing: 0.5 },
  statValue: { fontSize: 16, fontWeight: '700', color: COLORS.textMain },
  onlineStatusRow: { flexDirection: 'row', alignItems: 'center' },
  onlineIndicatorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.onlineGreen, marginRight: 5 },
  gamesSection: { paddingHorizontal: 20, paddingBottom: 20 },
  gamesSectionTitle: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10, letterSpacing: 0.5 },
  gamesListScrollContent: { paddingRight: 15 },
  gameItemContainer: { marginRight: 10, width: 60, height: 60, borderRadius: 12, backgroundColor: '#0F0F1A', overflow: 'hidden' },
  gameLogoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardBackground },
  gameLogo: { width: 45, height: 45 },
  moreGamesBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F0F1A', borderWidth: 1, borderColor: '#1A1A2A' },
  moreGamesText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', position: 'absolute', bottom: 95, width: width },
  actionButtonWrapper: { alignItems: 'center', width: 90 },
  circleActionButtonGlowRed: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.actionRed, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6, borderColor: COLORS.actionRed, borderWidth: 1 },
  actionLabelTextRed: { fontSize: 10, fontWeight: '800', marginTop: 10, letterSpacing: 1, color: COLORS.actionRed },
  circleActionButtonGlowPurple: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6, borderColor: COLORS.purple, borderWidth: 1 },
  actionLabelTextPurple: { fontSize: 10, fontWeight: '800', marginTop: 10, letterSpacing: 1, color: COLORS.purple },
  circleActionButtonGlowBlue: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.blue, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 6, borderColor: COLORS.blue, borderWidth: 1 },
  actionLabelTextBlue: { fontSize: 10, fontWeight: '800', marginTop: 10, letterSpacing: 1, color: COLORS.blue },

  // --- ESTILOS DEL MODAL DE FILTROS ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(7, 7, 15, 0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.cardBackground, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, maxHeight: height * 0.8, borderWidth: 1, borderColor: COLORS.glassBorder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMain },
  filterSectionTitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 15, marginBottom: 10, fontWeight: '600', letterSpacing: 1 },
  pillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: '#2A2A3A' },
  activePillBorder: { borderColor: COLORS.blue, backgroundColor: 'rgba(0, 202, 255, 0.1)' },
  filterPillText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  emptyFilterText: { color: COLORS.actionRed, fontSize: 12, fontStyle: 'italic' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderColor: '#2A2A3A' },
  clearButton: { paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center' },
  clearButtonText: { color: COLORS.textSecondary, fontWeight: 'bold' },
  applyButton: { flex: 1, marginLeft: 15, borderRadius: 15, overflow: 'hidden' },
  applyButtonGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { color: COLORS.textMain, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }
});