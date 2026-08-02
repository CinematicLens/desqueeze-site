#!/usr/bin/env python3
"""Generate additional separate SEO locale pages (batch 2+)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# folder -> lang code used in data-locale / LOCALIZED_PAGES key
FOLDER_LANG = {
    "zh": "zh-CN",
    "zh-tw": "zh-TW",
}

# Existing already generated: ja ko de es pt zh hi fr
# This batch adds remaining high-coverage markets as separate pages.
LOCALES = {
    "it": {
        "html_lang": "it", "hreflang": "it", "og_locale": "it_IT", "geo": "IT",
        "placename": "Italy", "language_name": "Italian", "currency": "EUR",
        "home_nav": "Home IT", "anamorphic_nav": "Anamorfico", "english_nav": "English",
        "home_title": "Desqueeze anamorfico — strumento web gratis | DeSqueeze Studio IT",
        "home_desc": "Desqueeze anamorfico per creator in Italia. App iPhone, Android, Mac, Windows e strumento online gratis. 1.33×–2×, CinemaScope, LUT live. Senza blocco regionale.",
        "home_kw": "desqueeze anamorfico, correggere anamorfico, CinemaScope, 1.33x desqueeze, iPhone anamorfico",
        "home_h1": "Desqueeze correttamente i filmati anamorfici",
        "home_lede": "DeSqueeze Studio ripristina la compressione orizzontale delle ottiche anamorfiche nel rapporto cinematografico. Dal Web Studio gratis alle app iPhone, Android, Mac e Windows.",
        "ana_title": "Desqueeze anamorfico — monitor live, batch e CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ecosistema desqueeze anamorfico: monitor live, correzione 1.33×–2× e CinemaScope 2.39:1 su iPhone, Android, Mac, Windows e Web Studio gratis — Italia.",
        "ana_h1": "Desqueeze anamorfico — dallo shooting alla delivery",
        "word_desqueeze": "desqueeze anamorfico",
    },
    "nl": {
        "html_lang": "nl", "hreflang": "nl", "og_locale": "nl_NL", "geo": "NL",
        "placename": "Netherlands", "language_name": "Dutch", "currency": "EUR",
        "home_nav": "Home NL", "anamorphic_nav": "Anamorfisch", "english_nav": "English",
        "home_title": "Anamorfisch desqueezen — gratis webtool | DeSqueeze Studio NL",
        "home_desc": "Anamorfisch desqueeze voor makers in NL/BE. Apps voor iPhone, Android, Mac & Windows plus gratis online tool. 1.33×–2×, CinemaScope, live LUT. Geen regioblok.",
        "home_kw": "anamorfisch desqueeze, anamorfisch corrigeren, CinemaScope, 1.33x desqueeze, iPhone anamorfisch",
        "home_h1": "Anamorfisch beeld correct desqueezen",
        "home_lede": "DeSqueeze Studio herstelt de horizontale compressie van anamorfische lenzen naar filmische aspect ratio. Van gratis Web Studio tot apps op iPhone, Android, Mac en Windows.",
        "ana_title": "Anamorfisch desqueeze — live monitor, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfisch desqueeze-ecosysteem: live monitor, 1.33×–2× correctie en CinemaScope 2.39:1 op iPhone, Android, Mac, Windows en gratis Web Studio — Nederland/België.",
        "ana_h1": "Anamorfisch desqueeze — van opname tot delivery",
        "word_desqueeze": "anamorfisch desqueeze",
    },
    "pl": {
        "html_lang": "pl", "hreflang": "pl", "og_locale": "pl_PL", "geo": "PL",
        "placename": "Poland", "language_name": "Polish", "currency": "PLN",
        "home_nav": "Start PL", "anamorphic_nav": "Anamorficzny", "english_nav": "English",
        "home_title": "Desqueeze anamorficzny — darmowe narzędzie web | DeSqueeze Studio PL",
        "home_desc": "Desqueeze anamorficzny dla twórców w Polsce. Aplikacje iPhone, Android, Mac, Windows i darmowe narzędzie online. 1.33×–2×, CinemaScope, live LUT. Bez blokady regionu.",
        "home_kw": "desqueeze anamorficzny, korekcja anamorficzna, CinemaScope, 1.33x desqueeze, iPhone anamorficzny",
        "home_h1": "Poprawnie desqueeze’uj materiał anamorficzny",
        "home_lede": "DeSqueeze Studio przywraca poziome ściśnięcie obiektywów anamorficznych do kinowego formatu. Od darmowego Web Studio po aplikacje iPhone, Android, Mac i Windows.",
        "ana_title": "Desqueeze anamorficzny — live monitor, batch i CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ekosystem desqueeze anamorficznego: live monitor, korekcja 1.33×–2× i CinemaScope 2.39:1 na iPhone, Android, Mac, Windows i darmowym Web Studio — Polska.",
        "ana_h1": "Desqueeze anamorficzny — od zdjęć do delivery",
        "word_desqueeze": "desqueeze anamorficzny",
    },
    "ru": {
        "html_lang": "ru", "hreflang": "ru", "og_locale": "ru_RU", "geo": "RU",
        "placename": "Russia", "language_name": "Russian", "currency": "RUB",
        "home_nav": "Главная RU", "anamorphic_nav": "Анаморфот", "english_nav": "English",
        "home_title": "Анаморфотный десквиз — бесплатный веб-инструмент | DeSqueeze Studio",
        "home_desc": "Анаморфотный desqueeze для авторов. Приложения iPhone, Android, Mac, Windows и бесплатный онлайн-инструмент. 1.33×–2×, CinemaScope, live LUT. Без региональной блокировки.",
        "home_kw": "анаморфотный десквиз, anamorphic desqueeze, CinemaScope, 1.33x desqueeze, iPhone анаморфот",
        "home_h1": "Правильно десквизьте анаморфотный материал",
        "home_lede": "DeSqueeze Studio восстанавливает горизонтальное сжатие анаморфотных объективов к кинематографическому формату. От бесплатного Web Studio до приложений iPhone, Android, Mac и Windows.",
        "ana_title": "Анаморфотный десквиз — live-монитор, batch и CinemaScope | DeSqueeze Studio",
        "ana_desc": "Экосистема анаморфотного desqueeze: live-монитор, коррекция 1.33×–2× и CinemaScope 2.39:1 на iPhone, Android, Mac, Windows и бесплатном Web Studio.",
        "ana_h1": "Анаморфотный десквиз — от съёмки до сдачи",
        "word_desqueeze": "анаморфотный десквиз",
    },
    "uk": {
        "html_lang": "uk", "hreflang": "uk", "og_locale": "uk_UA", "geo": "UA",
        "placename": "Ukraine", "language_name": "Ukrainian", "currency": "UAH",
        "home_nav": "Головна UA", "anamorphic_nav": "Анаморфот", "english_nav": "English",
        "home_title": "Анаморфотний десквіз — безкоштовний веб-інструмент | DeSqueeze Studio",
        "home_desc": "Анаморфотний desqueeze для творців в Україні. Додатки iPhone, Android, Mac, Windows і безкоштовний онлайн-інструмент. 1.33×–2×, CinemaScope, live LUT.",
        "home_kw": "анаморфотний десквіз, anamorphic desqueeze, CinemaScope, 1.33x desqueeze",
        "home_h1": "Правильно десквізьте анаморфотний матеріал",
        "home_lede": "DeSqueeze Studio відновлює горизонтальне стискання анаморфотних об’єктивів до кінематографічного формату. Від безкоштовного Web Studio до додатків iPhone, Android, Mac і Windows.",
        "ana_title": "Анаморфотний десквіз — live-монітор, batch і CinemaScope | DeSqueeze Studio",
        "ana_desc": "Екосистема анаморфотного desqueeze: live-монітор, корекція 1.33×–2× і CinemaScope 2.39:1 на iPhone, Android, Mac, Windows і безкоштовному Web Studio — Україна.",
        "ana_h1": "Анаморфотний десквіз — від зйомки до здачі",
        "word_desqueeze": "анаморфотний десквіз",
    },
    "tr": {
        "html_lang": "tr", "hreflang": "tr", "og_locale": "tr_TR", "geo": "TR",
        "placename": "Turkey", "language_name": "Turkish", "currency": "TRY",
        "home_nav": "TR Ana Sayfa", "anamorphic_nav": "Anamorfik", "english_nav": "English",
        "home_title": "Anamorfik desqueeze — ücretsiz web aracı | DeSqueeze Studio TR",
        "home_desc": "Türkiye’deki yaratıcılar için anamorfik desqueeze. iPhone, Android, Mac, Windows uygulamaları ve ücretsiz online araç. 1.33×–2×, CinemaScope, canlı LUT. Bölge kilidi yok.",
        "home_kw": "anamorfik desqueeze, anamorfik düzeltme, CinemaScope, 1.33x desqueeze, iPhone anamorfik",
        "home_h1": "Anamorfik görüntüyü doğru desqueeze edin",
        "home_lede": "DeSqueeze Studio, anamorfik lenslerin yatay sıkıştırmasını sinematik en-boy oranına geri getirir. Ücretsiz Web Studio’dan iPhone, Android, Mac ve Windows uygulamalarına.",
        "ana_title": "Anamorfik desqueeze — canlı monitör, toplu işlem ve CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfik desqueeze ekosistemi: canlı monitör, 1.33×–2× düzeltme ve CinemaScope 2.39:1 — iPhone, Android, Mac, Windows ve ücretsiz Web Studio — Türkiye.",
        "ana_h1": "Anamorfik desqueeze — çekimden teslimata",
        "word_desqueeze": "anamorfik desqueeze",
    },
    "ar": {
        "html_lang": "ar", "hreflang": "ar", "og_locale": "ar_SA", "geo": "SA",
        "placename": "Saudi Arabia, UAE, MENA", "language_name": "Arabic", "currency": "USD",
        "dir": "rtl",
        "home_nav": "العربية", "anamorphic_nav": "أنامورفيك", "english_nav": "English",
        "home_title": "فك ضغط الأنامورفيك Desqueeze — أداة ويب مجانية | DeSqueeze Studio",
        "home_desc": "تصحيح فيديو الأنامورفيك لصنّاع المحتوى في الشرق الأوسط. تطبيقات iPhone وAndroid وMac وWindows وأداة أونلاين مجانية. 1.33×–2× وCinemaScope وLUT مباشر. بدون قفل إقليمي.",
        "home_kw": "ديسكويز أنامورفيك, anamorphic desqueeze, سينماسكوب, 1.33x desqueeze, آيفون أنامورفيك",
        "home_h1": "صحّح فيديو الأنامورفيك بشكل صحيح",
        "home_lede": "يعيد DeSqueeze Studio الضغط الأفقي لعدسات الأنامورفيك إلى نسبة العرض السينمائية. من Web Studio المجاني إلى تطبيقات iPhone وAndroid وMac وWindows.",
        "ana_title": "ديسكويز أنامورفيك — مراقبة مباشرة وتصدير CinemaScope | DeSqueeze Studio",
        "ana_desc": "منظومة ديسكويز أنامورفيك: مراقبة مباشرة وتصحيح 1.33×–2× وCinemaScope 2.39:1 على iPhone وAndroid وMac وWindows وWeb Studio المجاني — الشرق الأوسط.",
        "ana_h1": "ديسكويز أنامورفيك — من التصوير إلى التسليم",
        "word_desqueeze": "ديسكويز أنامورفيك",
    },
    "th": {
        "html_lang": "th", "hreflang": "th", "og_locale": "th_TH", "geo": "TH",
        "placename": "Thailand", "language_name": "Thai", "currency": "THB",
        "home_nav": "หน้าแรก TH", "anamorphic_nav": "อนามอร์ฟิก", "english_nav": "English",
        "home_title": "Desqueeze อนามอร์ฟิก — เครื่องมือเว็บฟรี | DeSqueeze Studio TH",
        "home_desc": "แก้สัดส่วนวิดีโออนามอร์ฟิกสำหรับครีเอเตอร์ไทย แอป iPhone Android Mac Windows และเครื่องมือออนไลน์ฟรี 1.33×–2× CinemaScope LUT สด ไม่ล็อกภูมิภาค",
        "home_kw": "desqueeze อนามอร์ฟิก, แก้ภาพอนามอร์ฟิก, CinemaScope, 1.33x desqueeze, iPhone อนามอร์ฟิก",
        "home_h1": "Desqueeze วิดีโออนามอร์ฟิกให้ถูกต้อง",
        "home_lede": "DeSqueeze Studio คืนค่าการบีบแนวนอนของเลนส์อนามอร์ฟิกเป็นอัตราส่วนภาพยนตร์ จาก Web Studio ฟรีถึงแอปบน iPhone Android Mac และ Windows",
        "ana_title": "Desqueeze อนามอร์ฟิก — มอนิเตอร์สด แบตช์ และ CinemaScope | DeSqueeze Studio",
        "ana_desc": "ระบบนิเวศ desqueeze อนามอร์ฟิก: มอนิเตอร์สด แก้ 1.33×–2× และ CinemaScope 2.39:1 บน iPhone Android Mac Windows และ Web Studio ฟรี — ประเทศไทย",
        "ana_h1": "Desqueeze อนามอร์ฟิก — จากการถ่ายถึงส่งมอบ",
        "word_desqueeze": "desqueeze อนามอร์ฟิก",
    },
    "vi": {
        "html_lang": "vi", "hreflang": "vi", "og_locale": "vi_VN", "geo": "VN",
        "placename": "Vietnam", "language_name": "Vietnamese", "currency": "VND",
        "home_nav": "Trang chủ VI", "anamorphic_nav": "Anamorphic", "english_nav": "English",
        "home_title": "Desqueeze anamorphic — công cụ web miễn phí | DeSqueeze Studio VN",
        "home_desc": "Desqueeze anamorphic cho creator Việt Nam. App iPhone, Android, Mac, Windows và công cụ online miễn phí. 1.33×–2×, CinemaScope, LUT live. Không khóa vùng.",
        "home_kw": "desqueeze anamorphic, chỉnh anamorphic, CinemaScope, 1.33x desqueeze, iPhone anamorphic",
        "home_h1": "Desqueeze footage anamorphic đúng cách",
        "home_lede": "DeSqueeze Studio khôi phục độ nén ngang của ống kính anamorphic về tỷ lệ khung hình điện ảnh. Từ Web Studio miễn phí đến app iPhone, Android, Mac và Windows.",
        "ana_title": "Desqueeze anamorphic — monitor live, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Hệ sinh thái desqueeze anamorphic: monitor live, chỉnh 1.33×–2× và CinemaScope 2.39:1 trên iPhone, Android, Mac, Windows và Web Studio miễn phí — Việt Nam.",
        "ana_h1": "Desqueeze anamorphic — từ quay đến bàn giao",
        "word_desqueeze": "desqueeze anamorphic",
    },
    "id": {
        "html_lang": "id", "hreflang": "id", "og_locale": "id_ID", "geo": "ID",
        "placename": "Indonesia", "language_name": "Indonesian", "currency": "IDR",
        "home_nav": "Beranda ID", "anamorphic_nav": "Anamorfik", "english_nav": "English",
        "home_title": "Desqueeze anamorfik — alat web gratis | DeSqueeze Studio ID",
        "home_desc": "Desqueeze anamorfik untuk kreator di Indonesia. App iPhone, Android, Mac, Windows plus alat online gratis. 1.33×–2×, CinemaScope, LUT live. Tanpa kunci wilayah.",
        "home_kw": "desqueeze anamorfik, koreksi anamorfik, CinemaScope, 1.33x desqueeze, iPhone anamorfik",
        "home_h1": "Desqueeze footage anamorfik dengan benar",
        "home_lede": "DeSqueeze Studio mengembalikan kompresi horizontal lensa anamorfik ke rasio aspek sinematik. Dari Web Studio gratis hingga app iPhone, Android, Mac, dan Windows.",
        "ana_title": "Desqueeze anamorfik — monitor live, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ekosistem desqueeze anamorfik: monitor live, koreksi 1.33×–2× dan CinemaScope 2.39:1 di iPhone, Android, Mac, Windows, dan Web Studio gratis — Indonesia.",
        "ana_h1": "Desqueeze anamorfik — dari syuting sampai delivery",
        "word_desqueeze": "desqueeze anamorfik",
    },
    "ms": {
        "html_lang": "ms", "hreflang": "ms", "og_locale": "ms_MY", "geo": "MY",
        "placename": "Malaysia", "language_name": "Malay", "currency": "MYR",
        "home_nav": "Laman MS", "anamorphic_nav": "Anamorfik", "english_nav": "English",
        "home_title": "Desqueeze anamorfik — alat web percuma | DeSqueeze Studio MY",
        "home_desc": "Desqueeze anamorfik untuk pencipta di Malaysia. App iPhone, Android, Mac, Windows dan alat dalam talian percuma. 1.33×–2×, CinemaScope, LUT langsung. Tiada kunci wilayah.",
        "home_kw": "desqueeze anamorfik, betulkan anamorfik, CinemaScope, 1.33x desqueeze",
        "home_h1": "Desqueeze rakaman anamorfik dengan betul",
        "home_lede": "DeSqueeze Studio memulihkan mampatan mendatar kanta anamorfik kepada nisbah aspek sinematik. Dari Web Studio percuma ke app iPhone, Android, Mac dan Windows.",
        "ana_title": "Desqueeze anamorfik — monitor langsung, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ekosistem desqueeze anamorfik: monitor langsung, pembetulan 1.33×–2× dan CinemaScope 2.39:1 pada iPhone, Android, Mac, Windows dan Web Studio percuma — Malaysia.",
        "ana_h1": "Desqueeze anamorfik — dari rakaman ke penyerahan",
        "word_desqueeze": "desqueeze anamorfik",
    },
    "fil": {
        "html_lang": "fil", "hreflang": "fil", "og_locale": "fil_PH", "geo": "PH",
        "placename": "Philippines", "language_name": "Filipino", "currency": "PHP",
        "home_nav": "Home PH", "anamorphic_nav": "Anamorphic", "english_nav": "English",
        "home_title": "Anamorphic desqueeze — libreng web tool | DeSqueeze Studio PH",
        "home_desc": "Anamorphic desqueeze para sa mga creator sa Pilipinas. iPhone, Android, Mac, Windows apps at libreng online tool. 1.33×–2×, CinemaScope, live LUT. Walang region lock.",
        "home_kw": "anamorphic desqueeze, ayusin anamorphic, CinemaScope, 1.33x desqueeze, iPhone anamorphic",
        "home_h1": "I-desqueeze nang tama ang anamorphic footage",
        "home_lede": "Ibinalik ng DeSqueeze Studio ang horizontal squeeze ng anamorphic lenses sa cinematic aspect ratio. Mula sa libreng Web Studio hanggang sa iPhone, Android, Mac, at Windows apps.",
        "ana_title": "Anamorphic desqueeze — live monitor, batch at CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorphic desqueeze ecosystem: live monitor, 1.33×–2× correction, at CinemaScope 2.39:1 sa iPhone, Android, Mac, Windows, at libreng Web Studio — Pilipinas.",
        "ana_h1": "Anamorphic desqueeze — mula shoot hanggang delivery",
        "word_desqueeze": "anamorphic desqueeze",
    },
    "sv": {
        "html_lang": "sv", "hreflang": "sv", "og_locale": "sv_SE", "geo": "SE",
        "placename": "Sweden", "language_name": "Swedish", "currency": "SEK",
        "home_nav": "Hem SV", "anamorphic_nav": "Anamorfisk", "english_nav": "English",
        "home_title": "Anamorfisk desqueeze — gratis webbverktyg | DeSqueeze Studio SE",
        "home_desc": "Anamorfisk desqueeze för skapare i Sverige. Appar för iPhone, Android, Mac, Windows plus gratis onlineverktyg. 1.33×–2×, CinemaScope, live LUT. Ingen regionslåsning.",
        "home_kw": "anamorfisk desqueeze, korrigera anamorfisk, CinemaScope, 1.33x desqueeze",
        "home_h1": "Desqueeza anamorfiskt material korrekt",
        "home_lede": "DeSqueeze Studio återställer den horisontella kompressionen från anamorfiska objektiv till filmisk bildformat. Från gratis Web Studio till appar på iPhone, Android, Mac och Windows.",
        "ana_title": "Anamorfisk desqueeze — live-monitor, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfiskt desqueeze-ekosystem: live-monitor, 1.33×–2×-korrektion och CinemaScope 2.39:1 på iPhone, Android, Mac, Windows och gratis Web Studio — Sverige.",
        "ana_h1": "Anamorfisk desqueeze — från inspelning till leverans",
        "word_desqueeze": "anamorfisk desqueeze",
    },
    "da": {
        "html_lang": "da", "hreflang": "da", "og_locale": "da_DK", "geo": "DK",
        "placename": "Denmark", "language_name": "Danish", "currency": "DKK",
        "home_nav": "Hjem DA", "anamorphic_nav": "Anamorfisk", "english_nav": "English",
        "home_title": "Anamorfisk desqueeze — gratis webværktøj | DeSqueeze Studio DK",
        "home_desc": "Anamorfisk desqueeze til skabere i Danmark. Apps til iPhone, Android, Mac, Windows plus gratis onlineværktøj. 1.33×–2×, CinemaScope, live LUT. Ingen regionslås.",
        "home_kw": "anamorfisk desqueeze, ret anamorfisk, CinemaScope, 1.33x desqueeze",
        "home_h1": "DesqueeZ anamorfisk footage korrekt",
        "home_lede": "DeSqueeze Studio genskaber den vandrette kompression fra anamorfe objektiver til filmisk billedformat. Fra gratis Web Studio til apps på iPhone, Android, Mac og Windows.",
        "ana_title": "Anamorfisk desqueeze — live-monitor, batch & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfisk desqueeze-økosystem: live-monitor, 1.33×–2× korrektion og CinemaScope 2.39:1 på iPhone, Android, Mac, Windows og gratis Web Studio — Danmark.",
        "ana_h1": "Anamorfisk desqueeze — fra optagelse til levering",
        "word_desqueeze": "anamorfisk desqueeze",
    },
    "no": {
        "html_lang": "no", "hreflang": "no", "og_locale": "nb_NO", "geo": "NO",
        "placename": "Norway", "language_name": "Norwegian", "currency": "NOK",
        "home_nav": "Hjem NO", "anamorphic_nav": "Anamorfisk", "english_nav": "English",
        "home_title": "Anamorfisk desqueeze — gratis nettverktøy | DeSqueeze Studio NO",
        "home_desc": "Anamorfisk desqueeze for skapere i Norge. Apper for iPhone, Android, Mac, Windows pluss gratis nettverktøy. 1.33×–2×, CinemaScope, live LUT. Ingen regionslås.",
        "home_kw": "anamorfisk desqueeze, korriger anamorfisk, CinemaScope, 1.33x desqueeze",
        "home_h1": "DesqueeZ anamorfisk materiale riktig",
        "home_lede": "DeSqueeze Studio gjenoppretter den horisontale komprimeringen fra anamorfe objektiver til filmisk bildeforhold. Fra gratis Web Studio til apper på iPhone, Android, Mac og Windows.",
        "ana_title": "Anamorfisk desqueeze — live-monitor, batch og CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfisk desqueeze-økosystem: live-monitor, 1.33×–2×-korreksjon og CinemaScope 2.39:1 på iPhone, Android, Mac, Windows og gratis Web Studio — Norge.",
        "ana_h1": "Anamorfisk desqueeze — fra opptak til leveranse",
        "word_desqueeze": "anamorfisk desqueeze",
    },
    "fi": {
        "html_lang": "fi", "hreflang": "fi", "og_locale": "fi_FI", "geo": "FI",
        "placename": "Finland", "language_name": "Finnish", "currency": "EUR",
        "home_nav": "Koti FI", "anamorphic_nav": "Anamorfinen", "english_nav": "English",
        "home_title": "Anamorfinen desqueeze — ilmainen web-työkalu | DeSqueeze Studio FI",
        "home_desc": "Anamorfinen desqueeze tekijöille Suomessa. iPhone-, Android-, Mac- ja Windows-sovellukset sekä ilmainen verkko työkalu. 1.33×–2×, CinemaScope, live LUT. Ei aluelukkoa.",
        "home_kw": "anamorfinen desqueeze, korjaa anamorfinen, CinemaScope, 1.33x desqueeze",
        "home_h1": "DesqueeZaa anamorfinen materiaali oikein",
        "home_lede": "DeSqueeze Studio palauttaa anamorfisten objektiivien vaakapuristuksen elokuvalliseen kuvasuhteeseen. Ilmaisesta Web Studiosta iPhone-, Android-, Mac- ja Windows-sovelluksiin.",
        "ana_title": "Anamorfinen desqueeze — live-monitori, eräajo & CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorfinen desqueeze-ekosysteemi: live-monitori, 1.33×–2× korjaus ja CinemaScope 2.39:1 iPhonella, Androidilla, Macilla, Windowsilla ja ilmaisella Web Studiolla — Suomi.",
        "ana_h1": "Anamorfinen desqueeze — kuvauksesta toimitukseen",
        "word_desqueeze": "anamorfinen desqueeze",
    },
    "cs": {
        "html_lang": "cs", "hreflang": "cs", "og_locale": "cs_CZ", "geo": "CZ",
        "placename": "Czechia", "language_name": "Czech", "currency": "CZK",
        "home_nav": "Domů CS", "anamorphic_nav": "Anamorfní", "english_nav": "English",
        "home_title": "Anamorfní desqueeze — bezplatný webový nástroj | DeSqueeze Studio CZ",
        "home_desc": "Anamorfní desqueeze pro tvůrce v Česku. Aplikace iPhone, Android, Mac, Windows a bezplatný online nástroj. 1.33×–2×, CinemaScope, live LUT. Bez regionálního zámku.",
        "home_kw": "anamorfní desqueeze, korekce anamorfní, CinemaScope, 1.33x desqueeze",
        "home_h1": "Správně desqueezněte anamorfní materiál",
        "home_lede": "DeSqueeze Studio obnovuje horizontální stlačení anamorfních objektivů na filmový poměr stran. Od bezplatného Web Studia po aplikace iPhone, Android, Mac a Windows.",
        "ana_title": "Anamorfní desqueeze — live monitor, dávky a CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ekosystém anamorfního desqueeze: live monitor, korekce 1.33×–2× a CinemaScope 2.39:1 na iPhone, Android, Mac, Windows a bezplatném Web Studiu — Česko.",
        "ana_h1": "Anamorfní desqueeze — od natáčení po odevzdání",
        "word_desqueeze": "anamorfní desqueeze",
    },
    "ro": {
        "html_lang": "ro", "hreflang": "ro", "og_locale": "ro_RO", "geo": "RO",
        "placename": "Romania", "language_name": "Romanian", "currency": "RON",
        "home_nav": "Acasă RO", "anamorphic_nav": "Anamorfic", "english_nav": "English",
        "home_title": "Desqueeze anamorfic — instrument web gratuit | DeSqueeze Studio RO",
        "home_desc": "Desqueeze anamorfic pentru creatori din România. Aplicații iPhone, Android, Mac, Windows și instrument online gratuit. 1.33×–2×, CinemaScope, LUT live. Fără blocare regională.",
        "home_kw": "desqueeze anamorfic, corectare anamorfic, CinemaScope, 1.33x desqueeze",
        "home_h1": "Desqueeze corect materialul anamorfic",
        "home_lede": "DeSqueeze Studio restaurează compresia orizontală a obiectivelor anamorfice la raportul de aspect cinematografic. De la Web Studio gratuit la aplicații iPhone, Android, Mac și Windows.",
        "ana_title": "Desqueeze anamorfic — monitor live, batch și CinemaScope | DeSqueeze Studio",
        "ana_desc": "Ecosistem desqueeze anamorfic: monitor live, corecție 1.33×–2× și CinemaScope 2.39:1 pe iPhone, Android, Mac, Windows și Web Studio gratuit — România.",
        "ana_h1": "Desqueeze anamorfic — de la filmare la livrare",
        "word_desqueeze": "desqueeze anamorfic",
    },
    "hu": {
        "html_lang": "hu", "hreflang": "hu", "og_locale": "hu_HU", "geo": "HU",
        "placename": "Hungary", "language_name": "Hungarian", "currency": "HUF",
        "home_nav": "Kezdőlap HU", "anamorphic_nav": "Anamorf", "english_nav": "English",
        "home_title": "Anamorf desqueeze — ingyenes webes eszköz | DeSqueeze Studio HU",
        "home_desc": "Anamorf desqueeze magyar alkotóknak. iPhone, Android, Mac, Windows alkalmazások és ingyenes online eszköz. 1.33×–2×, CinemaScope, élő LUT. Nincs régiózár.",
        "home_kw": "anamorf desqueeze, anamorf javítás, CinemaScope, 1.33x desqueeze",
        "home_h1": "DesqueeZeld helyesen az anamorf anyagot",
        "home_lede": "A DeSqueeze Studio visszaállítja az anamorf objektívek vízszintes összenyomását filmszerű képarányra. Az ingyenes Web Studiótól az iPhone, Android, Mac és Windows appokig.",
        "ana_title": "Anamorf desqueeze — élő monitor, batch és CinemaScope | DeSqueeze Studio",
        "ana_desc": "Anamorf desqueeze ökoszisztéma: élő monitor, 1.33×–2× korrekció és CinemaScope 2.39:1 iPhone-on, Androidon, Macen, Windowson és ingyenes Web Studión — Magyarország.",
        "ana_h1": "Anamorf desqueeze — a felvételtől a leadásig",
        "word_desqueeze": "anamorf desqueeze",
    },
    "el": {
        "html_lang": "el", "hreflang": "el", "og_locale": "el_GR", "geo": "GR",
        "placename": "Greece", "language_name": "Greek", "currency": "EUR",
        "home_nav": "Αρχική EL", "anamorphic_nav": "Αναμορφωτικό", "english_nav": "English",
        "home_title": "Αναμορφωτικό desqueeze — δωρεάν web εργαλείο | DeSqueeze Studio GR",
        "home_desc": "Αναμορφωτικό desqueeze για δημιουργούς στην Ελλάδα. Εφαρμογές iPhone, Android, Mac, Windows και δωρεάν online εργαλείο. 1.33×–2×, CinemaScope, live LUT. Χωρίς κλείδωμα περιοχής.",
        "home_kw": "αναμορφωτικό desqueeze, διόρθωση αναμορφωτικού, CinemaScope, 1.33x desqueeze",
        "home_h1": "Κάντε σωστά desqueeze το αναμορφωτικό υλικό",
        "home_lede": "Το DeSqueeze Studio επαναφέρει την οριζόντια συμπίεση των αναμορφωτικών φακών στην κινηματογραφική αναλογία. Από το δωρεάν Web Studio έως εφαρμογές iPhone, Android, Mac και Windows.",
        "ana_title": "Αναμορφωτικό desqueeze — live monitor, batch και CinemaScope | DeSqueeze Studio",
        "ana_desc": "Οικοσύστημα αναμορφωτικού desqueeze: live monitor, διόρθωση 1.33×–2× και CinemaScope 2.39:1 σε iPhone, Android, Mac, Windows και δωρεάν Web Studio — Ελλάδα.",
        "ana_h1": "Αναμορφωτικό desqueeze — από τα γυρίσματα στην παράδοση",
        "word_desqueeze": "αναμορφωτικό desqueeze",
    },
    "he": {
        "html_lang": "he", "hreflang": "he", "og_locale": "he_IL", "geo": "IL",
        "placename": "Israel", "language_name": "Hebrew", "currency": "ILS",
        "dir": "rtl",
        "home_nav": "עברית", "anamorphic_nav": "אנאמורפי", "english_nav": "English",
        "home_title": "Desqueeze אנאמורפי — כלי ווב חינם | DeSqueeze Studio IL",
        "home_desc": "תיקון וידאו אנאמורפי ליוצרים בישראל. אפליקציות iPhone, Android, Mac, Windows וכלי אונליין חינם. 1.33×–2×, CinemaScope, LUT חי. בלי נעילת אזור.",
        "home_kw": "desqueeze אנאמורפי, תיקון אנאמורפי, CinemaScope, 1.33x desqueeze",
        "home_h1": "תקנו נכון צילום אנאמורפי",
        "home_lede": "DeSqueeze Studio משחזר את הדחיסה האופקית של עדשות אנאמורפיות ליחס מסך קולנועי. מ-Web Studio חינם ועד אפליקציות iPhone, Android, Mac ו-Windows.",
        "ana_title": "Desqueeze אנאמורפי — מוניטור חי, אצווה ו-CinemaScope | DeSqueeze Studio",
        "ana_desc": "אקוסיסטם desqueeze אנאמורפי: מוניטור חי, תיקון 1.33×–2× ו-CinemaScope 2.39:1 ב-iPhone, Android, Mac, Windows ו-Web Studio חינם — ישראל.",
        "ana_h1": "Desqueeze אנאמורפי — מצילום ועד מסירה",
        "word_desqueeze": "desqueeze אנאמורפי",
    },
    "bn": {
        "html_lang": "bn", "hreflang": "bn", "og_locale": "bn_BD", "geo": "BD",
        "placename": "Bangladesh", "language_name": "Bengali", "currency": "BDT",
        "home_nav": "বাংলা হোম", "anamorphic_nav": "অ্যানামরফিক", "english_nav": "English",
        "home_title": "অ্যানামরফিক ডিস্কুইজ — ফ্রি ওয়েব টুল | DeSqueeze Studio",
        "home_desc": "বাংলাদেশ ও বাংলাভাষী ক্রিয়েটরদের জন্য অ্যানামরফিক ডিস্কুইজ। iPhone, Android, Mac, Windows অ্যাপ ও ফ্রি অনলাইন টুল। 1.33×–2×, CinemaScope, লাইভ LUT।",
        "home_kw": "অ্যানামরফিক ডিস্কুইজ, anamorphic desqueeze, CinemaScope, 1.33x desqueeze",
        "home_h1": "অ্যানামরফিক ফুটেজ সঠিকভাবে ডিস্কুইজ করুন",
        "home_lede": "DeSqueeze Studio অ্যানামরফিক লেন্সের অনুভূমিক সংকোচন সিনেমাটিক অ্যাসপেক্ট রেশিওতে ফিরিয়ে আনে। ফ্রি Web Studio থেকে iPhone, Android, Mac ও Windows অ্যাপ পর্যন্ত।",
        "ana_title": "অ্যানামরফিক ডিস্কুইজ — লাইভ মনিটর, ব্যাচ ও CinemaScope | DeSqueeze Studio",
        "ana_desc": "অ্যানামরফিক ডিস্কুইজ ইকোসিস্টেম: লাইভ মনিটর, 1.33×–2× সংশোধন ও CinemaScope 2.39:1 — iPhone, Android, Mac, Windows ও ফ্রি Web Studio।",
        "ana_h1": "অ্যানামরফিক ডিস্কুইজ — শুটিং থেকে ডেলিভারি",
        "word_desqueeze": "অ্যানামরফিক ডিস্কুইজ",
    },
    "ta": {
        "html_lang": "ta", "hreflang": "ta", "og_locale": "ta_IN", "geo": "IN",
        "placename": "Tamil Nadu, India / Sri Lanka", "language_name": "Tamil", "currency": "INR",
        "home_nav": "தமிழ் முகப்பு", "anamorphic_nav": "அனாமார்ஃபிக்", "english_nav": "English",
        "home_title": "அனாமார்ஃபிக் டிஸ்க்வீஸ் — இலவச வலைக் கருவி | DeSqueeze Studio",
        "home_desc": "தமிழ் படைப்பாளிகளுக்கான அனாமார்ஃபிக் டிஸ்க்வீஸ். iPhone, Android, Mac, Windows செயலிகள் மற்றும் இலவச ஆன்லைன் கருவி. 1.33×–2×, CinemaScope, நேரடி LUT.",
        "home_kw": "அனாமார்ஃபிக் டிஸ்க்வீஸ், anamorphic desqueeze, CinemaScope, 1.33x desqueeze",
        "home_h1": "அனாமார்ஃபிக் காட்சியை சரியாக டிஸ்க்வீஸ் செய்யுங்கள்",
        "home_lede": "DeSqueeze Studio அனாமார்ஃபிக் லென்ஸின் கிடைமட்ட அமுக்கத்தை சினிமா விகிதத்திற்கு மீட்டெடுக்கிறது. இலவச Web Studio முதல் iPhone, Android, Mac, Windows செயலிகள் வரை.",
        "ana_title": "அனாமார்ஃபிக் டிஸ்க்வீஸ் — நேரடி மானிட்டர், தொகுதி & CinemaScope | DeSqueeze Studio",
        "ana_desc": "அனாமார்ஃபிக் டிஸ்க்வீஸ் சூழல்: நேரடி மானிட்டர், 1.33×–2× திருத்தம் மற்றும் CinemaScope 2.39:1 — iPhone, Android, Mac, Windows மற்றும் இலவச Web Studio.",
        "ana_h1": "அனாமார்ஃபிக் டிஸ்க்வீஸ் — படப்பிடிப்பில் இருந்து வழங்கல் வரை",
        "word_desqueeze": "அனாமார்ஃபிக் டிஸ்க்வீஸ்",
    },
    "zh-tw": {
        "html_lang": "zh-Hant", "hreflang": "zh-Hant", "og_locale": "zh_TW", "geo": "TW",
        "placename": "Taiwan, Hong Kong", "language_name": "Chinese Traditional", "currency": "TWD",
        "lang_key": "zh-TW",
        "home_nav": "繁中首頁", "anamorphic_nav": "變形寬銀幕", "english_nav": "English",
        "home_title": "變形寬銀幕解壓 Desqueeze — 免費網頁工具 | DeSqueeze Studio 繁中",
        "home_desc": "面向台灣／香港創作者的變形寬銀幕解壓。支援 iPhone、Android、Mac、Windows 與免費線上校正。1.33×–2×、CinemaScope、即時 LUT。無地區鎖定。",
        "home_kw": "變形寬銀幕 解壓, anamorphic desqueeze, 變形鏡頭校正, CinemaScope, 1.33x desqueeze",
        "home_h1": "正確解壓變形寬銀幕畫面",
        "home_lede": "DeSqueeze Studio 用於校正變形鏡頭的水平壓縮，還原電影畫幅。從免費 Web Studio 到 iPhone、Android、Mac、Windows 應用。",
        "ana_title": "變形寬銀幕解壓 — 即時監看、批次匯出、CinemaScope | DeSqueeze Studio",
        "ana_desc": "變形寬銀幕解壓生態：在 iPhone、Android、Mac、Windows 與免費 Web Studio 進行即時監看、1.33×–2× 校正與 CinemaScope 2.39:1 匯出 — 繁體中文市場。",
        "ana_h1": "變形寬銀幕解壓 — 從拍攝到交付",
        "word_desqueeze": "變形寬銀幕解壓",
    },
}


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


ALL_FOLDERS = [
    "ja", "ko", "de", "es", "pt", "zh", "hi", "fr",
    *LOCALES.keys(),
]


def hreflang_links(folder: str, path: str) -> str:
    en = "https://anamorphic-desqueeze.com/" if not path else f"https://anamorphic-desqueeze.com/{path}"
    loc = f"https://anamorphic-desqueeze.com/{folder}/" if not path else f"https://anamorphic-desqueeze.com/{folder}/{path}"
    meta = LOCALES.get(folder, {})
    href_lang = meta.get("hreflang", folder if folder != "zh" else "zh-Hans")
    if folder == "zh":
        href_lang = "zh-Hans"
    lines = [
        f'  <link rel="canonical" href="{loc}" />',
        f'  <link rel="alternate" hreflang="{href_lang}" href="{loc}" />',
        f'  <link rel="alternate" hreflang="en" href="{en}" />',
        f'  <link rel="alternate" hreflang="x-default" href="{en}" />',
    ]
    for other in ALL_FOLDERS:
        if other == folder:
            continue
        oh = LOCALES.get(other, {}).get("hreflang")
        if not oh:
            oh = {"zh": "zh-Hans", "ja": "ja", "ko": "ko", "de": "de", "es": "es", "pt": "pt", "hi": "hi", "fr": "fr"}.get(other, other)
        op = f"https://anamorphic-desqueeze.com/{other}/" if not path else f"https://anamorphic-desqueeze.com/{other}/{path}"
        lines.append(f'  <link rel="alternate" hreflang="{oh}" href="{op}" />')
    return "\n".join(lines)


def write_pages(folder: str, m: dict) -> None:
    lang_attr = m.get("lang_key") or FOLDER_LANG.get(folder) or folder
    direction = m.get("dir", "ltr")
    dir_attr = f' dir="{direction}"' if direction == "rtl" else ""
    word = m["word_desqueeze"]

    home = f"""<!doctype html>
<html lang="{m["html_lang"]}"{dir_attr}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-6BFDRLKVZK"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-6BFDRLKVZK');</script>
  <title>{esc(m["home_title"])}</title>
  <meta name="description" content="{esc(m["home_desc"])}" />
  <meta name="keywords" content="{esc(m["home_kw"])}" />
{hreflang_links(folder, "")}
  <meta name="geo.region" content="{m["geo"]}" />
  <meta name="geo.placename" content="{esc(m["placename"])}" />
  <meta name="language" content="{m["language_name"]}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="{m["og_locale"]}" />
  <meta property="og:title" content="{esc(m["home_title"])}" />
  <meta property="og:description" content="{esc(m["home_desc"])}" />
  <meta property="og:url" content="https://anamorphic-desqueeze.com/{folder}/" />
  <meta property="og:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"WebSite","name":"DeSqueeze Studio","inLanguage":"{m["html_lang"]}","url":"https://anamorphic-desqueeze.com/{folder}/","description":{json.dumps(m["home_desc"], ensure_ascii=False)}}}
  </script>
  <link rel="stylesheet" href="/style.css?v=43" />
</head>
<body class="product-skin product-skin--hub" data-locale="{lang_attr}">
  <header class="site-header"><div class="site-header__inner">
    <a href="/{folder}/" class="brand"><span>DeSqueeze Studio</span></a>
    <nav class="nav">
      <a href="/{folder}/" aria-current="page">{esc(m["home_nav"])}</a>
      <a href="/{folder}/anamorphic.html">{esc(m["anamorphic_nav"])}</a>
      <a href="/anamorphic-desqueeze-iphone.html">iOS / Mac</a>
      <a href="/guides.html">Guides</a>
      <a href="/" hreflang="en">{esc(m["english_nav"])}</a>
    </nav>
  </div></header>
  <main id="{folder}-home-main">
    <section class="hub-hero hub-hero--product" aria-labelledby="{folder}-home-title">
      <div class="hub-hero__inner hub-hero__inner--split">
        <div class="hub-hero__copy">
          <p class="product-hero__eyebrow">{esc(word)}</p>
          <h1 id="{folder}-home-title">{esc(m["home_h1"])}</h1>
          <p class="hub-hero__tool-body">{esc(m["home_lede"])}</p>
          <ul class="hub-hero__tool-bullets">
            <li>1.33×–2× · CinemaScope · live monitor</li>
            <li>iOS · Android · Mac · Windows · Web Studio</li>
            <li>{esc(word)}</li>
          </ul>
          <div class="product-hero__ctas">
            <a class="product-cta product-cta--primary" href="/{folder}/anamorphic.html">{esc(m["anamorphic_nav"])}</a>
            <a class="product-cta" href="/index.html#settings">Web Studio</a>
            <a class="product-cta" href="https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068" target="_blank" rel="noopener">App Store ↗</a>
          </div>
        </div>
        <figure class="hub-hero__visual hub-hero__visual--square">
          <a href="/{folder}/anamorphic.html" class="hub-hero__visual-link">
            <img src="/assets/anamorphic-desqueezer-iphone-hero.png?v=3" width="1024" height="1024" alt="{esc(m["home_h1"])}" loading="eager" decoding="async" />
          </a>
        </figure>
      </div>
    </section>
    <div class="product-main"><div class="product-body">
      <section class="product-panel">
        <h2>{esc(m["anamorphic_nav"])}</h2>
        <p>{esc(m["home_lede"])}</p>
        <p><a href="/{folder}/anamorphic.html">{esc(m["anamorphic_nav"])} →</a> · <a href="/anamorphic.html" hreflang="en">English</a></p>
      </section>
    </div></div>
  </main>
  <footer class="site-footer"><div class="site-footer__inner">
    <div>© <span id="y"></span> DeSqueeze Studio</div>
    <div class="site-footer__links">
      <a href="/{folder}/anamorphic.html">{esc(m["anamorphic_nav"])}</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="mailto:teamcentersap@gmail.com">Contact</a>
    </div>
  </div></footer>
  <script>document.getElementById("y").textContent=new Date().getFullYear();</script>
  <script src="/assets/site-chrome.js?v=16"></script>
</body></html>
"""

    ana = f"""<!doctype html>
<html lang="{m["html_lang"]}"{dir_attr}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-6BFDRLKVZK"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-6BFDRLKVZK');</script>
  <title>{esc(m["ana_title"])}</title>
  <meta name="description" content="{esc(m["ana_desc"])}" />
  <meta name="keywords" content="{esc(m["home_kw"])}" />
{hreflang_links(folder, "anamorphic.html")}
  <meta name="geo.region" content="{m["geo"]}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="{m["og_locale"]}" />
  <meta property="og:title" content="{esc(m["ana_title"])}" />
  <meta property="og:description" content="{esc(m["ana_desc"])}" />
  <meta property="og:url" content="https://anamorphic-desqueeze.com/{folder}/anamorphic.html" />
  <meta property="og:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <script type="application/ld+json">
  {{"@context":"https://schema.org","@type":"WebPage","inLanguage":"{m["html_lang"]}","name":{json.dumps(m["ana_h1"], ensure_ascii=False)},"description":{json.dumps(m["ana_desc"], ensure_ascii=False)},"url":"https://anamorphic-desqueeze.com/{folder}/anamorphic.html"}}
  </script>
  <link rel="stylesheet" href="/style.css?v=43" />
</head>
<body class="product-skin product-skin--anamorphic anamorphic-landing" data-locale="{lang_attr}">
  <header class="site-header"><div class="site-header__inner">
    <a href="/{folder}/" class="brand"><span>DeSqueeze Studio</span></a>
    <nav class="nav">
      <a href="/{folder}/">{esc(m["home_nav"])}</a>
      <a href="/{folder}/anamorphic.html" aria-current="page">{esc(m["anamorphic_nav"])}</a>
      <a href="/anamorphic-desqueeze-iphone.html">iOS / Mac</a>
      <a href="/guides.html">Guides</a>
      <a href="/anamorphic.html" hreflang="en">{esc(m["english_nav"])}</a>
    </nav>
  </div></header>
  <main id="anamorphic-main">
    <section class="hub-hero hub-hero--product" aria-labelledby="anamorphic-landing-title">
      <div class="hub-hero__inner hub-hero__inner--split">
        <div class="hub-hero__copy">
          <p class="product-hero__eyebrow">{esc(word)}</p>
          <h1 id="anamorphic-landing-title">{esc(m["ana_h1"])}</h1>
          <p class="hub-hero__tool-body"><strong>Anamorphic Desqueezer</strong> — live monitor, 1.33×–2×, CinemaScope, ProRes / FCPXML. {esc(m["home_lede"])}</p>
          <ul class="hub-hero__tool-bullets">
            <li>Live desqueeze · 2.39:1 · scopes</li>
            <li>Batch video &amp; stills · 1.33×–2×</li>
            <li>iOS · Android · Mac · Windows · Web</li>
          </ul>
          <div class="product-hero__ctas">
            <a class="product-cta product-cta--primary" href="/anamorphic-desqueeze-iphone.html">iOS / Mac</a>
            <a class="product-cta" href="/index.html#settings">Web Studio</a>
            <a class="product-cta" href="https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068" target="_blank" rel="noopener">App Store ↗</a>
          </div>
        </div>
        <figure class="hub-hero__visual hub-hero__visual--square">
          <a href="/anamorphic-desqueeze-iphone.html" class="hub-hero__visual-link">
            <img src="/assets/anamorphic-desqueezer-iphone-hero.png?v=3" width="1024" height="1024" alt="{esc(m["ana_h1"])}" loading="eager" decoding="async" />
          </a>
        </figure>
      </div>
    </section>
    <div class="product-main"><div class="product-body anamorphic-landing__body">
      <section class="product-panel" id="anamorphic-flow">
        <h2>{esc(m["anamorphic_nav"])}</h2>
        <p>{esc(m["ana_desc"])}</p>
        <p><a href="/how-to-desqueeze-1-33x.html">1.33×</a> · <a href="/moment-anamorphic-desqueeze.html">Moment</a> · <a href="/sirui-anamorphic-desqueeze.html">Sirui</a> · <a href="/guides.html">Guides</a></p>
      </section>
      <p class="product-back"><a href="/{folder}/">← {esc(m["home_nav"])}</a> · <a href="/anamorphic.html" hreflang="en">English</a></p>
    </div></div>
  </main>
  <footer class="site-footer"><div class="site-footer__inner">
    <div>© <span id="y"></span> DeSqueeze Studio</div>
    <div class="site-footer__links">
      <a href="/{folder}/">{esc(m["home_nav"])}</a>
      <a href="/privacy.html">Privacy</a>
      <a href="/terms.html">Terms</a>
      <a href="mailto:teamcentersap@gmail.com">Contact</a>
    </div>
  </div></footer>
  <script>document.getElementById("y").textContent=new Date().getFullYear();</script>
  <script src="/assets/site-chrome.js?v=16"></script>
</body></html>
"""
    out = ROOT / folder
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(home, encoding="utf-8")
    (out / "anamorphic.html").write_text(ana, encoding="utf-8")


def main() -> None:
    for folder, meta in LOCALES.items():
        write_pages(folder, meta)
        print("OK", folder)


if __name__ == "__main__":
    main()
