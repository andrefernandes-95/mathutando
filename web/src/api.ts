export { library as api } from './storage/library'
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Não foi possível concluir a operação.'
