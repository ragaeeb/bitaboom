This summarizes the "global inflation" bug found in bitaboom v2.4.0 and the fix applied.

### The Bug (Global Inflation)

**Issue**: The token estimation logic for Arabic diacritics was incorrectly applying a penalty to the *entire* Arabic text block if *any* diacritics were present.

**Old Code (Multiplicative)**:
```typescript
// If even ONE diacritic exists (arabicDiacritics > 0), 
// multiply the ENTIRE base token count by (1 + overhead)
const diacriticCost = arabicDiacritics > 0 ? baseTokens * config.diacriticOverhead : 0;
tokens += baseTokens + diacriticCost;
```

**Consequence**: 
If you had a large text block (e.g., 2000 chars) with a single tiny diacritic (e.g., one kasra `ِ`), the function would trigger the `arabicDiacritics > 0` condition and apply a ~15% overhead to all 2000 chars. 
- Plain text: ~1000 tokens.
- Plain text + 1 diacritic: ~1150 tokens. (Jump of 150 tokens for 1 char!)

This caused massive discrepancies when concatenating multiple excerpts. Individually they were estimated as plain text (sum = 10k), but when joined into a prompt, if just one excerpt had a diacritic, the whole prompt was estimated at ~11.5k.

### The Fix (Additive)

**Solution**: Change the logic to be *additive* per diacritic. We assume each diacritic adds a small fixed cost (representing the extra token complexity usually associated with voweled text).

**New Code (Additive)**:
```typescript
// Always add base tokens first
tokens += baseTokens;

// Then add specific cost for the actual count of diacritics found
if (arabicDiacritics > 0) {
    tokens += arabicDiacritics * config.diacriticOverhead;
}
```

**Result**:
- Plain text: ~1000 tokens.
- Plain text + 1 diacritic: ~1000.2 tokens. (Jump of 0.2 tokens).
- Fully voweled text (1000 chars + 1000 diacritics): ~1000 + 150 = 1150 tokens.

This preserves the overhead for fully voweled text while preventing a single stray diacritic from inflating simple text.

### Verification
A production regression test `Regression Tests > should avoid global inflation` was added to `arabic.test.ts`. It verifies that `count(plain) + count(diacritic)` is approximately equal to `count(plain + diacritic)`.
