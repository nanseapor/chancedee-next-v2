#!/bin/bash
# TDD Violation Scanner
# Run from: tests/audit/
# Usage: ./find-violations.sh

set -e

echo "=============================================="
echo "  TDD Violation Scanner"
echo "  Date: $(date +%Y-%m-%d)"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

count_matches() {
  local count=$1
  if [ "$count" -gt 0 ]; then
    echo -e "${RED}Found: $count${NC}"
  else
    echo -e "${GREEN}Found: 0${NC}"
  fi
}

echo "## 1. Defensive Skips (test.skip, it.skip, describe.skip)"
echo "   Looking for dynamic skips that depend on runtime conditions..."
echo ""
SKIP_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" "test\.skip\|it\.skip\|describe\.skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null | wc -l || echo "0")
count_matches $SKIP_COUNT
if [ "$SKIP_COUNT" -gt 0 ]; then
  grep -rn --include="*.ts" --include="*.tsx" "test\.skip\|it\.skip\|describe\.skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null | head -20
fi
echo ""

echo "----------------------------------------------"
echo "## 2. Conditional Skips (if...skip patterns)"
echo "   Looking for skip() calls inside conditionals..."
echo ""
COND_SKIP_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" -E "if.*skip|else.*skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null | wc -l || echo "0")
count_matches $COND_SKIP_COUNT
if [ "$COND_SKIP_COUNT" -gt 0 ]; then
  grep -rn --include="*.ts" --include="*.tsx" -E "if.*skip|else.*skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null | head -20
fi
echo ""

echo "----------------------------------------------"
echo "## 3. waitForTimeout Usage"
echo "   Looking for implicit waits instead of explicit conditions..."
echo ""
TIMEOUT_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" "waitForTimeout" ../e2e/ 2>/dev/null | wc -l || echo "0")
count_matches $TIMEOUT_COUNT
if [ "$TIMEOUT_COUNT" -gt 0 ]; then
  grep -rn --include="*.ts" --include="*.tsx" "waitForTimeout" ../e2e/ 2>/dev/null | head -30
fi
echo ""

echo "----------------------------------------------"
echo "## 4. Conditional Assertions"
echo "   Looking for if/else blocks containing expect()..."
echo ""
# This is harder to grep accurately, so we look for patterns
COND_ASSERT_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" -B2 -A2 "if.*{" ../e2e/ ../unit/ ../integration/ 2>/dev/null | grep -c "expect" || echo "0")
echo -e "${YELLOW}Potential matches (review manually): ~$COND_ASSERT_COUNT${NC}"
echo "   Run: grep -rn 'if.*{' tests/ | xargs grep -l 'expect' | head -10"
echo ""

echo "----------------------------------------------"
echo "## 5. Dynamic Test Data Checks"
echo "   Looking for tests that check data before asserting..."
echo ""
DYN_DATA_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" -E "if.*\.length|\.length\s*[><=]" ../e2e/ 2>/dev/null | grep -v "node_modules" | wc -l || echo "0")
count_matches $DYN_DATA_COUNT
if [ "$DYN_DATA_COUNT" -gt 0 ]; then
  grep -rn --include="*.ts" --include="*.tsx" -E "if.*\.length|\.length\s*[><=]" ../e2e/ 2>/dev/null | grep -v "node_modules" | head -20
fi
echo ""

echo "----------------------------------------------"
echo "## 6. Console.log in Tests (Debug Leftovers)"
echo "   Looking for forgotten debug statements..."
echo ""
CONSOLE_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" "console\.log" ../e2e/ ../unit/ ../integration/ 2>/dev/null | wc -l || echo "0")
count_matches $CONSOLE_COUNT
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  grep -rn --include="*.ts" --include="*.tsx" "console\.log" ../e2e/ ../unit/ ../integration/ 2>/dev/null | head -20
fi
echo ""

echo "----------------------------------------------"
echo "## 7. Hardcoded Test IDs/Values"
echo "   Looking for hardcoded Firestore IDs that might conflict..."
echo ""
HARDCODE_COUNT=$(grep -rn --include="*.ts" --include="*.tsx" -E "['\"][a-zA-Z0-9]{20,}['\"]" ../e2e/ ../unit/ ../integration/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | wc -l || echo "0")
echo -e "${YELLOW}Potential hardcoded IDs (review manually): ~$HARDCODE_COUNT${NC}"
echo ""

echo "=============================================="
echo "  Summary"
echo "=============================================="
echo ""
echo "| Violation Type          | Count |"
echo "|-------------------------|-------|"
echo "| Defensive Skips         | $SKIP_COUNT |"
echo "| Conditional Skips       | $COND_SKIP_COUNT |"
echo "| waitForTimeout          | $TIMEOUT_COUNT |"
echo "| Dynamic Data Checks     | $DYN_DATA_COUNT |"
echo "| Console.log             | $CONSOLE_COUNT |"
echo ""

TOTAL=$((SKIP_COUNT + COND_SKIP_COUNT + TIMEOUT_COUNT + DYN_DATA_COUNT))
if [ "$TOTAL" -gt 0 ]; then
  echo -e "${RED}Total violations to review: $TOTAL${NC}"
  exit 1
else
  echo -e "${GREEN}No obvious violations found!${NC}"
  exit 0
fi
