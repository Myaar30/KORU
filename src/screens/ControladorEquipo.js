import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import React, { useCallback, useContext, useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import GestionEquipo from './GestionEquipo';
import VistaJugador from './VistaJugador';

const COLORES = { fondo: '#0F172A', cards: '#1E293B', botonPrincipal: '#7C3AED', interactivo: '#22D3EE', textoPrincipal: '#FFFFFF', textoSecundario: '#94A3B8', exito: '#10B981', alerta: '#F59E0B' };

const ControladorEquipo = () => {
  const { usuarioActivo } = useContext(AuthContext);
  const [vistaActiva, setVistaActiva] = useState('OPCIONES');
  
  // NUEVOS ESTADOS DE ARQUITECTURA N:M
  const [misEquipos, setMisEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

  // Estados del Formulario (Iguales a la versión anterior)
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [tagEquipo, setTagEquipo] = useState('');
  const [juegoEquipo, setJuegoEquipo] = useState('League of Legends');
  const [descEquipo, setDescEquipo] = useState('');
  const [requisitosEquipo, setRequisitosEquipo] = useState('');
  const [nivelEquipo, setNivelEquipo] = useState('Semi competitivo');
  const [ambienteEquipo, setAmbienteEquipo] = useState('Chill');
  const [objetivoEquipo, setObjetivoEquipo] = useState('Clash');

  // LECTURA INTELIGENTE DE LA TABLA PUENTE
  const cargarMisEquipos = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('koru.db');
      const data = await db.getAllAsync(`
        SELECT e.*, je.rol_equipo, je.es_capitan, je.asistencia_torneo
        FROM Equipo e
        JOIN Jugador_Equipo je ON e.id = je.equipo_id
        WHERE je.usuario_id = ?
      `, [usuarioActivo.id]);
      setMisEquipos(data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(useCallback(() => { cargarMisEquipos(); }, [usuarioActivo.id]));

  // REGLAS DE NEGOCIO (¡Aquí está la magia de los límites!)
  const esTitularEnAlguno = misEquipos.some(eq => eq.rol_equipo === 'Titular');
  const limiteAlcanzado = esTitularEnAlguno || misEquipos.length >= 2;

  const registrarEquipoEnBD = async () => {
    if (nombreEquipo.trim() === '' || tagEquipo.trim() === '') return Alert.alert('Error', 'Nombre y Tag obligatorios.');

    try {
      const db = await SQLite.openDatabaseAsync('koru.db');
      
      // 1. Insertamos el Equipo
      const resultEquipo = await db.runAsync(
        `INSERT INTO Equipo (nombre, tag, juego, capitan_id, descripcion, objetivos, ambiente, nivel, requisitos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombreEquipo, tagEquipo.toUpperCase(), juegoEquipo, usuarioActivo.id, descEquipo, objetivoEquipo, ambienteEquipo, nivelEquipo, requisitosEquipo]
      );
      const nuevoEquipoId = resultEquipo.lastInsertRowId;

      // 2. Insertamos al creador en la TABLA PUENTE (Automáticamente es Titular y Capitán)
      await db.runAsync(
        `INSERT INTO Jugador_Equipo (usuario_id, equipo_id, rol_equipo, es_capitan, asistencia_torneo) VALUES (?, ?, 'Titular', 1, 'Pendiente')`,
        [usuarioActivo.id, nuevoEquipoId]
      );

      Alert.alert('¡Éxito!', `El equipo ${nombreEquipo} está listo.`);
      setVistaActiva('OPCIONES');
      cargarMisEquipos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el equipo en la BD.');
    }
  };

  // ==========================================
  // RENDERIZADO DE RUTAS
  // ==========================================
  
  if (vistaActiva === 'GESTION' && equipoSeleccionado) {
    // Le pasamos toda la info cruzada a la vista de gestión
    return <GestionEquipo dataPuente={equipoSeleccionado} volver={() => setVistaActiva('OPCIONES')} />
  }

  if (vistaActiva === 'CREAR_EQUIPO') {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
          <View style={styles.headerFormulario}>
            <TouchableOpacity onPress={() => setVistaActiva('OPCIONES')}>
              <Ionicons name="arrow-back" size={24} color={COLORES.textoPrincipal} />
            </TouchableOpacity>
            <Text style={styles.tituloForm}>Configurar Equipo</Text>
            <View style={{width: 24}} /> 
          </View>

          <ScrollView style={{ padding: 20 }}>
            <View style={styles.cajaFormulario}>
              <Text style={styles.label}>Información Básica</Text>
              <View style={{flexDirection: 'row', gap: 10}}>
                <TextInput style={[styles.input, {flex: 2}]} placeholder="Nombre ej: KORU E-Sports" placeholderTextColor={COLORES.textoSecundario} value={nombreEquipo} onChangeText={setNombreEquipo} />
                <TextInput style={[styles.input, {flex: 1}]} placeholder="Tag: KOR" placeholderTextColor={COLORES.textoSecundario} value={tagEquipo} onChangeText={setTagEquipo} maxLength={4} autoCapitalize="characters" />
              </View>

              <Text style={styles.label}>Juego Principal</Text>
              <View style={styles.contenedorOpciones}>
                <TouchableOpacity style={[styles.botonOpcion, juegoEquipo === 'League of Legends' && styles.botonOpcionActivo]} onPress={() => {setJuegoEquipo('League of Legends'); Keyboard.dismiss();}}>
                  <Text style={[styles.textoOpcion, juegoEquipo === 'League of Legends' && styles.textoOpcionActivo]}>LoL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.botonOpcion, juegoEquipo === 'Valorant' && styles.botonOpcionActivo]} onPress={() => {setJuegoEquipo('Valorant'); Keyboard.dismiss();}}>
                  <Text style={[styles.textoOpcion, juegoEquipo === 'Valorant' && styles.textoOpcionActivo]}>Valorant</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Descripción Corta</Text>
              <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="Ej: Equipo enfocado en subir a Inmortal..." placeholderTextColor={COLORES.textoSecundario} value={descEquipo} onChangeText={setDescEquipo} multiline />

              <Text style={styles.label}>Nivel Competitivo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                {['Casual', 'Semi competitivo', 'Competitivo', 'Tryhard'].map(nivel => (
                  <TouchableOpacity key={nivel} style={[styles.tagBoton, nivelEquipo === nivel && styles.tagBotonActivo]} onPress={() => setNivelEquipo(nivel)}>
                    <Text style={[styles.textoOpcion, nivelEquipo === nivel && styles.textoOpcionActivo]}>{nivel}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Ambiente</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                {['Chill', 'Compañerismo', 'Flexible', 'Serio'].map(ambiente => (
                  <TouchableOpacity key={ambiente} style={[styles.tagBoton, ambienteEquipo === ambiente && styles.tagBotonActivo]} onPress={() => setAmbienteEquipo(ambiente)}>
                    <Text style={[styles.textoOpcion, ambienteEquipo === ambiente && styles.textoOpcionActivo]}>{ambiente}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Objetivo Principal</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15}}>
                {['Clash', 'Torneos', 'Scrims', 'Subir elo', 'Aprender'].map(obj => (
                  <TouchableOpacity key={obj} style={[styles.tagBoton, objetivoEquipo === obj && styles.tagBotonActivo]} onPress={() => setObjetivoEquipo(obj)}>
                    <Text style={[styles.textoOpcion, objetivoEquipo === obj && styles.textoOpcionActivo]}>{obj}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Requisitos (Ej: Rango, Microfono)</Text>
              <TextInput style={styles.input} placeholder="Ej: Rango Mínimo Platino, Uso de Discord..." placeholderTextColor={COLORES.textoSecundario} value={requisitosEquipo} onChangeText={setRequisitosEquipo} />

              <TouchableOpacity style={styles.botonFundar} onPress={registrarEquipoEnBD}>
                <Ionicons name="trophy-outline" size={22} color="white" style={{marginRight: 10}} />
                <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Fundar Equipo</Text>
              </TouchableOpacity>
            </View>
            <View style={{height: 50}}/>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  if (vistaActiva === 'BUSCAR') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORES.fondo }}>
        <TouchableOpacity style={styles.botonVolver} onPress={() => setVistaActiva('OPCIONES')}>
          <Ionicons name="arrow-back" size={24} color={COLORES.textoPrincipal} />
          <Text style={styles.textoVolver}>Volver a opciones</Text>
        </TouchableOpacity>
        <VistaJugador misEquipos={misEquipos} limiteAlcanzado={limiteAlcanzado} />
      </View>
    );
  }

  // ==========================================
  // HUB PRINCIPAL: MIS EQUIPOS
  // ==========================================
  return (
    <ScrollView style={styles.contenedor}>
      <View style={{padding: 20, paddingTop: 40}}>
        <Text style={styles.tituloPantalla}>Mis Equipos</Text>
        <Text style={styles.subtitulo}>
          Titulares: Máx 1 equipo. Suplentes: Máx 2 equipos.
        </Text>
        
        {misEquipos.length === 0 ? (
          <View style={styles.cardVacia}>
            <Ionicons name="sad-outline" size={40} color={COLORES.textoSecundario} style={{marginBottom: 10}} />
            <Text style={{color: COLORES.textoSecundario}}>Aún no perteneces a ningún equipo.</Text>
          </View>
        ) : (
          misEquipos.map(eq => (
            <TouchableOpacity 
              key={eq.id} 
              style={styles.cardMiEquipo} 
              onPress={() => { setEquipoSeleccionado(eq); setVistaActiva('GESTION'); }}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.logoMini}><Text style={{color: 'white', fontWeight: 'bold'}}>{eq.tag}</Text></View>
                <View>
                  <Text style={styles.nombreMiEquipo}>{eq.nombre}</Text>
                  <Text style={{color: eq.rol_equipo === 'Titular' ? COLORES.interactivo : COLORES.alerta}}>
                    {eq.rol_equipo} {eq.es_capitan === 1 && '👑'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORES.textoSecundario} />
            </TouchableOpacity>
          ))
        )}

        {/* CONTROLES DE RECLUTAMIENTO BASADOS EN LÍMITES */}
        {limiteAlcanzado ? (
          <View style={styles.alertaBloqueo}>
            <Ionicons name="lock-closed" size={20} color={COLORES.alerta} style={{marginRight: 10}} />
            <Text style={{color: COLORES.textoPrincipal, flex: 1, fontSize: 13}}>
              Has alcanzado tu límite de participación. No puedes unirte ni fundar más equipos.
            </Text>
          </View>
        ) : (
          <View style={styles.contenedorBotones}>
            <TouchableOpacity style={styles.botonAccion} onPress={() => setVistaActiva('BUSCAR')}>
              <Ionicons name="search" size={24} color={COLORES.textoPrincipal} style={{marginBottom: 8}} />
              <Text style={styles.textoBotonSecundario}>Postular</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonAccion, { backgroundColor: COLORES.botonPrincipal, borderColor: COLORES.botonPrincipal }]} onPress={() => setVistaActiva('CREAR_EQUIPO')}>
              <Ionicons name="add-circle-outline" size={24} color={COLORES.textoPrincipal} style={{marginBottom: 8}} />
              <Text style={{ color: COLORES.textoPrincipal, fontWeight: 'bold', textAlign: 'center' }}>Fundar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },
  tituloPantalla: { color: COLORES.textoPrincipal, fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitulo: { color: COLORES.textoSecundario, fontSize: 14, marginBottom: 25 },
  cardVacia: { backgroundColor: COLORES.cards, padding: 30, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#334155', borderStyle: 'dashed' },
  cardMiEquipo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORES.cards, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  logoMini: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  nombreMiEquipo: { color: COLORES.textoPrincipal, fontSize: 18, fontWeight: 'bold' },
  alertaBloqueo: { flexDirection: 'row', backgroundColor: '#451A03', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: COLORES.alerta },
  contenedorBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botonAccion: { flex: 1, backgroundColor: COLORES.cards, padding: 20, borderRadius: 12, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#334155' },
  textoBotonSecundario: { color: COLORES.textoPrincipal, fontWeight: 'bold', textAlign: 'center', fontSize: 14 },
  
  // Estilos de Formularios (Mantienen los mismos)
  botonVolver: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 50, backgroundColor: COLORES.cards },
  textoVolver: { color: COLORES.textoPrincipal, fontSize: 16, marginLeft: 10, fontWeight: 'bold' },
  headerFormulario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 50, backgroundColor: COLORES.cards },
  tituloForm: { color: COLORES.textoPrincipal, fontSize: 20, fontWeight: 'bold' },
  cajaFormulario: { paddingBottom: 20 },
  label: { color: COLORES.interactivo, fontWeight: 'bold', marginBottom: 8, fontSize: 14, marginTop: 15 },
  input: { backgroundColor: COLORES.fondo, color: COLORES.textoPrincipal, padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
  avatarPlaceholder: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  contenedorOpciones: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  botonOpcion: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#334155', borderRadius: 8, marginHorizontal: 4 },
  botonOpcionActivo: { backgroundColor: COLORES.botonPrincipal },
  textoOpcion: { color: COLORES.textoSecundario, fontWeight: '600' },
  textoOpcionActivo: { color: COLORES.textoPrincipal, fontWeight: 'bold' },
  botonFundar: { flexDirection: 'row', backgroundColor: COLORES.exito, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  tagBoton: { backgroundColor: '#1E293B', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#334155' },
  tagBotonActivo: { borderColor: COLORES.botonPrincipal, backgroundColor: '#4C1D95' }
});

export default ControladorEquipo;