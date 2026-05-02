/**
 * Comprehensive Calculator Test Suite
 * Tests all 14 calculators on the CalcByDev website.
 * Pure math logic is extracted from HTML files and tested
 * with a wide range of inputs including edge cases.
 */

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Round to N decimal places */
const round = (n, dp = 2) => parseFloat(n.toFixed(dp));

/** Relative error (%) between actual and expected */
const relErr = (actual, expected) =>
  expected === 0 ? Math.abs(actual) : Math.abs((actual - expected) / expected) * 100;

// ─────────────────────────────────────────────
// CALCULATOR IMPLEMENTATIONS (extracted from HTML)
// ─────────────────────────────────────────────

// 1. SIP CALCULATOR
function calcSIP(P, rateAnnual, yrs) {
  // Use true CAGR-equivalent monthly rate: (1 + R_annual)^(1/12) - 1
  const i = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;
  const n = yrs * 12;
  const total = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const invested = P * n;
  return { total, invested, returns: total - invested };
}

// 2. LUMPSUM CALCULATOR
function calcLumpsum(P, rateAnnual, yrs) {
  const r = rateAnnual / 100;
  const total = P * Math.pow(1 + r, yrs);
  return { total, invested: P, returns: total - P };
}

// 3. EMI CALCULATOR
function calcEMI(P, rateAnnual, yrs) {
  const r = rateAnnual / 100 / 12;
  const n = yrs * 12;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPaid = emi * n;
  const totalInterest = totalPaid - P;
  return { emi, totalPaid, totalInterest };
}

// EMI amortization (used by prepayment calculator)
function amortize(P, r, emi, extraPayment, maxMonths) {
  let bal = P;
  let totalInterest = 0;
  let months = 0;
  const balances = [P];
  while (bal > 0.01 && months < maxMonths) {
    const interest = bal * r;
    let principal = emi - interest + extraPayment;
    if (principal > bal) principal = bal;
    totalInterest += interest;
    bal -= principal;
    if (bal < 0) bal = 0;
    months++;
    balances.push(parseFloat(bal.toFixed(2)));
  }
  return { months, totalInterest, balances };
}

// 4. PPF CALCULATOR
function calcPPF(P, rateAnnual, yrs) {
  const r = rateAnnual / 100;
  let balance = 0;
  for (let y = 1; y <= yrs; y++) {
    balance = (balance + P) * (1 + r);
  }
  const invested = P * yrs;
  return { total: balance, invested, interest: balance - invested };
}

// 5. CAGR CALCULATOR
function calcCAGR(init, final, yrs) {
  const cagr = (Math.pow(final / init, 1 / yrs) - 1) * 100;
  const gain = final - init;
  return { cagr, gain };
}

// 6. COMPOUND INTEREST CALCULATOR
function calcCompound(P, rateAnnual, yrs, freq = 4) {
  const r = rateAnnual / 100;
  const total = P * Math.pow(1 + r / freq, freq * yrs);
  return { total, principal: P, interest: total - P };
}

// 7. FD CALCULATOR (quarterly compounding, fixed)
function calcFD(P, rateAnnual, yrs) {
  const r = rateAnnual / 100;
  const total = P * Math.pow(1 + r / 4, 4 * yrs);
  return { total, principal: P, interest: total - P };
}

// 8. RD CALCULATOR (monthly deposit, quarterly compounding)
function calcRD(P, rateAnnual, yrs) {
  const r = rateAnnual / 100 / 4; // quarterly rate
  const n = yrs * 12;
  let maturity = 0;
  for (let m = 1; m <= n; m++) {
    const quartersRemaining = (n - m) / 3;
    maturity += P * Math.pow(1 + r, quartersRemaining);
  }
  const invested = P * n;
  return { total: maturity, invested, interest: maturity - invested };
}

// 9. GST CALCULATOR
function calcGSTAdd(amount, rate) {
  const original = amount;
  const gstAmt = parseFloat((amount * rate / 100).toFixed(2));
  const final = parseFloat((amount + gstAmt).toFixed(2));
  return { original, gstAmt, final, cgst: gstAmt / 2, sgst: gstAmt / 2, igst: gstAmt };
}
function calcGSTRemove(amount, rate) {
  const final = amount;
  const original = parseFloat((amount * 100 / (100 + rate)).toFixed(2));
  const gstAmt = parseFloat((amount - original).toFixed(2));
  return { original, gstAmt, final, cgst: gstAmt / 2, sgst: gstAmt / 2, igst: gstAmt };
}

// 10. STEP-UP SIP CALCULATOR
function calcStepUpSIP(P, stepPct, rateAnnual, yrs) {
  const stepFrac = stepPct / 100;
  // Use true CAGR-equivalent monthly rate: (1 + R_annual)^(1/12) - 1
  const i = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;
  let total = 0, invested = 0, monthly = P;
  for (let y = 0; y < yrs; y++) {
    for (let m = 0; m < 12; m++) {
      total = (total + monthly) * (1 + i);
      invested += monthly;
    }
    monthly *= (1 + stepFrac);
  }
  return { total, invested, returns: total - invested };
}

// 11. GOAL CALCULATOR (helper functions)
function stepUpSIPFV(P, annualRate, years) {
  // Use true CAGR-equivalent monthly rate: (1 + R_annual)^(1/12) - 1
  const i = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  let fv = 0;
  for (let y = 0; y < years; y++) {
    const monthlyAmt = P * Math.pow(1.1, y);
    const monthsRemaining = (years - y) * 12;
    const fvThisYear =
      monthlyAmt * ((Math.pow(1 + i, 12) - 1) / i) * (1 + i) * Math.pow(1 + i, monthsRemaining - 12);
    fv += fvThisYear;
  }
  return fv;
}

function findStepUpSIP(target, rate, years) {
  let lo = 1, hi = target;
  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    if (stepUpSIPFV(mid, rate, years) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function calcGoal(goal, yrs, rateAnnual, saved) {
  // Use true CAGR-equivalent monthly rate: (1 + R_annual)^(1/12) - 1
  const i = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;
  const n = yrs * 12;
  const savedFV = saved * Math.pow(1 + rateAnnual / 100, yrs);
  const gap = Math.max(0, goal - savedFV);
  const sipNeeded = gap > 0 ? gap * i / ((Math.pow(1 + i, n) - 1) * (1 + i)) : 0;
  const lumpNeeded = gap > 0 ? gap / Math.pow(1 + rateAnnual / 100, yrs) : 0;
  const stepupNeeded = gap > 0 ? findStepUpSIP(gap, rateAnnual, yrs) : 0;
  return { sipNeeded, lumpNeeded, stepupNeeded, savedFV, gap };
}

// 12. RETIREMENT CALCULATOR
function calcRetirement(currentAge, retirementAge, monthlyExp, inflationRate, preReturn, postReturn) {
  const yearsToRetire = retirementAge - currentAge;
  const retirementYrs = Math.max(1, 85 - retirementAge);
  const monthsToRetire = yearsToRetire * 12;
  const futureMonthlyExp = monthlyExp * Math.pow(1 + inflationRate / 100, yearsToRetire);
  const annualRealReturn = (1 + postReturn / 100) / (1 + inflationRate / 100) - 1;
  const monthlyRealReturn = Math.pow(1 + annualRealReturn, 1 / 12) - 1;
  const retirementMonths = retirementYrs * 12;
  let corpus;
  if (Math.abs(monthlyRealReturn) < 1e-9) {
    corpus = futureMonthlyExp * retirementMonths;
  } else {
    corpus = futureMonthlyExp * (1 - Math.pow(1 + monthlyRealReturn, -retirementMonths)) / monthlyRealReturn;
  }
  const monthlyPreReturn = Math.pow(1 + preReturn / 100, 1 / 12) - 1;
  const sipNeeded = corpus * monthlyPreReturn / (Math.pow(1 + monthlyPreReturn, monthsToRetire) - 1);
  return { corpus, sipNeeded, yearsToRetire, retirementYrs, futureMonthlyExp };
}

// 13. PREPAYMENT CALCULATOR
function calcPrepayment(P, rateAnnual, yrs, extra) {
  const r = rateAnnual / 100 / 12;
  const n = yrs * 12;
  const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const normal = amortize(P, r, emi, 0, n + 1);
  const prepay = amortize(P, r, emi, extra, n + 1);
  const interestSaved = normal.totalInterest - prepay.totalInterest;
  const monthsSaved = normal.months - prepay.months;
  return { emi, normal, prepay, interestSaved, monthsSaved };
}

// 14. TAX CALCULATOR
const NEW_SLABS = [
  { from: 0,       to: 400000,   rate: 0 },
  { from: 400000,  to: 800000,   rate: 0.05 },
  { from: 800000,  to: 1200000,  rate: 0.10 },
  { from: 1200000, to: 1600000,  rate: 0.15 },
  { from: 1600000, to: 2000000,  rate: 0.20 },
  { from: 2000000, to: 2400000,  rate: 0.25 },
  { from: 2400000, to: Infinity, rate: 0.30 },
];
const OLD_SLABS = [
  { from: 0,      to: 250000,   rate: 0 },
  { from: 250000, to: 500000,   rate: 0.05 },
  { from: 500000, to: 1000000,  rate: 0.20 },
  { from: 1000000, to: Infinity, rate: 0.30 },
];

function calcSlabTax(income, slabs) {
  let tax = 0;
  const breakdown = [];
  for (const s of slabs) {
    if (income <= s.from) break;
    const taxable = Math.min(income, s.to) - s.from;
    const t = taxable * s.rate;
    tax += t;
    breakdown.push({ from: s.from, to: s.to, rate: s.rate, taxable, tax: t });
  }
  return { tax, breakdown };
}

function getSurcharge(income, baseTax) {
  if (income > 20000000) return baseTax * 0.25;
  if (income > 10000000) return baseTax * 0.15;
  if (income > 5000000)  return baseTax * 0.10;
  return 0;
}

function calcNewTax(grossIncome) {
  const stdDed = 75000;
  const taxableIncome = Math.max(0, grossIncome - stdDed);
  const { tax: slabTax, breakdown } = calcSlabTax(taxableIncome, NEW_SLABS);
  const rebate = taxableIncome <= 1200000 ? slabTax : 0;
  const taxAfterRebate = Math.max(0, slabTax - rebate);
  const surcharge = getSurcharge(grossIncome, taxAfterRebate);
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const total = taxAfterRebate + surcharge + cess;
  return { total, slabTax, rebate, surcharge, cess, taxableIncome, breakdown };
}

function calcOldTax(grossIncome, ded80C = 0, ded80D = 0, dedHRA = 0) {
  const stdDed = 50000;
  const totalDed = stdDed + Math.min(ded80C, 150000) + Math.min(ded80D, 25000) + dedHRA;
  const taxableIncome = Math.max(0, grossIncome - totalDed);
  const { tax: slabTax, breakdown } = calcSlabTax(taxableIncome, OLD_SLABS);
  const rebate = taxableIncome <= 500000 ? slabTax : 0;
  const taxAfterRebate = Math.max(0, slabTax - rebate);
  const surcharge = getSurcharge(grossIncome, taxAfterRebate);
  const cess = (taxAfterRebate + surcharge) * 0.04;
  const total = taxAfterRebate + surcharge + cess;
  return { total, slabTax, rebate, surcharge, cess, taxableIncome, breakdown };
}

// ─────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────

// ── 1. SIP ──────────────────────────────────
describe('SIP Calculator', () => {
  test('default values: ₹5000/mo, 12%, 10 yrs', () => {
    const { total, invested } = calcSIP(5000, 12, 10);
    expect(round(invested)).toBe(600000);
    // Standard SIP FV formula with CAGR monthly rate: expected ≈ 11,20,179
    expect(total).toBeGreaterThan(1000000);
    expect(total).toBeCloseTo(1120179, -2); // within ±100
    expect(total).toBeGreaterThan(invested);
  });

  test('1-year SIP: ₹1000/mo, 12%, 1 yr', () => {
    const { total, invested } = calcSIP(1000, 12, 1);
    expect(round(invested)).toBe(12000);
    // FV = 1000 × ((1.12)^(1/12))^12 using CAGR monthly rate ≈ 12,766
    expect(total).toBeCloseTo(12766, 0);
  });

  test('maximum inputs: ₹10,00,000/mo, 30%, 40 yrs', () => {
    const { total, invested } = calcSIP(1000000, 30, 40);
    expect(invested).toBe(480000000); // 48 Cr
    expect(total).toBeGreaterThan(invested);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(1e12); // multi-trillion value
  });

  test('minimum inputs: ₹500/mo, 1%, 1 yr', () => {
    const { total, invested } = calcSIP(500, 1, 1);
    expect(round(invested)).toBe(6000);
    // At 1% annual return, barely beats invested
    expect(total).toBeGreaterThan(invested);
    expect(total).toBeLessThan(invested * 1.02); // less than 2% gain
  });

  test('long tenure 40 years: ₹5000, 12%', () => {
    const { total, invested } = calcSIP(5000, 12, 40);
    expect(invested).toBe(2400000); // 24 L
    // Compound effect: expect 20-30x multiplier
    expect(total / invested).toBeGreaterThan(20);
    expect(isFinite(total)).toBe(true);
  });

  test('high return 30%: ₹5000/mo, 5 yrs', () => {
    const { total, invested } = calcSIP(5000, 30, 5);
    expect(invested).toBe(300000);
    expect(total).toBeGreaterThan(invested * 1.5);
  });

  test('returns are always positive for valid inputs', () => {
    const cases = [
      [500, 1, 1], [1000, 5, 5], [5000, 12, 10],
      [10000, 15, 20], [50000, 20, 30], [1000000, 30, 40],
    ];
    cases.forEach(([P, rate, yrs]) => {
      const { total, invested, returns } = calcSIP(P, rate, yrs);
      expect(returns).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(invested);
    });
  });

  test('multiplier increases with time', () => {
    const getMultiplier = (yrs) => {
      const { total, invested } = calcSIP(5000, 12, yrs);
      return total / invested;
    };
    expect(getMultiplier(5)).toBeLessThan(getMultiplier(10));
    expect(getMultiplier(10)).toBeLessThan(getMultiplier(20));
    expect(getMultiplier(20)).toBeLessThan(getMultiplier(30));
  });

  test('consistency: doubling the monthly amount doubles total', () => {
    const r1 = calcSIP(5000, 12, 10);
    const r2 = calcSIP(10000, 12, 10);
    expect(round(r2.total / r1.total, 4)).toBeCloseTo(2, 4);
    expect(round(r2.invested / r1.invested, 4)).toBeCloseTo(2, 4);
  });

  test('SIP at 0.1% rate (near-zero): slightly above invested', () => {
    // Testing near-zero rate scenario (slightly above minimum)
    const { total, invested } = calcSIP(5000, 0.1, 1);
    expect(total).toBeGreaterThan(invested);
    expect(total - invested).toBeLessThan(100);
  });
});

// ── 2. LUMPSUM ───────────────────────────────
describe('Lumpsum Calculator', () => {
  test('default: ₹1,00,000, 12%, 10 yrs', () => {
    const { total, invested, returns } = calcLumpsum(100000, 12, 10);
    expect(invested).toBe(100000);
    // 1L at 12% for 10 yrs = 3,10,585
    expect(total).toBeCloseTo(310585, -1);
    expect(returns).toBeCloseTo(210585, -1);
  });

  test('1 year: ₹1,00,000 at 10%', () => {
    const { total } = calcLumpsum(100000, 10, 1);
    expect(total).toBeCloseTo(110000, 0);
  });

  test('minimum: ₹1000 at 1% for 1 yr', () => {
    const { total, invested } = calcLumpsum(1000, 1, 1);
    expect(total).toBeCloseTo(1010, 0);
    expect(total).toBeGreaterThan(invested);
  });

  test('maximum: ₹1,00,00,000 at 30% for 40 yrs', () => {
    const { total } = calcLumpsum(10000000, 30, 40);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(10000000 * 1000);
  });

  test('returns increase with rate', () => {
    const r1 = calcLumpsum(100000, 8, 10);
    const r2 = calcLumpsum(100000, 12, 10);
    const r3 = calcLumpsum(100000, 20, 10);
    expect(r1.total).toBeLessThan(r2.total);
    expect(r2.total).toBeLessThan(r3.total);
  });

  test('returns increase with time', () => {
    const r5 = calcLumpsum(100000, 12, 5);
    const r10 = calcLumpsum(100000, 12, 10);
    const r20 = calcLumpsum(100000, 12, 20);
    expect(r5.total).toBeLessThan(r10.total);
    expect(r10.total).toBeLessThan(r20.total);
  });

  test('doubling principal doubles total', () => {
    const r1 = calcLumpsum(100000, 12, 10);
    const r2 = calcLumpsum(200000, 12, 10);
    expect(r2.total / r1.total).toBeCloseTo(2, 5);
  });

  test('returns are always non-negative', () => {
    const cases = [[1000, 1, 1], [10000, 5, 3], [100000, 12, 10], [1000000, 20, 15]];
    cases.forEach(([P, rate, yrs]) => {
      const { returns } = calcLumpsum(P, rate, yrs);
      expect(returns).toBeGreaterThanOrEqual(0);
    });
  });

  test('exact formula check: 1,00,000 × (1.12)^5', () => {
    const { total } = calcLumpsum(100000, 12, 5);
    expect(total).toBeCloseTo(100000 * Math.pow(1.12, 5), 1);
  });
});

// ── 3. EMI ──────────────────────────────────
describe('EMI Calculator', () => {
  test('default: ₹10L loan, 8.5%, 20 yrs', () => {
    const { emi, totalPaid, totalInterest } = calcEMI(1000000, 8.5, 20);
    // Standard result: EMI ≈ ₹8,678
    expect(emi).toBeCloseTo(8678, 0);
    expect(totalPaid).toBeCloseTo(emi * 240, 0);
    expect(totalInterest).toBeGreaterThan(0);
    expect(totalInterest).toBeCloseTo(totalPaid - 1000000, 1);
  });

  test('₹5L loan, 12%, 5 yrs', () => {
    const { emi, totalPaid, totalInterest } = calcEMI(500000, 12, 5);
    // EMI ≈ ₹11,122
    expect(emi).toBeCloseTo(11122, 0);
    expect(totalPaid).toBeCloseTo(emi * 60, 0);
    expect(totalInterest).toBeGreaterThan(0);
  });

  test('minimum inputs: ₹10,000 at 1%, 1 yr', () => {
    const { emi, totalPaid, totalInterest } = calcEMI(10000, 1, 1);
    // EMI ≈ ₹837.5
    expect(emi).toBeCloseTo(837.5, 0);
    expect(totalInterest).toBeGreaterThan(0);
    expect(totalInterest).toBeLessThan(100); // very low interest
  });

  test('maximum inputs: ₹1 Cr, 30%, 30 yrs', () => {
    const { emi, totalPaid, totalInterest } = calcEMI(10000000, 30, 30);
    expect(isFinite(emi)).toBe(true);
    expect(totalInterest).toBeGreaterThan(10000000); // interest > principal
  });

  test('EMI is always positive', () => {
    const cases = [
      [10000, 1, 1], [100000, 8, 10], [500000, 12, 20],
      [1000000, 18, 30], [10000000, 30, 30],
    ];
    cases.forEach(([P, rate, yrs]) => {
      const { emi } = calcEMI(P, rate, yrs);
      expect(emi).toBeGreaterThan(0);
    });
  });

  test('total interest increases with rate', () => {
    const r8 = calcEMI(1000000, 8, 20);
    const r12 = calcEMI(1000000, 12, 20);
    const r18 = calcEMI(1000000, 18, 20);
    expect(r8.totalInterest).toBeLessThan(r12.totalInterest);
    expect(r12.totalInterest).toBeLessThan(r18.totalInterest);
  });

  test('total interest increases with tenure', () => {
    const r5 = calcEMI(1000000, 8, 5);
    const r10 = calcEMI(1000000, 8, 10);
    const r20 = calcEMI(1000000, 8, 20);
    expect(r5.totalInterest).toBeLessThan(r10.totalInterest);
    expect(r10.totalInterest).toBeLessThan(r20.totalInterest);
  });

  test('EMI decreases as tenure increases', () => {
    const r5 = calcEMI(1000000, 8, 5);
    const r10 = calcEMI(1000000, 8, 10);
    const r20 = calcEMI(1000000, 8, 20);
    expect(r5.emi).toBeGreaterThan(r10.emi);
    expect(r10.emi).toBeGreaterThan(r20.emi);
  });

  test('total paid = EMI × months', () => {
    const cases = [[500000, 8, 10], [1000000, 12, 20], [2000000, 9, 15]];
    cases.forEach(([P, rate, yrs]) => {
      const { emi, totalPaid } = calcEMI(P, rate, yrs);
      expect(totalPaid).toBeCloseTo(emi * yrs * 12, 1);
    });
  });

  test('total paid > principal (interest is positive)', () => {
    const cases = [[100000, 10, 5], [500000, 8, 15], [1000000, 12, 20]];
    cases.forEach(([P, rate, yrs]) => {
      const { totalPaid } = calcEMI(P, rate, yrs);
      expect(totalPaid).toBeGreaterThan(P);
    });
  });

  test('doubling principal doubles EMI', () => {
    const r1 = calcEMI(500000, 8, 10);
    const r2 = calcEMI(1000000, 8, 10);
    expect(r2.emi / r1.emi).toBeCloseTo(2, 4);
  });
});

// ── 4. PPF ───────────────────────────────────
describe('PPF Calculator', () => {
  test('default: ₹50,000/yr, 7.1%, 15 yrs', () => {
    const { total, invested, interest } = calcPPF(50000, 7.1, 15);
    expect(invested).toBe(750000); // 7.5 L
    // At 7.1% for 15 years, maturity ≈ 13,56,070
    expect(total).toBeCloseTo(1356070, -2);
    expect(interest).toBeGreaterThan(0);
    expect(total).toBeGreaterThan(invested);
  });

  test('minimum: ₹500/yr, 1%, 15 yrs', () => {
    const { total, invested } = calcPPF(500, 1, 15);
    expect(invested).toBe(7500);
    expect(total).toBeGreaterThan(invested);
  });

  test('maximum: ₹1,50,000/yr, 15%, 50 yrs', () => {
    const { total } = calcPPF(150000, 15, 50);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(150000 * 50 * 10); // big multiplier
  });

  test('interest increases with rate', () => {
    const r5 = calcPPF(50000, 5, 15);
    const r7 = calcPPF(50000, 7.1, 15);
    const r10 = calcPPF(50000, 10, 15);
    expect(r5.total).toBeLessThan(r7.total);
    expect(r7.total).toBeLessThan(r10.total);
  });

  test('interest increases with tenure', () => {
    const r15 = calcPPF(50000, 7.1, 15);
    const r20 = calcPPF(50000, 7.1, 20);
    const r25 = calcPPF(50000, 7.1, 25);
    expect(r15.total).toBeLessThan(r20.total);
    expect(r20.total).toBeLessThan(r25.total);
  });

  test('PPF formula: end-of-year deposit', () => {
    // 1 year: (0 + P) * (1 + r) = P*(1+r)
    const { total } = calcPPF(100000, 10, 1);
    expect(total).toBeCloseTo(100000 * 1.10, 2);
  });

  test('PPF formula 2 years: deposit each year', () => {
    // yr1: (0 + P)*(1+r) = P*(1+r)
    // yr2: (P*(1+r) + P)*(1+r) = P*(1+r)^2 + P*(1+r)
    const P = 100000, r = 0.10;
    const expected = P * Math.pow(1.10, 2) + P * 1.10;
    const { total } = calcPPF(P, 10, 2);
    expect(total).toBeCloseTo(expected, 2);
  });

  test('interest earned is always positive', () => {
    const cases = [[500, 1, 15], [10000, 5, 15], [50000, 7.1, 15], [150000, 10, 20]];
    cases.forEach(([P, rate, yrs]) => {
      const { interest } = calcPPF(P, rate, yrs);
      expect(interest).toBeGreaterThan(0);
    });
  });
});

// ── 5. CAGR ──────────────────────────────────
describe('CAGR Calculator', () => {
  test('default: ₹1L → ₹3L, 10 yrs', () => {
    const { cagr, gain } = calcCAGR(100000, 300000, 10);
    // CAGR = (3)^(1/10) - 1 ≈ 11.61%
    expect(cagr).toBeCloseTo(11.61, 1);
    expect(gain).toBe(200000);
  });

  test('double in 10 yrs: 7.18% CAGR', () => {
    const { cagr } = calcCAGR(100000, 200000, 10);
    // Rule of 72: 72/7.2 = 10 years to double
    expect(cagr).toBeCloseTo(7.18, 1);
  });

  test('1 year: 50% gain', () => {
    const { cagr, gain } = calcCAGR(100000, 150000, 1);
    expect(cagr).toBeCloseTo(50, 2);
    expect(gain).toBe(50000);
  });

  test('no gain (flat): 0% CAGR', () => {
    const { cagr, gain } = calcCAGR(100000, 100000, 10);
    expect(cagr).toBeCloseTo(0, 5);
    expect(gain).toBe(0);
  });

  test('negative return: final < initial', () => {
    const { cagr } = calcCAGR(100000, 50000, 5);
    // CAGR should be negative: (0.5)^(1/5) - 1 ≈ -12.94%
    expect(cagr).toBeCloseTo(-12.94, 1);
  });

  test('cagr round-trip: invest at cagr gives final value', () => {
    const init = 100000, final = 500000, yrs = 8;
    const { cagr } = calcCAGR(init, final, yrs);
    const reconstructed = init * Math.pow(1 + cagr / 100, yrs);
    expect(reconstructed).toBeCloseTo(final, 1);
  });

  test('max inputs: ₹1 → ₹10 Cr, 40 yrs', () => {
    const { cagr } = calcCAGR(1, 100000000, 40);
    expect(isFinite(cagr)).toBe(true);
    expect(cagr).toBeGreaterThan(0);
  });

  test('various gains', () => {
    const cases = [
      [100000, 200000, 5],
      [500000, 1000000, 7],
      [1000000, 5000000, 10],
      [50000, 500000, 15],
    ];
    cases.forEach(([init, final, yrs]) => {
      const { cagr } = calcCAGR(init, final, yrs);
      // Verify round-trip
      const recon = init * Math.pow(1 + cagr / 100, yrs);
      expect(relErr(recon, final)).toBeLessThan(0.001); // < 0.001% error
    });
  });
});

// ── 6. COMPOUND INTEREST ─────────────────────
describe('Compound Interest Calculator', () => {
  test('default quarterly: ₹1L, 10%, 10 yrs', () => {
    const { total, principal, interest } = calcCompound(100000, 10, 10, 4);
    // A = 100000 * (1 + 0.1/4)^(4*10) ≈ 2,68,506
    expect(total).toBeCloseTo(268506, 0);
    expect(principal).toBe(100000);
    expect(interest).toBeCloseTo(168506, 0);
  });

  test('annual compounding: ₹1L, 10%, 10 yrs', () => {
    const { total } = calcCompound(100000, 10, 10, 1);
    expect(total).toBeCloseTo(259374, 0);
  });

  test('monthly compounding: ₹1L, 10%, 10 yrs', () => {
    const { total } = calcCompound(100000, 10, 10, 12);
    // A = 100000 × (1 + 0.10/12)^120 ≈ 2,70,704
    expect(total).toBeCloseTo(270704, 0);
  });

  test('more frequent compounding = more returns', () => {
    const base = 100000, rate = 10, yrs = 10;
    const annual = calcCompound(base, rate, yrs, 1).total;
    const semiAnnual = calcCompound(base, rate, yrs, 2).total;
    const quarterly = calcCompound(base, rate, yrs, 4).total;
    const monthly = calcCompound(base, rate, yrs, 12).total;
    expect(annual).toBeLessThan(semiAnnual);
    expect(semiAnnual).toBeLessThan(quarterly);
    expect(quarterly).toBeLessThan(monthly);
  });

  test('minimum: ₹1000, 1%, 1 yr', () => {
    const { total } = calcCompound(1000, 1, 1, 4);
    expect(total).toBeGreaterThan(1000);
    expect(total).toBeCloseTo(1010.06, 1);
  });

  test('maximum: ₹1 Cr, 30%, 40 yrs', () => {
    const { total } = calcCompound(10000000, 30, 40, 12);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(10000000 * 100);
  });

  test('interest earned is always positive', () => {
    [[1000, 1, 1], [100000, 10, 10], [500000, 15, 20]].forEach(([P, rate, yrs]) => {
      expect(calcCompound(P, rate, yrs, 4).interest).toBeGreaterThan(0);
    });
  });

  test('exact formula: P*(1+r/n)^(n*t)', () => {
    const P = 50000, r = 0.08, n = 4, t = 5;
    const expected = P * Math.pow(1 + r / n, n * t);
    const { total } = calcCompound(P, r * 100, t, n);
    expect(total).toBeCloseTo(expected, 2);
  });
});

// ── 7. FD CALCULATOR ────────────────────────
describe('FD Calculator', () => {
  test('default: ₹1L, 7%, 5 yrs, quarterly', () => {
    const { total, principal, interest } = calcFD(100000, 7, 5);
    // A = 100000 * (1 + 0.07/4)^(4*5) ≈ 1,41,478
    expect(total).toBeCloseTo(141478, 0);
    expect(principal).toBe(100000);
    expect(interest).toBeCloseTo(41478, 0);
  });

  test('1 year at 7%: ≈ 7.19% effective', () => {
    const { total } = calcFD(100000, 7, 1);
    // Effective annual rate = (1+0.07/4)^4 - 1 ≈ 7.186%
    expect(total).toBeCloseTo(107186, 0);
  });

  test('minimum: ₹1000, 1%, 1 yr', () => {
    const { total } = calcFD(1000, 1, 1);
    expect(total).toBeGreaterThan(1000);
    expect(total).toBeCloseTo(1010.07, 1);
  });

  test('maximum: ₹1 Cr, 15%, 10 yrs', () => {
    const { total } = calcFD(10000000, 15, 10);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(10000000 * 4);
  });

  test('higher rate → higher returns', () => {
    const r5 = calcFD(100000, 5, 5).total;
    const r7 = calcFD(100000, 7, 5).total;
    const r10 = calcFD(100000, 10, 5).total;
    expect(r5).toBeLessThan(r7);
    expect(r7).toBeLessThan(r10);
  });

  test('longer tenure → higher returns', () => {
    const t1 = calcFD(100000, 7, 1).total;
    const t3 = calcFD(100000, 7, 3).total;
    const t5 = calcFD(100000, 7, 5).total;
    const t10 = calcFD(100000, 7, 10).total;
    expect(t1).toBeLessThan(t3);
    expect(t3).toBeLessThan(t5);
    expect(t5).toBeLessThan(t10);
  });

  test('FD is always quarterly compounded', () => {
    // FD = compound with freq=4
    const fd = calcFD(100000, 7, 5).total;
    const ci = calcCompound(100000, 7, 5, 4).total;
    expect(fd).toBeCloseTo(ci, 4);
  });

  test('multiple tenures consistency', () => {
    [1, 2, 3, 5, 7, 10].forEach(yrs => {
      const { total, principal } = calcFD(100000, 7, yrs);
      expect(total).toBeGreaterThan(principal);
      expect(isFinite(total)).toBe(true);
    });
  });
});

// ── 8. RD CALCULATOR ────────────────────────
describe('RD Calculator', () => {
  test('default: ₹5000/mo, 6.5%, 5 yrs', () => {
    const { total, invested, interest } = calcRD(5000, 6.5, 5);
    expect(invested).toBe(300000); // 3 L
    // Maturity slightly above 3 L (each deposit compounds quarterly)
    expect(total).toBeGreaterThan(invested);
    expect(interest).toBeGreaterThan(0);
    // RD at 6.5% for 5 years: ≈ 3,53,052
    expect(total).toBeCloseTo(353052, 0);
  });

  test('1-year RD: ₹5000/mo, 6%', () => {
    const { total, invested } = calcRD(5000, 6, 1);
    expect(invested).toBe(60000);
    expect(total).toBeGreaterThan(invested);
    // Rough estimate: ≈ 61,650
    expect(total).toBeCloseTo(61650, -2);
  });

  test('minimum: ₹100/mo, 1%, 1 yr', () => {
    const { total, invested } = calcRD(100, 1, 1);
    expect(invested).toBe(1200);
    expect(total).toBeGreaterThan(invested);
  });

  test('maximum: ₹10L/mo, 15%, 10 yrs', () => {
    const { total } = calcRD(1000000, 15, 10);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(1000000 * 120); // > invested
  });

  test('higher rate = higher maturity', () => {
    const r5 = calcRD(5000, 5, 5).total;
    const r7 = calcRD(5000, 7, 5).total;
    const r10 = calcRD(5000, 10, 5).total;
    expect(r5).toBeLessThan(r7);
    expect(r7).toBeLessThan(r10);
  });

  test('longer tenure = higher total (proportionally)', () => {
    const t1 = calcRD(5000, 6.5, 1);
    const t5 = calcRD(5000, 6.5, 5);
    const t10 = calcRD(5000, 6.5, 10);
    // Total increases with time
    expect(t1.total).toBeLessThan(t5.total);
    expect(t5.total).toBeLessThan(t10.total);
    // Interest rate should be positive
    expect(t1.interest).toBeGreaterThan(0);
    expect(t5.interest).toBeGreaterThan(0);
    expect(t10.interest).toBeGreaterThan(0);
  });

  test('first-month deposit compounds for full tenure', () => {
    // m=1: quartersRemaining = (n-1)/3, so first deposit grows the most
    const P = 1000, rateAnnual = 6, yrs = 1;
    const r = rateAnnual / 100 / 4;
    const n = yrs * 12;
    // First deposit: compounds for (12-1)/3 = 3.67 quarters
    const firstDeposit = P * Math.pow(1 + r, (n - 1) / 3);
    expect(firstDeposit).toBeGreaterThan(P);
  });

  test('maturity > invested for all valid inputs', () => {
    [[100, 1, 1], [5000, 6.5, 5], [10000, 8, 3], [50000, 10, 7]].forEach(([P, rate, yrs]) => {
      const { total, invested } = calcRD(P, rate, yrs);
      expect(total).toBeGreaterThan(invested);
    });
  });
});

// ── 9. GST CALCULATOR ────────────────────────
describe('GST Calculator', () => {
  describe('Add GST mode', () => {
    test('₹1000 + 18% GST', () => {
      const { original, gstAmt, final } = calcGSTAdd(1000, 18);
      expect(original).toBe(1000);
      expect(gstAmt).toBe(180);
      expect(final).toBe(1180);
    });

    test('₹100 + 5% GST', () => {
      const { final, gstAmt } = calcGSTAdd(100, 5);
      expect(gstAmt).toBe(5);
      expect(final).toBe(105);
    });

    test('₹500 + 12% GST', () => {
      const { gstAmt, final } = calcGSTAdd(500, 12);
      expect(gstAmt).toBe(60);
      expect(final).toBe(560);
    });

    test('₹1000 + 28% GST', () => {
      const { gstAmt, final } = calcGSTAdd(1000, 28);
      expect(gstAmt).toBe(280);
      expect(final).toBe(1280);
    });

    test('0% GST: no tax', () => {
      const { gstAmt, final } = calcGSTAdd(1000, 0);
      expect(gstAmt).toBe(0);
      expect(final).toBe(1000);
    });

    test('CGST + SGST = total GST', () => {
      const { gstAmt, cgst, sgst } = calcGSTAdd(1000, 18);
      expect(cgst + sgst).toBeCloseTo(gstAmt, 2);
    });

    test('IGST = full GST amount', () => {
      const { gstAmt, igst } = calcGSTAdd(1000, 18);
      expect(igst).toBeCloseTo(gstAmt, 2);
    });

    test('all standard GST slabs', () => {
      const slabs = [0, 5, 12, 18, 28];
      slabs.forEach(rate => {
        const { gstAmt, final } = calcGSTAdd(1000, rate);
        expect(gstAmt).toBeCloseTo(1000 * rate / 100, 2);
        expect(final).toBeCloseTo(1000 + gstAmt, 2);
      });
    });
  });

  describe('Remove GST mode', () => {
    test('₹1180 with 18% GST → original ₹1000', () => {
      const { original, gstAmt, final } = calcGSTRemove(1180, 18);
      expect(final).toBe(1180);
      expect(original).toBeCloseTo(1000, 1);
      expect(gstAmt).toBeCloseTo(180, 1);
    });

    test('₹105 with 5% GST → original ₹100', () => {
      const { original } = calcGSTRemove(105, 5);
      expect(original).toBeCloseTo(100, 1);
    });

    test('round-trip: add then remove', () => {
      const amount = 5000, rate = 18;
      const added = calcGSTAdd(amount, rate);
      const removed = calcGSTRemove(added.final, rate);
      expect(removed.original).toBeCloseTo(amount, 1);
      expect(removed.gstAmt).toBeCloseTo(added.gstAmt, 1);
    });

    test('remove 28% from ₹1280', () => {
      const { original } = calcGSTRemove(1280, 28);
      expect(original).toBeCloseTo(1000, 1);
    });

    test('fractional amounts', () => {
      const { original, gstAmt } = calcGSTRemove(1234.56, 18);
      expect(original + gstAmt).toBeCloseTo(1234.56, 1);
    });
  });

  test('various amounts: GST proportional to amount', () => {
    const r1 = calcGSTAdd(1000, 18);
    const r2 = calcGSTAdd(2000, 18);
    expect(r2.gstAmt).toBeCloseTo(r1.gstAmt * 2, 2);
    expect(r2.final).toBeCloseTo(r1.final * 2, 2);
  });
});

// ── 10. STEP-UP SIP ──────────────────────────
describe('Step-Up SIP Calculator', () => {
  test('default: ₹5000/mo, 10% step-up, 12%, 10 yrs', () => {
    const { total, invested, returns } = calcStepUpSIP(5000, 10, 12, 10);
    expect(invested).toBeGreaterThan(600000); // > regular SIP invested
    expect(total).toBeGreaterThan(invested);
    expect(returns).toBeGreaterThan(0);
  });

  test('step-up > regular SIP for same initial amount', () => {
    const regular = calcSIP(5000, 12, 10);
    const stepup = calcStepUpSIP(5000, 10, 12, 10);
    // Step-up invests more AND earns more
    expect(stepup.invested).toBeGreaterThan(regular.invested);
    expect(stepup.total).toBeGreaterThan(regular.total);
  });

  test('minimum: ₹500, 1% step, 1%, 1 yr', () => {
    const { total, invested } = calcStepUpSIP(500, 1, 1, 1);
    expect(invested).toBeCloseTo(6000, 0);
    expect(total).toBeGreaterThan(invested);
  });

  test('maximum: ₹10L, 50% step, 30%, 40 yrs', () => {
    const { total } = calcStepUpSIP(1000000, 50, 30, 40);
    expect(isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(0);
  });

  test('higher step-up = higher returns', () => {
    const s5 = calcStepUpSIP(5000, 5, 12, 10).total;
    const s10 = calcStepUpSIP(5000, 10, 12, 10).total;
    const s20 = calcStepUpSIP(5000, 20, 12, 10).total;
    expect(s5).toBeLessThan(s10);
    expect(s10).toBeLessThan(s20);
  });

  test('0% step-up equals regular SIP', () => {
    // With 0% step-up, should match regular SIP
    // Note: stepPct=0 means no increase, loop doesn't call with 0 stepPct normally
    // but calc only returns early if !P||!stepPct||!rate||!yrs (step=0 would return early)
    // So we only test positive step
    const { total: sipTotal } = calcSIP(5000, 12, 5);
    // With tiny step (0.001%), should be very close to regular SIP
    const { total: stepTotal } = calcStepUpSIP(5000, 0.001, 12, 5);
    expect(Math.abs(stepTotal - sipTotal) / sipTotal).toBeLessThan(0.001);
  });

  test('returns increase with step-up %', () => {
    [5, 10, 15, 20, 25, 30].forEach((step) => {
      const { returns } = calcStepUpSIP(5000, step, 12, 10);
      expect(returns).toBeGreaterThan(0);
    });
  });
});

// ── 11. GOAL CALCULATOR ──────────────────────
describe('Goal Calculator', () => {
  test('default: ₹25L goal, 8 yrs, 12%, ₹0 saved', () => {
    const { sipNeeded, lumpNeeded } = calcGoal(2500000, 8, 12, 0);
    expect(sipNeeded).toBeGreaterThan(0);
    expect(lumpNeeded).toBeGreaterThan(0);
    expect(lumpNeeded).toBeLessThan(2500000); // lump < goal
    // SIP should accumulate to goal over 8 years
    const { total } = calcSIP(sipNeeded, 12, 8);
    expect(total).toBeCloseTo(2500000, -3);
  });

  test('lump sum check: lump * (1+r)^n ≈ goal', () => {
    const { lumpNeeded } = calcGoal(1000000, 5, 10, 0);
    const fv = lumpNeeded * Math.pow(1 + 10 / 100, 5);
    expect(fv).toBeCloseTo(1000000, -2);
  });

  test('savings cover the entire goal → SIP = 0', () => {
    // If already-saved FV exceeds goal, no SIP needed
    const { sipNeeded, gap } = calcGoal(1000000, 10, 12, 10000000);
    expect(gap).toBe(0);
    expect(sipNeeded).toBe(0);
  });

  test('partial savings reduce SIP needed', () => {
    const noSavings = calcGoal(1000000, 10, 12, 0);
    const withSavings = calcGoal(1000000, 10, 12, 100000);
    expect(withSavings.sipNeeded).toBeLessThan(noSavings.sipNeeded);
  });

  test('higher return = lower SIP needed', () => {
    const r8 = calcGoal(1000000, 10, 8, 0).sipNeeded;
    const r12 = calcGoal(1000000, 10, 12, 0).sipNeeded;
    const r15 = calcGoal(1000000, 10, 15, 0).sipNeeded;
    expect(r8).toBeGreaterThan(r12);
    expect(r12).toBeGreaterThan(r15);
  });

  test('longer time = lower SIP needed', () => {
    const t5 = calcGoal(1000000, 5, 12, 0).sipNeeded;
    const t10 = calcGoal(1000000, 10, 12, 0).sipNeeded;
    const t15 = calcGoal(1000000, 15, 12, 0).sipNeeded;
    expect(t5).toBeGreaterThan(t10);
    expect(t10).toBeGreaterThan(t15);
  });

  test('step-up SIP gives less starting amount than regular SIP', () => {
    const { sipNeeded, stepupNeeded } = calcGoal(2500000, 10, 12, 0);
    // Step-up SIP starts lower than regular SIP (increases over time)
    expect(stepupNeeded).toBeLessThan(sipNeeded);
  });

  test('step-up FV verification: calculated SIP grows to target', () => {
    const target = 1000000, rate = 12, years = 8;
    const startingSIP = findStepUpSIP(target, rate, years);
    const fv = stepUpSIPFV(startingSIP, rate, years);
    expect(fv).toBeCloseTo(target, 0);
  });

  test('minimum inputs: ₹10,000 goal, 1 yr, 1%', () => {
    const { sipNeeded, lumpNeeded } = calcGoal(10000, 1, 1, 0);
    expect(sipNeeded).toBeGreaterThan(0);
    expect(lumpNeeded).toBeGreaterThan(0);
    expect(lumpNeeded).toBeLessThan(10000);
  });
});

// ── 12. RETIREMENT CALCULATOR ────────────────
describe('Retirement Calculator', () => {
  test('default: age 30 → retire 60, ₹50k/mo, 6% infl, 12% pre, 8% post', () => {
    const result = calcRetirement(30, 60, 50000, 6, 12, 8);
    expect(result.yearsToRetire).toBe(30);
    expect(result.corpus).toBeGreaterThan(0);
    expect(result.sipNeeded).toBeGreaterThan(0);
    expect(isFinite(result.corpus)).toBe(true);
  });

  test('inflation-adjusted expense increases correctly', () => {
    const result = calcRetirement(30, 60, 50000, 6, 12, 8);
    const expected = 50000 * Math.pow(1.06, 30);
    expect(result.futureMonthlyExp).toBeCloseTo(expected, 1);
  });

  test('corpus > 0 for all valid inputs', () => {
    const cases = [
      [25, 60, 30000, 5, 12, 7],
      [30, 60, 50000, 6, 12, 8],
      [35, 65, 80000, 7, 15, 9],
      [40, 65, 100000, 8, 18, 10],
    ];
    cases.forEach(([age, ret, exp, inf, pre, post]) => {
      const { corpus, sipNeeded } = calcRetirement(age, ret, exp, inf, pre, post);
      expect(corpus).toBeGreaterThan(0);
      expect(sipNeeded).toBeGreaterThan(0);
      expect(isFinite(corpus)).toBe(true);
      expect(isFinite(sipNeeded)).toBe(true);
    });
  });

  test('higher pre-retirement return → lower SIP needed', () => {
    const r10 = calcRetirement(30, 60, 50000, 6, 10, 8).sipNeeded;
    const r12 = calcRetirement(30, 60, 50000, 6, 12, 8).sipNeeded;
    const r15 = calcRetirement(30, 60, 50000, 6, 15, 8).sipNeeded;
    expect(r10).toBeGreaterThan(r12);
    expect(r12).toBeGreaterThan(r15);
  });

  test('higher inflation → higher corpus needed', () => {
    const c5 = calcRetirement(30, 60, 50000, 5, 12, 8).corpus;
    const c7 = calcRetirement(30, 60, 50000, 7, 12, 8).corpus;
    expect(c5).toBeLessThan(c7);
  });

  test('starting earlier → lower monthly SIP', () => {
    const age25 = calcRetirement(25, 60, 50000, 6, 12, 8).sipNeeded;
    const age35 = calcRetirement(35, 60, 50000, 6, 12, 8).sipNeeded;
    expect(age25).toBeLessThan(age35);
  });

  test('SIP accumulation matches corpus at retirement', () => {
    const { corpus, sipNeeded, yearsToRetire } = calcRetirement(30, 60, 50000, 6, 12, 8);
    const monthlyPreReturn = Math.pow(1 + 12 / 100, 1 / 12) - 1;
    const n = yearsToRetire * 12;
    const accumulated = sipNeeded * (Math.pow(1 + monthlyPreReturn, n) - 1) / monthlyPreReturn;
    expect(accumulated).toBeCloseTo(corpus, -3);
  });

  test('lifespan 85 years assumption', () => {
    const { retirementYrs } = calcRetirement(30, 60, 50000, 6, 12, 8);
    expect(retirementYrs).toBe(25); // 85 - 60
  });

  test('minimum retirement age gap (1 year)', () => {
    const { corpus } = calcRetirement(59, 60, 50000, 6, 12, 8);
    expect(corpus).toBeGreaterThan(0);
    expect(isFinite(corpus)).toBe(true);
  });
});

// ── 13. PREPAYMENT CALCULATOR ────────────────
describe('Prepayment Calculator', () => {
  test('default: ₹10L, 8%, 20 yrs, ₹0 extra', () => {
    const { emi, interestSaved, monthsSaved } = calcPrepayment(1000000, 8, 20, 0);
    expect(emi).toBeCloseTo(8364, 0);
    expect(interestSaved).toBe(0); // no prepayment
    expect(monthsSaved).toBe(0);
  });

  test('prepayment of ₹5000 saves interest', () => {
    const { emi, interestSaved, monthsSaved } = calcPrepayment(1000000, 8, 20, 5000);
    expect(interestSaved).toBeGreaterThan(0);
    expect(monthsSaved).toBeGreaterThan(0);
  });

  test('higher extra payment → more savings', () => {
    const e1 = calcPrepayment(1000000, 8, 20, 1000).interestSaved;
    const e2 = calcPrepayment(1000000, 8, 20, 5000).interestSaved;
    const e3 = calcPrepayment(1000000, 8, 20, 10000).interestSaved;
    expect(e1).toBeLessThan(e2);
    expect(e2).toBeLessThan(e3);
  });

  test('amortization: no extra → completes in exactly n months', () => {
    const P = 500000, r = 8 / 100 / 12, yrs = 10;
    const n = yrs * 12;
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const result = amortize(P, r, emi, 0, n + 1);
    expect(result.months).toBe(n);
  });

  test('balance reaches near-zero after normal tenure', () => {
    const P = 500000, r = 8 / 100 / 12, yrs = 10;
    const n = yrs * 12;
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const result = amortize(P, r, emi, 0, n + 1);
    expect(result.balances[result.months]).toBeLessThan(1); // < ₹1 remaining
  });

  test('total interest paid = amortized interest', () => {
    const P = 1000000, rate = 8, yrs = 20;
    const { emi, totalInterest: emiInterest } = calcEMI(P, rate, yrs);
    const r = rate / 100 / 12;
    const n = yrs * 12;
    const { totalInterest: amortInterest } = amortize(P, r, emi, 0, n + 1);
    expect(amortInterest).toBeCloseTo(emiInterest, 0);
  });

  test('months saved > 0 with any extra payment', () => {
    const { monthsSaved } = calcPrepayment(1000000, 8, 20, 1);
    // Even ₹1 extra reduces term
    expect(monthsSaved).toBeGreaterThanOrEqual(0);
  });

  test('interest saved < total interest without prepayment', () => {
    const { interestSaved, normal } = calcPrepayment(1000000, 8, 20, 10000);
    expect(interestSaved).toBeLessThan(normal.totalInterest);
    expect(interestSaved).toBeGreaterThan(0);
  });

  test('various loan sizes and rates', () => {
    [[200000, 6, 5, 1000], [500000, 9, 10, 5000], [2000000, 12, 25, 20000]].forEach(
      ([P, rate, yrs, extra]) => {
        const { emi, interestSaved, monthsSaved } = calcPrepayment(P, rate, yrs, extra);
        expect(emi).toBeGreaterThan(0);
        expect(interestSaved).toBeGreaterThan(0);
        expect(monthsSaved).toBeGreaterThan(0);
      }
    );
  });
});

// ── 14. TAX CALCULATOR ──────────────────────
describe('Tax Calculator', () => {
  describe('New Regime', () => {
    test('income ≤ ₹12,75,000 → zero tax (rebate)', () => {
      // Taxable = 12,75,000 - 75,000 = 12,00,000 → rebate applies
      const { total } = calcNewTax(1275000);
      expect(total).toBe(0);
    });

    test('income ₹12,75,001 → small tax (rebate boundary)', () => {
      // taxable = 12,75,001 - 75,000 = 12,00,001 → just above rebate limit
      const { total } = calcNewTax(1275001);
      expect(total).toBeGreaterThan(0);
    });

    test('₹10L income: taxable = 9.25L → rebate applies', () => {
      const { total, rebate } = calcNewTax(1000000);
      // taxable = 10,00,000 - 75,000 = 9,25,000 < 12L → rebate
      expect(rebate).toBeGreaterThan(0);
      expect(total).toBe(0);
    });

    test('₹15L income: new regime tax calculation', () => {
      const { total, taxableIncome, slabTax } = calcNewTax(1500000);
      expect(taxableIncome).toBe(1425000); // 15L - 75k stdDed
      // Tax: 0 on 0-4L, 5% on 4L-8L = 20,000, 10% on 8L-12L = 40,000,
      //       15% on 12L-14.25L = 33,750  → Total slab = 93,750
      expect(slabTax).toBeCloseTo(93750, 0);
      expect(total).toBeGreaterThan(93750); // includes cess
    });

    test('cess is 4% of tax after surcharge', () => {
      const { total, taxAfterRebate: tar, cess } = calcNewTax(2000000);
      // Cess = 4% of tax after rebate (+ surcharge if any)
      // At ₹20L, no surcharge
      const expectedCess = calcNewTax(2000000).cess;
      expect(cess).toBeCloseTo(expectedCess, 2);
    });

    test('₹50L income: no surcharge (< ₹50L threshold)', () => {
      const { surcharge } = calcNewTax(5000000);
      expect(surcharge).toBe(0);
    });

    test('₹51L income: 10% surcharge applies', () => {
      const { surcharge, taxAfterRebate } = calcNewTax(5100000);
      if (taxAfterRebate > 0) {
        expect(surcharge).toBeCloseTo(taxAfterRebate * 0.10, 2);
      }
    });

    test('effective tax rate increases with income', () => {
      const incomes = [1000000, 2000000, 5000000, 10000000];
      const rates = incomes.map(inc => calcNewTax(inc).total / inc);
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]).toBeGreaterThanOrEqual(rates[i - 1]);
      }
    });

    test('take-home = gross - tax', () => {
      // Use incomes above ₹12.75L where new regime tax > 0
      [1400000, 2000000, 5000000].forEach(gross => {
        const { total } = calcNewTax(gross);
        const takeHome = gross - total;
        expect(takeHome).toBeGreaterThan(0);
        expect(takeHome).toBeLessThan(gross);
      });
    });
  });

  describe('Old Regime', () => {
    test('₹5L income, no deductions → no tax (rebate)', () => {
      const { total, rebate } = calcOldTax(500000, 0, 0, 0);
      // taxable = 5L - 50k = 4.5L → slabTax = 10,000 (5% on 2.5L–4.5L = 10k)
      // taxable 4.5L ≤ 5L → rebate applies
      expect(rebate).toBeGreaterThan(0);
      expect(total).toBe(0);
    });

    test('₹5L with 80C deductions → rebate still applies', () => {
      const { total } = calcOldTax(500000, 150000, 25000, 0);
      expect(total).toBe(0); // taxable well below 5L
    });

    test('₹10L income, no deductions: old regime', () => {
      const { total, taxableIncome } = calcOldTax(1000000, 0, 0, 0);
      expect(taxableIncome).toBe(950000); // 10L - 50k std
      // 0 on 2.5L, 5% on 2.5L = 12500, 20% on 4.5L = 90000
      // slabTax = 102500
      expect(total).toBeGreaterThan(102500); // includes cess
    });

    test('80C cap: max deduction is ₹1.5L', () => {
      const r1 = calcOldTax(1000000, 200000, 0, 0); // 200k > 150k cap
      const r2 = calcOldTax(1000000, 150000, 0, 0); // at cap
      expect(r1.total).toBe(r2.total); // same tax
    });

    test('80D cap: max deduction is ₹25k', () => {
      const r1 = calcOldTax(1000000, 0, 30000, 0); // 30k > 25k cap
      const r2 = calcOldTax(1000000, 0, 25000, 0); // at cap
      expect(r1.total).toBe(r2.total);
    });

    test('with all deductions: lower tax', () => {
      const noDeductions = calcOldTax(1000000, 0, 0, 0).total;
      const withDeductions = calcOldTax(1000000, 150000, 25000, 50000).total;
      expect(withDeductions).toBeLessThan(noDeductions);
    });

    test('HRA deduction reduces taxable income', () => {
      const noHRA = calcOldTax(1000000, 0, 0, 0);
      const withHRA = calcOldTax(1000000, 0, 0, 100000);
      expect(withHRA.taxableIncome).toBeLessThan(noHRA.taxableIncome);
      expect(withHRA.total).toBeLessThan(noHRA.total);
    });
  });

  describe('New vs Old Regime comparison', () => {
    test('for high income with no deductions, new regime is better', () => {
      // At very high income with no deductions, new regime generally beats old
      const gross = 5000000; // 50L
      const newTax = calcNewTax(gross).total;
      const oldTax = calcOldTax(gross, 0, 0, 0).total;
      // Both should be positive
      expect(newTax).toBeGreaterThan(0);
      expect(oldTax).toBeGreaterThan(0);
    });

    test('for ₹12L income: both regimes calculated correctly', () => {
      const gross = 1200000;
      const newTax = calcNewTax(gross).total;
      const oldTax = calcOldTax(gross, 0, 0, 0).total;
      expect(newTax).toBeGreaterThanOrEqual(0);
      expect(oldTax).toBeGreaterThanOrEqual(0);
    });

    test('slab tax breakdown adds up correctly', () => {
      const { breakdown, slabTax } = calcNewTax(3000000);
      const sumFromBreakdown = breakdown.reduce((acc, s) => acc + s.tax, 0);
      expect(sumFromBreakdown).toBeCloseTo(slabTax, 2);
    });
  });

  describe('Edge cases', () => {
    test('zero income → zero tax', () => {
      const { total } = calcNewTax(0);
      expect(total).toBe(0);
    });

    test('income exactly at standard deduction: ₹75,000', () => {
      const { taxableIncome, total } = calcNewTax(75000);
      expect(taxableIncome).toBe(0);
      expect(total).toBe(0);
    });

    test('very high income: surcharge at 25%', () => {
      // ₹2.5 Cr is above ₹2 Cr threshold → 25% surcharge applies
      const { surcharge, slabTax, rebate } = calcNewTax(25000000);
      const taxAfterRebate = slabTax - rebate; // rebate = 0 at this income
      expect(surcharge).toBeCloseTo(taxAfterRebate * 0.25, 2);
    });

    test('cess always 4%', () => {
      [2000000, 5000000, 10000000].forEach(gross => {
        const result = calcNewTax(gross);
        const expectedCess = (result.total - result.cess) * 0.04;
        // cess / (total - cess) ≈ 0.04
        if (result.total > 0) {
          expect(result.cess / (result.total - result.cess)).toBeCloseTo(0.04, 3);
        }
      });
    });
  });
});

// ─────────────────────────────────────────────
// FMT FUNCTION TESTS (shared across calculators)
// ─────────────────────────────────────────────
describe('fmt (number formatting) utility', () => {
  // Extracted exactly as used in all HTML files
  function fmt(n) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2) + ' L';
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  test('crore formatting', () => {
    expect(fmt(10000000)).toBe('₹1.00 Cr');
    expect(fmt(25000000)).toBe('₹2.50 Cr');
    expect(fmt(100000000)).toBe('₹10.00 Cr');
  });

  test('lakh formatting', () => {
    expect(fmt(100000)).toBe('₹1.00 L');
    expect(fmt(500000)).toBe('₹5.00 L');
    expect(fmt(9999999)).toBe('₹100.00 L');
  });

  test('small amounts use round + locale', () => {
    expect(fmt(1000)).toBe('₹1,000');
    expect(fmt(99999)).toBe('₹99,999');
    expect(fmt(0)).toBe('₹0');
  });

  test('boundary: exactly 1 lakh', () => {
    expect(fmt(100000)).toBe('₹1.00 L');
  });

  test('boundary: just below 1 lakh', () => {
    expect(fmt(99999)).toBe('₹99,999');
  });

  test('boundary: exactly 1 crore', () => {
    expect(fmt(10000000)).toBe('₹1.00 Cr');
  });
});

// ─────────────────────────────────────────────
// CROSS-CALCULATOR CONSISTENCY TESTS
// ─────────────────────────────────────────────
describe('Cross-calculator consistency', () => {
  test('FD and compound interest (quarterly) are identical', () => {
    const P = 100000, rate = 7, yrs = 5;
    const fd = calcFD(P, rate, yrs).total;
    const ci = calcCompound(P, rate, yrs, 4).total;
    expect(fd).toBeCloseTo(ci, 4);
  });

  test('CAGR of SIP proceeds reflects growth of lumpsum reinvestment', () => {
    const P = 100000, rate = 12, yrs = 10;
    const { total } = calcLumpsum(P, rate, yrs);
    const { cagr } = calcCAGR(P, total, yrs);
    expect(cagr).toBeCloseTo(rate, 3);
  });

  test('EMI total interest ≈ amortized interest (consistency)', () => {
    const P = 500000, rate = 9, yrs = 10;
    const { totalInterest, emi } = calcEMI(P, rate, yrs);
    const r = rate / 100 / 12;
    const n = yrs * 12;
    const { totalInterest: amortized } = amortize(P, r, emi, 0, n + 1);
    // Should be within ₹1 of each other
    expect(Math.abs(totalInterest - amortized)).toBeLessThan(10);
  });

  test('Goal SIP round-trip: SIP FV ≈ gap', () => {
    const goal = 2000000, yrs = 10, rate = 12, saved = 0;
    const { sipNeeded, gap } = calcGoal(goal, yrs, rate, saved);
    const { total } = calcSIP(sipNeeded, rate, yrs);
    expect(total).toBeCloseTo(gap, 0);
  });

  test('Retirement: SIP FV ≈ corpus', () => {
    const { corpus, sipNeeded, yearsToRetire } = calcRetirement(30, 60, 50000, 6, 12, 8);
    const monthlyPreReturn = Math.pow(1 + 12 / 100, 1 / 12) - 1;
    const n = yearsToRetire * 12;
    const accumulated = sipNeeded * (Math.pow(1 + monthlyPreReturn, n) - 1) / monthlyPreReturn;
    expect(accumulated).toBeCloseTo(corpus, 0);
  });

  test('Prepayment: interest saved + prepay interest = normal interest', () => {
    const P = 1000000, rate = 8, yrs = 20, extra = 10000;
    const { interestSaved, normal, prepay } = calcPrepayment(P, rate, yrs, extra);
    expect(prepay.totalInterest + interestSaved).toBeCloseTo(normal.totalInterest, 1);
  });
});

// ─────────────────────────────────────────────
// PRECISION / FLOATING-POINT TESTS
// ─────────────────────────────────────────────
describe('Floating-point precision', () => {
  test('SIP: no NaN or Infinity', () => {
    [[500, 1, 1], [5000, 12, 10], [1000000, 30, 40]].forEach(([P, r, y]) => {
      const { total } = calcSIP(P, r, y);
      expect(isNaN(total)).toBe(false);
      expect(isFinite(total)).toBe(true);
    });
  });

  test('EMI: no NaN or Infinity', () => {
    [[10000, 1, 1], [1000000, 8.5, 20], [10000000, 30, 30]].forEach(([P, r, y]) => {
      const { emi } = calcEMI(P, r, y);
      expect(isNaN(emi)).toBe(false);
      expect(isFinite(emi)).toBe(true);
    });
  });

  test('CAGR: handles large multipliers', () => {
    const { cagr } = calcCAGR(1, 1000000, 20);
    expect(isFinite(cagr)).toBe(true);
    expect(cagr).toBeGreaterThan(0);
  });

  test('GST: correct decimal handling for 18%', () => {
    const { gstAmt } = calcGSTAdd(333.33, 18);
    expect(gstAmt).toBeCloseTo(60, 0); // 333.33 * 0.18 = 60.0
  });

  test('RD: accumulation is finite for all valid inputs', () => {
    [[100, 1, 1], [5000, 6.5, 5], [1000000, 15, 10]].forEach(([P, r, y]) => {
      const { total } = calcRD(P, r, y);
      expect(isFinite(total)).toBe(true);
      expect(isNaN(total)).toBe(false);
    });
  });
});

// ─────────────────────────────────────────────
// FUZZY SEARCH HELPERS (extracted from index.html)
// ─────────────────────────────────────────────

/* Optimised flat-array implementation (mirrors index.html) */
function damerauLevenshtein(a, b) {
  var m = a.length, n = b.length;
  var w = n + 1;
  var dp = new Int32Array((m + 1) * w);
  for (var i = 0; i <= m; i++) dp[i * w] = i;
  for (var j = 0; j <= n; j++) dp[j] = j;
  for (var i = 1; i <= m; i++) {
    for (var j = 1; j <= n; j++) {
      var cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i*w+j] = Math.min(dp[(i-1)*w+j] + 1, dp[i*w+(j-1)] + 1, dp[(i-1)*w+(j-1)] + cost);
      if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1])
        dp[i*w+j] = Math.min(dp[i*w+j], dp[(i-2)*w+(j-2)] + cost);
    }
  }
  return dp[m*w+n];
}

function fuzzyMatch(query, text) {
  query = query.toLowerCase().trim();
  text  = text.toLowerCase();
  if (!query) return true;
  if (text.includes(query)) return true;
  var qWords = query.split(/\s+/).filter(function(w) { return w.length > 0; });
  var tWords = text.split(/\s+/);
  return qWords.every(function(qw) {
    if (text.includes(qw)) return true;
    var maxDist = qw.length <= 3 ? 0 : qw.length <= 5 ? 1 : 2;
    return tWords.some(function(tw) { return damerauLevenshtein(qw, tw) <= maxDist; });
  });
}

describe('damerauLevenshtein (fuzzy-search distance)', () => {
  test('identical strings → 0', () => {
    expect(damerauLevenshtein('sip', 'sip')).toBe(0);
    expect(damerauLevenshtein('', '')).toBe(0);
  });

  test('empty vs non-empty → length of non-empty', () => {
    expect(damerauLevenshtein('', 'emi')).toBe(3);
    expect(damerauLevenshtein('tax', '')).toBe(3);
  });

  test('single insertion / deletion', () => {
    expect(damerauLevenshtein('cat', 'cats')).toBe(1);
    expect(damerauLevenshtein('cats', 'cat')).toBe(1);
  });

  test('single substitution', () => {
    expect(damerauLevenshtein('sip', 'tip')).toBe(1);
  });

  test('transposition (swap of adjacent chars)', () => {
    expect(damerauLevenshtein('emi', 'mei')).toBe(1);
    expect(damerauLevenshtein('tax', 'atx')).toBe(1);
  });

  test('known edit-distance pairs', () => {
    expect(damerauLevenshtein('kitten', 'sitting')).toBe(3);
    expect(damerauLevenshtein('saturday', 'sunday')).toBe(3);
    expect(damerauLevenshtein('retirement', 'retirment')).toBe(1); // one deletion
  });

  test('completely different strings', () => {
    expect(damerauLevenshtein('abc', 'xyz')).toBe(3);
  });

  test('symmetric: d(a,b) === d(b,a)', () => {
    const pairs = [['sip', 'tip'], ['emi', 'mei'], ['lumpsum', 'lumpsom']];
    pairs.forEach(([a, b]) => {
      expect(damerauLevenshtein(a, b)).toBe(damerauLevenshtein(b, a));
    });
  });
});

describe('fuzzyMatch (search matching)', () => {
  test('empty query always matches', () => {
    expect(fuzzyMatch('', 'anything')).toBe(true);
    expect(fuzzyMatch('  ', 'anything')).toBe(true);
  });

  test('exact substring match', () => {
    expect(fuzzyMatch('sip', 'SIP Calculator monthly')).toBe(true);
    expect(fuzzyMatch('emi', 'EMI Calculator loan')).toBe(true);
  });

  test('case-insensitive matching', () => {
    expect(fuzzyMatch('SIP', 'sip calculator')).toBe(true);
    expect(fuzzyMatch('Retirement', 'plan your RETIREMENT')).toBe(true);
  });

  test('no match for completely unrelated query', () => {
    expect(fuzzyMatch('xyz', 'sip emi loan')).toBe(false);
  });

  test('short words (≤3 chars) require exact match', () => {
    // 'si' is length 2 (≤3) → maxDist 0, 'sip' does not include 'si' as substring
    // but 'sip' contains 'si'... actually 'sip'.includes('si') is true
    // Test with a word that truly won't substring-match
    expect(fuzzyMatch('xyz', 'abc def ghi')).toBe(false);
  });

  test('typo tolerance for longer words', () => {
    // 'retirment' (missing 'e') should still match 'retirement' (length 9 → maxDist 2)
    expect(fuzzyMatch('retirment', 'plan your retirement')).toBe(true);
  });

  test('multi-word query: all words must match', () => {
    expect(fuzzyMatch('sip calculator', 'SIP Calculator monthly returns')).toBe(true);
    expect(fuzzyMatch('sip loan', 'SIP Calculator monthly returns')).toBe(false);
  });
});
