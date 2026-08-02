#!/usr/bin/env python3
"""Generate SEO locale landing pages for high-value sales markets."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Market priority (research): KR, DE/DACH, ES+LATAM, BR, CN, IN, FR — after JA.
LOCALES = {
    "ko": {
        "html_lang": "ko",
        "hreflang": "ko",
        "og_locale": "ko_KR",
        "geo": "KR",
        "placename": "South Korea",
        "language_name": "Korean",
        "dir_label": "한국어",
        "home_nav": "한국어 홈",
        "anamorphic_nav": "애너모픽",
        "english_nav": "English",
        "currency": "KRW",
        "home": {
            "title": "애너모픽 디스퀴즈 앱 — 무료 웹 도구 | DeSqueeze Studio 한국",
            "description": "한국 제작자를 위한 애너모픽 디스퀴즈. iPhone·Android·Mac·Windows 앱과 무료 온라인 보정. 1.33×~2×, 시네마스코프 내보내기, 라이브 LUT. 지역 제한 없음.",
            "keywords": "애너모픽 디스퀴즈, 애너모픽 보정, desqueeze, 시네마스코프, 1.33x 디스퀴즈, 아이폰 애너모픽, 영상 비율 보정",
            "eyebrow": "한국 · 애너모픽 디스퀴즈",
            "h1": "애너모픽 영상을 올바르게 디스퀴즈하세요",
            "lede": "DeSqueeze Studio는 애너모픽 렌즈로 촬영한 영상의 가로 압축을 보정해 시네마틱한 화면비로 되돌리는 도구입니다. 무료 Web Studio부터 iPhone·Android·Mac·Windows 앱까지.",
            "bullets": [
                "검색 키워드: 애너모픽 디스퀴즈 / desqueeze / 시네마스코프",
                "1.33×~2×, 라이브 모니터, 배치 내보내기",
                "지역 잠금 없음 — 한국에서 바로 사용",
            ],
            "cta_primary": "애너모픽 워크플로 보기",
            "cta_web": "무료 Web Studio",
            "why_title": "왜 디스퀴즈가 필요한가",
            "why_body": "애너모픽 렌즈는 가로로 압축해 기록합니다. 그대로 재생하면 인물과 원이 세로로 늘어져 보입니다. 디스퀴즈로 올바른 화면비(예: 2.39:1 CinemaScope)로 되돌리면 의도한 시네마 프레임이 됩니다.",
            "start_title": "여기서 시작",
            "cards": [
                ("애너모픽 가이드", "라이브 모니터, 배치, 플랫폼별 사용법.", "한국어 가이드 →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "App Store의 Anamorphic Desqueezer.", "앱 상세 →", "/anamorphic-desqueeze-iphone.html"),
                ("1.33× 가이드", "Moment / Sirui 등 1.33× 렌즈 체크포인트.", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("영문 전체 사이트", "FilmStudio, LiveGrade, Windows, 가이드.", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "애너모픽",
            "footer_guides": "가이드",
            "footer_privacy": "개인정보",
            "footer_terms": "이용약관",
            "footer_contact": "문의",
            "og_title": "애너모픽 디스퀴즈 — DeSqueeze Studio 한국",
            "og_desc": "애너모픽 영상을 올바르게 디스퀴즈. 무료 웹과 iOS / Android / Mac / Windows 앱.",
            "schema_desc": "애너모픽 디스퀴즈 및 영상 제작 도구(한국).",
            "app_desc": "애너모픽 렌즈 영상 디스퀴즈, 라이브 모니터, CinemaScope 내보내기.",
        },
        "anamorphic": {
            "title": "애너모픽 디스퀴즈 — 라이브 모니터·배치 내보내기·시네마스코프 | DeSqueeze Studio",
            "description": "애너모픽 렌즈 디스퀴즈: iPhone·Android·Mac·Windows·무료 Web Studio에서 라이브 모니터, 1.33×~2× 보정, CinemaScope 2.39:1 내보내기. 한국 영상 제작자용.",
            "keywords": "애너모픽 디스퀴즈, 애너모픽 워크플로, 시네마스코프, 1.33x 2x desqueeze, 아이폰 애너모픽",
            "eyebrow": "영상 제작 소프트웨어 · 애너모픽 레인",
            "h1": "애너모픽 디스퀴즈 — 촬영부터 납품까지",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — 라이브 모니터, 비율, 스코프, ProRes / FCPXML 내보내기. 풀 NLE 없이 비율·모니터링·배치 보정·시네마스코프 내보내기.",
            "bullets": [
                "2.39:1 가이드, 지브라, 파형, 폴스 컬러, 포커스 피킹 라이브 디스퀴즈",
                "영상·스틸 배치 — 1.33×~2× — 실제 CinemaScope 내보내기",
                "iOS · Android · Mac · Windows · 무료 Web Studio 하나의 생태계",
            ],
            "cta_overview": "앱 개요",
            "cta_web": "무료 Web Studio 체험",
            "flow_title": "애너모픽 플로우",
            "flow_p1": "애너모픽을 독립 파이프라인으로 다룹니다. 비율·모니터·배치 보정·내보내기. 무료 <a href=\"/index.html#settings\">Web Studio</a>에서 1.33×~2× 프리뷰와 배치(×10 MP4/JPG/PNG)로 시작하세요.",
            "flow_p2": "<strong>iPhone, iPad, MacBook</strong>에서는 <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a>가 네이티브 플래그십입니다. 라이브 모니터/포스트, ProRes·10bit, 스코프, FCPXML로 편집도 같은 지오메트리를 이어받습니다. <a href=\"/filmstudio.html\">FilmStudio</a>는 카메라 안에서 와이드를 잡는 촬영 동반자입니다.",
            "flow_p3": "<strong>Android(Google Play):</strong> 배치용 <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>(영상·스틸, CinemaScope 2.39:1 최대 4K, LUT, LiveGrade형 모니터링). 현장 라이브 디스퀴즈는 <a href=\"/index.html#android-anamorphic-pro-cam\">Anamorphic Desqueeze Pro Cam</a>.",
            "flow_p4": "<strong>Windows:</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a>로 폴더 일괄 디스퀴즈, CinemaScope 프리셋, LUT/CDL, EDL 연동 내보내기.",
            "platforms_title": "플랫폼",
            "plat": [
                ("모바일 앱", "iOS/Android 라이브 디스퀴즈와 편집 — 현장 모니터, 배치, CinemaScope.", "iOS 개요 →"),
                ("Web Studio", "브라우저에서 빠른 처리·배치. 설치 없이 테스트에 적합.", "Web Studio 열기 →"),
                ("데스크톱", "Windows 대량 배치, LUT/CDL, 포스트용 EDL 내보내기.", "Windows 도구 →"),
                ("그레이딩 & 납품", "<a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a>로 라이브 LUT/CDL 후 MP4 납품.", "CineLut Live Grade →"),
            ],
            "guides_title": "가이드 & 렌즈 워크플로",
            "back_home": "← 한국어 홈",
            "og_title": "애너모픽 디스퀴즈 — DeSqueeze Studio",
            "og_desc": "촬영부터 시네마스코프 납품까지. 모바일·데스크톱·웹 프로 애너모픽 워크플로.",
            "schema_name": "애너모픽 디스퀴즈 워크플로",
            "schema_desc": "iOS·Android·Mac·Windows·Web에서 촬영부터 CinemaScope 납품까지 프로 애너모픽 디스퀴즈.",
            "crumb": "애너모픽 디스퀴즈",
            "studios": "스튜디오",
            "guides": "가이드",
            "privacy": "개인정보",
            "terms": "이용약관",
            "contact": "문의",
            "alt": "AnamorphicDesqueezer — 모바일·iPad·iPhone·MacBook·Windows 애너모픽 디스퀴즈",
        },
    },
    "de": {
        "html_lang": "de",
        "hreflang": "de",
        "og_locale": "de_DE",
        "geo": "DE",
        "placename": "Germany",
        "language_name": "German",
        "dir_label": "Deutsch",
        "home_nav": "Deutsch Start",
        "anamorphic_nav": "Anamorphotisch",
        "english_nav": "English",
        "currency": "EUR",
        "home": {
            "title": "Anamorphotisch entsquetschen — kostenloses Web-Tool | DeSqueeze Studio DE",
            "description": "Anamorphotisches Desqueeze für Filmemacher in DE/AT/CH. Apps für iPhone, Android, Mac & Windows plus kostenloses Online-Tool. 1,33×–2×, CinemaScope-Export, Live-LUT. Ohne Regionssperre.",
            "keywords": "anamorphotisch entsquetschen, anamorphotisch desqueeze, CinemaScope, 1.33x desqueeze, iPhone anamorphotisch, Seitenverhältnis korrigieren",
            "eyebrow": "DACH · Anamorphotisches Desqueeze",
            "h1": "Anamorphotisches Material richtig entsquetschen",
            "lede": "DeSqueeze Studio korrigiert die horizontale Stauchung anamorphotischer Aufnahmen und stellt das filmische Seitenverhältnis wieder her. Vom kostenlosen Web Studio bis zu Apps für iPhone, Android, Mac und Windows.",
            "bullets": [
                "Suchbegriffe: anamorphotisch entsquetschen / desqueeze / CinemaScope",
                "1,33×–2×, Live-Monitor, Batch-Export",
                "Keine Regionssperre — nutzbar in DE, AT, CH",
            ],
            "cta_primary": "Anamorphotischen Workflow ansehen",
            "cta_web": "Kostenloses Web Studio",
            "why_title": "Warum Desqueeze?",
            "why_body": "Anamorphotische Objektive stauchen horizontal. Ohne Korrektur wirken Gesichter und Kreise gestreckt. Desqueeze stellt das gewünschte Format wieder her (z. B. 2,39:1 CinemaScope).",
            "start_title": "Hier starten",
            "cards": [
                ("Anamorphotischer Leitfaden", "Live-Monitor, Batch, Plattformen.", "Deutscher Guide →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "Anamorphic Desqueezer im App Store.", "App-Details →", "/anamorphic-desqueeze-iphone.html"),
                ("1,33× Anleitung", "Checkpoints für Moment/Sirui 1,33×.", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("Englische Vollsite", "FilmStudio, LiveGrade, Windows, Guides.", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "Anamorphotisch",
            "footer_guides": "Guides",
            "footer_privacy": "Datenschutz",
            "footer_terms": "AGB",
            "footer_contact": "Kontakt",
            "og_title": "Anamorphotisch entsquetschen — DeSqueeze Studio DE",
            "og_desc": "Anamorphotisches Material korrekt entsquetschen. Kostenloses Web plus iOS/Android/Mac/Windows.",
            "schema_desc": "Anamorphotisches Desqueeze und Filmmaking-Tools (DACH).",
            "app_desc": "Desqueeze für anamorphotische Aufnahmen, Live-Monitor, CinemaScope-Export.",
        },
        "anamorphic": {
            "title": "Anamorphotisch entsquetschen — Live-Monitor, Batch & CinemaScope | DeSqueeze Studio",
            "description": "Anamorphotisches Desqueeze: Live-Monitor, 1,33×–2× Korrektur und CinemaScope 2,39:1 auf iPhone, Android, Mac, Windows und kostenlosem Web Studio — für Filmemacher in DE/AT/CH.",
            "keywords": "anamorphotisch entsquetschen, anamorphotischer Workflow, CinemaScope Export, 1.33x 2x desqueeze",
            "eyebrow": "Filmmaking-Software · Anamorphotische Spur",
            "h1": "Anamorphotisch entsquetschen — von der Aufnahme bis zur Abgabe",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — Live-Monitor, Verhältnisse, Scopes, ProRes / FCPXML. Verhältnisrechnung, Monitoring, Batch und CinemaScope ohne volle NLE.",
            "bullets": [
                "Live-Desqueeze mit 2,39:1-Guides, Zebras, Waveform, False Color, Peaking",
                "Batch Video & Stills — 1,33× bis 2× — echter CinemaScope-Export",
                "iOS · Android · Mac · Windows · kostenloses Web Studio",
            ],
            "cta_overview": "App-Übersicht",
            "cta_web": "Web Studio testen (kostenlos)",
            "flow_title": "Anamorphotischer Flow",
            "flow_p1": "Anamorphotisch als eigene Pipeline: Verhältnisse, Monitoring, Batch, Export. Start im kostenlosen <a href=\"/index.html#settings\">Web Studio</a> mit 1,33×–2× und Batch ×10.",
            "flow_p2": "Auf <strong>iPhone, iPad und MacBook</strong> ist <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> das native Flaggschiff: Live-Monitor und Post, ProRes/10-Bit, Scopes, FCPXML. <a href=\"/filmstudio.html\">FilmStudio</a> begleitet die Aufnahme.",
            "flow_p3": "<strong>Android (Google Play):</strong> Batch mit <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>; Live am Set mit <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>.",
            "flow_p4": "<strong>Windows:</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> für Ordner-Batch, CinemaScope-Presets, LUT/CDL, EDL-Export.",
            "platforms_title": "Plattformen",
            "plat": [
                ("Mobile Apps", "Live-Desqueeze und Schnitt auf iOS/Android.", "iOS-Übersicht →"),
                ("Web Studio", "Schnelle Verarbeitung im Browser — ohne Installation.", "Web Studio öffnen →"),
                ("Desktop", "Windows-Batch mit LUT/CDL und EDL-freundlichem Export.", "Windows-Tools →"),
                ("Grade & Deliver", "Mit <a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> LUT/CDL, dann MP4.", "CineLut Live Grade →"),
            ],
            "guides_title": "Guides & Objektiv-Workflows",
            "back_home": "← Deutsch Start",
            "og_title": "Anamorphotisch entsquetschen — DeSqueeze Studio",
            "og_desc": "Aufnahme bis CinemaScope-Abgabe — ein Profi-Workflow über Mobile, Desktop und Web.",
            "schema_name": "Anamorphotischer Desqueeze-Workflow",
            "schema_desc": "Professionelles anamorphotisches Desqueeze von Aufnahme bis CinemaScope auf iOS, Android, Mac, Windows und Web.",
            "crumb": "Anamorphotisch entsquetschen",
            "studios": "Für Studios",
            "guides": "Guides",
            "privacy": "Datenschutz",
            "terms": "AGB",
            "contact": "Kontakt",
            "alt": "AnamorphicDesqueezer — Desqueeze für Mobile, iPad, iPhone, MacBook und Windows",
        },
    },
    "es": {
        "html_lang": "es",
        "hreflang": "es",
        "og_locale": "es_ES",
        "geo": "ES",
        "placename": "Spain, Latin America",
        "language_name": "Spanish",
        "dir_label": "Español",
        "home_nav": "Inicio ES",
        "anamorphic_nav": "Anamórfico",
        "english_nav": "English",
        "currency": "EUR",
        "home": {
            "title": "Desqueeze anamórfico — herramienta web gratis | DeSqueeze Studio ES",
            "description": "Desqueeze anamórfico para creadores en España y Latinoamérica. Apps iPhone, Android, Mac y Windows más herramienta online gratis. 1.33×–2×, CinemaScope, LUT en vivo. Sin bloqueo regional.",
            "keywords": "desqueeze anamorfico, corregir anamorfico, CinemaScope, 1.33x desqueeze, iPhone anamorfico, relacion de aspecto video",
            "eyebrow": "ES / LATAM · Desqueeze anamórfico",
            "h1": "Corrige el desqueeze anamórfico correctamente",
            "lede": "DeSqueeze Studio restaura la compresión horizontal de lentes anamórficos al aspect ratio cinematográfico. Desde el Web Studio gratis hasta apps en iPhone, Android, Mac y Windows.",
            "bullets": [
                "Palabras clave: desqueeze anamórfico / CinemaScope / 1.33x",
                "1.33×–2×, monitor en vivo, exportación por lotes",
                "Sin bloqueo regional — España, México, Argentina y más",
            ],
            "cta_primary": "Ver flujo anamórfico",
            "cta_web": "Web Studio gratis",
            "why_title": "¿Por qué desqueeze?",
            "why_body": "Las lentes anamórficas comprimen en horizontal. Sin corrección, caras y círculos se ven estirados. El desqueeze restaura el formato (p. ej. 2.39:1 CinemaScope).",
            "start_title": "Empieza aquí",
            "cards": [
                ("Guía anamórfica", "Monitor en vivo, lotes y plataformas.", "Guía en español →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "Anamorphic Desqueezer en App Store.", "Detalle de la app →", "/anamorphic-desqueeze-iphone.html"),
                ("Guía 1.33×", "Puntos clave para Moment / Sirui 1.33×.", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("Sitio completo EN", "FilmStudio, LiveGrade, Windows, guías.", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "Anamórfico",
            "footer_guides": "Guías",
            "footer_privacy": "Privacidad",
            "footer_terms": "Términos",
            "footer_contact": "Contacto",
            "og_title": "Desqueeze anamórfico — DeSqueeze Studio ES",
            "og_desc": "Corrige anamórfico con web gratis y apps iOS / Android / Mac / Windows.",
            "schema_desc": "Desqueeze anamórfico y herramientas de filmmaking (ES/LATAM).",
            "app_desc": "Desqueeze de vídeo anamórfico, monitor en vivo y exportación CinemaScope.",
        },
        "anamorphic": {
            "title": "Desqueeze anamórfico — monitor en vivo, lotes y CinemaScope | DeSqueeze Studio",
            "description": "Ecosistema de desqueeze anamórfico: monitor en vivo, corrección 1.33×–2× y CinemaScope 2.39:1 en iPhone, Android, Mac, Windows y Web Studio gratis — España y Latinoamérica.",
            "keywords": "desqueeze anamorfico, flujo anamorfico, export CinemaScope, 1.33x 2x desqueeze",
            "eyebrow": "Software de filmmaking · Carril anamórfico",
            "h1": "Desqueeze anamórfico — de la captura a la entrega",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — monitor en vivo, ratios, scopes, exportación ProRes / FCPXML. Matemáticas de ratio, monitoreo, lotes y CinemaScope sin abrir un NLE completo.",
            "bullets": [
                "Monitor live con guías 2.39:1, zebras, waveform, false color y peaking",
                "Lotes de vídeo y fotos — 1.33× a 2× — CinemaScope real",
                "iOS · Android · Mac · Windows · Web Studio gratis",
            ],
            "cta_overview": "Resumen de la app",
            "cta_web": "Probar Web Studio (gratis)",
            "flow_title": "Flujo anamórfico",
            "flow_p1": "Trata lo anamórfico como pipeline propio: ratios, monitoreo, lotes y export. Empieza en el <a href=\"/index.html#settings\">Web Studio</a> gratis con 1.33×–2× y lotes ×10.",
            "flow_p2": "En <strong>iPhone, iPad y MacBook</strong>, <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> es el buque insignia nativo. <a href=\"/filmstudio.html\">FilmStudio</a> acompaña la captura.",
            "flow_p3": "<strong>Android (Google Play):</strong> lotes con <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>; en set con <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>.",
            "flow_p4": "<strong>Windows:</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> para carpetas, presets CinemaScope, LUT/CDL y EDL.",
            "platforms_title": "Plataformas",
            "plat": [
                ("Apps móviles", "Desqueeze en vivo y edición en iOS/Android.", "Resumen iOS →"),
                ("Web Studio", "Procesado rápido en el navegador, sin instalar.", "Abrir Web Studio →"),
                ("Escritorio", "Throughput Windows con LUT/CDL y export EDL.", "Herramientas Windows →"),
                ("Grade y entrega", "Con <a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> LUT/CDL y MP4.", "CineLut Live Grade →"),
            ],
            "guides_title": "Guías y flujos por lente",
            "back_home": "← Inicio ES",
            "og_title": "Desqueeze anamórfico — DeSqueeze Studio",
            "og_desc": "De la captura a CinemaScope en móvil, escritorio y web.",
            "schema_name": "Flujo de desqueeze anamórfico",
            "schema_desc": "Desqueeze anamórfico profesional desde captura hasta CinemaScope en iOS, Android, Mac, Windows y web.",
            "crumb": "Desqueeze anamórfico",
            "studios": "Para estudios",
            "guides": "Guías",
            "privacy": "Privacidad",
            "terms": "Términos",
            "contact": "Contacto",
            "alt": "AnamorphicDesqueezer — desqueeze para móvil, iPad, iPhone, MacBook y Windows",
        },
    },
    "pt": {
        "html_lang": "pt-BR",
        "hreflang": "pt",
        "og_locale": "pt_BR",
        "geo": "BR",
        "placename": "Brazil",
        "language_name": "Portuguese",
        "dir_label": "Português",
        "home_nav": "Início PT",
        "anamorphic_nav": "Anamórfico",
        "english_nav": "English",
        "currency": "BRL",
        "home": {
            "title": "Desqueeze anamórfico — ferramenta web grátis | DeSqueeze Studio BR",
            "description": "Desqueeze anamórfico para criadores no Brasil. Apps iPhone, Android, Mac e Windows + ferramenta online grátis. 1.33×–2×, CinemaScope, LUT ao vivo. Sem bloqueio regional.",
            "keywords": "desqueeze anamorfico, corrigir anamorfico, CinemaScope, 1.33x desqueeze, iPhone anamorfico, proporcao de tela video",
            "eyebrow": "Brasil · Desqueeze anamórfico",
            "h1": "Corrija o desqueeze anamórfico do jeito certo",
            "lede": "DeSqueeze Studio restaura a compressão horizontal de lentes anamórficas para a proporção cinematográfica. Do Web Studio grátis aos apps em iPhone, Android, Mac e Windows.",
            "bullets": [
                "Palavras-chave: desqueeze anamórfico / CinemaScope / 1.33x",
                "1.33×–2×, monitor ao vivo, exportação em lote",
                "Sem bloqueio regional — pronto para o Brasil",
            ],
            "cta_primary": "Ver fluxo anamórfico",
            "cta_web": "Web Studio grátis",
            "why_title": "Por que desqueeze?",
            "why_body": "Lentes anamórficas comprimem na horizontal. Sem correção, rostos e círculos ficam esticados. O desqueeze restaura o formato (ex.: 2.39:1 CinemaScope).",
            "start_title": "Comece aqui",
            "cards": [
                ("Guia anamórfico", "Monitor ao vivo, lotes e plataformas.", "Guia em português →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "Anamorphic Desqueezer na App Store.", "Detalhes do app →", "/anamorphic-desqueeze-iphone.html"),
                ("Guia 1.33×", "Checklist Moment / Sirui 1.33×.", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("Site completo EN", "FilmStudio, LiveGrade, Windows, guias.", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "Anamórfico",
            "footer_guides": "Guias",
            "footer_privacy": "Privacidade",
            "footer_terms": "Termos",
            "footer_contact": "Contato",
            "og_title": "Desqueeze anamórfico — DeSqueeze Studio BR",
            "og_desc": "Corrija anamórfico com web grátis e apps iOS / Android / Mac / Windows.",
            "schema_desc": "Desqueeze anamórfico e ferramentas de filmmaking (Brasil).",
            "app_desc": "Desqueeze de vídeo anamórfico, monitor ao vivo e exportação CinemaScope.",
        },
        "anamorphic": {
            "title": "Desqueeze anamórfico — monitor ao vivo, lotes e CinemaScope | DeSqueeze Studio",
            "description": "Ecossistema de desqueeze anamórfico: monitor ao vivo, correção 1.33×–2× e CinemaScope 2.39:1 no iPhone, Android, Mac, Windows e Web Studio grátis — para o Brasil.",
            "keywords": "desqueeze anamorfico, fluxo anamorfico, export CinemaScope, 1.33x 2x desqueeze Brasil",
            "eyebrow": "Software de filmmaking · Trilha anamórfica",
            "h1": "Desqueeze anamórfico — da captura à entrega",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — monitor ao vivo, ratios, scopes, export ProRes / FCPXML. Matemática de ratio, monitoramento, lotes e CinemaScope sem abrir um NLE completo.",
            "bullets": [
                "Monitor live com guias 2.39:1, zebras, waveform, false color e peaking",
                "Lotes de vídeo e fotos — 1.33× a 2× — CinemaScope real",
                "iOS · Android · Mac · Windows · Web Studio grátis",
            ],
            "cta_overview": "Visão do app",
            "cta_web": "Testar Web Studio (grátis)",
            "flow_title": "Fluxo anamórfico",
            "flow_p1": "Trate o anamórfico como pipeline próprio. Comece no <a href=\"/index.html#settings\">Web Studio</a> grátis com 1.33×–2× e lotes ×10.",
            "flow_p2": "No <strong>iPhone, iPad e MacBook</strong>, <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> é o app nativo principal. <a href=\"/filmstudio.html\">FilmStudio</a> acompanha a captura.",
            "flow_p3": "<strong>Android (Google Play):</strong> lotes com <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>; no set com <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>.",
            "flow_p4": "<strong>Windows:</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> para pastas, presets CinemaScope, LUT/CDL e EDL.",
            "platforms_title": "Plataformas",
            "plat": [
                ("Apps móveis", "Desqueeze ao vivo e edição no iOS/Android.", "Visão iOS →"),
                ("Web Studio", "Processamento rápido no navegador, sem instalar.", "Abrir Web Studio →"),
                ("Desktop", "Lotes no Windows com LUT/CDL e export EDL.", "Ferramentas Windows →"),
                ("Grade e entrega", "Com <a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> LUT/CDL e MP4.", "CineLut Live Grade →"),
            ],
            "guides_title": "Guias e fluxos por lente",
            "back_home": "← Início PT",
            "og_title": "Desqueeze anamórfico — DeSqueeze Studio",
            "og_desc": "Da captura ao CinemaScope no celular, desktop e web.",
            "schema_name": "Fluxo de desqueeze anamórfico",
            "schema_desc": "Desqueeze anamórfico profissional da captura ao CinemaScope em iOS, Android, Mac, Windows e web.",
            "crumb": "Desqueeze anamórfico",
            "studios": "Para estúdios",
            "guides": "Guias",
            "privacy": "Privacidade",
            "terms": "Termos",
            "contact": "Contato",
            "alt": "AnamorphicDesqueezer — desqueeze para mobile, iPad, iPhone, MacBook e Windows",
        },
    },
    "zh": {
        "html_lang": "zh-CN",
        "hreflang": "zh-Hans",
        "og_locale": "zh_CN",
        "geo": "CN",
        "placename": "China",
        "language_name": "Chinese",
        "dir_label": "中文",
        "home_nav": "中文首页",
        "anamorphic_nav": "变形宽银幕",
        "english_nav": "English",
        "currency": "CNY",
        "home": {
            "title": "变形宽银幕解压 Desqueeze 应用 — 免费网页工具 | DeSqueeze Studio",
            "description": "面向中国及华语创作者的变形宽银幕（Anamorphic）解压工具。支持 iPhone、Android、Mac、Windows 与免费在线校正。1.33×–2×、CinemaScope 导出、实时 LUT。无地区锁定。",
            "keywords": "变形宽银幕 解压, anamorphic desqueeze, 变形镜头 校正, 电影画幅, 1.33x desqueeze, 手机电影镜头",
            "eyebrow": "华语市场 · 变形宽银幕解压",
            "h1": "正确解压变形宽银幕画面",
            "lede": "DeSqueeze Studio 用于校正变形镜头的水平压缩，还原电影画幅。从免费 Web Studio 到 iPhone、Android、Mac、Windows 应用。",
            "bullets": [
                "关键词：变形宽银幕解压 / desqueeze / CinemaScope",
                "支持 1.33×–2×、实时监看、批量导出",
                "无地区锁定 — 华语创作者可直接使用",
            ],
            "cta_primary": "查看变形宽银幕流程",
            "cta_web": "免费 Web Studio",
            "why_title": "为什么需要解压？",
            "why_body": "变形镜头会水平压缩画面。不解压时，人物与圆形会显得纵向拉伸。解压后可还原目标画幅（如 2.39:1 CinemaScope）。",
            "start_title": "从这里开始",
            "cards": [
                ("变形宽银幕指南", "实时监看、批量与各平台用法。", "中文指南 →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "App Store 上的 Anamorphic Desqueezer。", "应用详情 →", "/anamorphic-desqueeze-iphone.html"),
                ("1.33× 教程", "Moment / Sirui 等 1.33× 镜头检查点。", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("英文完整站", "FilmStudio、LiveGrade、Windows、指南。", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "变形宽银幕",
            "footer_guides": "指南",
            "footer_privacy": "隐私",
            "footer_terms": "条款",
            "footer_contact": "联系",
            "og_title": "变形宽银幕解压 — DeSqueeze Studio",
            "og_desc": "正确解压变形画面。免费网页 + iOS / Android / Mac / Windows。",
            "schema_desc": "变形宽银幕解压与影视制作工具（华语）。",
            "app_desc": "变形镜头画面解压、实时监看、CinemaScope 导出。",
        },
        "anamorphic": {
            "title": "变形宽银幕解压 — 实时监看、批量导出、CinemaScope | DeSqueeze Studio",
            "description": "变形宽银幕解压生态：在 iPhone、Android、Mac、Windows 与免费 Web Studio 上进行实时监看、1.33×–2× 校正与 CinemaScope 2.39:1 导出。",
            "keywords": "变形宽银幕解压, anamorphic workflow, CinemaScope 导出, 1.33x 2x desqueeze",
            "eyebrow": "影视软件 · 变形宽银幕通道",
            "h1": "变形宽银幕解压 — 从拍摄到交付",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — 实时监看、倍率、示波器、ProRes / FCPXML 导出。无需打开完整剪辑软件即可完成倍率、监看、批量与 CinemaScope。",
            "bullets": [
                "实时解压：2.39:1 参考线、斑马纹、波形、伪彩、峰值对焦",
                "视频与静帧批量 — 1.33× 至 2× — 真正的 CinemaScope 导出",
                "iOS · Android · Mac · Windows · 免费 Web Studio",
            ],
            "cta_overview": "应用概览",
            "cta_web": "试用 Web Studio（免费）",
            "flow_title": "变形宽银幕流程",
            "flow_p1": "将变形宽银幕作为独立管线：倍率、监看、批量、导出。可从免费 <a href=\"/index.html#settings\">Web Studio</a> 的 1.33×–2× 预览与批量开始。",
            "flow_p2": "在 <strong>iPhone、iPad、MacBook</strong> 上，<a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> 是原生旗舰。<a href=\"/filmstudio.html\">FilmStudio</a> 负责机内宽画幅取景。",
            "flow_p3": "<strong>Android（Google Play）：</strong> 批量用 <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>；现场实时用 <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>。",
            "flow_p4": "<strong>Windows：</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> 支持文件夹批量、CinemaScope 预设、LUT/CDL 与 EDL 导出。",
            "platforms_title": "平台",
            "plat": [
                ("移动应用", "iOS/Android 实时解压与剪辑。", "iOS 概览 →"),
                ("Web Studio", "浏览器快速处理与批量，无需安装。", "打开 Web Studio →"),
                ("桌面端", "Windows 大批量、LUT/CDL、EDL 友好导出。", "Windows 工具 →"),
                ("调色与交付", "配合 <a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> 实时 LUT/CDL，再导出 MP4。", "CineLut Live Grade →"),
            ],
            "guides_title": "指南与镜头工作流",
            "back_home": "← 中文首页",
            "og_title": "变形宽银幕解压 — DeSqueeze Studio",
            "og_desc": "从拍摄到 CinemaScope 交付 — 移动、桌面与网页一体。",
            "schema_name": "变形宽银幕解压工作流",
            "schema_desc": "在 iOS、Android、Mac、Windows 与网页上，从拍摄到 CinemaScope 的专业变形宽银幕解压。",
            "crumb": "变形宽银幕解压",
            "studios": "工作室适用",
            "guides": "指南",
            "privacy": "隐私",
            "terms": "条款",
            "contact": "联系",
            "alt": "AnamorphicDesqueezer — 适用于手机、iPad、iPhone、MacBook 与 Windows 的变形解压",
        },
    },
    "hi": {
        "html_lang": "hi",
        "hreflang": "hi",
        "og_locale": "hi_IN",
        "geo": "IN",
        "placename": "India",
        "language_name": "Hindi",
        "dir_label": "हिन्दी",
        "home_nav": "हिन्दी होम",
        "anamorphic_nav": "एनामॉर्फिक",
        "english_nav": "English",
        "currency": "INR",
        "home": {
            "title": "एनामॉर्फिक डिस्क्वीज़ ऐप — मुफ़्त वेब टूल | DeSqueeze Studio भारत",
            "description": "भारत के क्रिएटर्स के लिए एनामॉर्फिक डिस्क्वीज़। iPhone, Android, Mac, Windows ऐप्स और मुफ़्त ऑनलाइन सुधार। 1.33×–2×, CinemaScope एक्सपोर्ट, लाइव LUT। कोई रीजन लॉक नहीं।",
            "keywords": "एनामॉर्फिक डिस्क्वीज़, anamorphic desqueeze, सिनेमास्कोप, 1.33x desqueeze, iPhone एनामॉर्फिक, वीडियो आस्पेक्ट रेशियो",
            "eyebrow": "भारत · एनामॉर्फिक डिस्क्वीज़",
            "h1": "एनामॉर्फिक फ़ुटेज को सही से डिस्क्वीज़ करें",
            "lede": "DeSqueeze Studio एनामॉर्फिक लेंस की हॉरिज़ॉन्टल स्क्वीज़ को सिनेमैटिक आस्पेक्ट रेशियो में वापस लाता है। मुफ़्त Web Studio से लेकर iPhone, Android, Mac और Windows ऐप्स तक।",
            "bullets": [
                "कीवर्ड: एनामॉर्फिक डिस्क्वीज़ / desqueeze / CinemaScope",
                "1.33×–2×, लाइव मॉनिटर, बैच एक्सपोर्ट",
                "कोई रीजन लॉक नहीं — भारत से तुरंत इस्तेमाल",
            ],
            "cta_primary": "एनामॉर्फिक फ़्लो देखें",
            "cta_web": "मुफ़्त Web Studio",
            "why_title": "डिस्क्वीज़ क्यों ज़रूरी है?",
            "why_body": "एनामॉर्फिक लेंस हॉरिज़ॉन्टली स्क्वीज़ रिकॉर्ड करते हैं। बिना सुधार के चेहरे और वृत्त लंबे दिखते हैं। डिस्क्वीज़ सही फ़ॉर्मेट (जैसे 2.39:1 CinemaScope) वापस लाता है।",
            "start_title": "यहाँ से शुरू करें",
            "cards": [
                ("एनामॉर्फिक गाइड", "लाइव मॉनिटर, बैच और प्लेटफ़ॉर्म।", "हिन्दी गाइड →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "App Store पर Anamorphic Desqueezer।", "ऐप विवरण →", "/anamorphic-desqueeze-iphone.html"),
                ("1.33× हाउ-टू", "Moment / Sirui 1.33× चेकलिस्ट।", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("पूरा अंग्रेज़ी साइट", "FilmStudio, LiveGrade, Windows, गाइड्स।", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "एनामॉर्फिक",
            "footer_guides": "गाइड्स",
            "footer_privacy": "गोपनीयता",
            "footer_terms": "नियम",
            "footer_contact": "संपर्क",
            "og_title": "एनामॉर्फिक डिस्क्वीज़ — DeSqueeze Studio भारत",
            "og_desc": "सही एनामॉर्फिक डिस्क्वीज़। मुफ़्त वेब + iOS / Android / Mac / Windows।",
            "schema_desc": "एनामॉर्फिक डिस्क्वीज़ और फ़िल्ममेकिंग टूल्स (भारत)।",
            "app_desc": "एनामॉर्फिक वीडियो डिस्क्वीज़, लाइव मॉनिटर, CinemaScope एक्सपोर्ट।",
        },
        "anamorphic": {
            "title": "एनामॉर्फिक डिस्क्वीज़ — लाइव मॉनिटर, बैच और CinemaScope | DeSqueeze Studio",
            "description": "एनामॉर्फिक डिस्क्वीज़ इकोसिस्टम: iPhone, Android, Mac, Windows और मुफ़्त Web Studio पर लाइव मॉनिटर, 1.33×–2× सुधार और CinemaScope 2.39:1 — भारत के लिए।",
            "keywords": "एनामॉर्फिक डिस्क्वीज़, anamorphic workflow, CinemaScope export, 1.33x 2x desqueeze India",
            "eyebrow": "फ़िल्ममेकिंग सॉफ़्टवेयर · एनामॉर्फिक लेन",
            "h1": "एनामॉर्फिक डिस्क्वीज़ — कैप्चर से डिलीवरी तक",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — लाइव मॉनिटर, रेशियो, स्कोप, ProRes / FCPXML एक्सपोर्ट। पूरा NLE खोले बिना रेशियो, मॉनिटरिंग, बैच और CinemaScope।",
            "bullets": [
                "2.39:1 गाइड, ज़ेब्रा, वेवफ़ॉर्म, फ़ॉल्स कलर, फ़ोकस पीकिंग के साथ लाइव डिस्क्वीज़",
                "वीडियो और स्टिल बैच — 1.33× से 2× — असली CinemaScope एक्सपोर्ट",
                "iOS · Android · Mac · Windows · मुफ़्त Web Studio",
            ],
            "cta_overview": "ऐप ओवरव्यू",
            "cta_web": "Web Studio आज़माएँ (मुफ़्त)",
            "flow_title": "एनामॉर्फिक फ़्लो",
            "flow_p1": "एनामॉर्फिक को अलग पाइपलाइन की तरह लें। मुफ़्त <a href=\"/index.html#settings\">Web Studio</a> से 1.33×–2× और बैच ×10 से शुरू करें।",
            "flow_p2": "<strong>iPhone, iPad और MacBook</strong> पर <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> नेटिव फ़्लैगशिप है। <a href=\"/filmstudio.html\">FilmStudio</a> कैप्चर साथी है।",
            "flow_p3": "<strong>Android (Google Play):</strong> बैच के लिए <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a>; सेट पर <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>।",
            "flow_p4": "<strong>Windows:</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> फ़ोल्डर बैच, CinemaScope प्रीसेट, LUT/CDL, EDL एक्सपोर्ट।",
            "platforms_title": "प्लेटफ़ॉर्म",
            "plat": [
                ("मोबाइल ऐप्स", "iOS/Android पर लाइव डिस्क्वीज़ और एडिट।", "iOS ओवरव्यू →"),
                ("Web Studio", "ब्राउज़र में तेज़ प्रोसेसिंग — इंस्टॉल नहीं।", "Web Studio खोलें →"),
                ("डेस्कटॉप", "Windows बैच, LUT/CDL, EDL-फ़्रेंडली एक्सपोर्ट।", "Windows टूल्स →"),
                ("ग्रेड और डिलीवर", "<a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> से लाइव LUT/CDL, फिर MP4।", "CineLut Live Grade →"),
            ],
            "guides_title": "गाइड्स और लेंस वर्कफ़्लो",
            "back_home": "← हिन्दी होम",
            "og_title": "एनामॉर्फिक डिस्क्वीज़ — DeSqueeze Studio",
            "og_desc": "कैप्चर से CinemaScope डिलीवरी — मोबाइल, डेस्कटॉप और वेब।",
            "schema_name": "एनामॉर्फिक डिस्क्वीज़ वर्कफ़्लो",
            "schema_desc": "iOS, Android, Mac, Windows और वेब पर कैप्चर से CinemaScope तक प्रो एनामॉर्फिक डिस्क्वीज़।",
            "crumb": "एनामॉर्फिक डिस्क्वीज़",
            "studios": "स्टूडियो के लिए",
            "guides": "गाइड्स",
            "privacy": "गोपनीयता",
            "terms": "नियम",
            "contact": "संपर्क",
            "alt": "AnamorphicDesqueezer — मोबाइल, iPad, iPhone, MacBook और Windows के लिए डिस्क्वीज़",
        },
    },
    "fr": {
        "html_lang": "fr",
        "hreflang": "fr",
        "og_locale": "fr_FR",
        "geo": "FR",
        "placename": "France",
        "language_name": "French",
        "dir_label": "Français",
        "home_nav": "Accueil FR",
        "anamorphic_nav": "Anamorphique",
        "english_nav": "English",
        "currency": "EUR",
        "home": {
            "title": "Désqueeze anamorphique — outil web gratuit | DeSqueeze Studio FR",
            "description": "Désqueeze anamorphique pour créateurs en France et francophonie. Apps iPhone, Android, Mac, Windows + outil en ligne gratuit. 1,33×–2×, CinemaScope, LUT live. Sans verrouillage régional.",
            "keywords": "desqueeze anamorphique, corriger anamorphique, CinemaScope, 1.33x desqueeze, iPhone anamorphique, ratio d'aspect video",
            "eyebrow": "France · Désqueeze anamorphique",
            "h1": "Désqueezez correctement vos plans anamorphiques",
            "lede": "DeSqueeze Studio restaure la compression horizontale des optiques anamorphiques vers le ratio cinéma. Du Web Studio gratuit aux apps iPhone, Android, Mac et Windows.",
            "bullets": [
                "Mots-clés : désqueeze anamorphique / CinemaScope / 1.33x",
                "1,33×–2×, moniteur live, export par lots",
                "Sans verrouillage régional — France et francophonie",
            ],
            "cta_primary": "Voir le flux anamorphique",
            "cta_web": "Web Studio gratuit",
            "why_title": "Pourquoi désqueezer ?",
            "why_body": "Les optiques anamorphiques compriment à l’horizontale. Sans correction, visages et cercles paraissent étirés. Le désqueeze rétablit le format (ex. 2,39:1 CinemaScope).",
            "start_title": "Commencer ici",
            "cards": [
                ("Guide anamorphique", "Moniteur live, lots et plateformes.", "Guide FR →", "anamorphic.html"),
                ("iPhone / iPad / Mac", "Anamorphic Desqueezer sur l’App Store.", "Détails app →", "/anamorphic-desqueeze-iphone.html"),
                ("Guide 1,33×", "Points de contrôle Moment / Sirui 1,33×.", "How-to →", "/how-to-desqueeze-1-33x.html"),
                ("Site complet EN", "FilmStudio, LiveGrade, Windows, guides.", "English hub →", "/"),
            ],
            "back": "English anamorphic page →",
            "footer_home": "Anamorphique",
            "footer_guides": "Guides",
            "footer_privacy": "Confidentialité",
            "footer_terms": "Conditions",
            "footer_contact": "Contact",
            "og_title": "Désqueeze anamorphique — DeSqueeze Studio FR",
            "og_desc": "Corrigez l’anamorphique avec le web gratuit et les apps iOS / Android / Mac / Windows.",
            "schema_desc": "Désqueeze anamorphique et outils de filmmaking (FR).",
            "app_desc": "Désqueeze vidéo anamorphique, moniteur live et export CinemaScope.",
        },
        "anamorphic": {
            "title": "Désqueeze anamorphique — moniteur live, lots et CinemaScope | DeSqueeze Studio",
            "description": "Écosystème de désqueeze anamorphique : moniteur live, correction 1,33×–2× et CinemaScope 2,39:1 sur iPhone, Android, Mac, Windows et Web Studio gratuit — France.",
            "keywords": "desqueeze anamorphique, flux anamorphique, export CinemaScope, 1.33x 2x desqueeze",
            "eyebrow": "Logiciel filmmaking · Voie anamorphique",
            "h1": "Désqueeze anamorphique — de la prise de vue à la livraison",
            "lede_html": "<strong>Anamorphic Desqueezer</strong> — moniteur live, ratios, scopes, export ProRes / FCPXML. Maths de ratio, monitoring, lots et CinemaScope sans ouvrir un NLE complet.",
            "bullets": [
                "Désqueeze live avec guides 2,39:1, zébras, waveform, false color et peaking",
                "Lots vidéo et photos — 1,33× à 2× — vrai export CinemaScope",
                "iOS · Android · Mac · Windows · Web Studio gratuit",
            ],
            "cta_overview": "Aperçu de l’app",
            "cta_web": "Essayer Web Studio (gratuit)",
            "flow_title": "Flux anamorphique",
            "flow_p1": "Traitez l’anamorphique comme un pipeline dédié. Commencez dans le <a href=\"/index.html#settings\">Web Studio</a> gratuit en 1,33×–2× et lots ×10.",
            "flow_p2": "Sur <strong>iPhone, iPad et MacBook</strong>, <a href=\"/anamorphic-desqueeze-iphone.html\">Anamorphic Desqueezer</a> est le fleuron natif. <a href=\"/filmstudio.html\">FilmStudio</a> accompagne la prise de vue.",
            "flow_p3": "<strong>Android (Google Play) :</strong> lots avec <a href=\"/index.html#android-anamorphic-batch\">Anamorphic Desqueezer</a> ; sur le plateau avec <a href=\"/index.html#android-anamorphic-pro-cam\">Pro Cam</a>.",
            "flow_p4": "<strong>Windows :</strong> <a href=\"/index.html#windows-anamorphic-pro\">AnamorphicDesqueezePro</a> pour dossiers, presets CinemaScope, LUT/CDL et EDL.",
            "platforms_title": "Plateformes",
            "plat": [
                ("Apps mobiles", "Désqueeze live et montage sur iOS/Android.", "Aperçu iOS →"),
                ("Web Studio", "Traitement rapide dans le navigateur, sans install.", "Ouvrir Web Studio →"),
                ("Bureau", "Lots Windows avec LUT/CDL et export EDL.", "Outils Windows →"),
                ("Étalonnage & livraison", "Avec <a href=\"/cinelutlivegrade.html\">CineLut Live Grade</a> LUT/CDL puis MP4.", "CineLut Live Grade →"),
            ],
            "guides_title": "Guides et workflows par optique",
            "back_home": "← Accueil FR",
            "og_title": "Désqueeze anamorphique — DeSqueeze Studio",
            "og_desc": "De la prise de vue au CinemaScope — mobile, bureau et web.",
            "schema_name": "Workflow de désqueeze anamorphique",
            "schema_desc": "Désqueeze anamorphique pro de la prise de vue au CinemaScope sur iOS, Android, Mac, Windows et web.",
            "crumb": "Désqueeze anamorphique",
            "studios": "Pour studios",
            "guides": "Guides",
            "privacy": "Confidentialité",
            "terms": "Conditions",
            "contact": "Contact",
            "alt": "AnamorphicDesqueezer — désqueeze pour mobile, iPad, iPhone, MacBook et Windows",
        },
    },
}


def esc(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def hreflang_block(code: str, path: str) -> str:
    """path is '' for home or 'anamorphic.html'."""
    en = "https://anamorphic-desqueeze.com/" if not path else f"https://anamorphic-desqueeze.com/{path}"
    loc = f"https://anamorphic-desqueeze.com/{code}/" if not path else f"https://anamorphic-desqueeze.com/{code}/{path}"
    lines = [
        f'  <link rel="canonical" href="{loc}" />',
        f'  <link rel="alternate" hreflang="{LOCALES[code]["hreflang"]}" href="{loc}" />',
        f'  <link rel="alternate" hreflang="en" href="{en}" />',
        f'  <link rel="alternate" hreflang="en-us" href="{en}" />',
        f'  <link rel="alternate" hreflang="x-default" href="{en}" />',
    ]
    # Cross-link sibling locales
    for other in sorted(set(LOCALES) | {"ja"}):
        if other == code:
            continue
        oh = LOCALES[other]["hreflang"] if other in LOCALES else "ja"
        op = f"https://anamorphic-desqueeze.com/{other}/" if not path else f"https://anamorphic-desqueeze.com/{other}/{path}"
        lines.append(f'  <link rel="alternate" hreflang="{oh}" href="{op}" />')
    return "\n".join(lines)


def write_home(code: str, meta: dict) -> None:
    h = meta["home"]
    cards_html = []
    for title, body, link_txt, href in h["cards"]:
        if not href.startswith("/"):
            href = f"/{code}/{href}"
        cards_html.append(
            f"""          <article class="anamorphic-platform-card">
            <h3>{esc(title)}</h3>
            <p>{esc(body)}</p>
            <a href="{href}"{" hreflang=\"en\"" if href == "/" else ""}>{esc(link_txt)}</a>
          </article>"""
        )
    bullets = "\n".join(f"            <li>{esc(b)}</li>" for b in h["bullets"])
    html = f"""<!doctype html>
<html lang="{meta["html_lang"]}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-6BFDRLKVZK"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{ dataLayer.push(arguments); }}
    gtag('js', new Date());
    gtag('config', 'G-6BFDRLKVZK');
  </script>
  <title>{esc(h["title"])}</title>
  <meta name="description" content="{esc(h["description"])}" />
  <meta name="keywords" content="{esc(h["keywords"])}" />
{hreflang_block(code, "")}
  <meta name="geo.region" content="{meta["geo"]}" />
  <meta name="geo.placename" content="{esc(meta["placename"])}" />
  <meta name="language" content="{meta["language_name"]}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="{meta["og_locale"]}" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:site_name" content="DeSqueeze Studio" />
  <meta property="og:title" content="{esc(h["og_title"])}" />
  <meta property="og:description" content="{esc(h["og_desc"])}" />
  <meta property="og:url" content="https://anamorphic-desqueeze.com/{code}/" />
  <meta property="og:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(h["og_title"])}" />
  <meta name="twitter:description" content="{esc(h["og_desc"])}" />
  <meta name="twitter:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DeSqueeze Studio",
    "inLanguage": "{meta["html_lang"]}",
    "url": "https://anamorphic-desqueeze.com/{code}/",
    "description": {json.dumps(h["schema_desc"], ensure_ascii=False)},
    "publisher": {{ "@type": "Organization", "name": "DeSqueeze Studio", "url": "https://anamorphic-desqueeze.com/" }}
  }}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Anamorphic Desqueezer",
    "inLanguage": "{meta["html_lang"]}",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "iOS, iPadOS, macOS, Android, Windows, Web",
    "description": {json.dumps(h["app_desc"], ensure_ascii=False)},
    "url": "https://anamorphic-desqueeze.com/{code}/anamorphic.html",
    "offers": {{ "@type": "Offer", "price": "0", "priceCurrency": "{meta["currency"]}" }},
    "areaServed": {{ "@type": "Country", "name": {json.dumps(meta["placename"], ensure_ascii=False)} }}
  }}
  </script>
  <link rel="stylesheet" href="/style.css?v=43" />
</head>
<body class="product-skin product-skin--hub" data-locale="{code if code != "zh" else "zh-CN"}">
  <header class="site-header">
    <div class="site-header__inner">
      <a href="/{code}/" class="brand" aria-label="DeSqueeze Studio">
        <span>DeSqueeze Studio</span>
      </a>
      <nav class="nav">
        <a href="/{code}/" aria-current="page">{esc(meta["home_nav"])}</a>
        <a href="/{code}/anamorphic.html">{esc(meta["anamorphic_nav"])}</a>
        <a href="/anamorphic-desqueeze-iphone.html">iOS / Mac</a>
        <a href="/guides.html">Guides</a>
        <a href="/" hreflang="en">{esc(meta["english_nav"])}</a>
      </nav>
    </div>
  </header>
  <main id="{code}-home-main">
    <section class="hub-hero hub-hero--product" aria-labelledby="{code}-home-title">
      <div class="hub-hero__inner hub-hero__inner--split">
        <div class="hub-hero__copy">
          <p class="product-hero__eyebrow">{esc(h["eyebrow"])}</p>
          <h1 id="{code}-home-title">{esc(h["h1"])}</h1>
          <p class="hub-hero__tool-body">{esc(h["lede"])}</p>
          <ul class="hub-hero__tool-bullets">
{bullets}
          </ul>
          <div class="product-hero__ctas">
            <a class="product-cta product-cta--primary" href="/{code}/anamorphic.html">{esc(h["cta_primary"])}</a>
            <a class="product-cta" href="/index.html#settings">{esc(h["cta_web"])}</a>
            <a class="product-cta" href="https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068" target="_blank" rel="noopener">App Store ↗</a>
          </div>
        </div>
        <figure class="hub-hero__visual hub-hero__visual--square">
          <a href="/{code}/anamorphic.html" class="hub-hero__visual-link">
            <img src="/assets/anamorphic-desqueezer-iphone-hero.png?v=3" width="1024" height="1024" alt="{esc(h["og_title"])}" loading="eager" decoding="async" />
          </a>
        </figure>
      </div>
    </section>
    <div class="product-main">
      <div class="product-body">
        <section class="product-panel" id="why-desqueeze">
          <h2>{esc(h["why_title"])}</h2>
          <p>{esc(h["why_body"])}</p>
        </section>
        <section class="product-panel" id="start-here">
          <h2>{esc(h["start_title"])}</h2>
          <div class="anamorphic-platform-grid">
{chr(10).join(cards_html)}
          </div>
        </section>
        <p class="product-back"><a href="/anamorphic.html" hreflang="en">{esc(h["back"])}</a></p>
      </div>
    </div>
  </main>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div>© <span id="y"></span> DeSqueeze Studio</div>
      <div class="site-footer__links">
        <a href="/{code}/anamorphic.html">{esc(h["footer_home"])}</a>
        <a href="/guides.html">{esc(h["footer_guides"])}</a>
        <a href="/privacy.html">{esc(h["footer_privacy"])}</a>
        <a href="/terms.html">{esc(h["footer_terms"])}</a>
        <a href="mailto:teamcentersap@gmail.com">{esc(h["footer_contact"])}</a>
      </div>
    </div>
  </footer>
  <script>document.getElementById("y").textContent = new Date().getFullYear();</script>
  <script src="/assets/site-chrome.js?v=15"></script>
</body>
</html>
"""
    out = ROOT / code
    out.mkdir(parents=True, exist_ok=True)
    (out / "index.html").write_text(html, encoding="utf-8")


def write_anamorphic(code: str, meta: dict) -> None:
    a = meta["anamorphic"]
    bullets = "\n".join(f"            <li>{esc(b)}</li>" for b in a["bullets"])
    plats = []
    hrefs = [
        "/anamorphic-desqueeze-iphone.html",
        "/index.html#settings",
        "/windows-tools.html",
        "/cinelutlivegrade.html",
    ]
    for i, (title, body, link) in enumerate(a["plat"]):
        plats.append(
            f"""          <article class="anamorphic-platform-card">
            <h3>{esc(title)}</h3>
            <p>{body}</p>
            <a href="{hrefs[i]}">{esc(link)}</a>
          </article>"""
        )
    locale_attr = "zh-CN" if code == "zh" else code
    html = f"""<!doctype html>
<html lang="{meta["html_lang"]}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-6BFDRLKVZK"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{ dataLayer.push(arguments); }}
    gtag('js', new Date());
    gtag('config', 'G-6BFDRLKVZK');
  </script>
  <title>{esc(a["title"])}</title>
  <meta name="description" content="{esc(a["description"])}" />
  <meta name="keywords" content="{esc(a["keywords"])}" />
{hreflang_block(code, "anamorphic.html")}
  <meta name="geo.region" content="{meta["geo"]}" />
  <meta name="geo.placename" content="{esc(meta["placename"])}" />
  <meta name="language" content="{meta["language_name"]}" />
  <meta name="robots" content="index,follow" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="{meta["og_locale"]}" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:title" content="{esc(a["og_title"])}" />
  <meta property="og:description" content="{esc(a["og_desc"])}" />
  <meta property="og:url" content="https://anamorphic-desqueeze.com/{code}/anamorphic.html" />
  <meta property="og:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(a["og_title"])}" />
  <meta name="twitter:description" content="{esc(a["og_desc"])}" />
  <meta name="twitter:image" content="https://anamorphic-desqueeze.com/assets/anamorphic-desqueezer-iphone-hero.png?v=3" />
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "inLanguage": "{meta["html_lang"]}",
    "name": {json.dumps(a["schema_name"], ensure_ascii=False)},
    "description": {json.dumps(a["schema_desc"], ensure_ascii=False)},
    "url": "https://anamorphic-desqueeze.com/{code}/anamorphic.html",
    "isPartOf": {{ "@type": "WebSite", "name": "DeSqueeze Studio", "url": "https://anamorphic-desqueeze.com/" }}
  }}
  </script>
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {{ "@type": "ListItem", "position": 1, "name": "DeSqueeze Studio", "item": "https://anamorphic-desqueeze.com/{code}/" }},
      {{ "@type": "ListItem", "position": 2, "name": {json.dumps(a["crumb"], ensure_ascii=False)}, "item": "https://anamorphic-desqueeze.com/{code}/anamorphic.html" }}
    ]
  }}
  </script>
  <link rel="stylesheet" href="/style.css?v=43" />
</head>
<body class="product-skin product-skin--anamorphic anamorphic-landing" data-locale="{locale_attr}">
  <header class="site-header">
    <div class="site-header__inner">
      <a href="/{code}/" class="brand"><span>DeSqueeze Studio</span></a>
      <nav class="nav">
        <a href="/{code}/">{esc(meta["home_nav"])}</a>
        <a href="/{code}/anamorphic.html" aria-current="page">{esc(meta["anamorphic_nav"])}</a>
        <a href="/anamorphic-desqueeze-iphone.html">iOS / Mac</a>
        <a href="/guides.html">Guides</a>
        <a href="/anamorphic.html" hreflang="en">{esc(meta["english_nav"])}</a>
      </nav>
    </div>
  </header>
  <main id="anamorphic-main">
    <section class="hub-hero hub-hero--product" aria-labelledby="anamorphic-landing-title">
      <div class="hub-hero__inner hub-hero__inner--split">
        <div class="hub-hero__copy">
          <p class="product-hero__eyebrow">{esc(a["eyebrow"])}</p>
          <h1 id="anamorphic-landing-title">{esc(a["h1"])}</h1>
          <p class="hub-hero__tool-body">{a["lede_html"]}</p>
          <ul class="hub-hero__tool-bullets">
{bullets}
          </ul>
          <div class="product-hero__ctas">
            <a class="product-cta product-cta--primary" href="/anamorphic-desqueeze-iphone.html">{esc(a["cta_overview"])}</a>
            <a class="product-cta" href="/index.html#settings">{esc(a["cta_web"])}</a>
            <a class="product-cta" href="https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068" target="_blank" rel="noopener">App Store ↗</a>
          </div>
        </div>
        <figure class="hub-hero__visual hub-hero__visual--square">
          <a href="/anamorphic-desqueeze-iphone.html" class="hub-hero__visual-link">
            <img src="/assets/anamorphic-desqueezer-iphone-hero.png?v=3" width="1024" height="1024" alt="{esc(a["alt"])}" loading="eager" decoding="async" />
          </a>
        </figure>
      </div>
    </section>
    <div class="product-main">
      <div class="product-body anamorphic-landing__body">
        <section class="product-panel anamorphic-landing__panel" id="anamorphic-flow">
          <h2>{esc(a["flow_title"])}</h2>
          <p>{a["flow_p1"]}</p>
          <p>{a["flow_p2"]}</p>
          <p>{a["flow_p3"]}</p>
          <p>{a["flow_p4"]}</p>
        </section>
        <section class="product-panel anamorphic-landing__panel" id="anamorphic-platforms">
          <h2>{esc(a["platforms_title"])}</h2>
          <div class="anamorphic-platform-grid">
{chr(10).join(plats)}
          </div>
        </section>
        <section class="product-panel anamorphic-landing__panel" id="anamorphic-guides">
          <h2>{esc(a["guides_title"])}</h2>
          <p class="anamorphic-landing__guide-links">
            <a href="/how-to-desqueeze-1-33x.html">1.33×</a> ·
            <a href="/moment-anamorphic-desqueeze.html">Moment</a> ·
            <a href="/sirui-anamorphic-desqueeze.html">Sirui</a> ·
            <a href="/cinemascope-export-online.html">CinemaScope</a> ·
            <a href="/guides.html">Guides</a>
          </p>
        </section>
        <p class="product-back"><a href="/{code}/">{esc(a["back_home"])}</a> · <a href="/anamorphic.html" hreflang="en">English</a></p>
      </div>
    </div>
  </main>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div>© <span id="y"></span> DeSqueeze Studio</div>
      <div class="site-footer__links">
        <a href="/index.html#for-studios">{esc(a["studios"])}</a>
        <a href="/guides.html">{esc(a["guides"])}</a>
        <a href="/privacy.html">{esc(a["privacy"])}</a>
        <a href="/terms.html">{esc(a["terms"])}</a>
        <a href="mailto:teamcentersap@gmail.com">{esc(a["contact"])}</a>
      </div>
    </div>
  </footer>
  <script>document.getElementById("y").textContent = new Date().getFullYear();</script>
  <script src="/assets/site-chrome.js?v=15"></script>
</body>
</html>
"""
    out = ROOT / code
    out.mkdir(parents=True, exist_ok=True)
    (out / "anamorphic.html").write_text(html, encoding="utf-8")


def main() -> None:
    for code, meta in LOCALES.items():
        write_home(code, meta)
        write_anamorphic(code, meta)
        print(f"OK {code}/")


if __name__ == "__main__":
    main()
