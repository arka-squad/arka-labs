const bcrypt = require('bcryptjs');

// Generate hash for demo123
bcrypt.hash('demo123', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Hash for demo123:', hash);
  }
});