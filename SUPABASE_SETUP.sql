-- ==============================================================================
-- 🚀 KELESHEK ORAYLARI — ПОЛНЫЙ СКРИПТ НАСТРОЙКИ БАЗЫ SUPABASE
-- Инструкция:
-- 1. Откройте Supabase Dashboard (https://supabase.com/dashboard/project/xvqsbjzbngnolcggojwr)
-- 2. В левом меню выберите "SQL Editor" -> "New query"
-- 3. Вставьте весь этот код и нажмите кнопку "Run" (в правом нижнем углу)
-- ==============================================================================

-- 1. ТАБЛИЦА КООРДИНАТОРОВ И ЛИДЕРА
CREATE TABLE IF NOT EXISTS public.keleshek_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    role_full TEXT,
    emoji TEXT,
    photo_url TEXT DEFAULT '',
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

-- 2. ТАБЛИЦА ДОСТИЖЕНИЙ
CREATE TABLE IF NOT EXISTS public.keleshek_achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Общее',
    year TEXT DEFAULT '2026',
    description TEXT,
    photo_url TEXT DEFAULT '',
    icon TEXT DEFAULT '🏆',
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ТАБЛИЦА КОНТЕНТА САЙТА
CREATE TABLE IF NOT EXISTS public.keleshek_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. НАСТРОЙКА ПРАВ ДОСТУПА (ROW LEVEL SECURITY)
ALTER TABLE public.keleshek_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keleshek_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Members Read" ON public.keleshek_members;
CREATE POLICY "Public Members Read" ON public.keleshek_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Members Write" ON public.keleshek_members;
CREATE POLICY "Public Members Write" ON public.keleshek_members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Achievements Read" ON public.keleshek_achievements;
CREATE POLICY "Public Achievements Read" ON public.keleshek_achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Achievements Write" ON public.keleshek_achievements;
CREATE POLICY "Public Achievements Write" ON public.keleshek_achievements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Content Read" ON public.keleshek_content;
CREATE POLICY "Public Content Read" ON public.keleshek_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Content Write" ON public.keleshek_content;
CREATE POLICY "Public Content Write" ON public.keleshek_content FOR ALL USING (true) WITH CHECK (true);

-- 5. ХРАНИЛИЩЕ ДЛЯ ФОТОГРАФИЙ (STORAGE BUCKET)
INSERT INTO storage.buckets (id, name, public)
VALUES ('keleshek-photos', 'keleshek-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow Public Storage Access" ON storage.objects;
CREATE POLICY "Allow Public Storage Access" ON storage.objects
FOR ALL USING (bucket_id = 'keleshek-photos')
WITH CHECK (bucket_id = 'keleshek-photos');

-- ==============================================================================
-- 6. НАЧАЛЬНЫЕ ДАННЫЕ (SEED DATA)
-- ==============================================================================

-- Заполняем лидера и координаторов
INSERT INTO public.keleshek_members (id, name, role, role_full, emoji, photo_url, color, color_glow, bio, quote, focus, projects, responsibilities, order_index)
VALUES
(
  'leader',
  'Keleshek Lideri',
  'Келешек Лидери',
  'Главный лидер и председатель движения',
  '🌟',
  '',
  '#fbbf24',
  'rgba(251, 191, 36, 0.35)',
  'Главный координатор всей школьной инициативы Keleshek Orayları. Отвечает за общую стратегию развития школьного самоуправления, связь с администрацией, поддержку всех 6 направлений и представление интересов учащихся на городских и районных форумах молодёжи.',
  'Мы не просто учимся — мы создаём атмосферу, где каждый школьник может раскрыть свой потенциал, запустить свой проект и быть услышанным.',
  'Стратегия и лидерство',
  '15+ общешкольных инициатив',
  '["Координация всех 6 направлений", "Связь с администрацией школы", "Представление на форумах", "Утверждение школьных проектов"]'::jsonb,
  0
),
(
  'sport',
  'Sport Koordinatorı',
  'Спорт',
  'Координатор спортивного направления',
  '🏃‍♂️',
  '',
  '#f43f5e',
  'rgba(244, 63, 94, 0.30)',
  'Организует футбольные лиги, волейбольные турниры, шахматные первенства и утренние зарядки. Мотивирует школьников ставить рекорды и побеждать честно. Создаёт спортивный дух и культуру здорового образа жизни в школе.',
  'Спорт — это не просто тренировки, это характер и командный дух.',
  'Турниры и спортивный дух',
  'Кубок школы, кросс, ГТО',
  '["Организация внутришкольных турниров", "Координация спортивных секций", "Проведение эстафет и кроссов", "Межшкольные соревнования"]'::jsonb,
  1
),
(
  'education',
  'Bilimlendiriw Koordinatorı',
  'Образование',
  'Координатор образовательного направления',
  '📖',
  '',
  '#38bdf8',
  'rgba(56, 189, 248, 0.30)',
  'Помогает ребятам готовиться к предметным олимпиадам, запускает клубы дебатов, организует книжные челленджи и викторины. Формирует атмосферу интеллектуального соперничества и взаимной помощи.',
  'Знания — это сила, а делиться знаниями — это мудрость.',
  'Олимпиады и научные клубы',
  'Quiz-битвы, Peer-to-peer учёба',
  '["Подготовка к олимпиадам", "Организация интеллектуальных игр", "Книжные клубы и дебаты", "Взаимопомощь по предметам"]'::jsonb,
  2
),
(
  'it',
  'IT Koordinatorı',
  'IT',
  'Координатор IT и цифровизации',
  '💻',
  '',
  '#818cf8',
  'rgba(129, 140, 248, 0.30)',
  'Отвечает за весь цифровой сектор школы: разработку сайта Keleshek, поддержку презентаций, проведение чемпионатов по программированию и киберспорту. Строит мост между технологиями и образованием.',
  'Код — это новый язык, на котором мы создаём будущее.',
  'Сайт, киберспорт, хакатоны',
  'IT-клуб, школьный портал',
  '["Разработка школьного сайта", "Проведение хакатонов", "Киберспортивные турниры", "Цифровая грамотность"]'::jsonb,
  3
),
(
  'culture',
  'Mádeniyat Koordinatorı',
  'Маденият',
  'Координатор культуры и творчества',
  '🎭',
  '',
  '#f59e0b',
  'rgba(245, 158, 11, 0.30)',
  'Создаёт творческую атмосферу школы: праздничные концерты, театральные постановки, художественные выставки, музыкальные перемены и сохранение национальных традиций.',
  'Искусство делает нас людьми, а творчество — свободными.',
  'Концерты и национальные традиции',
  'Школьный театр, арт-галерея',
  '["Организация концертов", "Театральные постановки", "Художественные выставки", "Сохранение традиций"]'::jsonb,
  4
),
(
  'media',
  'Media Koordinatorı',
  'Медия',
  'Координатор медиа и пресс-центра',
  '🎙️',
  '',
  '#ec4899',
  'rgba(236, 72, 153, 0.30)',
  'Голос и объектив нашей школы! Ведёт социальные сети, снимает фоторепортажи с каждого события, берёт интервью у учителей и учеников, монтирует трендовые ролики и подкасты.',
  'Каждый момент школьной жизни заслуживает быть рассказанным.',
  'Reels, фото, школьный подкаст',
  'Пресс-центр, еженедельный дайджест',
  '["Ведение соцсетей школы", "Фото и видеосъёмка событий", "Школьный подкаст", "Интервью и репортажи"]'::jsonb,
  5
),
(
  'kenes',
  'Keńes Koordinatorı',
  'Кеңес',
  'Координатор совета и самоуправления',
  '⚖️',
  '',
  '#10b981',
  'rgba(16, 185, 129, 0.30)',
  'Основа школьной справедливости и порядка. Координирует собрания старост, следит за выполнением школьного устава, помогает разрешать споры мирным путём и защищает права учеников.',
  'Справедливость — это когда голос каждого ученика имеет значение.',
  'Школьный парламент и этика',
  'Совет старост, открытый микрофон',
  '["Координация школьного парламента", "Защита прав учеников", "Организация дебатов", "Разрешение конфликтов"]'::jsonb,
  6
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  role_full = EXCLUDED.role_full,
  emoji = EXCLUDED.emoji,
  color = EXCLUDED.color,
  color_glow = EXCLUDED.color_glow,
  bio = EXCLUDED.bio,
  quote = EXCLUDED.quote,
  focus = EXCLUDED.focus,
  projects = EXCLUDED.projects,
  responsibilities = EXCLUDED.responsibilities,
  updated_at = now();

-- Заполняем достижения
INSERT INTO public.keleshek_achievements (id, title, category, year, description, icon, photo_url, order_index)
VALUES
(
  'ach-1',
  '1-е место в районном турнире по футзалу',
  'Спорт',
  '2026',
  'Школьная сборная под руководством спорт-координатора одержала победу в финале районной спартакиады.',
  '🏆',
  '',
  0
),
(
  'ach-2',
  'Победители хакатона молодых разработчиков',
  'IT',
  '2026',
  'Команда IT-сектора разработала веб-платформу школьного самоуправления и заняла призовое место.',
  '💻',
  '',
  1
),
(
  'ach-3',
  'Гран-при городского фестиваля «Өнерлі ұрпақ»',
  'Мәдениет',
  '2025',
  'Театральная труппа школы и домбровый ансамбль покорили жюри национального творческого смотра.',
  '🎭',
  '',
  2
),
(
  'ach-4',
  'Запуск школьного медиа-подкаста «Keleshek Talk»',
  'Медиа',
  '2026',
  'Более 10 выпущенных интервью с учителями, активистами и выпускниками. Суммарно 15 000+ просмотров.',
  '🎙️',
  '',
  3
)
ON CONFLICT (id) DO NOTHING;

-- Заполняем контент главной страницы
INSERT INTO public.keleshek_content (key, data)
VALUES (
  'main_content',
  '{
    "heroTag": "Школьное самоуправление 2026/2027",
    "heroTitleLine1": "Энергия молодёжи.",
    "heroTitleLine2": "Новое поколение лидеров.",
    "heroDesc": "Keleshek Orayları — совет активных учеников, объединяющий спорт, образование, IT, культуру, медиа и совет в единую движущую силу нашей школы.",
    "stats": [
      { "val": "7", "lbl": "Направлений" },
      { "val": "100%", "lbl": "Инициатива учеников" },
      { "val": "2026—27", "lbl": "Учебный год" }
    ],
    "schoolTitle": "Наша школа",
    "schoolDesc": "Наша школа — это не просто место, где мы учимся. Это пространство, где рождаются идеи, формируются лидеры и создаётся будущее. Мы верим, что каждый ученик может внести свой вклад в развитие школы и общества. Именно для этого был создан совет координаторов Keleshek Orayları.",
    "missionTitle": "Наша миссия",
    "missionDesc": "Keleshek Orayları Oqıwshılar Keńesi — система школьного самоуправления, где каждый координатор отвечает за своё направление: от спорта и образования до IT, культуры, медиа и школьного совета. Мы организуем мероприятия, создаём проекты и делаем школьную жизнь яркой и наполненной.",
    "values": [
      { "icon": "💪", "title": "Инициатива", "desc": "Каждый может предложить идею и воплотить её" },
      { "icon": "🤝", "title": "Командная работа", "desc": "Вместе мы делаем больше, чем поодиночке" },
      { "icon": "⭐", "title": "Лидерство", "desc": "Мы растим новое поколение ответственных лидеров" }
    ],
    "standTitle": "Наш настоящий штаб",
    "standDesc": "На стене школы установлена официальная визуальная доска Keleshek Orayları Oqıwshılar Keńesi. Каждое направление имеет свой герб, фирменную эмблему и закреплённого координатора.",
    "standPhotoUrl": "/images/board-photo.png",
    "standPoints": [
      "Keleshek Lideri — центральная эмблема с флагом на вершине",
      "6 направлений со своими гербами и иконками",
      "Единая миссия — драйв, открытия и дружба"
    ]
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
