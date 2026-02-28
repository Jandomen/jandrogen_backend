const bcrypt = require('bcryptjs');

const password = 'alquizor_admin';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log(hash);
