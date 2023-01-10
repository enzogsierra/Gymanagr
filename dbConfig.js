import * as SQLite from "expo-sqlite";


//const CLEAR_DATABASE = false;
export const db = SQLite.openDatabase("compustack-gymanagr.db");

export function initDatabase()
{
    /*
    if(CLEAR_DATABASE)
    {
        db.transaction(tx => 
        {
            tx.executeSql("DROP TABLE IF EXISTS payments");
        });
        db.transaction(tx => 
        {
            tx.executeSql("DROP TABLE IF EXISTS clients");
        });
    }*/
    
    // Habilitar foreign keys
    db.exec([
    { 
        sql: 'PRAGMA foreign_keys = ON;', 
        args: []
    }], false, () => {});


    // Crear tabla de clientes
    db.transaction(tx => 
    {
        const query =
        `CREATE TABLE IF NOT EXISTS clients 
        (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            phone TEXT UNIQUE,
            payDate REAL DEFAULT(JULIANDAY(DATE('NOW'))),
            nextPayDate REAL DEFAULT(JULIANDAY(DATE('NOW', '+1 month')))
        )`;
        tx.executeSql(query);
    });

    // Crear tabla de pagos
    db.transaction(tx => 
    {
        const query =
        `CREATE TABLE IF NOT EXISTS payments
        (
            id INTEGER PRIMARY KEY,
            date TEXT DEFAULT(DATE('NOW')),
            price INTEGER NOT NULL,
            client_id INTEGER,
            FOREIGN KEY (client_id) REFERENCES clients(id)
                ON DELETE SET NULL
        )`;
        tx.executeSql(query);
    });
}
