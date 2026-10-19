import { supabase } from './useSupabase'
import type { MantenimientoAceite, Vehiculo, VehiculoConSeguimiento, TipoSeguimiento } from '~/types/database'
import { useMantenimientos } from './useMantenimientos'

export function useVehiculos() {
  const { obtenerUltimosPorVehiculo } = useMantenimientos()

  async function obtenerTodos(): Promise<Vehiculo[]> {
    const { data, error } = await supabase
      .from('vehiculos')
      .select('*')
      .order('placa')

    if (error) throw error
    return data || []
  }

  async function obtenerConSeguimiento(): Promise<VehiculoConSeguimiento[]> {
    const vehiculos = await obtenerTodos()
    const ultimosMantenimientos = await obtenerUltimosPorVehiculo()

    return vehiculos.map(v => {
      const ultimo = ultimosMantenimientos.find(m => m.vehiculo_id === v.id)
      const tipoSeguimiento = determinarTipoSeguimiento(ultimo)
      const proximo = calcularProximoServicio(ultimo, tipoSeguimiento)

      return {
        ...v,
        tipo_seguimiento: tipoSeguimiento,
        ultimo_mantenimiento: ultimo,
        proximo_servicio: proximo
      }
    })
  }

  function determinarTipoSeguimiento(ultimo: MantenimientoAceite | undefined): TipoSeguimiento {
    if (!ultimo) return 'fecha'
    return ultimo.kilometraje !== null && ultimo.proximo_kilometraje !== null ? 'kilometraje' : 'fecha'
  }

  function diferenciaEnDias(desde: string, hasta: string): number {
    const a = Date.parse(`${desde}T00:00:00Z`)
    const b = Date.parse(`${hasta}T00:00:00Z`)
    return Math.round((b - a) / 86_400_000)
  }

  function calcularProximoServicio(ultimo: MantenimientoAceite | undefined, tipo: TipoSeguimiento) {
    if (!ultimo) {
      return { fecha: null, kilometraje: null, vencido: false, dias_restantes: null, km_restantes: null }
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (tipo === 'fecha' && ultimo.proxima_revision) {
      const hoyISO = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
      const diasRestantes = diferenciaEnDias(hoyISO, ultimo.proxima_revision)
      return {
        fecha: ultimo.proxima_revision,
        kilometraje: null,
        vencido: diasRestantes < 0,
        dias_restantes: diasRestantes,
        km_restantes: null
      }
    }

    if (tipo === 'kilometraje' && ultimo.proximo_kilometraje !== null) {
      const kmActual = ultimo.kilometraje || 0
      const kmRestantes = ultimo.proximo_kilometraje - kmActual
      return {
        fecha: null,
        kilometraje: ultimo.proximo_kilometraje,
        vencido: kmRestantes <= 0,
        dias_restantes: null,
        km_restantes: kmRestantes
      }
    }

    return { fecha: null, kilometraje: null, vencido: false, dias_restantes: null, km_restantes: null }
  }

  async function crear(vehiculo: Omit<Vehiculo, 'id' | 'created_at'>): Promise<Vehiculo> {
    const { data, error } = await supabase
      .from('vehiculos')
      .insert(vehiculo)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function actualizar(id: number, vehiculo: Partial<Vehiculo>): Promise<Vehiculo> {
    const { data, error } = await supabase
      .from('vehiculos')
      .update(vehiculo)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async function eliminar(id: number): Promise<void> {
    const { error } = await supabase
      .from('vehiculos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    obtenerTodos,
    obtenerConSeguimiento,
    crear,
    actualizar,
    eliminar
  }
}
