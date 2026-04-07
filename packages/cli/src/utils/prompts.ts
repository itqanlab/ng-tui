/**
 * Simple interactive prompts for CLI commands.
 * Placeholder — will use a proper prompts library later.
 */

import * as readline from 'node:readline';

export async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}
