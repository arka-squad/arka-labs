#!/usr/bin/env node
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function checkTypes() {
  console.log('🔍 Checking TypeScript types...\n');
  
  try {
    // Run TypeScript compiler in no-emit mode
    const { stdout, stderr } = await execAsync('npx tsc --noEmit');
    
    if (stdout) console.log(stdout);
    if (stderr) {
      console.error('❌ TypeScript errors found:\n');
      console.error(stderr);
      process.exit(1);
    }
    
    console.log('✅ No TypeScript errors found!\n');
    
    // Run ESLint
    console.log('🔍 Checking ESLint...\n');
    try {
      const { stdout: eslintOut } = await execAsync('npx next lint');
      console.log(eslintOut);
      console.log('✅ ESLint check passed!\n');
    } catch (eslintError) {
      console.error('⚠️  ESLint warnings/errors found (non-blocking):\n');
      console.error(eslintError.stdout || eslintError.stderr);
    }
    
    console.log('🎉 All checks completed!');
    
  } catch (error) {
    console.error('❌ TypeScript compilation failed:\n');
    console.error(error.stdout || error.stderr || error.message);
    process.exit(1);
  }
}

checkTypes();