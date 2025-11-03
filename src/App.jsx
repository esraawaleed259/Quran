// ملف App.jsx: المكون الرئيسي لتطبيق راديو القرآن

// ***************************************************************
// ملاحظة مهمة: هذا المكون يستخدم Tailwind CSS. تأكد من تحميل
// الأنماط العامة (مثل الخطوط وتكوين Tailwind) في ملف main.jsx
// أو index.css ليتم تطبيقها بشكل صحيح.
// ***************************************************************
import * as React from 'react';
// استخدام React Hooks
const { useState, useEffect, useCallback, useRef } = React;
// استيراد أيقونات Lucide
import { Search, Moon, Sun, Globe, Play, Pause, Volume2, VolumeX, List, Mic, RotateCw, AlertTriangle } from 'lucide-react'; 

// =================================================================
// 1. الثوابت والمتغيرات الرئيسية
// =================================================================

// قائمة المقرئين المتاحة مع الأكواد الخاصة بهم (أكواد API موحدة)
const reciters = [
    { id: 1, name_ar: 'مشاري بن راشد العفاسي', name_en: 'Mishary Alafasy', code: 'ar.alafasy' }, 
    { id: 2, name_ar: 'عبد الباسط عبد الصمد', name_en: 'Abdul Basit (Murattal)', code: 'ar.abdulbasitmurattal' }, 
    { id: 3, name_ar: 'ماهر بن حمد المعيقلي', name_en: 'Maher Al Muaiqly', code: 'ar.mahermuaiqly' }, 
    { id: 4, name_ar: 'أحمد بن علي العجمي', name_en: 'Ahmad Al-Ajmi', code: 'ar.ahmedajamy' },
    { id: 5, name_ar: 'محمد صديق المنشاوي', name_en: 'Muhammad Siddeeq al-Minshawi', code: 'ar.minshawi' }, 
];

const API_SURAH_LIST = "https://api.alquran.cloud/v1/surah";
const BASE_API_URL = "https://api.alquran.cloud/v1/surah"; 
const API_TEXT_EDITION = 'ar.quran-simple'; 

// تعريف الثيمات
const themes = {
    dark: {
        bgStart: '#1C1A17', // بني غامق جداً
        bgEnd: '#000000', // أسود
        text: '#E5E7EB',
        accent: '#AA8453',  // دهبي عتيق وهادئ
        card: 'rgba(28, 26, 23, 0.95)',
        cardHover: '#37332F',
        shadow: 'rgba(170, 132, 83, 0.6)',
        icon: 'text-[#AA8453]',
        darkToggle: true,
    },
    // تم تعديل الثيم الفاتح ليكون أكثر وضوحاً وسهولة
    light: {
        bgStart: '#F5F7F8', // رمادي فاتح جداً
        bgEnd: '#FFFFFF', // أبيض
        text: '#1F2937', // لون نص غامق
        accent: '#2563EB', // أزرق هادئ بدلاً من البرتقالي
        card: 'rgba(255, 255, 255, 0.95)', // خلفية البطاقات
        cardHover: '#E0E7FF', // خلفية عند المرور (أزرق فاتح جداً)
        shadow: 'rgba(37, 99, 235, 0.4)', // ظل أزرق
        icon: 'text-[#2563EB]',
        darkToggle: false,
    }
};

// النصوص المترجمة للغات
const translations = {
    'ar': {
        title: 'صدى الآيات',
        reciters_title: 'اختر المقرئ',
        search_placeholder: 'ابحث باسم المقرئ...',
        loading: '...جاري تحميل السور',
        error: 'عذراً، حدث خطأ أثناء الاتصال.',
        not_playing: 'لم يتم بدء التشغيل بعد',
        playing: 'الآن: سورة ${surahName} للمقرئ ${reciterName}',
        select_surah: 'اختر سورة',
        language: 'اللغة',
        arabic: 'العربية',
        english: 'English',
        french: 'Français', 
        german: 'Deutsch', 
        list_surahs: 'قائمة السور',
        from_to_world: 'مِنْ مُحَمَّدٍ إِلَى العَالَمِ', 
        current_ayah: 'السورة كاملة',
        autoplay_blocked: '⚠️ تم حظر التشغيل التلقائي. يرجى الضغط على زر التشغيل (▶️) في الأسفل للبدء.',
        ayah_text_loading: 'جاري تحميل الآيات...',
        network_error: 'عذراً، لم نتمكن من الاتصال بخادم القرآن. حاول مجدداً.',
        ayah_start: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        ayah_load_failed: 'عذراً، تعذر جلب آيات هذه السورة.',
        ayah_index: 'آية ${index}',
        development_note: 'المزيد من الميزات والتحسينات قادمة قريباً!', 
    },
    'en': {
        title: 'Sada Al-Ayat',
        reciters_title: 'Select Reciter',
        search_placeholder: 'Search for Reciter...',
        loading: 'Loading Surahs...',
        error: 'Sorry, an error occurred.',
        not_playing: 'Not playing yet',
        playing: 'Now Playing: Surah ${surahName} by ${reciterName}',
        select_surah: 'Select Surah',
        language: 'Language',
        arabic: 'Arabic',
        english: 'English',
        french: 'Français', 
        german: 'Deutsch', 
        list_surahs: 'Surah List',
        from_to_world: 'From Muhammad to the World',
        current_ayah: 'Full Surah',
        autoplay_blocked: '⚠️ Autoplay blocked. Please press the Play button (▶️) below to start.',
        ayah_text_loading: 'Loading Ayahs...',
        network_error: 'Sorry, we could not connect to the Quran server. Please try again.',
        ayah_start: 'In the name of Allah, the Most Gracious, the Most Merciful.',
        ayah_load_failed: 'Sorry, unable to fetch ayahs for this surah.',
        ayah_index: 'Ayah ${index}',
        development_note: 'More features and improvements are coming soon!',
    },
    'fr': { 
        title: 'Sada Al-Ayat',
        reciters_title: 'Sélectionner Récitateur',
        search_placeholder: 'Rechercher un Récitateur...',
        loading: 'Chargement des Sourates...',
        error: 'Désolé, une erreur est survenue.',
        not_playing: 'Pas encore de lecture',
        playing: 'En cours : Sourate ${surahName} par ${reciterName}',
        select_surah: 'Sélectionner Sourate',
        language: 'Langue',
        arabic: 'Arabe',
        english: 'Anglais',
        french: 'Français',
        german: 'Allemand',
        list_surahs: 'Liste des Sourates',
        from_to_world: 'De Mohamed au Monde',
        current_ayah: 'Sourate Complète',
        autoplay_blocked: '⚠️ Lecture auto bloquée. Veuillez appuyer sur le bouton Lecture (▶️) ci-dessous.',
        ayah_text_loading: 'Chargement des Ayahs...',
        network_error: 'Désolé, nous n\'avons pas pu nous connecter au serveur du Coran. Veuillez réessayer.',
        ayah_start: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.',
        ayah_load_failed: 'Désolé, impossible de récupérer les ayahs pour cette sourate.',
        ayah_index: 'Verset ${index}',
        development_note: 'Plus de fonctionnalités et d\'améliorations seront bientôt disponibles!',
    },
    'de': { 
        title: 'Sada Al-Ayat',
        reciters_title: 'Wähle den Rezitator',
        search_placeholder: 'Suche nach Rezitator...',
        loading: 'Suren werden geladen...',
        error: 'Entschuldigung, ein Fehler ist aufgetreten.',
        not_playing: 'Noch nicht am Spielen',
        playing: 'Aktuell: Sure ${surahName} von ${reciterName}',
        select_surah: 'Wähle Sure',
        language: 'Sprache',
        arabic: 'Arabisch',
        english: 'Englisch',
        french: 'Französisch',
        german: 'Deutsch',
        list_surahs: 'Surenliste',
        from_to_world: 'Von Mohamed zur Welt',
        current_ayah: 'Volle Sure',
        autoplay_blocked: '⚠️ Autoplay blockiert. Bitte drücken Sie unten auf die Wiedergabetaste (▶️) um zu starten.',
        ayah_text_loading: 'Lade Ayahs...',
        network_error: 'Entschuldigung, die Verbindung zum Quran-Server konnte nicht hergestellt werden.',
        ayah_load_failed: 'Entschuldigung, die Verse dieser Sure konnten nicht abgerufen werden.',
        ayah_index: 'Vers ${index}',
        development_note: 'Weitere Funktionen und Verbesserungen folgen in Kürze!',
    }
};

// =================================================================
// 2. المكون الرئيسي (App)
// =================================================================

// مكون النمط الهندسي الإسلامي
const BackgroundPattern = ({ currentTheme }) => (
    <svg 
        className="fixed inset-0 w-full h-full opacity-5 pointer-events-none z-0" 
        style={{ color: currentTheme.accent }}
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid slice"
    >
        <defs>
            {/* نمط نجمي ثماني مكرر */}
            <pattern id="islamicPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path 
                    d="M10 0 L15 5 L20 10 L15 15 L10 20 L5 15 L0 10 L5 5 Z" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="0.5"
                />
                <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamicPattern)" />
    </svg>
);


export default function App() {
    // حالة التطبيق
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentReciter, setCurrentReciter] = useState(reciters[0]);
    const [currentSurah, setCurrentSurah] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('quranRadioLang') || 'ar');
    // FIX: تغيير القيمة الافتراضية لـ isDarkMode ليكون الثيم الفاتح هو الافتراضي
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('quranRadioTheme') === 'dark'); 
    const [volume, setVolume] = useState(1); 
    const [isSurahListOpen, setIsSurahListOpen] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false); 
    const [currentAyahText, setCurrentAyahText] = useState(''); 
    const [initialError, setInitialError] = useState(false); 
    
    // حالات قائمة التشغيل المتسلسل
    const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
    const [playlist, setPlaylist] = useState([]); 
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0); 

    // Ref لمشغل الصوت
    const audioRef = useRef(null);

    // جلب النص المترجم (UseCallback لمنع إعادة إنشاء الدالة)
    const getTranslation = useCallback((key, values = {}) => {
        let text = translations[currentLang]?.[key] || translations['ar'][key];
        for (const [k, v] of Object.entries(values)) {
            text = text.replace(new RegExp('\\$\\{' + k + '\\}', 'g'), v); 
        }
        return text;
    }, [currentLang]);

    // تحديد الثيم الحالي
    const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
    const dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    // =================================================================
    // 3. وظائف جلب البيانات والتشغيل 
    // =================================================================

    // دالة تشغيل الآية التالية في القائمة (UseCallback لمنع إعادة إنشاء الدالة)
    const playNextAyah = useCallback(() => {
        if (!playlist.length) return;

        let nextIndex = currentAyahIndex + 1;
        
        // إذا وصلنا لنهاية السورة
        if (nextIndex >= playlist.length) {
            setIsPlaying(false);
            setCurrentAyahIndex(0);
            setCurrentAyahText(getTranslation('ayah_start'));
            return;
        }
        
        const nextAyah = playlist[nextIndex];
        
        if (audioRef.current) {
            audioRef.current.src = nextAyah.audio;
            audioRef.current.play()
                .then(() => {
                    setCurrentAyahIndex(nextIndex);
                    setCurrentAyahText(nextAyah.text_ar);
                })
                .catch(e => {
                    console.error("Failed to play next ayah:", e);
                    setIsPlaying(false);
                });
        }
    }, [playlist, currentAyahIndex, getTranslation]);


    // دالة جلب قائمة التشغيل (Playlist) (UseCallback)
    const getPlaylist = useCallback(async (surah) => {
        
        const audioUrl = `${BASE_API_URL}/${surah.number}/${currentReciter.code}`;
        const textUrl = `${BASE_API_URL}/${surah.number}/${API_TEXT_EDITION}`;

        try {
            // 1. جلب بيانات التلاوة (الصوت) والنص بالتوازي
            const [audioRes, textRes] = await Promise.all([
                fetch(audioUrl),
                fetch(textUrl)
            ]);

            if (!audioRes.ok || !textRes.ok) {
                throw new Error(getTranslation('network_error'));
            }

            const [audioData, textData] = await Promise.all([
                audioRes.json(),
                textRes.json()
            ]);
            
            const audioAyahs = audioData.data?.ayahs;
            const textAyahs = textData.data?.ayahs;

            if (!audioAyahs || audioAyahs.length === 0 || !textAyahs || textAyahs.length === 0) {
                throw new Error(getTranslation('ayah_load_failed'));
            }

            const textMap = textAyahs.reduce((map, ayah) => {
                map[ayah.number] = ayah.text; 
                return map;
            }, {});

            // بناء قائمة التشغيل بالاعتماد على بيانات الصوت ودمج النص
            const newPlaylist = audioAyahs.map(ayah => {
                const audioLink = ayah.audio ? ayah.audio.replace('http:', 'https:') : null;
                const text_ar = textMap[ayah.number] || getTranslation('ayah_load_failed');

                return {
                    audio: audioLink, 
                    text_ar: text_ar,
                    number: ayah.numberInSurah, 
                };
            }).filter(item => item.audio && item.text_ar !== getTranslation('ayah_load_failed'));

            if (newPlaylist.length === 0) {
                console.error(`Playback Error: The reciter ${currentReciter.name_ar} (code: ${currentReciter.code}) does not have available audio for Surah ${surah.number} after filtering.`);
                throw new Error(getTranslation('ayah_load_failed'));
            }
            
            return newPlaylist;

        } catch (e) {
            console.error("Error fetching playlist:", e);
            const errorMessage = e.message && (e.message.includes('ayah_load_failed') || e.message.includes('network_error'))
                ? e.message 
                : getTranslation('network_error');

            throw new Error(errorMessage);
        }
    }, [currentReciter, getTranslation]);
    
    
    // وظيفة بدء تشغيل السورة
    const playSurah = useCallback(async (surah) => {
        
        setCurrentSurah(surah);
        setIsSurahListOpen(false); 
        setIsPlaylistLoading(true); 
        setCurrentAyahText(getTranslation('ayah_text_loading'));
        setAutoplayBlocked(false);
        setIsPlaying(false);

        try {
            // 1. جلب قائمة التشغيل
            const playlistForSurah = await getPlaylist(surah);
            
            if (playlistForSurah.length === 0) {
                throw new Error(getTranslation('ayah_load_failed'));
            }
            
            // 2. تحديث قائمة التشغيل والحالة
            setPlaylist(playlistForSurah); 
            setCurrentAyahIndex(0);

            // 3. محاولة تشغيل الآية الأولى مباشرةً
            const firstAyah = playlistForSurah[0];
            if (audioRef.current) {
                audioRef.current.src = firstAyah.audio; 
                audioRef.current.volume = volume;
                
                audioRef.current.play()
                    .then(() => {
                        setIsPlaying(true);
                        setAutoplayBlocked(false);
                        setCurrentAyahText(firstAyah.text_ar);
                    })
                    .catch(e => {
                        // إذا تم الحظر، اضبط الحالة للإشارة إلى الحظر
                        setIsPlaying(false);
                        setAutoplayBlocked(true); 
                        setCurrentAyahText(firstAyah.text_ar); 
                    });
            }


        } catch (e) {
            if(audioRef.current) audioRef.current.src = '';
            setCurrentAyahText(e.message || getTranslation('network_error'));
            console.error("Critical Playback Error:", e);
            setAutoplayBlocked(true);
            setIsPlaying(false);
        } finally {
            setIsPlaylistLoading(false);
        }

    }, [getPlaylist, getTranslation, volume]);


    // وظيفة اختيار المقرئ 
    const selectReciter = useCallback((reciter) => {
        setCurrentReciter(reciter);
        
        // إيقاف التشغيل وإعادة تعيين
        setIsPlaying(false);
        setCurrentSurah(null);
        setAutoplayBlocked(false);
        setCurrentAyahText(''); 
        setPlaylist([]); 
        setCurrentAyahIndex(0);
        
        // FIX: فتح القائمة الجانبية عند اختيار مقرئ جديد
        setIsSurahListOpen(true); 

    }, []);


    // وظيفة تبديل التشغيل/الإيقاف (لزر التحكم)
    const togglePlayPause = () => {
        if (!audioRef.current || !currentSurah) return; 

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // إذا لم يكن هناك مصدر (أول تشغيل بعد الحظر)، قم بتعيين أول آية
            if (!audioRef.current.src && playlist.length > 0) {
                audioRef.current.src = playlist[currentAyahIndex].audio;
            }
            
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    setAutoplayBlocked(false); // إزالة رسالة الحظر بعد التفاعل
                    if (playlist.length > 0) {
                        setCurrentAyahText(playlist[currentAyahIndex].text_ar);
                    }
                })
                .catch(e => {
                    console.error("Play failed after user interaction:", e);
                    setAutoplayBlocked(true);
                });
        }
    };
    
    // وظيفة التحكم في الصوت
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };
    
    // =================================================================
    // 4. useEffects (التحميل الأولي ومستمع الأحداث)
    // =================================================================

    // مستمع انتهاء التشغيل (يتم ربطه مرة واحدة)
    useEffect(() => {
        if (audioRef.current) {
            const audioEl = audioRef.current;
            audioEl.onended = playNextAyah;
            return () => {
                audioEl.onended = null;
            };
        }
    }, [playNextAyah]);


    // جلب قائمة السور في البداية
    useEffect(() => {
        const fetchSurahs = async () => {
            const maxRetries = 3;
            let delay = 1000; 
            setLoading(true);
            setInitialError(false); 
            
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const res = await fetch(API_SURAH_LIST);
                    const data = await res.json();
                    
                    if (data.data) {
                        setSurahs(data.data);
                        setLoading(false);
                        // FIX: ظهور القائمة الجانبية تلقائياً في البداية لتوضيح السور
                        setIsSurahListOpen(true); 
                        return; 
                    }
                    
                } catch (error) {
                    console.warn(`Fetch Surahs failed, retrying in ${delay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; 
                }
            }
            
            console.error("Failed to fetch surahs after all retries.");
            setLoading(false);
            setInitialError(true); 
        };
        
        fetchSurahs();
        
        // تطبيق اتجاه النص بناءً على اللغة المحفوظة في localStorage
        document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLang;
    }, [currentLang]);

    // =================================================================
    // 5. مكونات مساعدة (Helper Components)
    // =================================================================

    // مكون عرض نص الآية في منتصف الشاشة
    const AyahDisplay = () => {
        let text = currentAyahText;
        if (isPlaylistLoading) {
            text = getTranslation('ayah_text_loading');
        }
        
        // إخفاء النص إذا لم يتم بدء التشغيل ولم يكن هناك خطأ
        if (!text || (text === getTranslation('autoplay_blocked') && !autoplayBlocked && !isPlaylistLoading)) return null;

        const fontClass = currentLang === 'ar' ? 'font-[\'Amiri\']' : 'font-[\'Inter\']';
        
        return (
            <div 
                // تم تعديل الحد الأقصى للعرض ليتناسب مع الشاشات
                className={`
                    mt-16 mx-auto max-w-xl p-4 sm:p-6 rounded-xl shadow-2xl transition-all duration-700 
                    ${isPlaying || autoplayBlocked || isPlaylistLoading ? 'opacity-100 scale-100' : 'opacity-70 scale-[0.98]'}
                `}
                style={{ 
                    backgroundColor: currentTheme.card.replace('0.95', '0.90'),
                    border: `1px solid ${currentTheme.accent}`,
                    boxShadow: isPlaying ? `0 0 15px ${currentTheme.shadow}` : 'none'
                }}
            >
                <p 
                    id="ayah-text-container" 
                    // تصغير حجم الخط قليلاً ليتناسب مع العرض الأوسع
                    className={`text-base sm:text-lg lg:text-xl font-bold transition-all duration-300 ${fontClass}`} 
                    style={{ 
                        color: currentTheme.accent,
                        lineHeight: currentLang === 'ar' ? '2.0rem' : '1.5rem',
                        textAlign: 'center', 
                        direction: 'rtl', // دائماً النص عربي
                    }}
                    dir={'rtl'}
                >
                    {text}
                </p>
                {/* مؤشر الآية الحالية */}
                {isPlaying && currentAyahIndex > 0 && (
                    <p className="text-xs mt-3 opacity-80" style={{ color: currentTheme.text }}>
                        {getTranslation('ayah_index', { index: currentAyahIndex })}
                    </p>
                )}
            </div>
        );
    };
    
    // بطاقة المقرئ (محدثة لتصبح عنصر قائمة)
    const ReciterCard = ({ reciter }) => {
        const isSelected = currentReciter.id === reciter.id;
        const name = currentLang === 'ar' ? reciter.name_ar : reciter.name_en;

        return (
            <div
                onClick={() => selectReciter(reciter)}
                // تم تعديل الأنماط لعرضها كعنصر قائمة واضح
                className={`
                    p-3 rounded-lg shadow-md transition-all duration-300 transform 
                    hover:scale-[1.01] hover:shadow-xl flex items-center justify-between cursor-pointer text-${dir === 'rtl' ? 'right' : 'left'}
                    w-full mb-2
                `}
                style={{
                    backgroundColor: isSelected ? currentTheme.accent : currentTheme.card,
                    color: isSelected ? currentTheme.bgStart : currentTheme.text,
                    boxShadow: isSelected ? `0 0 10px ${currentTheme.shadow}` : undefined,
                    border: isSelected ? 'none' : `1px solid ${currentTheme.cardHover}`
                }}
            >
                <div className="flex items-center">
                    <div 
                        // ايقونة المقرئ - تصغير الحجم
                        className={`
                            w-10 h-10 rounded-full flex items-center justify-center 
                            text-base font-bold mr-2 transition-all duration-300
                        `}
                        style={{
                            backgroundColor: isSelected ? currentTheme.bgStart : currentTheme.accent,
                            color: isSelected ? currentTheme.accent : currentTheme.bgStart,
                            border: `2px solid ${isSelected ? currentTheme.bgStart : currentTheme.accent}`
                        }}
                    >
                        <Mic size={18} /> 
                    </div>
                    <div>
                        <h3 className="text-base font-bold truncate max-w-full font-['Amiri']">
                            {name}
                        </h3>
                        <p className="text-xs opacity-80 mt-0.5" style={{ color: isSelected ? currentTheme.bgStart : currentTheme.text }}>
                            {getTranslation('select_surah')}
                        </p>
                    </div>
                </div>

                {/* مؤشر التحديد والتحميل */}
                {(isSelected || isPlaylistLoading) && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {isPlaylistLoading && isSelected && (
                            <RotateCw size={16} className="animate-spin" style={{ color: isSelected ? currentTheme.bgStart : currentTheme.accent }} />
                        )}
                        {isSelected && (
                            <Play size={18} style={{ color: isSelected ? currentTheme.bgStart : currentTheme.accent }} />
                        )}
                    </div>
                )}
            </div>
        );
    };

    // زر تبديل اللغة (قائمة منسدلة)
    const LanguageToggle = () => {
        const [isOpen, setIsOpen] = useState(false);
        const ref = useRef(null);

        useEffect(() => {
            function handleClickOutside(event) {
                if (ref.current && !ref.current.contains(event.target)) {
                    setIsOpen(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [ref]);

        const switchAndClose = (lang) => {
            setCurrentLang(lang);
            localStorage.setItem('quranRadioLang', lang);
            setIsOpen(false);
        };

        return (
            <div className="relative" ref={ref}>
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    // تصغير حجم الأيقونة
                    className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${currentTheme.icon}`} 
                    aria-label="Language"
                >
                    <Globe size={20} />
                </button>

                {isOpen && (
                    <div
                        className={`absolute top-10 w-40 rounded-xl shadow-2xl p-2 z-50 transition-all`}
                        style={{ 
                            backgroundColor: currentTheme.card, 
                            border: `1px solid ${currentTheme.accent}`,
                            [dir === 'rtl' ? 'right' : 'left']: 0 
                        }}
                    >
                        {Object.entries(translations).map(([langCode, names]) => (
                            <button
                                key={langCode}
                                onClick={() => switchAndClose(langCode)}
                                className={`block w-full text-sm p-2 rounded-md hover:opacity-90 transition-colors text-${dir === 'rtl' ? 'right' : 'left'} ${currentLang === langCode ? 'font-bold' : ''}`}
                                style={{ backgroundColor: currentLang === langCode ? currentTheme.cardHover : 'transparent', color: currentTheme.text }}
                            >
                                {names.language}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // شريط التنقل العلوي
    const Navbar = () => (
        <nav
            // جعل الشريط ثابتاً وكبيراً (p-4 و p-6)
            className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4 shadow-xl flex flex-col justify-center transition-all backdrop-blur-md" 
            style={{
                backgroundColor: currentTheme.card.replace('0.95', '0.85'),
                borderBottom: `3px solid ${currentTheme.accent}`,
            }}
        >
            {/* المحتوى الداخلي: مركّز ومحدد بـ max-w-6xl */}
            <div className="flex w-full max-w-6xl items-center justify-between mx-auto">
                {/* الشعار وأزرار التحكم (على اليسار/اليمين) */}
                <div className="flex items-center space-x-3 space-x-reverse">
                    {/* زر القائمة (للهواتف) */}
                    <button onClick={() => setIsSurahListOpen(true)} className={`p-1.5 rounded-full hover:opacity-80 transition md:hidden ${currentTheme.icon}`} aria-label="Surah List">
                        <List size={20} />
                    </button>
                    {/* الشعار */}
                    <h1 className="text-xl sm:text-3xl font-extrabold font-['Amiri'] echo-effect-logo" style={{ color: currentTheme.accent }}>
                        {getTranslation('title')}
                    </h1>
                </div>

                {/* حقل البحث (يظهر في الوسط على الشاشات الكبيرة) */}
                <div className="relative flex-grow mx-4 max-w-md hidden md:block">
                    <input
                        type="text"
                        placeholder={getTranslation('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{
                            backgroundColor: currentTheme.bgStart,
                            color: currentTheme.text,
                            borderColor: currentTheme.accent,
                            outlineColor: currentTheme.accent,
                            paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem',
                            paddingRight: dir === 'rtl' ? '2.5rem' : '1rem',
                        }}
                    />
                    <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${currentTheme.icon}`} size={18} />
                </div>


                {/* أزرار الإعدادات (على اليمين/اليسار) */}
                <div className="flex items-center space-x-3 space-x-reverse">
                    <button onClick={() => {
                        const newTheme = !isDarkMode;
                        setIsDarkMode(newTheme);
                        localStorage.setItem('quranRadioTheme', newTheme ? 'dark' : 'light');
                    }} className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${currentTheme.icon}`} aria-label="Toggle Theme">
                        {currentTheme.darkToggle ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <LanguageToggle />
                    {/* زر القائمة (للشاشات الكبيرة) */}
                    <button onClick={() => setIsSurahListOpen(true)} className={`p-1.5 rounded-full hover:opacity-80 transition hidden md:block ${currentTheme.icon}`} aria-label="Surah List">
                        <List size={20} />
                    </button>
                </div>
            </div>
            
             {/* حقل البحث (يظهر في الأسفل على الهواتف - جزء من الـ Navbar) */}
            <div className="relative w-full mx-0 md:hidden mt-2">
                <input
                    type="text"
                    placeholder={getTranslation('search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                        backgroundColor: currentTheme.bgStart,
                        color: currentTheme.text,
                        borderColor: currentTheme.accent,
                        outlineColor: currentTheme.accent,
                        paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem',
                        paddingRight: dir === 'rtl' ? '2.5rem' : '1rem',
                    }}
                />
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${currentTheme.icon}`} size={18} />
            </div>
        </nav>
    );
    
    // شريط التحكم المتحرك (يظهر تحت الشيوخ مباشرةً)
    const ControlsBar = () => {
        const VolumeIcon = volume === 0 ? VolumeX : Volume2;

        return (
            <div
                // تم تصغير العرض الأقصى لتركيز المحتوى
                className={`w-full max-w-xl mx-auto p-3 rounded-lg shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-center transition-all`}
                style={{
                    backgroundColor: currentTheme.card, 
                    border: `1px solid ${currentTheme.cardHover}`,
                }}
            >
                {/* أزرار التشغيل */}
                <div className="flex items-center space-x-4 space-x-reverse mb-3 sm:mb-0 mr-0 sm:mr-6">
                    <button
                        onClick={togglePlayPause}
                        disabled={!currentSurah || isPlaylistLoading}
                        // تصغير حجم زر التشغيل
                        className={`w-10 h-10 rounded-full text-xl transition-all ${currentSurah ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'} ${isPlaylistLoading ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: currentTheme.accent, color: currentTheme.bgStart }}
                    >
                        {isPlaying ? <Pause size={20} className="mx-auto" /> : <Play size={20} className="mx-auto" />}
                    </button>
                    {isPlaylistLoading && (
                        <RotateCw size={16} className={`animate-spin ${currentTheme.icon}`} style={{ color: currentTheme.accent }} />
                    )}
                </div>

                {/* التحكم في الصوت */}
                <div className="flex items-center space-x-2 space-x-reverse w-full sm:w-auto justify-center">
                    <VolumeIcon size={20} className={currentTheme.icon} />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-32 h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to ${dir === 'rtl' ? 'left' : 'right'}, ${currentTheme.accent} ${volume * 100}%, ${currentTheme.cardHover} ${volume * 100}%)`
                        }}
                    />
                </div>
            </div>
        );
    };

    // شريط مشغل الصوت السفلي (ثابت)
    const FixedPlayerBar = () => {
        // ارتفاع شريط التحكم السفلي هو 72px (p-4 + العناصر الداخلية)
        const reciterName = currentLang === 'ar' ? currentReciter.name_ar : currentReciter.name_en;
        const surahName = currentSurah ? (currentLang === 'ar' ? currentSurah.name : currentSurah.englishName) : '';
        
        const nowPlayingText = currentSurah?.name 
            ? getTranslation('playing', { surahName, reciterName })
            : getTranslation('not_playing');
        
        const MicIcon = isPlaying ? <Mic size={18} className='animate-pulse' style={{ color: currentTheme.accent }} /> : <Mic size={18} className={currentTheme.icon} />;


        return (
            <div
                id="fixed-player-bar"
                // تصغير الـ padding
                className="fixed bottom-0 left-0 right-0 z-40 shadow-2xl p-3 flex justify-center items-center transition-all backdrop-blur-md"
                style={{
                    backgroundColor: currentTheme.card.replace('0.95', '0.85'), 
                    borderTop: `3px solid ${currentTheme.accent}`,
                }}
            >
                {/* المحتوى الداخلي: مركّز ومحدد بـ max-w-6xl */}
                <div className="flex w-full max-w-6xl items-center justify-between">
                    {/* أيقونة حالة التشغيل (Mic) */}
                    <div className="hidden sm:block">
                        {MicIcon}
                    </div>

                    {/* معلومات السورة (النص) - تصغير الخط */}
                    <div className="flex-grow mx-0 sm:mx-6 w-full text-center sm:text-right">
                        <p className="text-sm font-semibold truncate mb-0.5" style={{ color: currentTheme.accent, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                            {nowPlayingText}
                        </p>
                        <p className="text-xs opacity-80" style={{ color: currentTheme.text, textAlign: dir === 'rtl' ? 'right' : 'left' }}>
                            {currentSurah ? getTranslation('current_ayah') : getTranslation('select_surah')}
                        </p>
                    </div>
                    
                    {/* رسالة للتنبيه في الهواتف */}
                    <div className="sm:hidden text-center">
                        {MicIcon}
                    </div>
                </div>

            </div>
        );
    };

    // ****** مكون رسالة التحذير العائمة ******
    const AutoplayWarning = () => {
        if (!autoplayBlocked) return null;

        const warningText = getTranslation('autoplay_blocked');
        // محاولة تقسيم الرسالة للحصول على نص فرعي أكثر نظافة
        const [mainMessage, ...rest] = warningText.split('. ');
        const subMessage = rest.join('. ') || '';

        return (
            <div 
                className={`
                    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-red-800/90 p-5 rounded-lg shadow-2xl z-[60] text-center max-w-xs transition-opacity duration-500
                    ${autoplayBlocked ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}
                style={{ 
                    borderColor: currentTheme.accent,
                    borderWidth: '2px',
                    color: currentTheme.text,
                    backgroundColor: currentTheme.card,
                    fontFamily: currentLang === 'ar' ? "'Amiri', sans-serif" : "'Inter', sans-serif"
                }}
            >
                <AlertTriangle size={28} className="mx-auto mb-2" style={{ color: currentTheme.accent }}/>
                <p className="font-bold text-base mb-1">{mainMessage}.</p>
                <p className="text-sm opacity-90">
                    {subMessage}
                </p>
            </div>
        );
    };
    
    // اللوحة الجانبية لاختيار السورة (Surah List Sidebar)
    const SurahListSidebar = () => {
        
        // عرض اسم السورة باللغة المختارة
        const surahNameInLang = (surah) => currentLang === 'ar' ? surah.name : surah.englishName;

        const filteredSurahs = surahs.filter(surah => {
            const normalizedTerm = listSearchTerm.trim().toLowerCase();
            if (!normalizedTerm) return true;

            // البحث بالاسم العربي والإنجليزي ورقم السورة
            return surah.name.toLowerCase().includes(normalizedTerm) ||
                   surah.englishName.toLowerCase().includes(normalizedTerm) ||
                   surah.number.toString().includes(normalizedTerm);
        });
        
        // دالة لعرض نوع السورة (مكية/مدنية) باللغة المختارة
        const surahType = (surah) => {
            if (currentLang === 'ar') {
                return surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
            } else {
                return surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan';
            }
        };

        // ارتفاع الـ Navbar
        const navbarHeight = 55; // p-3 + border + line-height (تقريبي)
        // ارتفاع الـ PlayerBar
        const playerBarHeight = 50; // p-3 + border + line-height (تقريبي)

        return (
            <>
                {/* خلفية Overlay لعزل القائمة */}
                {isSurahListOpen && (
                    <div 
                        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
                        onClick={() => setIsSurahListOpen(false)}
                    />
                )}

                <div
                    // FIX: ضبط الارتفاع ليتناسب مع الأشرطة الثابتة الجديدة
                    className={`fixed top-0 z-50 w-full sm:w-72 max-w-[90vw] shadow-2xl transition-transform duration-300 transform pt-20 pb-4
                        ${dir === 'rtl' ? 'right-0' : 'left-0'} 
                        ${isSurahListOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')}
                    `} 
                    style={{ 
                        backgroundColor: currentTheme.card, 
                        border: `3px solid ${currentTheme.accent}`,
                        // حساب الارتفاع: ارتفاع الشاشة - ارتفاع شريط التنقل - ارتفاع شريط المشغل
                        height: `calc(100vh - ${navbarHeight + playerBarHeight}px)`, 
                        top: `${navbarHeight}px`, 
                    }}
                >
                    <div className="p-3 flex flex-col h-full">
                        <div className="flex justify-between items-center pb-2 mb-3" style={{ borderBottom: `1px solid ${currentTheme.cardHover}` }}>
                            <h2 className="text-lg font-bold" style={{ color: currentTheme.accent }}>{getTranslation('list_surahs')}</h2>
                            <button onClick={() => setIsSurahListOpen(false)} className={`p-1 rounded-full hover:opacity-80 transition ${currentTheme.icon}`} aria-label="Close List">
                                <List size={18} />
                            </button>
                        </div>

                        {/* شريط البحث داخل القائمة */}
                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder={getTranslation('search_placeholder').replace('ابحث', 'السورة')}
                                value={listSearchTerm}
                                onChange={(e) => setListSearchTerm(e.target.value)}
                                className="w-full p-2 rounded-full text-sm focus:outline-none focus:ring-2"
                                style={{
                                    backgroundColor: currentTheme.bgStart,
                                    color: currentTheme.text,
                                    borderColor: currentTheme.accent,
                                    outlineColor: currentTheme.accent,
                                    paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem',
                                    paddingRight: dir === 'rtl' ? '2.5rem' : '1rem',
                                }}
                            />
                            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 ${currentTheme.icon}`} size={16} />
                        </div>

                        {/* FIX: إزالة الـ padding العمودي من هنا والاعتماد على الـ h-full */}
                        <ul className="space-y-1 overflow-y-auto flex-grow pr-1"> 
                            {/* عرض رسالة إذا لم يتم تحميل السور بعد وفتح القائمة */}
                            {loading && surahs.length === 0 && (
                                <li className="text-center p-3 text-xs" style={{ color: currentTheme.text }}>
                                    <RotateCw size={18} className={`animate-spin mx-auto ${currentTheme.icon}`} />
                                    {getTranslation('loading')}
                                </li>
                            )}
                            
                            {filteredSurahs.map((surah) => {
                                const isSelected = currentSurah?.number === surah.number;
                                return (
                                    <li
                                        key={surah.number}
                                        onClick={() => playSurah(surah)}
                                        className={`p-2 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200 text-sm`}
                                        style={{
                                            backgroundColor: isSelected ? currentTheme.accent : currentTheme.cardHover,
                                            color: isSelected ? currentTheme.bgStart : currentTheme.text,
                                            textAlign: dir === 'rtl' ? 'right' : 'left',
                                        }}
                                    >
                                        <span>{surah.number}. {surahNameInLang(surah)}</span>
                                        <span className='text-xs opacity-70 ml-2'>
                                            {surahType(surah)}
                                        </span>
                                    </li>
                                );
                            })}
                            {filteredSurahs.length === 0 && !loading && (
                                <li className="text-center p-3 text-sm" style={{ color: currentTheme.text }}>
                                    {getTranslation('search_placeholder').replace('ابحث', 'لا توجد نتائج بحث مطابقة')}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </>
        );
    };

    // =================================================================
    // 6. هيكل التطبيق (Return Structure)
    // =================================================================
    
    // تصفية المقرئين للبحث (لمعالجة البحث في الواجهة الرئيسية)
    let filteredReciters = reciters.filter(reciter => {
        const normalizedTerm = searchTerm.trim().toLowerCase();
        if (!normalizedTerm) return true;

        // البحث بالاسم العربي والإنجليزي
        return reciter.name_ar.toLowerCase().includes(normalizedTerm) ||
               reciter.name_en.toLowerCase().includes(normalizedTerm);
    });
    
    // الترتيب الأبجدي للمقرئين بناءً على الاسم العربي (لتحقيق طلب الترتيب)
    filteredReciters = filteredReciters.sort((a, b) => {
        // استخدام localeCompare مع 'ar' لترتيب أبجدي سليم للغة العربية
        return a.name_ar.localeCompare(b.name_ar, 'ar', { sensitivity: 'base' });
    });


    return (
        <div
            className="min-h-screen pb-40 relative main-app-container" 
            dir={dir}
            style={{
                color: currentTheme.text,
                // يتم التحكم في الخلفية عبر CSS Vars و keyframes لتحريك التدرج
                background: `linear-gradient(135deg, ${currentTheme.bgStart} 0%, ${currentTheme.bgEnd} 100%)`,
                fontFamily: currentLang === 'ar' ? "Amiri, Cairo, sans-serif" : "Inter, sans-serif"
            }}
        >
            <style>{`
                /* أنماط الـ Keyframes للحركة والخطوط */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Amiri:wght@400;700;900&family=Cairo:wght@400;700&display=swap');
                
                /* FIX: لضمان ملء الشاشة وعدم الحاجة للـ Zoom Out */
                html, body, #root {
                    height: 100%;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
                .main-app-container {
                    min-height: 100vh; 
                    width: 100vw;
                    box-sizing: border-box;
                    overflow-x: hidden; /* **تأكيد منع التمرير الأفقي** */
                }
                
                @keyframes subtleMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                /* لكي تعمل الرسوم المتحركة، سنستخدم inline style للتحريك في الـ div الرئيسي */
                .main-app-container {
                    background-size: 500% 500%;
                    animation: subtleMove 40s ease-in-out infinite alternate;
                    transition: all 0.5s;
                }
                
                /* تخصيص شريط التقدم لضمان الثبات */
                input[type=range] {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                /* لضمان عمل الشرائط، سنبقي الأنماط العامة لـ thumb هنا */
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    /* لون الـ thumb سنقوم بتعيينه عبر inline style */
                    background: ${currentTheme.accent}; 
                    cursor: pointer;
                    box-shadow: 0 0 5px ${currentTheme.shadow};
                }
                input[type=range]::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: ${currentTheme.accent};
                    cursor: pointer;
                    box-shadow: 0 0 5px ${currentTheme.shadow};
                }

                /* الأنماط المعتمدة على الثيم المتغيرة باستمرار */
                .footer-special-text {
                    text-shadow: 0 0 8px ${currentTheme.accent}, 0 0 15px ${currentTheme.shadow};
                }
                
                .echo-effect-logo {
                    filter: drop-shadow(0 0 4px ${currentTheme.shadow});
                }
                @keyframes echoPulse {
                    from { opacity: 0.8; transform: scale(1); }
                    to { opacity: 1; transform: scale(1.05); }
                }
            `}</style>

            {/* النمط الهندسي الإسلامي في الخلفية */}
            <BackgroundPattern currentTheme={currentTheme} />

            {/* مشغل الصوت الفعلي - مخفي */}
            <audio ref={audioRef} preload="auto" />

            {/* Navbar - ثابت في الأعلى (يحتوي على الأيقونات والشعار والبحث) */}
            <Navbar />

            {/* رسالة حظر التشغيل العائمة */}
            <AutoplayWarning />
            
            {/* مكون عرض نص الآية في منتصف الشاشة */}
            <AyahDisplay />

            {/* Main Content */}
            {/* تم إزالة max-w-6xl من main ليتمدد المحتوى أفقياً (لكن المحتويات الداخلية ستكون بـ max-w-6xl) */}
            {/* تقليص الهوامش العلوية والسفلية قليلاً لتناسب الأشرطة الصغيرة الجديدة */}
            <main className="w-full mx-auto p-3 relative z-10 pt-[80px] pb-[70px] min-h-screen"> 

                {/* تصغير حجم الخط */}
                <h2 className="text-xl sm:text-2xl font-bold mb-5 text-center font-['Amiri']" style={{ color: currentTheme.accent }}>
                    {getTranslation('reciters_title')}
                </h2>
                
                {/* الشريط المتحرك: شريط التحكم في التشغيل والصوت (تحت الشيوخ مباشرة) */}
                {/* تم توسيع الشريط ليتناسب مع العرض الأكبر */}
                <div className="max-w-xl mx-auto mb-6">
                    <ControlsBar />
                </div>


                {/* عرض المقرئين - قائمة مرتبة وأيقونات واضحة */}
                {/* تم تضييق العرض الأقصى لتركيز المحتوى */}
                <div className="flex flex-col space-y-2 max-w-xl mx-auto">
                    {filteredReciters.map(reciter => (
                        <ReciterCard key={reciter.id} reciter={reciter} />
                    ))}
                    {filteredReciters.length === 0 && (
                        <p className="col-span-full text-center text-base mt-8" style={{ color: currentTheme.text }}>
                            {getTranslation('search_placeholder').replace('ابحث', 'لا توجد نتائج بحث مطابقة لـ')} "{searchTerm}"
                        </p>
                    )}
                </div>
                
                {/* رسالة التحميل أو الخطأ الأولي */}
                {(loading && surahs.length === 0) && (
                    <div className="text-center mt-8 p-3 col-span-full">
                        <p className="text-center text-base flex items-center justify-center" style={{ color: currentTheme.text }}>
                            <RotateCw size={18} className={`animate-spin mr-2 ${currentTheme.icon}`} />
                            {getTranslation('loading')}
                        </p>
                    </div>
                )}
                {initialError && (
                    <div className="text-center mt-8 p-3 col-span-full">
                        <div className="text-center p-5 rounded-lg bg-red-800/20 text-yellow-500 shadow-xl" style={{ borderColor: currentTheme.accent, border: '1px solid' }}>
                            <AlertTriangle size={28} className="mx-auto mb-2" style={{ color: currentTheme.accent }}/>
                            <h2 className="text-xl font-bold mb-1" style={{ color: currentTheme.accent }}>
                                {getTranslation('error')}
                            </h2>
                            <p className="text-base" style={{ color: currentTheme.text }}>
                                {getTranslation('network_error')}
                            </p>
                            <p className="text-sm opacity-70 mt-1" style={{ color: currentTheme.text }}>
                                لا يمكن عرض قائمة السور الآن. يمكنك اختيار المقرئ والمحاولة لاحقاً.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* FixedPlayerBar - ثابت في الأسفل (يعرض فقط حالة التشغيل الحالية) */}
            <FixedPlayerBar />

            {/* Surah List Sidebar - تم إصلاح ارتفاعه ليناسب الأشرطة الثابتة */}
            <SurahListSidebar />

            {/* Footer - في آخر البيدج تماماً (يظهر بعد السكرول) */}
            <footer 
                // تم إزالة max-w-6xl ليتمدد الشريط بالكامل
                className="w-full mx-auto p-3 py-6 text-center relative z-10" 
                style={{ backgroundColor: currentTheme.bgEnd }}
            >
                {/* تم تطبيق max-w-6xl على المحتوى الداخلي للـ Footer لمركزه */}
                <div className="flex justify-between max-w-6xl mx-auto flex-col md:flex-row items-center">
                    {/* الجملة المميزة مكبرة الآن */}
                    <p 
                        className="footer-special-text extra-large-footer-text text-sm" 
                        style={{ color: currentTheme.accent, order: dir === 'rtl' ? -1 : 1 }}
                    >
                        {getTranslation('from_to_world')}
                    </p>

                    <div className="flex flex-col items-center md:items-end mt-2 md:mt-0" style={{ order: dir === 'rtl' ? 1 : -1 }}>
                        {/* الرسالة الإنجليزية الجديدة */}
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: currentTheme.accent, opacity: 0.8 }}>
                            {getTranslation('development_note')}
                        </p>
                        {/* اسم المصمم المميز */}
                        <p className="footer-special-text text-xs" style={{ color: currentTheme.accent }}>
                            Designed by Sera
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
