-- Create enum types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE match_type AS ENUM ('singles', 'doubles');
CREATE TYPE match_status AS ENUM ('pending', 'confirmed', 'completed', 'expired');

-- Create provinces table
CREATE TABLE public.provinces (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wards table  
CREATE TABLE public.wards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    province_id UUID REFERENCES public.provinces(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courts table
CREATE TABLE public.courts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    province_id UUID REFERENCES public.provinces(id),
    ward_id UUID REFERENCES public.wards(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin settings table
CREATE TABLE public.admin_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    account_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    gender gender_type NOT NULL,
    email TEXT,
    avatar_url TEXT,
    birthday DATE,
    address TEXT,
    ward_id UUID REFERENCES public.wards(id),
    province_id UUID REFERENCES public.provinces(id),
    current_rank DECIMAL(10,2) DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE public.matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    match_type match_type NOT NULL,
    court_id UUID REFERENCES public.courts(id),
    total_sets INTEGER NOT NULL DEFAULT 3,
    points_to_win INTEGER NOT NULL DEFAULT 11,
    min_point_difference INTEGER NOT NULL DEFAULT 2,
    suggested_handicap INTEGER DEFAULT 0,
    status match_status NOT NULL DEFAULT 'pending',
    confirmation_deadline TIMESTAMP WITH TIME ZONE,
    match_date TIMESTAMP WITH TIME ZONE,
    creator_score JSONB, -- Array of set scores [11, 9, 11]
    opponent_score JSONB, -- Array of set scores [9, 11, 8]
    creator_rank_before DECIMAL(10,2),
    opponent_rank_before DECIMAL(10,2),
    creator_rank_after DECIMAL(10,2),
    opponent_rank_after DECIMAL(10,2),
    points_gained_creator DECIMAL(10,2) DEFAULT 0,
    points_gained_opponent DECIMAL(10,2) DEFAULT 0,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for provinces (public read)
CREATE POLICY "Provinces are viewable by everyone" 
ON public.provinces FOR SELECT 
USING (true);

-- Create policies for wards (public read)
CREATE POLICY "Wards are viewable by everyone" 
ON public.wards FOR SELECT 
USING (true);

-- Create policies for courts (public read)
CREATE POLICY "Courts are viewable by everyone" 
ON public.courts FOR SELECT 
USING (true);

-- Create policies for admin settings (restricted)
CREATE POLICY "Admin settings are viewable by authenticated users" 
ON public.admin_settings FOR SELECT 
TO authenticated
USING (true);

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for matches
CREATE POLICY "Users can view matches they're involved in" 
ON public.matches FOR SELECT 
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = creator_id
        UNION
        SELECT user_id FROM public.profiles WHERE id = opponent_id
    )
);

CREATE POLICY "Users can create matches" 
ON public.matches FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = creator_id)
);

CREATE POLICY "Users can update matches they created or are opponents in" 
ON public.matches FOR UPDATE 
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = creator_id
        UNION
        SELECT user_id FROM public.profiles WHERE id = opponent_id
    )
);

-- Create function to generate account code
CREATE OR REPLACE FUNCTION generate_account_code()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_courts_updated_at
    BEFORE UPDATE ON public.courts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description) VALUES
('default_rank_male', '1000', 'Default starting rank for male players'),
('default_rank_female', '1000', 'Default starting rank for female players'),
('default_rank_other', '1000', 'Default starting rank for other gender players'),
('rank_points_win', '25', 'Default points gained for winning a match'),
('rank_points_loss', '25', 'Default points lost for losing a match'),
('handicap_multiplier', '10', 'Multiplier for calculating handicap points'),
('match_confirmation_hours', '24', 'Hours to confirm a match before expiry'),
('set_difference_multiplier', '2', 'Multiplier for set score difference bonus');

-- Insert sample provinces and wards (Vietnam)
INSERT INTO public.provinces (name, code) VALUES
('Hồ Chí Minh', 'HCM'),
('Hà Nội', 'HN'),
('Đà Nẵng', 'DN');

INSERT INTO public.wards (name, code, province_id) VALUES
('Quận 1', 'Q1', (SELECT id FROM public.provinces WHERE code = 'HCM')),
('Quận 3', 'Q3', (SELECT id FROM public.provinces WHERE code = 'HCM')),
('Ba Đình', 'BD', (SELECT id FROM public.provinces WHERE code = 'HN')),
('Hai Bà Trưng', 'HBT', (SELECT id FROM public.provinces WHERE code = 'HN'));

-- Insert sample courts
INSERT INTO public.courts (name, address, province_id, ward_id) VALUES
('Sân Pickleball Central Park', '123 Nguyễn Huệ, Quận 1', 
 (SELECT id FROM public.provinces WHERE code = 'HCM'),
 (SELECT id FROM public.wards WHERE code = 'Q1')),
('Sân Pickleball Thảo Điền', '456 Xa Lộ Hà Nội, Quận 2',
 (SELECT id FROM public.provinces WHERE code = 'HCM'),
 (SELECT id FROM public.wards WHERE code = 'Q1'));