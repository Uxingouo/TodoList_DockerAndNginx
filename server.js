const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 5001;
const path = require('path');

const cors = require('cors');
app.use(cors());


// PostgreSQL 連線設定
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});


app.use(express.json());

app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


app.post('/todos', async (req, res) => {
  const { task } = req.body;
  try {
    const result = await pool.query('INSERT INTO todos(task) VALUES($1) RETURNING *', [task]);
    if (result.rowCount > 0) {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM todos WHERE id = $1', [id]);
      res.status(200).send(`Todo with ID ${id} was deleted`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

  app.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    try {
      const result = await pool.query('UPDATE todos SET task = $1 WHERE id = $2', [task, id]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
        res.status(204).send()
      } else {
        res.status(404).send('Todo not found');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});