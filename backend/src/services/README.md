# Services — business logic (DB + validation)
# Move SQL from routes here so controllers stay thin and debugging is easier.
# Example:
# // services/userService.js
# const db = require('../config/db');
# exports.findByEmail = (email) => db.execute('SELECT * FROM users WHERE email=?', [email]);
