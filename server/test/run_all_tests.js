/**
 * CanteenPulse Comprehensive Master Test Suite Runner
 * Runs both:
 * 1. Unit & Controller Logic Test Suite (Offline Isolated Harness - 29 Tests)
 * 2. MongoDB Atlas Cloud Integration & Persistence Test Suite (Live Cloud Cluster - 10 Tests)
 */

const { runAllTests: runUnitTests } = require('./api.test');
const { runAtlasIntegrationTests } = require('./atlas.integration.test');

async function runMasterTestSuite() {
  console.log('\n================================================================');
  console.log('🚀 CANTEENPULSE MASTER BACKEND VERIFICATION RUNNER');
  console.log('================================================================\n');

  // Part 1: Offline Unit & Controller Logic Tests
  console.log('>>> EXECUTING PART 1: UNIT & CONTROLLER LOGIC TESTS (OFFLINE HARNESS) <<<\n');
  const unitResults = await runUnitTests();

  // Part 2: Live MongoDB Atlas Cloud Integration Tests
  console.log('\n>>> EXECUTING PART 2: LIVE MONGODB ATLAS CLOUD INTEGRATION TESTS <<<\n');
  let integrationResults = { passed: 0, total: 0 };
  try {
    integrationResults = await runAtlasIntegrationTests();
  } catch (err) {
    console.error('Atlas Integration Suite encountered an error:', err.message);
  }

  // Combined Summary
  const grandTotal = unitResults.total + integrationResults.total;
  const grandPassed = unitResults.passed + integrationResults.passed;
  const overallSuccess = grandPassed === grandTotal;

  console.log('\n================================================================');
  console.log('📊 MASTER TEST SUITE RESULTS SUMMARY');
  console.log('================================================================');
  console.log(` 1. Unit & Controller Logic Tests: ${unitResults.passed}/${unitResults.total} Passed (${Math.round((unitResults.passed / unitResults.total) * 100)}%)`);
  console.log(` 2. MongoDB Atlas Cloud Integration:  ${integrationResults.passed}/${integrationResults.total} Passed (${Math.round((integrationResults.passed / integrationResults.total) * 100)}%)`);
  console.log('----------------------------------------------------------------');
  console.log(` 🏁 OVERALL: ${grandPassed}/${grandTotal} TESTS PASSED (${Math.round((grandPassed / grandTotal) * 100)}%)`);
  console.log('================================================================\n');

  process.exit(overallSuccess ? 0 : 1);
}

runMasterTestSuite().catch(err => {
  console.error('Master Test Runner Fatal Error:', err);
  process.exit(1);
});
