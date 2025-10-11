-- NeuroFi MySQL Database Setup Script
-- Run this script in MySQL Workbench to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS neurofi 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE neurofi;

-- Create a dedicated user for the application (optional but recommended)
-- Replace 'your_password' with a strong password
CREATE USER IF NOT EXISTS 'neurofi_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON neurofi.* TO 'neurofi_user'@'localhost';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

-- Show databases to confirm creation
SHOW DATABASES;

-- Show current database
SELECT DATABASE();

-- The tables will be created automatically by Sequelize when the application starts
-- This includes:
-- - users (for user accounts and authentication)
-- - cryptos (for cryptocurrency data and predictions)

-- Optional: Create indexes for better performance (Sequelize will handle this automatically)
-- But you can add custom indexes here if needed

SHOW TABLES;