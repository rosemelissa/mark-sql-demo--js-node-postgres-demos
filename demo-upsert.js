//An upsert is either an insert or an update.
//Context: The hiscore table is intended to hold ONE hiscore for any given username.
//The first "upsert" to hiscore for any new username will be an insert.
//Subsequent ones for that same username will be updates.
//Note that the username column has been defined UNIQUE in the schema.

const { Client } = require("pg");

async function doDemo() {
  const client = new Client({ database: 'demos' }); //defaults to localhost -- Melissa not: this was ust Client() but that didn't work so I copied the object from the other demo
  await client.connect();

  //prep the table to a known empty state
  await client.query("delete from hiscores");
  console.log("Deleted all hiscores");

  //first score for user neill - should be an insert
  await upsertScore(client, "neill", 100);
  console.log("== After first upsert ==");
  await showScores(client);

  //second score for user neill - should be an update
  await upsertScore(client, "neill", 999);
  console.log("== After second upsert ==");
  await showScores(client);

  await client.end();
}

doDemo();

/** Inserts or updates a score row for the given user.
 * Returns the promise returned by client.query.
 * This promise will resolve to the results including
 * the inserted or updated row.
 * 
 * Note: you cannot mention a table-name on the left-hand side of the conflict action
 * i.e. you cannot say DO UPDATE SET table_name.column_name = ... here.
 */
function upsertScore(client, username, score) {
  return client.query(
    `INSERT INTO hiscores(username, score, time)
    VALUES($1, $2, now()) 
    ON CONFLICT (username)
    DO UPDATE SET score = $2, time=now()
    RETURNING *`,
    [username, score]
  );
}

async function showScores(client) {
  const res = await client.query("select * from hiscores");
  console.log("Entire hiscores table is now: ");
  console.table(res.rows);
}
