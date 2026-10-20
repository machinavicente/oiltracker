import { supabase } from './useSupabase'
import type { MantenimientoAceite, MantenimientoConRelaciones, FormDataCompleto } from '~/types/database'

export function useMantenimientos() {
  function obtenerUltimoPorVehiculo<T extends Pick<MantenimientoAceite, 'vehiculo_id'>>(mantenimientos: T[]): T[] {
    const ultimosPorVehiculo = new Map<number, T>()
    for (const mantenimiento of mantenimientos) {
      if (!ultimosPorVehiculo.has(mantenimiento.vehiculo_id)) {
        ultimosPorVehiculo.set(mantenimiento.vehiculo_id, mantenimiento)
      }
    }
    return Array.from(ultimosPorVehiculo.values())
  }

  async function obtenerTodos(): Promise<MantenimientoConRelaciones[]> {
    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .select(`
        *,
        vehiculo:vehiculos(*),
        chofer:choferes(*)
      `)
      .order('fecha_servicio', { ascending: false })

    if (error) throw error
    return data || []
  }

  async function obtenerUltimosPorVehiculo(): Promise<MantenimientoAceite[]> {
    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .select('*')
      .order('fecha_servicio', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

    if (error) throw error

    return obtenerUltimoPorVehiculo(data || [])
  }

  async function obtenerPorVehiculo(vehiculoId: number): Promise<MantenimientoConRelaciones[]> {
    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .select(`
        *,
        vehiculo:vehiculos(*),
        chofer:choferes(*)
      `)
      .eq('vehiculo_id', vehiculoId)
      .order('fecha_servicio', { ascending: false })

    if (error) throw error
    return data || []
  }

  async function obtenerProximos(dias: number = 30): Promise<MantenimientoConRelaciones[]> {
    const fechaLimite = new Date()
    fechaLimite.setDate(fechaLimite.getDate() + dias)
    const fechaLimiteStr = fechaLimite.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .select(`
        *,
        vehiculo:vehiculos(*),
        chofer:choferes(*)
      `)
      .order('fecha_servicio', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

    if (error) throw error
    return obtenerUltimoPorVehiculo(data || [])
      .filter(m =>
        (m.proxima_revision !== null && m.proxima_revision <= fechaLimiteStr) ||
        m.proximo_kilometraje !== null
      )
      .sort((a, b) => (a.proxima_revision || '').localeCompare(b.proxima_revision || ''))
  }

  async function obtenerVencidos(): Promise<MantenimientoConRelaciones[]> {
    const hoy = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .select(`
        *,
        vehiculo:vehiculos(*),
        chofer:choferes(*)
      `)
      .order('fecha_servicio', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })

    if (error) throw error

    const vencidos: MantenimientoConRelaciones[] = []
    for (const m of obtenerUltimoPorVehiculo(data || [])) {
      if (m.proxima_revision && m.proxima_revision < hoy) {
        vencidos.push(m)
      } else if (m.proximo_kilometraje !== null && m.kilometraje !== null && m.kilometraje >= m.proximo_kilometraje) {
        vencidos.push(m)
      }
    }
    return vencidos
  }

  async function crear(mantenimiento: Omit<MantenimientoAceite, 'id' | 'created_at'>): Promise<MantenimientoAceite> {
    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .insert(mantenimiento)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function crearCompleto(formData: FormDataCompleto): Promise<{ vehiculo: any; chofer: any; mantenimiento: MantenimientoAceite }> {
    let vehiculoId: number
    let choferId: number

    const { data: vehiculoExistente, error: buscarVehiculoError } = await supabase
      .from('vehiculos')
      .select('id')
      .eq('placa', formData.vehiculo.placa)
      .maybeSingle()

    if (buscarVehiculoError) throw buscarVehiculoError

    if (vehiculoExistente) {
      vehiculoId = vehiculoExistente.id
    } else {
      const { data: nuevoVehiculo, error: vehiculoError } = await supabase
        .from('vehiculos')
        .insert({
          placa: formData.vehiculo.placa,
          marca: formData.vehiculo.marca,
          modelo: formData.vehiculo.modelo
        })
        .select()
        .single()

      if (vehiculoError) throw vehiculoError
      vehiculoId = nuevoVehiculo.id
    }

    const { data: choferExistente, error: buscarChoferError } = await supabase
      .from('choferes')
      .select('id')
      .eq('nombre', formData.chofer.nombre)
      .eq('apellido', formData.chofer.apellido)
      .maybeSingle()

    if (buscarChoferError) throw buscarChoferError

    if (choferExistente) {
      choferId = choferExistente.id
    } else {
      const { data: nuevoChofer, error: choferError } = await supabase
        .from('choferes')
        .insert({
          nombre: formData.chofer.nombre,
          apellido: formData.chofer.apellido
        })
        .select()
        .single()

      if (choferError) throw choferError
      choferId = nuevoChofer.id
    }

    const mantenimientoData = {
      vehiculo_id: vehiculoId,
      chofer_id: choferId,
      fecha_servicio: formData.mantenimiento.fecha_servicio,
      kilometraje: formData.mantenimiento.usa_kilometraje ? formData.mantenimiento.kilometraje : null,
      tipo_aceite: formData.mantenimiento.tipo_aceite,
      numero_filtro: formData.mantenimiento.numero_filtro,
      filtro_combustible: formData.mantenimiento.filtro_combustible,
      filtro_aire: formData.mantenimiento.filtro_aire_accion !== null,
      filtro_aire_accion: formData.mantenimiento.filtro_aire_accion,
      transmision_caja: formData.mantenimiento.transmision_caja,
      engrase: formData.mantenimiento.engrase,
      proxima_revision: formData.mantenimiento.usa_kilometraje ? null : formData.mantenimiento.proxima_revision,
      proximo_kilometraje: formData.mantenimiento.usa_kilometraje ? formData.mantenimiento.proximo_kilometraje : null,
      observaciones: formData.mantenimiento.observaciones
    }

    const { data: mantenimiento, error: mantenimientoError } = await supabase
      .from('mantenimientos_aceite')
      .insert(mantenimientoData)
      .select()
      .single()

    if (mantenimientoError) throw mantenimientoError

    const { data: vehiculo } = await supabase.from('vehiculos').select('*').eq('id', vehiculoId).single()
    const { data: chofer } = await supabase.from('choferes').select('*').eq('id', choferId).single()

    return { vehiculo, chofer, mantenimiento }
  }

  async function actualizar(id: number, mantenimiento: Partial<MantenimientoAceite>): Promise<MantenimientoAceite> {
    const { data, error } = await supabase
      .from('mantenimientos_aceite')
      .update(mantenimiento)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function eliminar(id: number): Promise<void> {
    const { error } = await supabase
      .from('mantenimientos_aceite')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    obtenerTodos,
    obtenerUltimosPorVehiculo,
    obtenerPorVehiculo,
    obtenerProximos,
    obtenerVencidos,
    crear,
    crearCompleto,
    actualizar,
    eliminar
  }
}