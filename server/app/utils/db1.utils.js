import { pool } from '../config/db.config.js';

export const db = {
  // Run any raw query
  query: async (text, params = []) => {
    try {
      const res = await pool.query(text, params);
      return res.rows;
    } catch (err) {
      console.error('DB Query Error:', err);
      throw err;
    }
  },

  // Get one record by ID
  getById: async (table, id) => {
    const query = `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`;
    const result = await db.query(query, [id]);
    return result[0] || null;
  },

  // Get all records from a table
  getAll: async (table) => {
    const query = `SELECT * FROM ${table}`;
    return await db.query(query);
  },

  // Insert a record
  insert: async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await db.query(query, values);
    return result[0];
  },

  // Update a record by ID
  updateById: async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, idx) => `${key} = $${idx + 1}`).join(', ');

    const query = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await db.query(query, [...values, id]);
    return result[0];
  },

  // Delete a record by ID
  deleteById: async (table, id) => {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result[0];
  }
};

