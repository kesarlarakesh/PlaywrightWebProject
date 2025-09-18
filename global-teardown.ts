import * as path from 'path';

/**
 * This global teardown runs after all tests are complete.
 * Performs any necessary cleanup operations.
 */
async function globalTeardown() {
  console.log('\n--- Post-test cleanup ---');
  
  const projectRoot = path.resolve(__dirname);
  
  // Any post-test cleanup can go here
  console.log(' Tests completed successfully');
}

export default globalTeardown;
