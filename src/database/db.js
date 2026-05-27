import * as SQLite from 'expo-sqlite';

export const iniciarBaseDeDatos = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('koru.db');
    
    // MIGRACIÓN DESTRUCTIVA TOTAL (Descomentado para que aplique la nueva arquitectura)
    await db.execAsync('DROP TABLE IF EXISTS Perfil;');
    await db.execAsync('DROP TABLE IF EXISTS Equipo;');
    await db.execAsync('DROP TABLE IF EXISTS Postulacion;');
    await db.execAsync('DROP TABLE IF EXISTS Jugador_Equipo;'); // NUEVA
    await db.execAsync('DROP TABLE IF EXISTS Sugerencia;'); // NUEVA

    // 1. EQUIPO 
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Equipo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        tag TEXT,
        juego TEXT NOT NULL,
        capitan_id INTEGER,
        descripcion TEXT,
        objetivos TEXT,
        ambiente TEXT,
        nivel TEXT,
        requisitos TEXT,
        privacidad TEXT DEFAULT 'Público',
        reclutamientoAbierto INTEGER DEFAULT 0
      );
    `);

    // 2. PERFIL 
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Perfil (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE,
        password TEXT,
        nombre TEXT NOT NULL,
        rolPrimario TEXT,
        rolSecundario TEXT,
        juegoPrincipal TEXT
      );
    `);

    // 3. JUGADOR_EQUIPO (La tabla puente: Un jugador puede tener varias filas aquí si está en varios equipos)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Jugador_Equipo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        equipo_id INTEGER NOT NULL,
        rol_equipo TEXT DEFAULT 'Suplente',
        es_capitan INTEGER DEFAULT 0,
        asistencia_torneo TEXT DEFAULT 'Pendiente'
      );
    `);

    // 4. POSTULACIONES
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Postulacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        equipo_id INTEGER NOT NULL,
        rol_postulado TEXT NOT NULL,
        estado TEXT DEFAULT 'Pendiente'
      );
    `);

    // 5. SUGERENCIAS (Para que los titulares recomienden jugadores)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS Sugerencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipo_id INTEGER NOT NULL,
        sugeridor_id INTEGER NOT NULL,
        sugerido_id INTEGER NOT NULL,
        estado TEXT DEFAULT 'Pendiente'
      );
    `);

    return db;
  } catch (error) {
    console.error("Error al iniciar la BD: ", error);
  }
};

export const crearPerfilesDePrueba = async (db) => {
  try {
    const perfilExistente = await db.getFirstAsync('SELECT * FROM Perfil LIMIT 1');
    
    if (!perfilExistente) {
      // 1. Capitán y Jugador Base
      const idKuro = (await db.runAsync('INSERT INTO Perfil (usuario, password, nombre, rolPrimario, rolSecundario, juegoPrincipal) VALUES (?, ?, ?, ?, ?, ?)', ['capitan', '1234', 'Kurochi (Capitán)', 'Jungla', 'Top', 'League of Legends'])).lastInsertRowId;
      await db.runAsync('INSERT INTO Perfil (usuario, password, nombre, rolPrimario, rolSecundario, juegoPrincipal) VALUES (?, ?, ?, ?, ?, ?)', ['jugador', '1234', 'Martín (SoloQ)', 'Soporte', 'Iniciador', 'Valorant']);

      // 2. TRES JUGADORES EXTRA PARA COMPLETAR LOS 5
      await db.runAsync('INSERT INTO Perfil (usuario, password, nombre, rolPrimario, rolSecundario, juegoPrincipal) VALUES (?, ?, ?, ?, ?, ?)', ['faker', '1234', 'Faker (Mid)', 'Mid', 'Top', 'League of Legends']);
      await db.runAsync('INSERT INTO Perfil (usuario, password, nombre, rolPrimario, rolSecundario, juegoPrincipal) VALUES (?, ?, ?, ?, ?, ?)', ['deft', '1234', 'Deft (ADC)', 'ADC', 'Soporte', 'League of Legends']);
      await db.runAsync('INSERT INTO Perfil (usuario, password, nombre, rolPrimario, rolSecundario, juegoPrincipal) VALUES (?, ?, ?, ?, ?, ?)', ['zeus', '1234', 'Zeus (Top)', 'Top', 'Jungla', 'League of Legends']);

      // 3. Crear el Equipo y enlazar al Capitán
      const idEquipo = (await db.runAsync('INSERT INTO Equipo (nombre, tag, juego, capitan_id) VALUES (?, ?, ?, ?)', ['KORU E-Sports', 'KOR', 'League of Legends', idKuro])).lastInsertRowId;
      await db.runAsync('INSERT INTO Jugador_Equipo (usuario_id, equipo_id, rol_equipo, es_capitan, asistencia_torneo) VALUES (?, ?, ?, ?, ?)', [idKuro, idEquipo, 'Titular', 1, 'Pendiente']);
    }
  } catch (error) {
    console.error("Error al insertar perfiles: ", error);
  }
};

export const obtenerPerfiles = async (db) => {
  try {
    return await db.getAllAsync('SELECT * FROM Perfil');
  } catch (error) {
    return [];
  }
};

export const obtenerEquiposDisponibles = async (db) => {
  try {
    const query = `
      SELECT Equipo.*, Perfil.nombre AS capitan_nombre 
      FROM Equipo 
      LEFT JOIN Perfil ON Equipo.capitan_id = Perfil.id
    `;
    return await db.getAllAsync(query);
  } catch (error) {
    console.error("Error al obtener equipos: ", error);
    return [];
  }
};