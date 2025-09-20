// simple test runner: executes the two test files sequentially
(async function() {
  console.log('Running generator.test.ts');
  await import('./generator.test.js');
  console.log('Running ml.test.ts');
  await import('./ml.test.js');
  console.log('Local unit tests finished. Jalankan integrasi HEDERA:');
  console.log('  npm run test:hedera:all');
})();
