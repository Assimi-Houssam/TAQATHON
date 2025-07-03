const bcrypt = require('bcryptjs');

async function generatePassword() {
  const password = 'Admin123!';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash validation:', isValid);
}

generatePassword(); 