#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🚀 NeuroFi MySQL Setup Script');
console.log('================================');

async function runCommand(command, description) {
  try {
    console.log(`\n🔄 ${description}...`);
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('npm WARN')) console.log('⚠️', stderr);
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function setupMySQL() {
  console.log('\n📦 Installing MySQL dependencies...');
  
  // Remove old MongoDB dependencies
  console.log('\n🗑️ Removing MongoDB dependencies...');
  await runCommand('npm uninstall mongoose', 'Removing mongoose');
  
  // Install MySQL dependencies
  console.log('\n📥 Installing MySQL dependencies...');
  const installSuccess = await runCommand(
    'npm install sequelize@^6.35.2 mysql2@^3.6.5',
    'Installing Sequelize and MySQL2'
  );
  
  if (!installSuccess) {
    console.log('\n❌ Failed to install dependencies. Please run manually:');
    console.log('npm install sequelize mysql2');
    return false;
  }
  
  // Check if .env file exists
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('\n📝 Creating .env file from .env.example...');
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created');
      console.log('⚠️ Please update .env file with your MySQL credentials');
    } catch (error) {
      console.log('❌ Failed to create .env file:', error.message);
    }
  }
  
  console.log('\n🎉 MySQL setup completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Install and start MySQL Server');
  console.log('2. Install MySQL Workbench');
  console.log('3. Run the database setup script in MySQL Workbench');
  console.log('4. Update .env file with your MySQL credentials');
  console.log('5. Start the application with: npm run dev');
  console.log('\n📖 For detailed instructions, see: backend/MYSQL_SETUP.md');
  
  return true;
}

// Run the setup
setupMySQL().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});