DROP POLICY IF EXISTS "Anyone can insert quote requests" ON public.quote_requests;

CREATE POLICY "Public can submit new quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (
  (status IS NULL OR status = 'nuovo')
);