const execSync = require('child_process').execSync;

try {
  execSync('npm install react-scripts --save', { stdio: 'inherit' });
  execSync('react-scripts build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}