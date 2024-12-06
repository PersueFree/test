const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { body, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json({ code: 0, data: rows, description: 'Success' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/push', [
  body('name').isString(),
  body('email').isEmail(),
], async (req, res) => {
    const { name, email } = req.body;
    try {
      const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
      const [rows] = await pool.query(sql, [name, email]);
      res.status(201).json({ id: rows.insertId, name, email });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


// 自定义验证器：确保至少一个字段存在
const atLeastOneField = (value, { req }) => {
  if (!req.body.name && !req.body.email) {
      throw new Error('Either name or email must be provided.');
  }
  return true; // 通过验证
};

router.post('/update', [
  body('id').isInt(),
  body('name').isString().optional(),
  body('email').isEmail().optional(),
  body().custom(atLeastOneField)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, errors: errors.array() });
  }

  const { id, name, email } = req.body;

  let sql = 'UPDATE users SET ';
  let params = [];

  if (name) {
    sql += 'name = ?';
    params.push(name);
  }

  if (email) {
    if (params.length > 0) (sql += ', ');
    sql += 'email = ?';
    params.push(email);
  }

  sql += ' WHERE id = ?';
  params.push(id);

  try {
    const [rows] = await pool.query(sql, params);
    // res.json({ id, name, email });
    res.json({ code: 0, message: 'Update successful' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/delete', async (req, res) => {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ code: 400, message: 'id must be an integer' });
  }

  try {
    const sql = 'DELETE FROM users WHERE id = ?';
    const [rows] = await pool.query(sql, id);
    if (rows.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: 'No such user' });
    }
    res.json({ code: 0, message: 'Delete successful' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
