ALTER TABLE public.mantenimientos_aceite
  ADD COLUMN IF NOT EXISTS filtro_aire_accion text
  CHECK (filtro_aire_accion IN ('cambiado', 'soplado'));

UPDATE public.mantenimientos_aceite
SET filtro_aire_accion = 'cambiado'
WHERE filtro_aire IS TRUE
  AND filtro_aire_accion IS NULL;
