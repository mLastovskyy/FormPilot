/**
 * Internationalization for FormPilot (English + Russian).
 *
 * The dictionary is a plain typed object; `en` defines the shape and `ru`
 * must match it exactly (TypeScript enforces this). Interpolated / pluralized
 * strings are expressed as functions so both locales stay in sync.
 */

export type Locale = "en" | "ru";
export const LOCALES: Locale[] = ["en", "ru"];
export const LOCALE_COOKIE = "fp-lang";
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

export function parseLocale(value: string | undefined | null): Locale | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.startsWith("ru")) return "ru";
  if (v.startsWith("en")) return "en";
  return null;
}

/** Best-effort locale from an Accept-Language header string. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(",")) {
    const lang = parseLocale(part.trim().split(";")[0]);
    if (lang) return lang;
  }
  return DEFAULT_LOCALE;
}

const en = {
  header: {
    howItWorks: "How it works",
    faq: "FAQ",
    toggleTheme: "Toggle light / dark",
    language: "Language",
  },
  footer: {
    useResponsibly: "Use responsibly.",
    body: "FormPilot is built for testing your own forms and generating sample data. Only submit to forms you own or have permission to fill.",
    rights: "A portfolio project.",
    builtWith: "Not affiliated with Google.",
    contact: "Questions? Message me",
  },
  hero: {
    badge: "Parse · Configure · Submit — no code, no spreadsheets",
    titleStart: "Fill Google Forms, ",
    titleHighlight: "exactly how you want",
    titleEnd: "",
    subtitle:
      "FormPilot parses any public Google Form, lets you design per-question answer strategies with weighted randomness, and submits realistic responses in bulk — with a live preview of the distribution.",
  },
  how: {
    title: "How it works",
    subtitle: "Four steps, start to finish.",
    steps: [
      {
        title: "Paste the link",
        body: "Drop in any public Google Form URL. We read its structure on the server so your browser doesn't hit CORS walls.",
      },
      {
        title: "Review the parse",
        body: "See every question we detected, its type and options, and confirm it matches before anything happens.",
      },
      {
        title: "Configure answers",
        body: "Per question, choose fixed or weighted-random answers and watch the projected distribution update live.",
      },
      {
        title: "Run the fill",
        body: "Pick how many responses to generate. Each one is sampled from your rules and really submitted to Google.",
      },
    ],
  },
  features: [
    {
      title: "Weighted distributions",
      body: "Give options weights and FormPilot spreads answers across submissions to match — with a live preview.",
    },
    {
      title: "Nothing to set up",
      body: "No account, no database. Your form and settings are kept in your browser's local storage.",
    },
    {
      title: "Safe by design",
      body: "The server only ever talks to Google Forms endpoints, and you confirm ownership before any run.",
    },
    {
      title: "Polished & accessible",
      body: "Light and dark themes, keyboard-friendly tooltips, and smooth motion throughout.",
    },
  ],
  faq: {
    title: "Frequently asked questions",
    subtitle: "Answers to the things people ask most.",
    contactText: "Still have a question?",
    contactCta: "Ask me on Telegram",
    items: [
      {
        q: "Is this allowed?",
        a: "FormPilot is meant for forms you own or have permission to fill — like testing your own survey or generating sample data. Don't use it to spam or skew forms you don't control.",
      },
      {
        q: "Are the responses actually submitted?",
        a: "Yes. Each generated response is really sent to Google's form endpoint, so it appears in the form's responses just like a normal submission.",
      },
      {
        q: "Why can't it read my form?",
        a: "The form must be public. If it requires sign-in or collects emails, Google blocks anonymous access — turn those off in the form's Settings → Responses.",
      },
      {
        q: "Do you store my data?",
        a: "No. There's no database and no account. Your parsed form and settings live only in your browser's local storage.",
      },
      {
        q: "Why did some submissions fail?",
        a: "Google occasionally rate-limits automated requests. FormPilot retries transient errors automatically; any that still fail show in the failed counter, and you can top them up with another run.",
      },
      {
        q: "How do weights work?",
        a: "A weight sets how often an option is chosen relative to the others. Weights of 3 and 1 mean roughly 75% and 25% across your submissions — the preview bars show the exact split.",
      },
    ],
  },
  steps: {
    link: "Link",
    review: "Review",
    configure: "Configure",
    run: "Run",
  },
  url: {
    title: "Paste a Google Form link",
    titleInfo:
      "FormPilot fetches the public form on the server, reads its structure, and shows it back to you before anything is submitted.",
    subtitle: "We'll parse the questions so you can review them next.",
    placeholder: "https://docs.google.com/forms/d/e/…/viewform",
    parse: "Parse form",
    parsing: "Parsing…",
    signIn: "Forms that require sign-in can't be filled anonymously.",
    signInInfo:
      "If a form collects emails or is restricted to an organization, Google blocks anonymous reads and submissions — FormPilot will tell you if that's the case.",
  },
  loader: {
    stages: [
      "Fetching the form from Google…",
      "Decoding its structure…",
      "Mapping questions and options…",
      "Almost there…",
    ],
  },
  review: {
    parsedForm: "Parsed form",
    questions: "Questions",
    required: "Required",
    pages: "Pages",
    openOriginal: "Open original form",
    match: "Does this match the form?",
    matchInfo:
      "If a question looks wrong or missing, go back and double-check the link — some forms use types FormPilot can't read.",
    unsupported: (n: number) =>
      `${n} question${n > 1 ? "s" : ""} can't be filled.`,
    back: "Back",
    configure: "Configure answers",
  },
  configure: {
    title: "Configure answers",
    titleInfo:
      "For each question, decide whether it's included, and how its answer is chosen for every generated submission.",
    included: (a: number, b: number) => `${a} of ${b} included`,
    needAttention: (n: number) => ` · ${n} need attention`,
    includeAll: "Include all",
    excludeAll: "Exclude all",
    back: "Back",
    reviewRun: "Review & run",
    issues: (n: number) =>
      `${n} required question${n > 1 ? "s" : ""} still need answers`,
  },
  card: {
    required: "Required",
    modeRandom: "Random",
    modeFixed: "Fixed",
    projected: "Projected distribution",
    howOften: "How often each is picked",
    selectionsPer: "Selections per submission",
    min: "min",
    max: "max",
    weight: "weight",
    enabled: (n: number) => `${n} enabled`,
    higherWeight: "Higher weight = chosen more often.",
    otherPlaceholder: "Text to send",
    fixedTextPlaceholder: "Text sent with every submission",
    leftBlank: "Left blank in every submission.",
    unsupportedNote:
      "This question type can't be auto-filled and will be skipped.",
    empty: "(empty)",
    other: "Other",
  },
  run: {
    title: "Run the fill",
    subtitle: "Submitting real responses to",
    submissions: "Submissions",
    delay: "Delay between (ms)",
    issues: (n: number) =>
      `${n} required question${n > 1 ? "s are" : " is"} missing an answer. Google may reject those submissions — go back to fix them.`,
    ack: "I own this form or have permission to submit responses to it.",
    submitting: "Submitting…",
    finished: "Finished",
    paused: "Paused",
    succeeded: "Succeeded",
    failed: "Failed",
    start: (n: number) => `Start filling ${n}`,
    stop: "Stop",
    continue: "Continue",
    pausedNote: (sent: number, total: number) =>
      `Paused at ${sent} of ${total}. Change the count or delay, or go back to reconfigure — the remaining ${Math.max(0, total - sent)} will use your current settings when you continue.`,
    runAgain: "Run again",
    newForm: "New form",
    whatSent: "What was actually sent",
    whatSentInfo:
      "The real distribution of answers across the submissions FormPilot just sent — compare it to what you configured.",
    aggregated: (n: number) =>
      `Aggregated across ${n} submission${n > 1 ? "s" : ""}.`,
    retryFailed: (n: number) => `Retry ${n} failed`,
    failures: "Why they failed",
    reason: {
      network: "Network error or timeout",
      blocked: "Sign-in required or blocked by Google",
      rateLimited: "Rate-limited by Google",
      rejected: "Rejected — check required questions",
      serverError: "Google server error",
      http: (s: number) => `Unexpected response (HTTP ${s})`,
    },
    back: "Back",
  },
  textPool: {
    placeholder: "Add a possible answer…",
    add: "Add",
    empty: "No answers yet. Add a few — one is picked at random per submission.",
  },
  dist: {
    empty: "Enable at least one option to see the projected split.",
  },
  notFound: {
    title: "This page flew off course",
    body: "The page you're looking for doesn't exist or may have moved. Let's get you back to filling forms.",
    home: "Back home",
    how: "How it works",
  },
  errorPage: {
    title: "Something went wrong",
    body: "An unexpected error occurred while loading this page. You can try again, or head back home.",
    tryAgain: "Try again",
    home: "Back home",
  },
  issues: {
    noEnabledOptions:
      "This required question has no enabled options — submissions may be rejected.",
    pickFixed: "Pick a fixed answer for this required question.",
    addAnswer: "Add at least one possible answer for this required question.",
    enterValue: "Enter a value for this required question.",
    chooseValue: "Choose a value for this required question.",
  },
  types: {
    SHORT_ANSWER: {
      label: "Short answer",
      hint: "A single line of text. Provide a pool of possible answers and one is picked at random for each submission.",
    },
    PARAGRAPH: {
      label: "Paragraph",
      hint: "A longer free-text answer. Works like short answer — one entry from your pool is used per submission.",
    },
    RADIO: {
      label: "Multiple choice",
      hint: "Exactly one option is chosen. Enable the options you allow and give each a weight to control how often it's picked.",
    },
    DROPDOWN: {
      label: "Dropdown",
      hint: "Exactly one option from a dropdown. Configure it just like multiple choice.",
    },
    CHECKBOX: {
      label: "Checkboxes",
      hint: "Several options can be selected. Set how many to pick (min–max) and weight which ones are more likely.",
    },
    LINEAR_SCALE: {
      label: "Linear scale",
      hint: "A rating on a numeric scale. Each point is an option you can weight.",
    },
    DATE: {
      label: "Date",
      hint: "A calendar date. Choose a fixed date to send with every submission.",
    },
    TIME: {
      label: "Time",
      hint: "A time value. Choose a fixed time to send with every submission.",
    },
    GRID: {
      label: "Grid",
      hint: "A grid where each row picks one column. Each row is weighted independently.",
    },
    UNSUPPORTED: {
      label: "Unsupported",
      hint: "This question type (e.g. file upload) can't be auto-filled and will be skipped.",
    },
  },
  glossary: {
    weight:
      "A relative number that controls how often an option is chosen. An option with weight 3 is picked three times as often as one with weight 1.",
    distribution:
      "Across all your submissions, answers are spread according to the weights you set. The preview bars show the expected share for each option.",
    fixedVsRandom:
      "Fixed always sends the same answer. Random picks from your enabled options using their weights, so responses vary between submissions.",
    include:
      "When off, this question is left blank in every submission. Turn it off only if the question is optional.",
    required:
      "Google marks this question as required. If you leave it blank or unconfigured, submissions may be rejected.",
    checkboxRange:
      "For each submission, a random number of options between the minimum and maximum is selected from your enabled set.",
    count:
      "How many separate responses to generate and submit. Each one is sampled independently from your settings.",
    delay:
      "A short pause between submissions. Keeping it above zero is gentler on Google and looks less automated.",
    other:
      "The 'Other' option sends free text instead of a preset choice. Type what should be sent when it's selected.",
    entryId:
      "Google's internal field id for this question. FormPilot maps your answers to it when submitting.",
  },
  errors: {
    not_google_forms:
      "Only Google Forms links are supported (docs.google.com/forms/… or forms.gle/…).",
    edit_link:
      "That's the form's edit link. Open the form, click Send, and copy the public link instead.",
    requires_login:
      "This form requires sign-in, so it can't be read or filled anonymously. In the form's Settings → Responses, turn off “Restrict to users in your organization” and set “Collect email addresses” to Do not collect, then try again.",
    not_a_form:
      "That page doesn't look like a public Google Form. Use the form's share link (the one that ends in /viewform or a forms.gle link).",
    timeout: "Timed out while loading the form. Try again.",
    network: "Could not reach Google Forms. Check the link and your connection.",
    parse_error: "Found the form but couldn't decode its structure.",
    fetch_failed: "Google returned an error while loading the form.",
    invalid_url: "That doesn't look like a valid URL.",
    empty: "Please paste a Google Form link.",
    noQuestions: "That form has no fillable questions.",
    generic: "Couldn't parse that form.",
    clientNetwork: "Network error — please try again.",
  },
};

type DeepDict = typeof en;

const ru: DeepDict = {
  header: {
    howItWorks: "Как это работает",
    faq: "Вопросы",
    toggleTheme: "Светлая / тёмная тема",
    language: "Язык",
  },
  footer: {
    useResponsibly: "Используйте ответственно.",
    body: "FormPilot создан для тестирования собственных форм и генерации демо-данных. Отправляйте ответы только в формы, которыми вы владеете или на которые есть разрешение.",
    rights: "Проект для портфолио.",
    builtWith: "Не связано с Google.",
    contact: "Вопросы? Напишите мне",
  },
  hero: {
    badge: "Разбор · Настройка · Отправка — без кода и таблиц",
    titleStart: "Заполняйте Google Формы ",
    titleHighlight: "именно так, как нужно",
    titleEnd: "",
    subtitle:
      "FormPilot разбирает любую публичную Google Форму, позволяет задать стратегию ответа для каждого вопроса со взвешенной случайностью и массово отправляет реалистичные ответы — с живым превью распределения.",
  },
  how: {
    title: "Как это работает",
    subtitle: "Четыре шага от начала до конца.",
    steps: [
      {
        title: "Вставьте ссылку",
        body: "Вставьте ссылку на любую публичную Google Форму. Мы читаем её структуру на сервере, чтобы браузер не упирался в CORS.",
      },
      {
        title: "Проверьте разбор",
        body: "Посмотрите все распознанные вопросы, их типы и варианты и подтвердите, что всё совпадает, прежде чем продолжить.",
      },
      {
        title: "Настройте ответы",
        body: "По каждому вопросу выберите фиксированный или взвешенно-случайный ответ и следите за живым превью распределения.",
      },
      {
        title: "Запустите заполнение",
        body: "Укажите, сколько ответов создать. Каждый формируется по вашим правилам и реально отправляется в Google.",
      },
    ],
  },
  features: [
    {
      title: "Взвешенные распределения",
      body: "Задайте вес вариантам — FormPilot распределит ответы между отправками в нужной пропорции, с живым превью.",
    },
    {
      title: "Ничего не нужно настраивать",
      body: "Без аккаунта и базы данных. Форма и настройки хранятся в локальном хранилище браузера.",
    },
    {
      title: "Безопасно по замыслу",
      body: "Сервер обращается только к эндпоинтам Google Forms, а перед запуском вы подтверждаете права.",
    },
    {
      title: "Аккуратно и доступно",
      body: "Светлая и тёмная темы, тултипы с поддержкой клавиатуры и плавные анимации.",
    },
  ],
  faq: {
    title: "Частые вопросы",
    subtitle: "Ответы на то, что спрашивают чаще всего.",
    contactText: "Остался вопрос?",
    contactCta: "Напишите мне в Telegram",
    items: [
      {
        q: "Это вообще законно?",
        a: "FormPilot предназначен для форм, которыми вы владеете или на заполнение которых есть разрешение — например для теста своей анкеты или генерации демо-данных. Не используйте его для спама или накрутки чужих форм.",
      },
      {
        q: "Ответы действительно отправляются?",
        a: "Да. Каждый сгенерированный ответ реально уходит на эндпоинт формы Google и попадает в её ответы, как обычная отправка.",
      },
      {
        q: "Почему форму не удаётся прочитать?",
        a: "Форма должна быть публичной. Если она требует входа или собирает email, Google блокирует анонимный доступ — отключите это в настройках формы (Настройки → Ответы).",
      },
      {
        q: "Вы храните мои данные?",
        a: "Нет. Ни базы данных, ни аккаунтов. Распарсенная форма и настройки хранятся только в локальном хранилище вашего браузера.",
      },
      {
        q: "Почему часть отправок не прошла?",
        a: "Google иногда ограничивает автоматические запросы. FormPilot сам повторяет временные ошибки; оставшиеся видны в счётчике «С ошибкой» — можно дозапустить ещё раз.",
      },
      {
        q: "Как работают веса?",
        a: "Вес задаёт, насколько часто вариант выбирается относительно других. Веса 3 и 1 дают примерно 75% и 25% по всем отправкам — полоски превью показывают точное распределение.",
      },
    ],
  },
  steps: {
    link: "Ссылка",
    review: "Проверка",
    configure: "Настройка",
    run: "Запуск",
  },
  url: {
    title: "Вставьте ссылку на Google Форму",
    titleInfo:
      "FormPilot загружает публичную форму на сервере, читает её структуру и показывает вам до того, как что-либо будет отправлено.",
    subtitle: "Мы разберём вопросы, чтобы вы могли их проверить на следующем шаге.",
    placeholder: "https://docs.google.com/forms/d/e/…/viewform",
    parse: "Разобрать форму",
    parsing: "Разбираем…",
    signIn: "Формы, требующие входа, нельзя заполнить анонимно.",
    signInInfo:
      "Если форма собирает email или ограничена организацией, Google блокирует анонимное чтение и отправку — FormPilot сообщит об этом.",
  },
  loader: {
    stages: [
      "Загружаем форму из Google…",
      "Расшифровываем её структуру…",
      "Сопоставляем вопросы и варианты…",
      "Почти готово…",
    ],
  },
  review: {
    parsedForm: "Разобранная форма",
    questions: "Вопросов",
    required: "Обязательных",
    pages: "Страниц",
    openOriginal: "Открыть оригинал формы",
    match: "Всё совпадает с формой?",
    matchInfo:
      "Если вопрос выглядит неверно или отсутствует, вернитесь и перепроверьте ссылку — некоторые формы используют типы, которые FormPilot не читает.",
    unsupported: (n: number) => `${n} вопрос(ов) нельзя заполнить.`,
    back: "Назад",
    configure: "Настроить ответы",
  },
  configure: {
    title: "Настройка ответов",
    titleInfo:
      "Для каждого вопроса решите, включён ли он и как выбирается его ответ для каждой генерируемой отправки.",
    included: (a: number, b: number) => `Включено ${a} из ${b}`,
    needAttention: (n: number) => ` · ${n} требуют внимания`,
    includeAll: "Включить все",
    excludeAll: "Выключить все",
    back: "Назад",
    reviewRun: "Проверить и запустить",
    issues: (n: number) => `Ещё ${n} обязательн. вопрос(ов) без ответа`,
  },
  card: {
    required: "Обязательный",
    modeRandom: "Случайно",
    modeFixed: "Фиксированно",
    projected: "Ожидаемое распределение",
    howOften: "Как часто выбирается каждый",
    selectionsPer: "Выборов на отправку",
    min: "мин",
    max: "макс",
    weight: "вес",
    enabled: (n: number) => `включено: ${n}`,
    higherWeight: "Больше вес = выбирается чаще.",
    otherPlaceholder: "Текст для отправки",
    fixedTextPlaceholder: "Текст, отправляемый в каждой отправке",
    leftBlank: "Остаётся пустым в каждой отправке.",
    unsupportedNote: "Этот тип вопроса нельзя заполнить автоматически — он будет пропущен.",
    empty: "(пусто)",
    other: "Другое",
  },
  run: {
    title: "Запуск заполнения",
    subtitle: "Отправляем реальные ответы в",
    submissions: "Количество отправок",
    delay: "Пауза между (мс)",
    issues: (n: number) =>
      `${n} обязательн. вопрос(ов) без ответа. Google может отклонить такие отправки — вернитесь и исправьте.`,
    ack: "Я владею этой формой или имею разрешение отправлять в неё ответы.",
    submitting: "Отправляем…",
    finished: "Готово",
    paused: "Приостановлено",
    succeeded: "Успешно",
    failed: "С ошибкой",
    start: (n: number) => `Отправить: ${n}`,
    stop: "Стоп",
    continue: "Продолжить",
    pausedNote: (sent: number, total: number) =>
      `Приостановлено на ${sent} из ${total}. Измените количество или задержку либо вернитесь к настройке — оставшиеся ${Math.max(0, total - sent)} пойдут по текущим настройкам, когда вы продолжите.`,
    runAgain: "Запустить снова",
    newForm: "Новая форма",
    whatSent: "Что реально отправлено",
    whatSentInfo:
      "Реальное распределение ответов по только что отправленным формам — сравните с тем, что вы настроили.",
    aggregated: (n: number) => `Агрегировано по ${n} отправке(ам).`,
    retryFailed: (n: number) => `Повторить неуспешные (${n})`,
    failures: "Почему не прошли",
    reason: {
      network: "Ошибка сети или таймаут",
      blocked: "Требуется вход или блокировка Google",
      rateLimited: "Ограничение частоты Google",
      rejected: "Отклонено — проверьте обязательные вопросы",
      serverError: "Ошибка сервера Google",
      http: (s: number) => `Неожиданный ответ (HTTP ${s})`,
    },
    back: "Назад",
  },
  textPool: {
    placeholder: "Добавьте возможный ответ…",
    add: "Добавить",
    empty: "Пока нет ответов. Добавьте несколько — один выбирается случайно на каждую отправку.",
  },
  dist: {
    empty: "Включите хотя бы один вариант, чтобы увидеть распределение.",
  },
  notFound: {
    title: "Эта страница сбилась с курса",
    body: "Страница, которую вы ищете, не существует или была перемещена. Давайте вернёмся к заполнению форм.",
    home: "На главную",
    how: "Как это работает",
  },
  errorPage: {
    title: "Что-то пошло не так",
    body: "При загрузке этой страницы произошла непредвиденная ошибка. Попробуйте снова или вернитесь на главную.",
    tryAgain: "Попробовать снова",
    home: "На главную",
  },
  issues: {
    noEnabledOptions:
      "У этого обязательного вопроса нет включённых вариантов — отправки могут быть отклонены.",
    pickFixed: "Выберите фиксированный ответ для этого обязательного вопроса.",
    addAnswer: "Добавьте хотя бы один возможный ответ для этого обязательного вопроса.",
    enterValue: "Введите значение для этого обязательного вопроса.",
    chooseValue: "Выберите значение для этого обязательного вопроса.",
  },
  types: {
    SHORT_ANSWER: {
      label: "Короткий ответ",
      hint: "Одна строка текста. Задайте пул возможных ответов — один выбирается случайно на каждую отправку.",
    },
    PARAGRAPH: {
      label: "Абзац",
      hint: "Длинный свободный текст. Работает как короткий ответ — один вариант из пула на каждую отправку.",
    },
    RADIO: {
      label: "Один из списка",
      hint: "Выбирается ровно один вариант. Включите допустимые варианты и задайте вес, чтобы управлять частотой выбора.",
    },
    DROPDOWN: {
      label: "Выпадающий список",
      hint: "Ровно один вариант из списка. Настраивается как «Один из списка».",
    },
    CHECKBOX: {
      label: "Несколько из списка",
      hint: "Можно выбрать несколько вариантов. Задайте сколько выбирать (мин–макс) и веса для более вероятных.",
    },
    LINEAR_SCALE: {
      label: "Шкала",
      hint: "Оценка по числовой шкале. Каждое значение — вариант, которому можно задать вес.",
    },
    DATE: {
      label: "Дата",
      hint: "Календарная дата. Выберите фиксированную дату для каждой отправки.",
    },
    TIME: {
      label: "Время",
      hint: "Значение времени. Выберите фиксированное время для каждой отправки.",
    },
    GRID: {
      label: "Сетка",
      hint: "Сетка, где каждая строка выбирает один столбец. Каждая строка взвешивается отдельно.",
    },
    UNSUPPORTED: {
      label: "Не поддерживается",
      hint: "Этот тип вопроса (например, загрузка файла) нельзя заполнить автоматически — он будет пропущен.",
    },
  },
  glossary: {
    weight:
      "Относительное число, задающее частоту выбора варианта. Вариант с весом 3 выбирается в три раза чаще, чем с весом 1.",
    distribution:
      "По всем отправкам ответы распределяются согласно заданным весам. Полоски превью показывают ожидаемую долю каждого варианта.",
    fixedVsRandom:
      "«Фиксированно» всегда отправляет один и тот же ответ. «Случайно» выбирает из включённых вариантов по весам, поэтому ответы различаются.",
    include:
      "Когда выключено, вопрос остаётся пустым в каждой отправке. Выключайте только для необязательных вопросов.",
    required:
      "Google отметил вопрос как обязательный. Если оставить пустым или ненастроенным, отправки могут быть отклонены.",
    checkboxRange:
      "Для каждой отправки выбирается случайное число вариантов между минимумом и максимумом из включённого набора.",
    count:
      "Сколько отдельных ответов создать и отправить. Каждый формируется независимо по вашим настройкам.",
    delay:
      "Небольшая пауза между отправками. Значение больше нуля мягче для Google и выглядит менее автоматизированно.",
    other:
      "Вариант «Другое» отправляет свободный текст вместо готового выбора. Укажите, что отправлять при его выборе.",
    entryId:
      "Внутренний id поля Google для этого вопроса. FormPilot сопоставляет ваши ответы с ним при отправке.",
  },
  errors: {
    not_google_forms:
      "Поддерживаются только ссылки Google Forms (docs.google.com/forms/… или forms.gle/…).",
    edit_link:
      "Это ссылка на редактирование формы. Откройте форму, нажмите «Отправить» и скопируйте публичную ссылку.",
    requires_login:
      "Форма требует входа, поэтому её нельзя прочитать или заполнить анонимно. В настройках формы → «Ответы» отключите «Ограничить пользователями организации» и установите «Собирать адреса электронной почты» в «Не собирать», затем повторите.",
    not_a_form:
      "Эта страница не похожа на публичную Google Форму. Используйте ссылку «Поделиться» (оканчивается на /viewform или ссылка forms.gle).",
    timeout: "Истекло время загрузки формы. Попробуйте снова.",
    network: "Не удалось связаться с Google Forms. Проверьте ссылку и соединение.",
    parse_error: "Форма найдена, но не удалось расшифровать её структуру.",
    fetch_failed: "Google вернул ошибку при загрузке формы.",
    invalid_url: "Это не похоже на корректный URL.",
    empty: "Вставьте ссылку на Google Форму.",
    noQuestions: "В этой форме нет заполняемых вопросов.",
    generic: "Не удалось разобрать эту форму.",
    clientNetwork: "Ошибка сети — попробуйте снова.",
  },
};

export const DICTS: Record<Locale, DeepDict> = { en, ru };

export type Dict = DeepDict;

export function getDict(locale: Locale): Dict {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}
