#!/bin/bash
# TDD Violation Bulk Fixer
# Run from: tests/audit/
# Usage: ./bulk-fix-violations.sh [--dry-run]

set -e

DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No files will be modified"
  echo ""
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=============================================="
echo "  TDD Violation Bulk Fixer"
echo "=============================================="
echo ""

# ============================================
# FIX 1: Remove console.log statements
# ============================================
echo -e "${BLUE}## Fix 1: Removing console.log statements${NC}"

CONSOLE_FILES=$(grep -rl --include="*.ts" --include="*.tsx" "console\.log" ../e2e/ ../unit/ ../integration/ 2>/dev/null || true)
CONSOLE_COUNT=$(echo "$CONSOLE_FILES" | grep -c "." || echo "0")

if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo "Found $CONSOLE_COUNT files with console.log"
  
  if [ "$DRY_RUN" = true ]; then
    echo "Would remove console.log from:"
    echo "$CONSOLE_FILES" | head -10
    [ "$CONSOLE_COUNT" -gt 10 ] && echo "... and $(($CONSOLE_COUNT - 10)) more files"
  else
    echo "Removing console.log statements..."
    for file in $CONSOLE_FILES; do
      # Remove lines containing only console.log (preserves lines with other code)
      sed -i '/^\s*console\.log/d' "$file"
      echo -e "  ${GREEN}✓${NC} $file"
    done
  fi
else
  echo -e "${GREEN}No console.log statements found${NC}"
fi
echo ""

# ============================================
# FIX 2: Replace waitForTimeout with better alternatives
# ============================================
echo -e "${BLUE}## Fix 2: Flagging waitForTimeout usage${NC}"
echo -e "${YELLOW}NOTE: These require manual review - cannot auto-fix safely${NC}"
echo ""

TIMEOUT_INSTANCES=$(grep -rn --include="*.ts" --include="*.tsx" "waitForTimeout" ../e2e/ 2>/dev/null || true)
TIMEOUT_COUNT=$(echo "$TIMEOUT_INSTANCES" | grep -c "." || echo "0")

if [ "$TIMEOUT_COUNT" -gt 0 ]; then
  echo "Found $TIMEOUT_COUNT instances of waitForTimeout"
  echo ""
  echo "Suggested replacements:"
  echo ""
  echo "| Current Pattern | Replace With |"
  echo "|-----------------|--------------|"
  echo "| waitForTimeout(1000) then check element | await expect(element).toBeVisible({ timeout: 5000 }) |"
  echo "| waitForTimeout(2000) then check text | await expect(element).toHaveText('...', { timeout: 5000 }) |"
  echo "| waitForTimeout after click | await page.waitForLoadState('networkidle') |"
  echo "| waitForTimeout for API | await page.waitForResponse(url => url.includes('/api/')) |"
  echo ""
  
  if [ "$DRY_RUN" = false ]; then
    # Create a report file
    echo "# waitForTimeout Instances to Review" > ../audit/reports/waitForTimeout-review.md
    echo "" >> ../audit/reports/waitForTimeout-review.md
    echo "Generated: $(date)" >> ../audit/reports/waitForTimeout-review.md
    echo "" >> ../audit/reports/waitForTimeout-review.md
    echo "| File | Line | Code |" >> ../audit/reports/waitForTimeout-review.md
    echo "|------|------|------|" >> ../audit/reports/waitForTimeout-review.md
    
    echo "$TIMEOUT_INSTANCES" | while IFS= read -r line; do
      file=$(echo "$line" | cut -d: -f1)
      linenum=$(echo "$line" | cut -d: -f2)
      code=$(echo "$line" | cut -d: -f3- | sed 's/|/\\|/g' | xargs)
      echo "| $file | $linenum | \`$code\` |" >> ../audit/reports/waitForTimeout-review.md
    done
    
    echo -e "${GREEN}Created: reports/waitForTimeout-review.md${NC}"
  fi
else
  echo -e "${GREEN}No waitForTimeout found${NC}"
fi
echo ""

# ============================================
# FIX 3: Show conditional skip patterns for manual review
# ============================================
echo -e "${BLUE}## Fix 3: Conditional skips (manual review required)${NC}"

SKIP_INSTANCES=$(grep -rn --include="*.ts" --include="*.tsx" -E "if.*\{[^}]*skip|else[^}]*skip" ../e2e/ ../unit/ ../integration/ 2>/dev/null || true)
SKIP_COUNT=$(echo "$SKIP_INSTANCES" | grep -c "." || echo "0")

if [ "$SKIP_COUNT" -gt 0 ]; then
  echo "Found $SKIP_COUNT conditional skip patterns"
  echo ""
  
  if [ "$DRY_RUN" = false ]; then
    echo "# Conditional Skip Patterns to Fix" > ../audit/reports/conditional-skips-review.md
    echo "" >> ../audit/reports/conditional-skips-review.md
    echo "These need to be converted to explicit test.fail() or split into separate tests." >> ../audit/reports/conditional-skips-review.md
    echo "" >> ../audit/reports/conditional-skips-review.md
    echo "$SKIP_INSTANCES" >> ../audit/reports/conditional-skips-review.md
    
    echo -e "${GREEN}Created: reports/conditional-skips-review.md${NC}"
  fi
else
  echo -e "${GREEN}No conditional skips found${NC}"
fi
echo ""

# ============================================
# Summary
# ============================================
echo "=============================================="
echo "  Summary"
echo "=============================================="
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "DRY RUN - No changes made"
  echo ""
  echo "To apply fixes, run:"
  echo "  ./bulk-fix-violations.sh"
else
  echo -e "${GREEN}✓ console.log statements removed${NC}"
  echo -e "${YELLOW}⚠ waitForTimeout instances logged to reports/waitForTimeout-review.md${NC}"
  echo -e "${YELLOW}⚠ Conditional skips logged to reports/conditional-skips-review.md${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Review reports/waitForTimeout-review.md and fix manually"
  echo "2. Review reports/conditional-skips-review.md and convert to test.fail()"
  echo "3. Run tests to verify no regressions"
fi
