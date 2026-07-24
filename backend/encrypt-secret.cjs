#!/usr/bin/env node
const crypto = require('crypto');

const [, , plainTextPassword, passphrase] = process.argv;

if (!plainTextPassword || !passphrase) {
  console.error('Usage: node backend/encrypt-secret.cjs "<plain-text-password>" "<passphrase>"');
  process.exit(1);
}

const iv = crypto.randomBytes(12);
const key = crypto.scryptSync(passphrase, 'cbm-als-db-password-salt', 32);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

const encrypted = Buffer.concat([cipher.update(plainTextPassword, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();

const payload = `${iv.toString('hex')}:${Buffer.concat([encrypted, tag]).toString('hex')}`;
console.log(payload);
