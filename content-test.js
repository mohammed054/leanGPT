// ULTRA MINIMAL TEST - Does this inject at all?
console.log('ULTRA TEST: Script loaded');

// Add obvious visual indicator
const testDiv = document.createElement('div');
testDiv.innerHTML = '🔴 SCRIPT INJECTED';
testDiv.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  background: red;
  color: white;
  padding: 10px;
  z-index: 999999;
  font-size: 20px;
  font-weight: bold;
`;
document.body.appendChild(testDiv);

console.log('ULTRA TEST: Indicator added');