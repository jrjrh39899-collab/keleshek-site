-- ==============================================================================
-- СХЕМА БАЗЫ ДАННЫХ SUPABASE ДЛЯ САЙТА "KELESHEK ORAYLARI"
-- Скопируйте весь этот код и запустите в:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Таблица участников и координаторов
CREATE TABLE IF NOT EXISTS public.keleshek_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    role_full TEXT,
    emoji TEXT,
    photo_url TEXT,
    color TEXT DEFAULT '#38bdf8',
    color_glow TEXT DEFAULT 'rgba(56, 189, 248, 0.30)',
    bio TEXT,
    quote TEXT,
    focus TEXT,
    projects TEXT,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Таблица достижений
CREATE TABLE IF NOT EXISTS public.keleshek_achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Общее',
    year TEXT DEFAULT '2026',
    description TEXT,
    photo_url TEXT,
    icon TEXT DEFAULT '🏆',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Таблица настроек и контента сайта
CREATE TABLE IF NOT EXISTS public.keleshek_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включаем RLS
ALTER TABLE public.keleshek_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_content ENABLE ROW LEVEL SECURITY;

-- Создаём политики для публичного чтения и записи через anon ключ
DROP POLICY IF EXISTS "Public can read members" ON public.keleshek_members;
CREATE POLICY "Public can read members" ON public.keleshek_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify members" ON public.keleshek_members;
CREATE POLICY "Public can modify members" ON public.keleshek_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read achievements" ON public.keleshek_achievements;
CREATE POLICY "Public can read achievements" ON public.keleshek_achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify achievements" ON public.keleshek_achievements;
CREATE POLICY "Public can modify achievements" ON public.keleshek_achievements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read content" ON public.keleshek_content;
CREATE POLICY "Public can read content" ON public.keleshek_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can modify content" ON public.keleshek_content;
CREATE POLICY "Public can modify content" ON public.keleshek_content FOR ALL USING (true) WITH CHECK (true);

-- Создаем публичный бакет для загрузки фотографий (если отсутствует)
INSERT INTO storage.buckets (id, name, public)
VALUES ('keleshek-photos', 'keleshek-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Политика для хранилища картинок
DROP POLICY IF EXISTS "Public Storage Access" ON storage.objects;
CREATE POLICY "Public Storage Access" ON storage.objects
FOR ALL USING (bucket_id = 'keleshek-photos')
WITH CHECK (bucket_id = 'keleshek-photos');
