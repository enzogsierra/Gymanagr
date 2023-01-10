import * as SQLite from "expo-sqlite";


//const CLEAR_DATABASE = false;
export const db = SQLite.openDatabase("olimpogym.db");

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
        db.transaction(tx => 
        {
            tx.executeSql("DROP TABLE IF EXISTS teachers");
        });
        db.transaction(tx => 
        {
            tx.executeSql("DROP TABLE IF EXISTS settings");
        });
    }*/
    
    // Habilitar foreign keys
    db.exec([
    { 
        sql: 'PRAGMA foreign_keys = ON;', 
        args: []
    }], false, () => {});

    
    // Crear tabla de profesores
    db.transaction(tx => 
    {
        const query =
        `CREATE TABLE IF NOT EXISTS teachers
        (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            phone TEXT UNIQUE,
            price INTEGER NOT NULL
        )`;
        tx.executeSql(query);
    });

    // Crear tabla de clientes
    db.transaction(tx => 
    {
        const query =
        `CREATE TABLE IF NOT EXISTS clients 
        (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            phone TEXT UNIQUE,
            teacher_id INTEGER,
            payDate REAL DEFAULT(JULIANDAY(DATE('NOW'))),
            nextPayDate REAL DEFAULT(JULIANDAY(DATE('NOW', '+1 month'))),
            FOREIGN KEY (teacher_id) REFERENCES teachers (id)
                ON DELETE SET NULL
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
            teacher_id INTEGER,
            client_id INTEGER,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
                ON DELETE SET NULL,
            FOREIGN KEY (client_id) REFERENCES clients(id)
                ON DELETE SET NULL
        )`;
        tx.executeSql(query);
    });


    /*if(CLEAR_DATABASE)
    {
        db.transaction(tx => 
        {
            const query = 
            `
                INSERT INTO teachers(name, phone, price) 
                VALUES 
                    ('Pablo', '0004832', '2000'), 
                    ('Martin', '0006455', '2500'), 
                    ('Juan', '0001248', '2200')
            `;
            tx.executeSql(query, [], (_, res) => {}, (_, error) => { console.log(error); });
        });
    
        db.transaction(tx => 
        {
            const query = 
            `
                INSERT INTO clients(name, phone, teacher_id, payDate, nextPayDate) 
                VALUES 
                    ('Enzo', '5435893', 1, julianday(DATE('NOW')), julianday(DATE('NOW', '+1 month'))),
                    ('Nico', '9381439', 2, julianday(DATE('NOW')), julianday(DATE('NOW', '+1 month'))),
                    ('Tamara', '2134433', 2, julianday(DATE('NOW')), julianday(DATE('NOW', '+3 month')))
            `;
            tx.executeSql(query, [], (_, res) => {}, (_, error) => { console.log(error); });
        });
    }*/
}
