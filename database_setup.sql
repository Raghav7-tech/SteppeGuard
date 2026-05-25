-- Supabase Database Setup for SteppeGuard

CREATE TABLE IF NOT EXISTS public.observations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id TEXT, -- Changed to text to handle varying id types like 'b0e42d71-55e1-4c12-9c44-59e51c88820c' safely
    district_name TEXT,
    observed_at TIMESTAMPTZ DEFAULT NOW(),
    fusion_score FLOAT,
    risk_level TEXT,
    ndvi_mean FLOAT,
    dnbr_mean FLOAT,
    bai_max FLOAT,
    sar_change_mean FLOAT,
    active_fire_points INTEGER,
    lat FLOAT,
    lng FLOAT
);

-- Optional: Create an index on observed_at to speed up timeframe filtering
CREATE INDEX IF NOT EXISTS idx_observations_observed_at ON public.observations (observed_at);

-- Create Predictions table as it's also queried by the AI Chat backend
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id TEXT,
    district_name TEXT,
    horizon_hours INTEGER,
    spread_probability FLOAT,
    risk_level TEXT,
    predicted_area_ha INTEGER,
    confidence_score FLOAT,
    wind_speed_ms FLOAT,
    wind_dir_deg INTEGER,
    predicted_at TIMESTAMPTZ DEFAULT NOW(),
    timeline JSONB -- Stores the array of timeline dictionaries
);

CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at ON public.predictions (predicted_at);
