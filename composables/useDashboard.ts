import { useVehiculos } from './useVehiculos'
import { useChoferes } from './useChoferes'
import { useMantenimientos } from './useMantenimientos'
import type { DashboardStats, VehiculoConSeguimiento } from '~/types/database'

export function useDashboard() {
  const { obtenerConSeguimiento } = useVehiculos()
  const { obtenerTodos: obtenerChoferes } = useChoferes()
  const { obtenerTodos: obtenerMantenimientos } = useMantenimientos()

  async function obtenerEstadisticas(): Promise<DashboardStats> {
    const [vehiculos, choferes, mantenimientos] = await Promise.all([
      obtenerConSeguimiento(),
      obtenerChoferes(),
      obtenerMantenimientos()
    ])

    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const inicioMesStr = inicioMes.toISOString().split('T')[0]

    const mantenimientosMesActual = mantenimientos.filter(m => m.fecha_servicio >= inicioMesStr).length
    const porKilometraje = vehiculos.filter(v => v.tipo_seguimiento === 'kilometraje').length
    const porFecha = vehiculos.filter(v => v.tipo_seguimiento === 'fecha').length

    return {
      total_vehiculos: vehiculos.length,
      total_choferes: choferes.length,
      total_mantenimientos: mantenimientos.length,
      mantenimientos_mes_actual: mantenimientosMesActual,
      proximos_vencidos: vehiculos.filter(v => v.proximo_servicio?.vencido).length,
      mantenimientos_3_4_dias: vehiculos.filter(v =>
        v.tipo_seguimiento === 'fecha' &&
        v.proximo_servicio?.dias_restantes !== null &&
        v.proximo_servicio?.dias_restantes !== undefined &&
        v.proximo_servicio.dias_restantes >= 3 &&
        v.proximo_servicio.dias_restantes <= 4
      ).length,
      por_kilometraje: porKilometraje,
      por_fecha: porFecha
    }
  }

  async function obtenerProximasRevisiones(limite?: number) {
    const vehiculos = await obtenerConSeguimiento()

    const conProximo = vehiculos
      .filter(v => v.proximo_servicio)
      .map(v => ({
        ...v,
        urgencia: calcularUrgencia(v)
      }))
      .sort((a, b) => a.urgencia - b.urgencia)

    return limite === undefined ? conProximo : conProximo.slice(0, limite)
  }

  function calcularUrgencia(vehiculo: VehiculoConSeguimiento): number {
    const proximo = vehiculo.proximo_servicio
    if (!proximo) return 999
    if (proximo.vencido) return 0
    if (vehiculo.tipo_seguimiento === 'fecha' && proximo.dias_restantes !== null) {
      return proximo.dias_restantes
    }
    if (vehiculo.tipo_seguimiento === 'kilometraje' && proximo.km_restantes !== null) {
      return proximo.km_restantes > 1000 ? 30 : 15
    }
    return 999
  }

  return {
    obtenerEstadisticas,
    obtenerProximasRevisiones
  }
}