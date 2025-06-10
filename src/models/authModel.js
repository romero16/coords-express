const { dbMySQL } = require('../config/db');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(data, res) {
  try {
    const userResult = await dbMySQL('users')
      .where({ email: data.email, active: 1, deleted_at: null })
      .select('id', 'email', 'password', 'active', 'deleted_at')
      .first();

    if (!userResult) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Validar contraseña
    const validPassword = await bcryptjs.compare(data.password, userResult.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: userResult.id,
        email: userResult.email
      },
      process.env.JWT_SECRET || 'tu_secreto', // Cambia por tu secreto real
      { expiresIn: '1h' }
    );

    // Responder con token y datos del usuario
    res.json({
      message: 'Login exitoso',
      token,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}

module.exports = {
  login
};

