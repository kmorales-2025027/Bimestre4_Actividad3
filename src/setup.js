import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function main() {
  const dbName = 'bim4_act3_in5bm'

  const connection = process.env.DATABASE_URL || `postgresql://postgres:admin@localhost:5432/${dbName}`;

  const admin = new Client({ connectionString: connection.replace(`/${dbName}`, '/postgres') });
  await admin.connect();

  const dbExists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  
  if (dbExists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log('Base de datos creada.');
  } else {
    console.log('La base de datos ya existe.');
  }
  await admin.end();

  const db = new Client({ connectionString: connection });
  await db.connect();
  await db.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre varchar(60) NOT NULL,
      precio DECIMAL(10,2) NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0
    )
  `);
  console.log('Tabla de productos creada.');

  await db.query(`
    CREATE TABLE IF NOT EXISTS carrito (
      id SERIAL PRIMARY KEY,
      id_producto INTEGER NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (id_producto) REFERENCES productos(id)
        ON DELETE CASCADE
    )
  `);
  console.log('Tabla de carrito creada.');

  await db.end();
}

main().catch((error) => {
  console.error('*Error*: No se pudo configurar la base de datos.', error.message);
  process.exit(1);
});