const mysql = require("mysql2");
const config = require("../config.json");
const db = mysql.createConnection({
  host: config.host,
  user: config.user,
  database: config.database,
  password: config.password,
});

class Model {
  async find(id, table, column = "id") {
    const selectQ = `SELECT * FROM ${table} WHERE ${column}=${id}`;
    return new Promise((resolve, reject) => {
      db.query(selectQ, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  }

  async getAllData(table) {
    const selectQ = `SELECT * FROM ${table}`;
    return new Promise((resolve, reject) => {
      db.query(selectQ, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  }

  delete(id, table, column = "id") {
    const selectQ = `SELECT * FROM ${table} WHERE ${column}=${id}`;
    db.query(selectQ, (err, results) => {
      if (err) {
        throw err;
      } else {
        if (results.length != 0) {
          const deleteQ = `DELETE FROM ${table} WHERE ${column}=${id}`;
          db.query(deleteQ, (err) => {
            if (err) {
              throw err;
            }
          });
        }
      }
    });
  }

  async save(data, table, column = "id") {
    const id = data[column];
    if (id && id >= 0) {
      const updateQ = `UPDATE ${table} SET ? WHERE ${column}=${id}`;
      return new Promise((resolve, reject) => {
        db.query(updateQ, data, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
    } else {
      const insertQ = `INSERT INTO ${table} SET ?`;
      return new Promise((resolve, reject) => {
        db.query(insertQ, data, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
    }
  }
}
module.exports = Model;
