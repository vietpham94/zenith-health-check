-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION generate_account_code()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate 12-digit code
        code := LPAD(FLOOR(RANDOM() * 1000000000000)::TEXT, 12, '0');
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE account_code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        account_code,
        full_name,
        phone,
        gender,
        email
    ) VALUES (
        NEW.id,
        generate_account_code(),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', NEW.phone),
        COALESCE((NEW.raw_user_meta_data ->> 'gender')::gender_type, 'other'),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;