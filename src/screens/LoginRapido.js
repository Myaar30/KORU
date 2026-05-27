import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const COLORES = { fondo: '#0F172A', cards: '#1E293B', botonPrincipal: '#7C3AED', textoPrincipal: '#FFFFFF', textoSecundario: '#94A3B8' };

const LoginRapido = () => {
  const [perfiles, setPerfiles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { setUsuarioActivo } = useContext(AuthContext); 

  useEffect(() => {
    const cargarPerfiles = async () => {
      try {
        const db = await SQLite.openDatabaseAsync('koru.db');
        const datos = await db.getAllAsync('SELECT * FROM Perfil');
        setPerfiles(datos);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargarPerfiles();
  }, []);

  if (cargando) return <View style={styles.contenedor}><ActivityIndicator size="large" color={COLORES.botonPrincipal} /></View>;

  return (
    <View style={styles.contenedor}>
      {/* TOMA EN CUENTA ESTA IMAGEN: Si el nombre de tu archivo es distinto, cámbialo aquí */}
      <Image
        source={require('../../assets/images/iconoRedondeado.png')}
        style={{ width: 100, height: 100, marginBottom: 20, resizeMode: 'contain' }}
      />
      <Text style={styles.titulo}>KORU E-Sports</Text>
      <Text style={styles.subtitulo}>Selecciona un perfil para probar</Text>

      {perfiles.map((perfil) => (
        <TouchableOpacity key={perfil.id} style={styles.botonPerfil} onPress={() => setUsuarioActivo(perfil)} >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="person-circle" size={40} color={COLORES.textoPrincipal} style={{marginRight: 15}} />
            <View>
              <Text style={styles.textoNombre}>{perfil.nombre}</Text>
              <Text style={styles.textoRol}>Rol: {perfil.rolPrimario}</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color={COLORES.textoSecundario} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo, justifyContent: 'center', alignItems: 'center', padding: 20 },
  titulo: { color: COLORES.textoPrincipal, fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitulo: { color: COLORES.textoSecundario, fontSize: 16, textAlign: 'center', marginBottom: 40 },
  botonPerfil: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORES.cards, width: '100%', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  textoNombre: { color: COLORES.textoPrincipal, fontSize: 18, fontWeight: 'bold' },
  textoRol: { color: COLORES.botonPrincipal, fontSize: 14, marginTop: 4, fontWeight: '600' }
});

export default LoginRapido;