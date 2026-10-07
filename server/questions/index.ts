import type { Question } from '../../shared/types';
import { questions as balanceSheet } from './balance-sheet';
import { questions as debitCredit } from './debit-credit';
import { questions as dre } from './dre';
import { questions as analysis } from './analysis';
import { questions as dupont } from './dupont';
import { questions as ambev } from './ambev';

export const QUESTION_BANK: Question[] = [
  ...balanceSheet,
  ...debitCredit,
  ...dre,
  ...analysis,
  ...dupont,
  ...ambev,
];

export const QUESTION_BY_ID: Map<string, Question> = new Map(QUESTION_BANK.map((q) => [q.id, q]));
