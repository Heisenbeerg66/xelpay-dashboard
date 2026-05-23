// src/lib/watcher/imap/email-parser.ts
// Parses Bangladeshi and international bank transaction emails
// Extracts: amount, trx_id, balance, sender, account_number, bank_name

import type { ParsedEmailTransaction } from '@/types/watcher';

// ─── Bank patterns registry ───────────────────────────────────
// Each bank has its own email template. We detect by sender/subject.

interface BankPattern {
  name: string;
  senderPatterns: RegExp[];
  subjectPatterns: RegExp[];
  amountPatterns: RegExp[];
  trxIdPatterns: RegExp[];
  balancePatterns: RegExp[];
  accountPatterns: RegExp[];
  senderNamePatterns: RegExp[];
  typePatterns: { credit: RegExp[]; debit: RegExp[] };
}

const BANK_PATTERNS: BankPattern[] = [
  // ─── Dutch-Bangla Bank (DBBL / Rocket) ─────────────────────
  {
    name: 'Dutch-Bangla Bank',
    senderPatterns: [/dbbl/i, /dutchbangla/i, /rocket/i],
    subjectPatterns: [/transaction alert/i, /account alert/i, /debit alert/i, /credit alert/i],
    amountPatterns: [
      /(?:BDT|TK|Tk|৳)\s*([0-9,]+\.?[0-9]*)/i,
      /amount[:\s]+(?:BDT|TK|Tk)?\s*([0-9,]+\.?[0-9]*)/i,
      /credited.*?([0-9,]+\.?[0-9]*)\s*(?:BDT|TK)/i,
      /debited.*?([0-9,]+\.?[0-9]*)\s*(?:BDT|TK)/i,
    ],
    trxIdPatterns: [
      /(?:Ref(?:erence)?|TXN|Trxn?|Transaction)\s*(?:No|ID|#)?[:\s]+([A-Z0-9]+)/i,
      /Ref\.?\s*No[.:\s]+([A-Z0-9]+)/i,
    ],
    balancePatterns: [
      /(?:Available|Current|Closing)\s*(?:Balance|Bal)[:\s]+(?:BDT|TK|Tk)?\s*([0-9,]+\.?[0-9]*)/i,
      /Balance[:\s]+(?:BDT|TK|Tk)?\s*([0-9,]+\.?[0-9]*)/i,
    ],
    accountPatterns: [/(?:A\/C|Account)\s*(?:No)?[.:\s]+(\*+[0-9]+|[0-9]+)/i],
    senderNamePatterns: [/(?:from|by)[:\s]+([A-Za-z\s]+?)(?:\s+on|\s+dated|\s+account|$)/im],
    typePatterns: {
      credit: [/credit(?:ed)?/i, /received/i, /deposited/i],
      debit: [/debit(?:ed)?/i, /paid/i, /withdrawn/i, /transferred/i],
    },
  },

  // ─── BRAC Bank ─────────────────────────────────────────────
  {
    name: 'BRAC Bank',
    senderPatterns: [/bracbank/i, /brac bank/i, /bbl\.com\.bd/i],
    subjectPatterns: [/transaction/i, /alert/i, /notification/i],
    amountPatterns: [
      /BDT\s*([0-9,]+\.?[0-9]*)/i,
      /amount[:\s]+BDT\s*([0-9,]+\.?[0-9]*)/i,
      /Taka\s*([0-9,]+\.?[0-9]*)/i,
    ],
    trxIdPatterns: [/(?:Ref|TXN|Txn)\s*(?:No|ID|#)?[:\s]+([A-Z0-9]+)/i],
    balancePatterns: [/Balance[:\s]+BDT\s*([0-9,]+\.?[0-9]*)/i],
    accountPatterns: [/(?:A\/C|Account)(?:\s*No)?[:\s]+(\*+[0-9]+|[0-9]+)/i],
    senderNamePatterns: [],
    typePatterns: {
      credit: [/credit/i, /received/i],
      debit: [/debit/i, /paid/i, /withdrawal/i],
    },
  },

  // ─── Eastern Bank (EBL) ────────────────────────────────────
  {
    name: 'Eastern Bank',
    senderPatterns: [/ebl\.com\.bd/i, /eastern bank/i, /ebl/i],
    subjectPatterns: [/alert/i, /notification/i, /transaction/i],
    amountPatterns: [/BDT\s*([0-9,]+\.?[0-9]*)/i, /Tk\.?\s*([0-9,]+\.?[0-9]*)/i],
    trxIdPatterns: [/(?:Ref|TRN|TXN)[:\s]+([A-Z0-9]+)/i],
    balancePatterns: [/(?:Available\s)?Balance[:\s]+(?:BDT\s*)?([0-9,]+\.?[0-9]*)/i],
    accountPatterns: [/A\/C\s*No[:\s]+(\*+[0-9]+|[0-9]+)/i],
    senderNamePatterns: [],
    typePatterns: {
      credit: [/credit/i, /received/i],
      debit: [/debit/i, /paid/i],
    },
  },

  // ─── City Bank ─────────────────────────────────────────────
  {
    name: 'City Bank',
    senderPatterns: [/thecitybank/i, /city bank/i, /citybank/i],
    subjectPatterns: [/transaction/i, /alert/i],
    amountPatterns: [/BDT\s*([0-9,]+\.?[0-9]*)/i, /Tk\s*([0-9,]+\.?[0-9]*)/i],
    trxIdPatterns: [/(?:Ref|Txn|TRN)\s*(?:No|ID)?[:\s]+([A-Z0-9]+)/i],
    balancePatterns: [/Balance[:\s]+(?:BDT)?\s*([0-9,]+\.?[0-9]*)/i],
    accountPatterns: [/Account[:\s]+(\*+[0-9]+|[0-9]+)/i],
    senderNamePatterns: [],
    typePatterns: {
      credit: [/credit/i, /received/i, /deposited/i],
      debit: [/debit/i, /paid/i, /withdrawal/i],
    },
  },

  // ─── Generic bank fallback ──────────────────────────────────
  {
    name: 'Generic Bank',
    senderPatterns: [/bank/i, /alert/i],
    subjectPatterns: [/transaction/i, /alert/i, /payment/i, /debit/i, /credit/i],
    amountPatterns: [
      /(?:BDT|Tk|TK|৳|USD|EUR)\s*([0-9,]+\.?[0-9]*)/i,
      /(?:amount|sum)[:\s]+([0-9,]+\.?[0-9]*)/i,
      /([0-9,]+\.[0-9]{2})\s*(?:BDT|USD|EUR|TK)/i,
    ],
    trxIdPatterns: [
      /(?:Ref(?:erence)?|TXN|Trxn?|Transaction|Trans)\s*(?:No|ID|#|\.)?[:\s]+([A-Z0-9]{6,30})/i,
    ],
    balancePatterns: [
      /(?:Balance|Bal|Available)[:\s]+(?:BDT|Tk)?\s*([0-9,]+\.?[0-9]*)/i,
    ],
    accountPatterns: [
      /(?:A\/C|Account|Acct)\s*(?:No)?[.:\s]+(\*+[0-9]+|[0-9X*]{6,20})/i,
    ],
    senderNamePatterns: [],
    typePatterns: {
      credit: [/credit/i, /received/i, /deposited/i, /incoming/i],
      debit: [/debit/i, /paid/i, /withdrawn/i, /outgoing/i, /transferred/i],
    },
  },
];

// ─── Main parser function ─────────────────────────────────────

export function parseEmailTransaction(
  emailUid: string,
  subject: string,
  from: string,
  date: Date,
  body: string
): ParsedEmailTransaction {
  const cleanBody = body
    .replace(/<[^>]+>/g, ' ')   // strip HTML
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  const searchText = `${subject}\n${from}\n${cleanBody}`;

  // ── Find best matching bank pattern ──────────────────────────
  let matchedPattern: BankPattern | null = null;
  let matchScore = 0;

  for (const pattern of BANK_PATTERNS) {
    let score = 0;
    if (pattern.senderPatterns.some((p) => p.test(from))) score += 3;
    if (pattern.subjectPatterns.some((p) => p.test(subject))) score += 2;
    if (score > matchScore) {
      matchScore = score;
      matchedPattern = pattern;
    }
  }

  const bank = matchedPattern ?? BANK_PATTERNS[BANK_PATTERNS.length - 1];

  // ── Extract fields ────────────────────────────────────────────
  const amount = extractNumber(searchText, bank.amountPatterns);
  const trxId = extractString(searchText, bank.trxIdPatterns);
  const balance = extractNumber(searchText, bank.balancePatterns);
  const accountNumber = extractString(searchText, bank.accountPatterns);
  const senderName = extractString(searchText, bank.senderNamePatterns);

  // ── Determine transaction type ────────────────────────────────
  let transactionType: 'credit' | 'debit' | 'unknown' = 'unknown';
  if (bank.typePatterns.credit.some((p) => p.test(searchText))) {
    transactionType = 'credit';
  } else if (bank.typePatterns.debit.some((p) => p.test(searchText))) {
    transactionType = 'debit';
  }

  // ── Detect currency ───────────────────────────────────────────
  let currency = 'BDT';
  if (/\bUSD\b/i.test(searchText)) currency = 'USD';
  else if (/\bEUR\b/i.test(searchText)) currency = 'EUR';
  else if (/\bGBP\b/i.test(searchText)) currency = 'GBP';

  // ── Confidence score ──────────────────────────────────────────
  let confidence = 0;
  if (amount !== null) confidence += 40;
  if (trxId) confidence += 30;
  if (balance !== null) confidence += 15;
  if (accountNumber) confidence += 10;
  if (transactionType !== 'unknown') confidence += 5;

  return {
    email_uid: emailUid,
    email_subject: subject,
    email_from: from,
    email_date: date,
    bank_name: bank.name === 'Generic Bank' ? detectBankName(from, subject) : bank.name,
    account_number: accountNumber,
    trx_id: trxId,
    amount,
    balance,
    currency,
    transaction_type: transactionType,
    sender_name: senderName,
    sender_account: null,
    description: subject,
    raw_body: cleanBody.substring(0, 5000),
    parsed_data: {
      bank_pattern_used: bank.name,
      match_score: matchScore,
      raw_extractions: { amount, trxId, balance, accountNumber, senderName },
    },
    parse_confidence: Math.min(100, confidence),
  };
}

// ─── Helpers ──────────────────────────────────────────────────

function extractNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

function extractString(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  return null;
}

function detectBankName(from: string, subject: string): string {
  const text = `${from} ${subject}`.toLowerCase();
  if (text.includes('dbbl') || text.includes('dutch')) return 'Dutch-Bangla Bank';
  if (text.includes('brac')) return 'BRAC Bank';
  if (text.includes('ebl') || text.includes('eastern')) return 'Eastern Bank';
  if (text.includes('city')) return 'City Bank';
  if (text.includes('ucb')) return 'UCB';
  if (text.includes('mtb') || text.includes('mutual trust')) return 'Mutual Trust Bank';
  if (text.includes('ific')) return 'IFIC Bank';
  if (text.includes('pubali')) return 'Pubali Bank';
  if (text.includes('sonali')) return 'Sonali Bank';
  if (text.includes('janata')) return 'Janata Bank';
  if (text.includes('agrani')) return 'Agrani Bank';
  if (text.includes('islami')) return 'Islami Bank';
  if (text.includes('sibl')) return 'SIBL';
  return 'Unknown Bank';
}
