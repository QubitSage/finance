import { importBatch } from './storage'
import { BATCH_2_ID, BATCH_2_COMBINADOS, BATCH_2_REGRAS_INTRO } from '../data/batch-1-regras'
import {
  BATCH_3_ID,
  BATCH_3_MIMOS_FIXOS,
  BATCH_3_WISHES,
  BATCH_3_ACORDO,
  BATCH_3_PROTOCOLO,
  BATCH_3_SAIDA_TEMPLATES,
  BATCH_3_SAIDA_NOTAS,
  BATCH_3_MANIFESTO,
  BATCH_3_SIM_MIMOS,
} from '../data/batch-3-acordo-casal'

import {
  BATCH_5_ID,
  BATCH_5_SIM_GASTOS,
} from '../data/batch-5-gastos-casal'

import {
  BATCH_6_ID,
  BATCH_6_COMBINADOS,
  BATCH_6_QUESTIONARIO,
  BATCH_6_SETTINGS,
} from '../data/batch-6-mesada-planejamento'

import {
  BATCH_7_ID,
  BATCH_7_COMBINADOS,
  BATCH_7_QUESTIONARIO_PATCHES,
} from '../data/batch-7-respostas-planejamento'

export const BATCH_4_ID = 'batch-4-marcos-livres'

export function runPendingBatchImports() {
  const results = []

  const r2 = importBatch({
    batchId: BATCH_2_ID,
    combinados: BATCH_2_COMBINADOS,
    regrasIntro: BATCH_2_REGRAS_INTRO,
    replaceCombinados: true,
  })
  results.push({ batch: BATCH_2_ID, ...r2 })

  const r3 = importBatch({
    batchId: BATCH_3_ID,
    combinados: BATCH_3_PROTOCOLO,
    mimosFixos: BATCH_3_MIMOS_FIXOS,
    replaceMimosFixos: true,
    wishes: BATCH_3_WISHES,
    appendWishes: true,
    objetivos: [BATCH_3_MANIFESTO],
    replaceObjetivos: true,
    acordoItens: BATCH_3_ACORDO,
    replaceAcordo: true,
    saidaTemplates: BATCH_3_SAIDA_TEMPLATES,
    replaceSaidaTemplates: true,
    settingsPatch: BATCH_3_SAIDA_NOTAS,
    simMimos: BATCH_3_SIM_MIMOS,
    replaceSimMimos: true,
    user2Name: 'Vianka',
  })
  results.push({ batch: BATCH_3_ID, ...r3 })

  const r4 = importBatch({ batchId: BATCH_4_ID, resetMarcosPremios: true })
  results.push({ batch: BATCH_4_ID, ...r4 })

  const r5 = importBatch({
    batchId: BATCH_5_ID,
    simGastos: BATCH_5_SIM_GASTOS,
    replaceSimGastos: true,
  })
  results.push({ batch: BATCH_5_ID, ...r5 })

  const r6 = importBatch({
    batchId: BATCH_6_ID,
    combinados: BATCH_6_COMBINADOS,
    appendCombinados: true,
    questionario: BATCH_6_QUESTIONARIO,
    settingsPatch: BATCH_6_SETTINGS,
  })
  results.push({ batch: BATCH_6_ID, ...r6 })

  const r7 = importBatch({
    batchId: BATCH_7_ID,
    combinados: BATCH_7_COMBINADOS,
    appendCombinados: true,
    questionarioPatches: BATCH_7_QUESTIONARIO_PATCHES,
    user2Name: 'Vianka',
  })
  results.push({ batch: BATCH_7_ID, ...r7 })

  return results
}
