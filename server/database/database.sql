CREATE DATABASE TICKETING_SYSTEM;

CREATE TABLE users(
 user_id SERIAL PRIMARY KEY,
 username VARCHAR(50),
 email VARCHAR(256) UNIQUE,
 firstname VARCHAR(256),
 lastname VARCHAR(256),
 password VARCHAR(256),
 role VARCHAR DEFAULT 'Employee' NOT NULL,
 user_verified BOOLEAN DEFAULT FALSE,
 verification_code VARCHAR DEFAULT NULL,
 verification_date DATE DEFAULT NULL
);

CREATE TABLE tickets(
 ticket_id SERIAL PRIMARY KEY,
 user_id SERIAL NOT NULL REFERENCES users(user_id),
 title VARCHAR(255),
 description VARCHAR(500),
 status VARCHAR DEFAULT 'Pending' NOT NULL,
 priority VARCHAR DEFAULT 'Regular' NOT NULL,
 solved_by VARCHAR DEFAULT NULL
);

