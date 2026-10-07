import type { Question } from '../../shared/types';
import { questions as balanceSheet } from './balance-sheet';
import { questions as debitCredit } from './debit-credit';
import { questions as dre } from './dre';
import { questions as analysis } from './analysis';
import { questions as dupont } from './dupont';
import { questions as recognition } from './recognition';
import { questions as aulas } from './aulas';
import { questions as aula5 } from './aula5';
import { questions as ambev } from './ambev';
import { questions as renner } from './renner';
import { questions as roteiroFicticio } from './roteiro-ficticio';

export const QUESTION_BANK: Question[] = [
  ...balanceSheet,
  ...debitCredit,
  ...dre,
  ...analysis,
  ...dupont,
  ...recognition,
  ...aulas,
  ...aula5,
  ...ambev,
  ...renner,
  ...roteiroFicticio,
];

export const QUESTION_BY_ID: Map<string, Question> = new Map(QUESTION_BANK.map((q) => [q.id, q]));
