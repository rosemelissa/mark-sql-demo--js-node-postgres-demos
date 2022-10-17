const { Client } = require("pg");

async function doDemo() {
  const client = new Client({ database: 'musicbase' });
  await client.connect();
  const text = "INSERT INTO artists(name, genre) VALUES ($1, $2) RETURNING *"
  const values = ['Ariana Grande', 'Pop']
  const res = await client.query(text, values);
  console.log(res.rows);
  await client.end();
}

doDemo();
