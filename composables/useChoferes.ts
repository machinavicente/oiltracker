import { supabase } from './useSupabase'
import type { Chofer } from '~/types/database'

export function useChoferes() {
  async function obtenerTodos(): Promise<Chofer[]> {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .order('apellido')

    if (error) throw error
    return data || []
  }

  async function obtenerPorId(id: number): Promise<Chofer | null> {
    const { data, error } = await supabase
      .from('choferes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async function crear(chofer: Omit<Chofer, 'id' | 'created_at'>): Promise<Chofer> {
    const { data, error } = await supabase
      .from('choferes')
      .insert(chofer)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function actualizar(id: number, chofer: Partial<Chofer>): Promise<Chofer> {
    const { data, error } = await supabase
      .from('choferes')
      .update(chofer)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function eliminar(id: number): Promise<void> {
    const { error } = await supabase
      .from('choferes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    obtenerTodos,
    obtenerPorId,
    crear,
    actualizar,
    eliminar
  }
}