const { S3Client, PutObjectCommand ,DeleteObjectCommand} = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();
const { Octokit } = require("@octokit/core");
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 5001;
const cors = require('cors');

app.use(cors());
app.use(express.json());

// PostgreSQL 連線設定
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234',
  port: 5432,
});

const octokit = new Octokit({
  auth: process.env.AUTH
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
});

app.post('/blogUpdate', async (req, res) => {
  const { title, contents } = req.body;

  try {
      const payload = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${title}/index.mdx`,
          Body: contents,
          ContentType: 'text/markdown',
      };

      const command = new PutObjectCommand(payload);
      await s3Client.send(command);

      res.status(200).send({ message: 'Blog update successfully' });
  } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).send({ error: 'Error updating blog post' });
  }
});

app.delete('/deleteFolder', async (req, res) => {
  const { title } = req.body;
  try {
      const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: `${title}/index.mdx`
      };
      await s3Client.send(new DeleteObjectCommand(deleteParams));
      res.status(200).send({ message: 'File deleted successfully' });
  } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).send({ error: 'Error deleting file' });
  }
});

app.post('/trigger-workflow', async (req, res) => {
  const { owner, repo, ref, workflow_file_name, inputs } = req.body;
  try {
    await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_file_name}/dispatches', {
      owner: owner,
      repo: repo,
      workflow_file_name: workflow_file_name,
      ref: ref,
      inputs: inputs
    });
    res.status(200).send('Workflow triggered successfully');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to trigger the workflow: ' + (err.response ? err.response.data.message : err.message));
  }
});


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