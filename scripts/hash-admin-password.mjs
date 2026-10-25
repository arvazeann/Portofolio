import { randomBytes, scryptSync } from "node:crypto";
import process from "node:process";

const cost = 1 << 15;
const blockSize = 8;
const parallelization = 1;
const keyLength = 32;
const maxMemory = 64 * 1024 * 1024;

function readHidden(label) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal so the password is not echoed.");
  }

  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(label);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();

    const finish = (error) => {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    };

    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === "\u0003") return finish(new Error("Cancelled."));
        if (character === "\r" || character === "\n") return finish();
        if (character === "\u007f" || character === "\b") {
          if (value.length) {
            value = value.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (character >= " ") {
          value += character;
          process.stdout.write("*");
        }
      }
    };

    input.on("data", onData);
  });
}

try {
  const password = await readHidden("Admin password (min. 14 characters): ");
  const confirmation = await readHidden("Confirm admin password: ");
  if (password !== confirmation) throw new Error("Passwords did not match.");
  if (password.length < 14 || password.length > 1024) {
    throw new Error("Password must be between 14 and 1024 characters.");
  }

  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, keyLength, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: maxMemory,
  });
  process.stdout.write(`ADMIN_PASSWORD_HASH=scrypt-v1$${salt.toString("base64url")}$${digest.toString("base64url")}\n`);
  process.stdout.write("Copy this hash to your local/deployment environment variables. Do not commit it.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Hash generation failed."}\n`);
  process.exitCode = 1;
}
