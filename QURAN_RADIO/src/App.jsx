import * as React from 'react';
const { useState, useEffect, useCallback, useRef } = React;
import { Search, Moon, Sun, Globe, Play, Pause, Volume2, VolumeX, List, Star, Mic, RotateCw, AlertTriangle } from 'lucide-react'; 

// =================================================================
// 1. الثوابت والمتغيرات الرئيسية
// =================================================================

// قائمة المقرئين المتاحة مع الأكواد الخاصة بهم (أكواد API موحدة)
const reciters = [
	// تم تغيير الكود إلى رمز الـ API الرسمي لـ alquran.cloud
	{ id: 1, name_ar: 'مشاري بن راشد العفاسي', name_en: 'Mishary Alafasy', code: 'ar.alafasy' }, 
	{ id: 2, name_ar: 'عبد الباسط عبد الصمد', name_en: 'Abdul Basit (Murattal)', code: 'ar.abdulbasitmurattal' }, 
	{ id: 3, name_ar: 'ماهر بن حمد المعيقلي', name_en: 'Maher Al Muaiqly', code: 'ar.mahermuaiqly' }, 
    // FIX: تم حذف الشريم والسديس بسبب عدم توفر تلاواتهم للآيات المنفردة بشكل موثوق في الـ API
    // ADD: إضافة مقرئ موثوق آخر
    { id: 4, name_ar: 'أحمد بن علي العجمي', name_en: 'Ahmad Al-Ajmi', code: 'ar.ahmedajamy' },
    { id: 5, name_ar: 'محمد صديق المنشاوي', name_en: 'Muhammad Siddeeq al-Minshawi', code: 'ar.minshawi' }, 
];

// ملاحظة: تم استبعاد السديس والشريم بسبب المشاكل المتكررة في توفر تلاوات الآيات الفردية ضمن alquran.cloud
// يمكن إضافتهم مرة أخرى إذا تم استخدام مصدر API مختلف للصوت في المستقبل.

const API_SURAH_LIST = "https://api.alquran.cloud/v1/surah";
const BASE_API_URL = "https://api.alquran.cloud/v1/surah"; // لاستخدامه في الطلبات المنفصلة
const API_TEXT_EDITION = 'ar.quran-simple'; // استخدام نص عثماني أكثر استقراراً

// **********************************************
// 📝 الثوابت المضافة من API أخرى (Quran.com)
// **********************************************
const ALTERNATE_RECITER_LIST_API = "https://api.quran.com/api/v4/resources/recitations"; // API بديلة لقائمة المقرئين
const ALTERNATE_BASE_API_URL = "https://api.quran.com/api/v4"; // قاعدة API بديلة (لم يتم استخدامها حاليًا)
// **********************************************

// تعريف الثيمات (الثابتة على طلبك: دهبي قديم + أسود/بني)
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
		fontColor: '#D4AF37',
	},
	light: {
		// ثيم فاتح احترافي (مضاد للثبات الداكن)
		bgStart: '#F9FAFB',
		bgEnd: '#FFFFFF',
		text: '#1F2937',
		accent: '#D97706',
		card: 'rgba(255, 255, 255, 0.95)',
		cardHover: '#E5E7EB',
		shadow: 'rgba(217, 119, 6, 0.4)',
		icon: 'text-amber-700',
		darkToggle: false,
		fontColor: '#D97706',
	}
};

// النصوص المترجمة للغات
const translations = {
	'ar': {
		title: 'صدى الآيات',
		reciters_title: 'اختر المقرئ',
		search_placeholder: 'ابحث باسم المقرئ...',
		loading: '...جاري تحميل المقرئين والسور',
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
		from_to_world: 'مِنْ مُحَمَّدٍ إِلَى العَالَمِ', // 👈 تم إضافة التشكيل هنا
		current_ayah: 'السورة كاملة',
		autoplay_blocked: '⚠️ تم حظر التشغيل التلقائي. يرجى الضغط على زر التشغيل (▶️) في الأسفل للبدء.',
		ayah_text_loading: 'جاري تحميل الآيات...',
		network_error: 'عذراً، لم نتمكن من الاتصال بخادم القرآن. حاول مجدداً.',
		ayah_start: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
		ayah_load_failed: 'عذراً، تعذر جلب آيات هذه السورة.',
		ayah_index: 'آية ${index}',
        development_note: 'More features and improvements are coming soon!', // إضافة جملة التطوير
	},
	'en': {
		title: 'Sada Al-Ayat',
		reciters_title: 'Select Reciter',
		search_placeholder: 'Search for Reciter...',
		loading: 'Loading Reciters and Surahs...',
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
		from_to_world: 'From Muhammad to the World', // تحديث النص الإنجليزي أيضاً
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
		loading: 'Chargement des Récitateurs et des Sourates...',
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
		loading: 'Rezitatoren und Suren werden geladen...',
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
		ayah_start: 'Im Namen Allahs, des Allerbarmers, des Barmherzigen.',
		ayah_load_failed: 'Entschuldigung, die Verse dieser Sure konnten nicht abgerufen werden.',
		ayah_index: 'Vers ${index}',
        development_note: 'Weitere Funktionen und Verbesserungen folgen in Kürze!',
	}
};

// =================================================================
// 2. المكون الرئيسي (App)
// =================================================================

// مكون النمط الهندسي الإسلامي (بدون تغيير)
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
	const [currentLang, setCurrentLang] = useState('ar');
	const [isDarkMode, setIsDarkMode] = useState(true);
	const [volume, setVolume] = useState(1); // حالة الصوت
	const [isSurahListOpen, setIsSurahListOpen] = useState(false);
	const [autoplayBlocked, setAutoplayBlocked] = useState(false); // حالة جديدة لحظر التشغيل
	const [currentAyahText, setCurrentAyahText] = useState(''); // حالة جديدة لعرض نص الآية
	const [initialError, setInitialError] = useState(false); // حالة جديدة لخطأ التحميل الأولي
	
	// ******* حالات قائمة التشغيل المتسلسل *******
	const [isPlaylistLoading, setIsPlaylistLoading] = useState(false);
	const [playlist, setPlaylist] = useState([]); // قائمة روابط الآيات
	const [currentAyahIndex, setCurrentAyahIndex] = useState(0); // مؤشر الآية الحالية
	// ******* حالات قائمة التشغيل المتسلسل *******

	// Ref لمشغل الصوت
	const audioRef = useRef(null);

	// جلب النص المترجم
	const getTranslation = useCallback((key, values = {}) => {
		let text = translations[currentLang]?.[key] || translations['ar'][key];
		for (const [k, v] of Object.entries(values)) {
			// استخدام تعبير منتظم عالمي لضمان استبدال جميع المطابقات
			text = text.replace(new RegExp('\\$\\{' + k + '\\}', 'g'), v); 
		}
		return text;
	}, [currentLang]);

	// تحديد الثيم الحالي
	const currentTheme = themes[isDarkMode ? 'dark' : 'light'];
	const dir = currentLang === 'ar' ? 'rtl' : 'ltr';

	// =================================================================
	// 3. وظائف جلب البيانات والتشغيل (FINAL SIMPLE PLAYBACK LOGIC)
	// =================================================================

	// دالة تشغيل الآية التالية في القائمة
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


	// دالة جلب قائمة التشغيل (Playlist)
	const getPlaylist = useCallback(async (surah) => {
		
		// استخدام طلبين منفصلين لضمان دقة البيانات وتجنب مشاكل الدمج
		const audioUrl = `${BASE_API_URL}/${surah.number}/${currentReciter.code}`;
		const textUrl = `${BASE_API_URL}/${surah.number}/${API_TEXT_EDITION}`;

		try {
			// 1. جلب بيانات التلاوة (الصوت) والنص بالتوازي
			const [audioRes, textRes] = await Promise.all([
				fetch(audioUrl),
				fetch(textUrl)
			]);

			// التأكد من نجاح الاستجابات
			if (!audioRes.ok || !textRes.ok) {
				throw new Error(getTranslation('network_error'));
			}

			const [audioData, textData] = await Promise.all([
				audioRes.json(),
				textRes.json()
			]);
			
			const audioAyahs = audioData.data?.ayahs;
			const textAyahs = textData.data?.ayahs;

			// التأكد من وجود البيانات
			if (!audioAyahs || audioAyahs.length === 0 || !textAyahs || textAyahs.length === 0) {
				throw new Error(getTranslation('ayah_load_failed'));
			}

			// إنشاء خريطة للنصوص لتسهيل الدمج باستخدام رقم الآية الكلي (number)
			const textMap = textAyahs.reduce((map, ayah) => {
				map[ayah.number] = ayah.text; 
				return map;
			}, {});


			// بناء قائمة التشغيل بالاعتماد على بيانات الصوت ودمج النص
			const newPlaylist = audioAyahs.map(ayah => {
				const audioLink = ayah.audio ? ayah.audio.replace('http:', 'https:') : null;
				// استخدام رقم الآية الكلي للمطابقة
				const text_ar = textMap[ayah.number] || getTranslation('ayah_load_failed');

				return {
					audio: audioLink, // ضمان HTTPS
					text_ar: text_ar,
					number: ayah.numberInSurah, // رقم الآية داخل السورة
				};
			}).filter(item => item.audio && item.text_ar !== getTranslation('ayah_load_failed')); // إزالة الآيات التي ليس لها صوت أو نص

			if (newPlaylist.length === 0) {
				// إذا كانت القائمة فارغة بعد التصفية، فمن المحتمل أن التلاوة غير متوفرة لهذه السورة
				// نطبع رسالة خطأ أكثر تفصيلاً في الكونسول لتحديد المشكلة
				console.error(`Playback Error: The reciter ${currentReciter.name_ar} (code: ${currentReciter.code}) does not have available audio for Surah ${surah.number} after filtering.`);
				throw new Error(getTranslation('ayah_load_failed'));
			}
			
			return newPlaylist;

		} catch (e) {
			console.error("Error fetching playlist:", e);
			// التحقق من نوع الخطأ لتقديم رسالة أدق
			const errorMessage = e.message && (e.message.includes('ayah_load_failed') || e.message.includes('network_error'))
				? e.message 
				: getTranslation('network_error');

			throw new Error(errorMessage);
		}
	}, [currentReciter, getTranslation]);
	
	
	// وظيفة بدء تشغيل السورة (تبدأ بجلب الـ Playlist)
	const playSurah = useCallback(async (surah) => {
		
		setCurrentSurah(surah);
		setIsSurahListOpen(false); 
		setIsPlaylistLoading(true); // استخدام هذا المتغير لإظهار حالة التحميل
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

			// 3. محاولة تشغيل الآية الأولى مباشرةً (دون الاعتماد على useEffect)
			const firstAyah = playlistForSurah[0];
			if (audioRef.current) {
				audioRef.current.src = firstAyah.audio; 
				
				// محاولة تشغيل الصوت (قد يتم حظره)
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
						setCurrentAyahText(firstAyah.text_ar); // عرض النص حتى لو لم يبدأ الصوت
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

	}, [getPlaylist, getTranslation]);


	// ************************************************
	// دالة اختيار المقرئ (بدون تحميل مسبق)
	// ************************************************
	const selectReciter = useCallback((reciter) => {
		setCurrentReciter(reciter);
		
		// إيقاف التشغيل وإعادة تعيين
		setIsPlaying(false);
		setCurrentSurah(null);
		setAutoplayBlocked(false);
		setCurrentAyahText(''); 
		setPlaylist([]); // مسح القائمة القديمة
		setCurrentAyahIndex(0);
		
		// فتح قائمة السور تلقائياً
		setIsSurahListOpen(true); 

	}, []);


	// وظيفة تبديل التشغيل/الإيقاف (لزر التحكم)
	const togglePlayPause = () => {
		if (!audioRef.current || !currentSurah) return; // لا تعمل إذا لم يتم اختيار سورة بعد

		if (isPlaying) {
			audioRef.current.pause();
		} else {
			// إذا لم يكن هناك مصدر (أول تشغيل بعد الحظر)، قم بتعيين أول آية
			if (!audioRef.current.src && playlist.length > 0) {
				audioRef.current.src = playlist[currentAyahIndex].audio;
			}
			
			// إذا كان المشغل متوقفاً وله مصدر، ابدأ التشغيل
			audioRef.current.play()
				.then(() => {
					setIsPlaying(true);
					setAutoplayBlocked(false); // إزالة رسالة الحظر بعد التفاعل
					// تحديث النص عند الضغط على Play بعد الحظر
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
	
	// ******* مستمع انتهاء التشغيل (Ended Listener) *******
	useEffect(() => {
		if (audioRef.current) {
			const audioEl = audioRef.current;
			audioEl.onended = playNextAyah;
			return () => {
				audioEl.onended = null;
			};
		}
	}, [playNextAyah]);


	// جلب قائمة السور في البداية (منطق مرن)
	useEffect(() => {
		const fetchSurahs = async () => {
			const maxRetries = 3;
			let delay = 1000; // 1 ثانية
			setLoading(true);
			setInitialError(false); // مسح أي خطأ سابق
			
			for (let i = 0; i < maxRetries; i++) {
				try {
					const res = await fetch(API_SURAH_LIST);
					const data = await res.json();
					
					if (data.data) {
						setSurahs(data.data);
						setLoading(false);
						return; // نجح التحميل، نخرج من الحلقة
					}
					
				} catch (error) {
					console.warn(`Fetch Surahs failed, retrying in ${delay / 1000}s...`);
					await new Promise(resolve => setTimeout(resolve, delay));
					delay *= 2; // زيادة زمن التأخير
				}
			}
			
			// إذا فشلت جميع المحاولات
			console.error("Failed to fetch surahs after all retries.");
			setLoading(false);
			setInitialError(true); // تفعيل رسالة الخطأ الأولي
		};
		
		fetchSurahs();

		// تحميل الحالة المحفوظة (مماثل للسابق)
		const savedTheme = localStorage.getItem('quranRadioTheme');
		if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
		const savedLang = localStorage.getItem('quranRadioLang');
		if (savedLang) setCurrentLang(savedLang);
	}, []);

	// =================================================================
	// 5. وظائف الواجهة (UI Logic)
	// =================================================================

	// تبديل الثيم
	const toggleTheme = () => {
		const newTheme = !isDarkMode;
		setIsDarkMode(newTheme);
		localStorage.setItem('quranRadioTheme', newTheme ? 'dark' : 'light');
	};

	// تبديل اللغة
	const switchLanguage = (lang) => {
		setCurrentLang(lang);
		localStorage.setItem('quranRadioLang', lang);
		document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
	};

	// تصفية المقرئين للبحث
	const filteredReciters = reciters.filter(reciter => {
		const normalizedTerm = searchTerm.trim().toLowerCase();
		if (!normalizedTerm) return true;

		// البحث بالاسم العربي والإنجليزي
		return reciter.name_ar.toLowerCase().includes(normalizedTerm) ||
			   reciter.name_en.toLowerCase().includes(normalizedTerm);
	});
	
	// =================================================================
	// 6. مكونات مساعدة (Helper Components)
	// =================================================================

	// مكون عرض نص الآية في منتصف الشاشة (جديد)
	const AyahDisplay = ({ text, isPlaying, currentTheme, dir, currentLang }) => {
		// عرض رسالة التحميل في حالة جلب الآيات
		if (isPlaylistLoading) {
			text = getTranslation('ayah_text_loading');
		}
		
		// إخفاء النص إذا لم يتم بدء التشغيل ولم يكن هناك خطأ
		if (!text || (text === getTranslation('autoplay_blocked') && !autoplayBlocked) ) return null;


		const fontClass = currentLang === 'ar' ? 'font-[\'Amiri\']' : 'font-[\'Inter\']';
		
		return (
			<div 
				className={`
					mt-16 mx-auto max-w-4xl p-6 rounded-xl shadow-2xl transition-all duration-700 
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
					className={`text-2xl sm:text-3xl font-bold transition-all duration-300 ${fontClass}`} 
					style={{ 
						color: currentTheme.accent,
						lineHeight: currentLang === 'ar' ? '2.5rem' : '2rem',
						textAlign: 'center', // دائماً في المنتصف
						direction: 'rtl', // دائماً النص عربي
					}}
					dir={'rtl'}
				>
					{text}
				</p>
				{/* مؤشر الآية الحالية */}
				{isPlaying && currentAyahIndex > 0 && (
					<p className="text-sm mt-3 opacity-80" style={{ color: currentTheme.text }}>
						{getTranslation('ayah_index', { index: currentAyahIndex })}
					</p>
				)}
			</div>
		);
	};
	
	// بطاقة المقرئ
	const ReciterCard = ({ reciter, selectReciter }) => {
		const isSelected = currentReciter.id === reciter.id;
		const name = currentLang === 'ar' ? reciter.name_ar : reciter.name_en;

		return (
			<div
				onClick={() => selectReciter(reciter)}
				className={`
					p-4 rounded-xl shadow-lg transition-all duration-300 transform 
					hover:scale-[1.05] hover:shadow-2xl flex flex-col items-center cursor-pointer text-center
				`}
				style={{
					backgroundColor: isSelected ? currentTheme.accent : currentTheme.card,
					color: isSelected ? currentTheme.bgStart : currentTheme.text,
					boxBoxShadow: isSelected ? `0 0 20px ${currentTheme.shadow}` : undefined,
					border: isSelected ? 'none' : `1px solid ${currentTheme.cardHover}`
				}}
			>
				<div 
					className={`
						w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center 
						text-4xl sm:text-6xl font-bold mb-3 transition-all duration-300
					`}
					style={{
						backgroundColor: isSelected ? currentTheme.bgStart : currentTheme.accent,
						color: isSelected ? currentTheme.accent : currentTheme.bgStart,
						border: `3px solid ${isSelected ? currentTheme.bgStart : currentTheme.accent}`
					}}
				>
					<Mic size={50} /> 
				</div>
				<h3 className="text-lg sm:text-xl font-bold mt-2 truncate max-w-full font-['Amiri']">
					{name}
				</h3>
				<p className="text-xs sm:text-sm opacity-80 mt-1" style={{ color: currentTheme.text }}>
					{getTranslation('select_surah')}
				</p>
				{/* رسالة التحميل المسبق */}
				{isPlaylistLoading && isSelected && (
					<RotateCw size={20} className="animate-spin mt-2" style={{ color: currentTheme.bgStart }} />
				)}
			</div>
		);
	};

	// شريط التنقل العلوي (مماثل للسابق)
	const Navbar = () => (
		<nav
			className="sticky top-0 left-0 right-0 z-40 p-4 shadow-xl flex flex-col md:flex-row justify-between items-center transition-all backdrop-blur-md"
			style={{
				backgroundColor: currentTheme.card.replace('0.95', '0.85'),
				borderBottom: `3px solid ${currentTheme.accent}`,
			}}
		>
			{/* الشعار */}
			<div className="flex items-center space-x-4 space-x-reverse">
				<h1 className="text-2xl font-bold font-['Amiri']" style={{ color: currentTheme.accent }}>
					{getTranslation('title')}
				</h1>
			</div>

			{/* حقل البحث */}
			<div className="relative w-full md:w-1/3 mx-0 md:mx-6 my-2 md:my-0">
				<input
					type="text"
					placeholder={getTranslation('search_placeholder')}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full p-2 rounded-full pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
					style={{
						backgroundColor: currentTheme.bgStart,
						color: currentTheme.text,
						borderColor: currentTheme.accent,
						outlineColor: currentTheme.accent,
						paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem',
						paddingRight: dir === 'rtl' ? '2.5rem' : '1rem',
					}}
				/>
				<Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`} size={20} style={{ color: currentTheme.accent }} />
			</div>

			{/* أزرار الإعدادات */}
			<div className="flex items-center space-x-4 space-x-reverse">
				<button onClick={toggleTheme} className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${currentTheme.icon}`} aria-label="Toggle Theme">
					{currentTheme.darkToggle ? <Sun size={24} /> : <Moon size={24} />}
				</button>
				<LanguageToggle />
				<button onClick={() => setIsSurahListOpen(true)} className={`p-2 rounded-full hover:opacity-80 transition ${currentTheme.icon}`} aria-label="Surah List">
					<List size={24} />
				</button>
			</div>
		</nav>
	);

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

		return (
			<div className="relative" ref={ref}>
				<button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${currentTheme.icon}`} aria-label="Language">
					<Globe size={24} />
				</button>

				{isOpen && (
					<div
						className={`absolute top-12 w-40 rounded-xl shadow-2xl p-2 z-50 transition-all`}
						style={{ 
							backgroundColor: currentTheme.card, 
							border: `1px solid ${currentTheme.accent}`,
							[dir === 'rtl' ? 'right' : 'left']: 0 
						}}
					>
						<button
							onClick={() => { switchLanguage('ar'); setIsOpen(false); }}
							className={`block w-full text-sm p-2 rounded-md hover:opacity-90 transition-colors ${currentLang === 'ar' ? 'font-bold' : ''}`}
							style={{ backgroundColor: currentLang === 'ar' ? currentTheme.cardHover : 'transparent', color: currentTheme.text }}
						>
							{getTranslation('arabic')}
						</button>
						<button
							onClick={() => { switchLanguage('en'); setIsOpen(false); }}
							className={`block w-full text-sm p-2 rounded-md hover:opacity-90 transition-colors ${currentLang === 'en' ? 'font-bold' : ''}`}
							style={{ backgroundColor: currentLang === 'en' ? currentTheme.cardHover : 'transparent', color: currentTheme.text }}
						>
							{getTranslation('english')}
						</button>
						<button
							onClick={() => { switchLanguage('fr'); setIsOpen(false); }} 
							className={`block w-full text-sm p-2 rounded-md hover:opacity-90 transition-colors ${currentLang === 'fr' ? 'font-bold' : ''}`}
							style={{ backgroundColor: currentLang === 'fr' ? currentTheme.cardHover : 'transparent', color: currentTheme.text }}
						>
							{getTranslation('french')}
						</button>
						<button
							onClick={() => { switchLanguage('de'); setIsOpen(false); }}
							className={`block w-full text-sm p-2 rounded-md hover:opacity-90 transition-colors ${currentLang === 'de' ? 'font-bold' : ''}`}
							style={{ backgroundColor: currentLang === 'de' ? currentTheme.cardHover : 'transparent', color: currentTheme.text }}
						>
							{getTranslation('german')}
						</button>
					</div>
				)}
			</div>
		);
	};

	// شريط مشغل الصوت السفلي
	const PlayerBar = ({ volume, handleVolumeChange, currentTheme, isPlaying, togglePlayPause, currentReciter, currentSurah, getTranslation }) => {
		const reciterName = currentLang === 'ar' ? currentReciter.name_ar : currentReciter.name_en;
		const surahName = currentSurah ? (currentLang === 'ar' ? currentSurah.name : currentSurah.englishName) : '';
		
		// *** إصلاح هنا: استخدام الأمان في الوصول إلى currentSurah ***
		const nowPlayingText = currentSurah?.name 
			? getTranslation('playing', { surahName, reciterName })
			: getTranslation('not_playing');
		
		// تم تبسيط مؤشر الحالة
		const statusIndicator = <Mic size={20} className={isPlaying ? 'animate-pulse' : ''} style={{ color: currentTheme.accent }} />;

		const volumeIcon = volume === 0 ? VolumeX : Volume2;

		return (
			<div
				className="fixed bottom-0 left-0 right-0 z-40 shadow-2xl p-4 flex flex-col md:flex-row justify-between items-center transition-all backdrop-blur-md"
				style={{
					backgroundColor: currentTheme.card.replace('0.95', '0.85'), // شبه شفاف أكثر
					borderTop: `3px solid ${currentTheme.accent}`,
				}}
			>
				{/* أزرار التحكم */}
				<div className="flex items-center space-x-4 space-x-reverse w-full md:w-auto mb-3 md:mb-0 justify-center md:justify-start">
					<button
						onClick={togglePlayPause}
						disabled={!currentSurah}
						className={`w-12 h-12 rounded-full text-2xl transition-all ${currentSurah ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
						style={{ backgroundColor: currentTheme.accent, color: currentTheme.bgStart }}
					>
						{isPlaying ? <Pause size={24} className="mx-auto" /> : <Play size={24} className="mx-auto" />}
					</button>
					{statusIndicator}
				</div>

				{/* معلومات السورة */}
				<div className="flex-grow mx-0 md:mx-6 w-full">
					<p className="text-lg font-semibold truncate text-center md:text-right mb-1" style={{ color: currentTheme.accent }}>
						{nowPlayingText}
					</p>
					<p className="text-sm opacity-80 text-center md:text-right" style={{ color: currentTheme.text }}>
						{currentSurah ? getTranslation('current_ayah') : getTranslation('select_surah')}
					</p>
				</div>

				{/* التحكم في الصوت */}
				<div className="flex items-center space-x-3 space-x-reverse w-full md:w-auto mt-3 md:mt-0 justify-center md:justify-end">
					{React.createElement(volumeIcon, { size: 24, className: currentTheme.icon })}
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={handleVolumeChange}
						className="w-24 h-2 rounded-lg appearance-none cursor-pointer"
						style={{
							background: `linear-gradient(to right, ${currentTheme.accent} ${volume * 100}%, ${currentTheme.cardHover} ${volume * 100}%)`
						}}
					/>
				</div>
			</div>
		);
	};
	
	// ****** مكون رسالة التحذير العائمة ******
	const AutoplayWarning = () => (
		<div 
			className={`
				fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
				bg-red-800/90 p-6 rounded-xl shadow-2xl z-[60] text-center max-w-sm transition-opacity duration-500
				${autoplayBlocked ? 'opacity-100 visible' : 'opacity-0 invisible'}
			`}
			style={{ 
				borderColor: '#AA8453',
				borderWidth: '2px',
				color: '#F9F3E8',
				fontFamily: currentLang === 'ar' ? "'Amiri', sans-serif" : "'Inter', sans-serif"
			}}
		>
			<AlertTriangle size={32} className="mx-auto mb-3" />
			<p className="font-bold text-lg mb-2">{getTranslation('autoplay_blocked')}</p>
			<p className="text-sm opacity-90">
				{getTranslation('autoplay_blocked').split('.').pop()}
			</p>
		</div>
	);
	// ***************************************


	// اللوحة الجانبية لاختيار السورة (Surah List Sidebar)
	const SurahListSidebar = () => {
		const [listSearchTerm, setListSearchTerm] = useState('');

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


		return (
			<div
				className={`fixed top-0 z-50 w-80 max-w-[90vw] h-full shadow-2xl transition-all duration-300 ${isSurahListOpen ? (dir === 'rtl' ? 'left-0' : 'right-0') : (dir === 'rtl' ? '-left-80' : '-right-80')}`}
				style={{ backgroundColor: currentTheme.card, border: `3px solid ${currentTheme.accent}` }}
			>
				<div className="p-4 flex flex-col h-full">
					<div className="flex justify-between items-center pb-3 mb-4" style={{ borderBottom: `2px solid ${currentTheme.cardHover}` }}>
						<h2 className="text-xl font-bold" style={{ color: currentTheme.accent }}>{getTranslation('list_surahs')}</h2>
						<button onClick={() => setIsSurahListOpen(false)} className={`p-1 rounded-full hover:opacity-80 transition ${currentTheme.icon}`}>
							<List size={24} />
						</button>
					</div>

					{/* شريط البحث داخل القائمة */}
					<div className="relative mb-4">
						<input
							type="text"
							placeholder={getTranslation('search_placeholder').replace('ابحث', 'السورة')}
							value={listSearchTerm}
							onChange={(e) => setListSearchTerm(e.target.value)}
							className="w-full p-2 rounded-full pr-4 text-sm focus:outline-none focus:ring-2"
							style={{
								backgroundColor: currentTheme.bgStart,
								color: currentTheme.text,
								borderColor: currentTheme.accent,
								outlineColor: currentTheme.accent,
								paddingLeft: dir === 'rtl' ? '1rem' : '2.5rem',
								paddingRight: dir === 'rtl' ? '2.5rem' : '1rem',
							}}
						/>
						<Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`} size={20} style={{ color: currentTheme.accent }} />
					</div>

					<ul className="space-y-2 overflow-y-auto flex-grow pr-2">
						{filteredSurahs.map((surah) => (
							<li
								key={surah.number}
								onClick={() => playSurah(surah)}
								className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all duration-200`}
								style={{
									backgroundColor: currentSurah?.number === surah.number ? currentTheme.accent : currentTheme.cardHover,
									color: currentSurah?.number === surah.number ? currentTheme.bgStart : currentTheme.text,
								}}
							>
								<span>{surah.number}. {surahNameInLang(surah)}</span>
								<span className='text-xs opacity-70 ml-2'>
									{surahType(surah)}
								</span>
							</li>
						))}
						{filteredSurahs.length === 0 && (
							<li className="text-center p-4 text-sm" style={{ color: currentTheme.text }}>
								لا توجد نتائج بحث مطابقة.
							</li>
						)}
					</ul>
				</div>
			</div>
		);
	};

	// =================================================================
	// 7. هيكل التطبيق (Return Structure)
	// =================================================================

	return (
		<div
			className="min-h-screen pb-40 relative overflow-hidden" // إضافة overflow-hidden لمنع ظهور الشريط
			dir={dir}
			style={{
				color: currentTheme.text,
				// تطبيق تدرج لوني عميق ومتحرك بالبني والأسود
				background: `linear-gradient(135deg, ${currentTheme.bgStart} 0%, ${currentTheme.bgEnd} 100%)`,
				fontFamily: currentLang === 'ar' ? "'Amiri', 'Cairo', sans-serif" : "'Inter', sans-serif"
			}}
		>
			<style>
				{`
				/* تضمين الخطوط */
				@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Amiri:wght@400;700;900&family=Cairo:wght@400;700&display=swap');
				
				/* تصميم الخلفية المتحركة (Motion Gradient) */
				@keyframes subtleMove {
                    /* حركة أكثر وضوحاً: تحريك التدرج من اليسار إلى اليمين ببطء مع نطاق أوسع */
					0% { background-position: 0% 50%; }
					50% { background-position: 100% 50%; } /* الوصول إلى نهاية النطاق */
					100% { background-position: 0% 50%; }
				}
				.min-h-screen {
					background-size: 500% 500%; /* زيادة حجم التمدد لعمق أكبر للحركة */
					animation: subtleMove 40s ease-in-out infinite alternate; /* زيادة المدة ونوع الحركة */
				}
                
                /* 🌟 تأثير نص مميز للفوتر 🌟 */
                .footer-special-text {
                    font-size: 1.25rem; /* تم زيادة الحجم إلى text-xl */
                    font-weight: 900; /* font-black */
                    font-style: italic;
                    letter-spacing: 0.5px;
                    /* استخدام خط Amiri لجمالية الخط العربي والتشكيل */
                    font-family: 'Amiri', serif; 
                    /* تأثير التوهج الذهبي */
                    text-shadow: 0 0 8px ${currentTheme.accent}, 0 0 15px ${currentTheme.shadow}; /* زيادة قوة التوهج */
                    transition: text-shadow 0.5s ease-in-out;
                }
                .footer-special-text:hover {
                    text-shadow: 0 0 12px ${currentTheme.accent}, 0 0 25px ${currentTheme.shadow};
                }
				
				/* تخصيص شريط التقدم */
				input[type=range]::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 14px;
					height: 14px;
					border-radius: 50%;
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
				/* لوغو صدى الآيات الفني (Echo Effect) */
				.echo-effect-logo {
					filter: ${isDarkMode ? 'drop-shadow(0 0 4px rgba(170, 132, 83, 0.9))' : 'none'};
					animation: echoPulse 2s infinite ease-in-out alternate;
				}
				@keyframes echoPulse {
					from { opacity: 0.8; transform: scale(1); }
					to { opacity: 1; transform: scale(1.05); }
				}
				/* 📢 كلاس النص الكبير الجديد للجملة المميزة 📢 */
				.extra-large-footer-text {
					font-size: 1.75rem; /* حجم كبير جداً: 28px */
					font-weight: 900;
                    /* لتضمن بروز الجملة أكثر من اسم المصمم */
					order: -1; 
					margin-bottom: 0.5rem;
				}
				`}
			</style>
			
			{/* النمط الهندسي الإسلامي في الخلفية */}
			<BackgroundPattern currentTheme={currentTheme} />

			{/* مشغل الصوت الفعلي - مخفي */}
			<audio ref={audioRef} preload="auto" />

			{/* Navbar */}
			<Navbar />

			{/* رسالة حظر التشغيل العائمة */}
			<AutoplayWarning />
			
			{/* مكون عرض نص الآية في منتصف الشاشة */}
			<AyahDisplay 
				text={currentAyahText} 
				isPlaying={isPlaying} 
				currentTheme={currentTheme} 
				dir={dir} 
				currentLang={currentLang} 
			/>

			{/* Main Content */}
			<main className="w-full max-w-6xl mx-auto p-4 pt-28 pb-20 relative z-10">
				{/* لوغو صدى الآيات الفني - يجب وضعه ببروز */}
				<div className="w-48 h-10 mx-auto mb-10 flex items-center justify-center echo-effect-logo">
						<h2 className="text-4xl font-extrabold font-['Amiri']" style={{ color: currentTheme.accent }}>
							{getTranslation('title')}
						</h2>
				</div>


				<h2 className="text-3xl font-bold mb-8 text-center font-['Amiri']" style={{ color: currentTheme.accent }}>
					{getTranslation('reciters_title')}
				</h2>

				{loading ? (
					<p className="text-center text-xl mt-10" style={{ color: currentTheme.text }}>{getTranslation('loading')}</p>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{filteredReciters.map(reciter => (
							<ReciterCard key={reciter.id} reciter={reciter} selectReciter={selectReciter} />
						))}
						{filteredReciters.length === 0 && (
							<p className="col-span-full text-center text-xl mt-10" style={{ color: currentTheme.text }}>
								{getTranslation('search_placeholder').replace('ابحث', 'لا توجد نتائج بحث مطابقة لـ')} "{searchTerm}"
							</p>
						)}
					</div>
				)}
				{/* رسالة خطأ التحميل الأولي */}
				{initialError && (
					<div className="text-center p-6 mt-10 rounded-xl bg-red-800/20 text-yellow-500 shadow-2xl" style={{ borderColor: currentTheme.accent, border: '2px solid' }}>
						<AlertTriangle size={32} className="mx-auto mb-3" style={{ color: currentTheme.accent }}/>
						<h2 className="text-2xl font-bold mb-2">
							{getTranslation('error')}
						</h2>
						<p className="text-lg">
							{getTranslation('network_error')}
						</p>
						<p className="text-sm opacity-70 mt-2">
							الرجاء التأكد من اتصالك بالإنترنت.
						</p>
					</div>
				)}
			</main>

			{/* Player Bar */}
			<PlayerBar 
				volume={volume}
				handleVolumeChange={handleVolumeChange}
				currentTheme={currentTheme}
				isPlaying={isPlaying}
				togglePlayPause={togglePlayPause}
				currentReciter={currentReciter}
				currentSurah={currentSurah}
				getTranslation={getTranslation}
			/>

			{/* Surah List Sidebar */}
			<SurahListSidebar />

			{/* Footer - في آخر البيدج تماماً (يظهر بعد السكرول) */}
			<footer className="w-full mx-auto p-4 py-8 text-center relative z-10" style={{ backgroundColor: currentTheme.bgEnd }}>
				<div className="flex justify-between max-w-6xl mx-auto flex-col md:flex-row">
						{/* الجملة المميزة مكبرة الآن */}
						<p 
                            className="footer-special-text extra-large-footer-text" 
                            style={{ color: currentTheme.accent, alignSelf: 'center' }}
                        >
							{getTranslation('from_to_world')}
						</p>

						<div className="flex flex-col items-center md:items-end mt-2 md:mt-0">
							{/* الرسالة الإنجليزية الجديدة */}
							<p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: currentTheme.accent, opacity: 0.8 }}>
								{getTranslation('development_note')}
							</p>
							{/* اسم المصمم المميز */}
							<p className="footer-special-text" style={{ color: currentTheme.accent }}>
								Designed by Sera
							</p>
						</div>
				</div>
			</footer>
		</div>
	);
}
