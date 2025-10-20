import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'martin',
  password: 'dagobert',
  database: 'shop',
  connectionLimit: 10
});

export default pool;