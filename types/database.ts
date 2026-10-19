export interface Vehiculo {
  id: number
  placa: string
  marca: string | null
  modelo: string | null
  created_at: string
}

export interface Chofer {
  id: number
  nombre: string
  apellido: string
  created_at: string
}

export interface MantenimientoAceite {
  id: number
  vehiculo_id: number
  chofer_id: number | null
  fecha_servicio: string
  kilometraje: number | null
  tipo_aceite: string | null
  numero_filtro: string | null
  filtro_combustible: boolean
  filtro_aire: boolean
  filtro_aire_accion?: 'cambiado' | 'soplado' | null
  transmision_caja: string | null
  engrase: boolean
  proxima_revision: string | null
  proximo_kilometraje: number | null
  observaciones: string | null
  created_at: string
  vehiculo?: Vehiculo
  chofer?: Chofer | null
}

export interface MantenimientoConRelaciones extends MantenimientoAceite {
  vehiculo: Vehiculo
  chofer: Chofer | null
}

export type TipoSeguimiento = 'kilometraje' | 'fecha'

export interface VehiculoConSeguimiento extends Vehiculo {
  tipo_seguimiento: TipoSeguimiento
  ultimo_mantenimiento?: MantenimientoAceite
  proximo_servicio?: {
    fecha: string | null
    kilometraje: number | null
    vencido: boolean
    dias_restantes: number | null
    km_restantes: number | null
  }
}

export interface DashboardStats {
  total_vehiculos: number
  total_choferes: number
  total_mantenimientos: number
  mantenimientos_mes_actual: number
  proximos_vencidos: number
  mantenimientos_3_4_dias: number
  por_kilometraje: number
  por_fecha: number
}

export interface FormDataCompleto {
  vehiculo: {
    placa: string
    marca: string
    modelo: string
  }
  chofer: {
    nombre: string
    apellido: string
  }
  mantenimiento: {
    fecha_servicio: string
    kilometraje: number | null
    tipo_aceite: string
    numero_filtro: string
    filtro_combustible: boolean
    filtro_aire: boolean
    filtro_aire_accion: 'cambiado' | 'soplado' | null
    transmision_caja: string
    engrase: boolean
    proxima_revision: string | null
    proximo_kilometraje: number | null
    observaciones: string
    usa_kilometraje: boolean
  }
}

export type DatosEdicion =
  | {
      tipo: 'vehiculo'
      datos: Pick<Vehiculo, 'placa' | 'marca' | 'modelo'>
    }
  | {
      tipo: 'chofer'
      datos: Pick<Chofer, 'nombre' | 'apellido'>
    }
  | {
      tipo: 'mantenimiento'
      datos: Omit<MantenimientoAceite, 'id' | 'created_at' | 'vehiculo' | 'chofer'>
    }