ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choferes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimientos_aceite ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can manage vehiculos"
  ON public.vehiculos
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon can manage choferes"
  ON public.choferes
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon can manage mantenimientos"
  ON public.mantenimientos_aceite
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
