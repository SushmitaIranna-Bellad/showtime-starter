-- Add admin-only write policies for theaters table

-- Admin-only INSERT policy
CREATE POLICY "Only admins can insert theaters" 
ON public.theaters 
FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin-only UPDATE policy
CREATE POLICY "Only admins can update theaters" 
ON public.theaters 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin-only DELETE policy
CREATE POLICY "Only admins can delete theaters" 
ON public.theaters 
FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));