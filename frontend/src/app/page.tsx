"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [earlyEmail, setEarlyEmail] = useState("");
  const [earlySubmitted, setEarlySubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleEarlyAccess(e: FormEvent) {
    e.preventDefault();
    const email = earlyEmail.trim();
    if (!email) return;
    setEarlySubmitted(true);
    router.push(`/register?email=${encodeURIComponent(email)}`);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (ID_PATTERN.test(q)) {
      router.push(`/p/${encodeURIComponent(q.toUpperCase())}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <nav
        className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all ${
          scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
              ID
            </span>
            <span>Identification ID</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/search" className="text-muted hover:text-foreground transition-colors">Search</Link>
            <Link href="/pricing" className="text-muted hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/faq" className="text-muted hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/login" className="text-muted hover:text-foreground transition-colors">Log in</Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              For Manufacturers
            </Link>
          </div>
          <Link
            href="/register"
            className="md:hidden bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-blue-50 via-blue-50/30 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-3xl mx-auto text-center pt-20 pb-10 px-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white text-accent px-3.5 py-1.5 rounded-full mb-8 border border-blue-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Глобальный реестр товаров · Live
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
            Identification ID
          </h1>

          <p className="text-xl text-muted mb-4 leading-relaxed max-w-2xl mx-auto font-medium">
            Это глобальный онлайн-реестр товаров, где каждый товар получает уникальный ID
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", label: "Wikipedia" },
              { icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z", label: "GS1 / Штрих-коды" },
              { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Цифровой паспорт" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-sm bg-white border border-border rounded-full px-4 py-2 shadow-sm"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                {label}
              </span>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-2xl border border-border shadow-sm focus-within:border-accent focus-within:shadow-md transition-all">
                <svg className="w-5 h-5 text-muted ml-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Введите название товара или ID..."
                  className="flex-1 px-4 py-4 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                  style={{ boxShadow: "none" }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="m-1.5 bg-accent text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover whitespace-nowrap transition-colors shadow-sm"
                >
                  Найти →
                </button>
              </div>
            </div>
            <p className="text-xs text-muted mt-4">
              Попробуйте:{" "}
              <button type="button" onClick={() => setQuery("IID-4F9A-2K7Q")} className="font-mono text-foreground hover:text-accent underline-offset-4 hover:underline transition-colors">
                IID-4F9A-2K7Q
              </button>
              {" · "}
              <button type="button" onClick={() => setQuery("Air Fryer")} className="hover:text-accent transition-colors">Air Fryer</button>
              {" · "}
              <button type="button" onClick={() => setQuery("Drill")} className="hover:text-accent transition-colors">Drill</button>
            </p>
          </form>
        </div>

        {/* Trust stats */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
            {[
              { n: "1 200+", label: "Зарегистрированных товаров" },
              { n: "50+", label: "Производителей" },
              { n: "30+", label: "Стран" },
              { n: "100%", label: "Бесплатно для потребителей" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold tracking-tight">{s.n}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Identification ID ── */}
      <section className="bg-gradient-to-b from-surface to-background py-20 px-6 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Что это такое</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              Единый цифровой паспорт для каждого товара
            </h2>
            <p className="text-muted max-w-2xl mx-auto leading-relaxed">
              Identification ID — это система независимого единого цифрового паспорта товара,
              а также международный каталог товаров. Единый стандарт описания товара и паспорт изделия.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
                title: "Уникальный ID для каждого товара",
                desc: "Каждый товар получает уникальный идентификатор, который остаётся с ним навсегда — от производства до потребителя.",
              },
              {
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
                title: "Вся информация в одном месте",
                desc: "Документы, инструкции, сертификаты, фотографии — всё хранится в единой системе и всегда доступно по ID.",
              },
              {
                icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z",
                title: "Проверка информации потребителем",
                desc: "Любой потребитель может получить и проверить полную информацию о товаре по его ID — быстро и бесплатно.",
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                title: "Цифровой паспорт товара",
                desc: "Производители получают живой цифровой паспорт — обновляют информацию без перепечатки инструкций и экономят на бумажной документации.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Consumers & Manufacturers split ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Для всех сторон</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Одна платформа — для потребителей и производителей
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumers */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Для потребителей</h3>
              <p className="text-sm text-muted mb-6">Identification ID позволяет потребителям:</p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Быстрый доступ к данным по ID",
                  "Описание и инструкцию по пользованию на разных языках",
                  "Проверку подлинности товара",
                  "Бесплатно — без регистрации и приложений",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:gap-2.5 transition-all">
                Найти товар <span>→</span>
              </Link>
            </div>

            {/* Manufacturers */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all relative">
              <div className="absolute top-4 right-4 text-[10px] font-semibold bg-accent text-white px-2 py-0.5 rounded">
                ДЛЯ БИЗНЕСА
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V9l6 4V9l6 4V5l6 4v12H3zM7 17h2M13 17h2M17 17h1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Для производителей</h3>
              <p className="text-sm text-muted mb-6">После регистрации на платформе производитель получает:</p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Регистрацию товара и уникальный ID для него",
                  "Верификацию производителя",
                  "Создание карточки товара",
                  "Загрузку документов и фото",
                  "Генерацию Identification ID",
                  "Генерацию QR-кода",
                  "Редактирование информации в любое время",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                Зарегистрировать товар <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Anti-Counterfeit ── */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Защита от подделок</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Anti&#8209;Counterfeit платформа
              </h2>
              <p className="text-muted mb-8 leading-relaxed">
                Identification ID — это надёжная система защиты от подделок. Уникальный код
                для каждой единицы товара позволяет мгновенно подтвердить оригинальность.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z", text: "Подтверждение оригинальности по номеру ID на товаре" },
                  { icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", text: "Уникальный код для каждой единицы товара" },
                  { icon: "M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0zM9 10h4M11 8v4", text: "Моментальная проверка перед покупкой — прямо в магазине" },
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Защита репутации бренда от контрафакта" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed pt-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fake badge mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white border border-border rounded-2xl p-8 text-center shadow-lg">
                <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-muted font-mono mb-1">IID-4F9A-2K7Q</p>
                <p className="text-lg font-semibold text-green-700 mb-1">Оригинальный товар</p>
                <p className="text-sm text-muted mb-4">Подтверждено Identification ID</p>
                <div className="text-left space-y-2 text-sm border-t border-border pt-4">
                  {[
                    ["Производитель", "ACME Corp"],
                    ["Страна", "United States"],
                    ["Дата регистрации", "2024-01-15"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted">{label}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIM System ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Для производителей</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              PIM-система управления товарами
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Identification ID — это полноценная PIM-система (Product Information Management)
              для производителей. Всё в одном месте, всегда актуально.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
                title: "Хранит все данные о товаре",
                desc: "Централизованное хранилище для спецификаций, документов, фото и медиафайлов.",
              },
              {
                icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
                title: "Генерирует QR / ID",
                desc: "Автоматическая генерация уникального Identification ID и QR-кода для каждого товара.",
              },
              {
                icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                title: "Обновляет инструкции",
                desc: "Меняйте документы и инструкции без перепечатки. Потребители всегда видят актуальную версию.",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Без бумажной документации",
                desc: "Просто укажите на товаре или упаковке Identification ID — и никаких распечатанных инструкций.",
              },
              {
                icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
                title: "Интегрируется с маркетплейсами",
                desc: "Прямая интеграция с крупнейшими торговыми площадками для синхронизации данных о товаре.",
              },
              {
                icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
                title: "Мультиязычные описания",
                desc: "Автоматический перевод описаний и инструкций — ваш товар понятен потребителям по всему миру.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Тарифы</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Pay Per Product</h2>
            <p className="text-muted max-w-xl mx-auto">
              Производители товаров при регистрации на платформе выбирают подходящий план.
              Потребители всегда используют платформу бесплатно.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "Basic",
                price: "$3",
                period: "за товар / мес",
                desc: "Для единичных товаров",
                features: ["1 товар", "Уникальный ID", "QR-код", "Карточка товара"],
                accent: false,
              },
              {
                name: "Small Business",
                price: "$29",
                period: "/ месяц",
                desc: "До 50 товаров",
                features: ["До 50 товаров", "Все функции Basic", "Загрузка документов", "Мультиязычность"],
                accent: false,
              },
              {
                name: "Medium",
                price: "$99",
                period: "/ месяц",
                desc: "До 500 товаров",
                features: ["До 500 товаров", "Все функции Small", "PIM-система", "Интеграция маркетплейсов"],
                accent: true,
              },
              {
                name: "Enterprise",
                price: "$299",
                period: "/ месяц",
                desc: "Без ограничений",
                features: ["Неограниченно товаров", "Все функции Medium", "API-доступ", "Приоритетная поддержка"],
                accent: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-md ${
                  plan.accent
                    ? "bg-accent border-accent text-white shadow-lg"
                    : "bg-white border-border"
                }`}
              >
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-white text-accent px-3 py-1 rounded-full shadow border border-blue-100">
                    ПОПУЛЯРНЫЙ
                  </div>
                )}
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${plan.accent ? "text-blue-100" : "text-muted"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <p className={`text-xs mb-1 ${plan.accent ? "text-blue-100" : "text-muted"}`}>{plan.period}</p>
                <p className={`text-sm mb-5 font-medium ${plan.accent ? "text-blue-50" : "text-muted"}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className={`w-3.5 h-3.5 shrink-0 ${plan.accent ? "text-green-300" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center text-sm font-medium py-2.5 rounded-xl transition-colors ${
                    plan.accent
                      ? "bg-white text-accent hover:bg-blue-50"
                      : "bg-accent text-white hover:bg-accent-hover"
                  }`}
                >
                  Выбрать план
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted mt-8">
            Нужен индивидуальный план?{" "}
            <a href="mailto:support@identificationid.com" className="text-accent hover:underline">
              Напишите нам
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/10 text-white px-3 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ранний доступ · Бесплатный тариф навсегда
          </div>
          <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">
            Готовы зарегистрировать свои товары?
          </h2>
          <p className="text-blue-100 text-base mb-8 leading-relaxed">
            Присоединяйтесь к производителям, которые уже используют Identification ID.
            Первые 10 товаров — бесплатно, без карты.
          </p>
          {earlySubmitted ? (
            <p className="text-white font-medium">Перенаправляем на регистрацию...</p>
          ) : (
            <form onSubmit={handleEarlyAccess} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={earlyEmail}
                onChange={(e) => setEarlyEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border border-white/30 rounded-xl px-4 py-3.5 text-sm bg-white/95 text-foreground placeholder:text-muted focus:bg-white"
              />
              <button
                type="submit"
                className="bg-white text-accent px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-50 whitespace-nowrap shadow-lg transition-colors"
              >
                Начать →
              </button>
            </form>
          )}
          <div className="flex items-center justify-center gap-4 mt-6 text-blue-100 text-xs flex-wrap">
            {["10 товаров бесплатно", "Без кредитной карты", "Отмена в любой момент"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
                  ID
                </span>
                <span>Identification ID</span>
              </Link>
              <p className="text-sm text-muted max-w-xs leading-relaxed">
                Глобальный онлайн-реестр товаров. Цифровой паспорт продукта, защита от подделок и международный каталог.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Платформа</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="text-foreground hover:text-accent transition-colors">Поиск товаров</Link></li>
                <li><Link href="/pricing" className="text-foreground hover:text-accent transition-colors">Тарифы</Link></li>
                <li><Link href="/register" className="text-foreground hover:text-accent transition-colors">Для производителей</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Компания</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-foreground hover:text-accent transition-colors">FAQ</Link></li>
                <li><Link href="/login" className="text-foreground hover:text-accent transition-colors">Войти</Link></li>
                <li>
                  <a href="mailto:support@identificationid.com" className="text-foreground hover:text-accent transition-colors">
                    Контакты
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 pt-6 border-t border-border text-xs text-muted">
            <p>© {new Date().getFullYear()} Identification ID. All rights reserved.</p>
            <p>Глобальный реестр товаров · Wikipedia + GS1 + Digital Passport</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
