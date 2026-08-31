export type IsraelSeedProduct = {
  title: string
  handle: string
  category: string
  description: string
  priceIls: number
}

export type IsraelSeedSeller = {
  name: string
  email: string
  first_name: string
  last_name: string
  city: string
  address_1: string
  description: string
}

export const ISRAEL_COUNTRY = "il"
export const ISRAEL_CURRENCY = "ils"
export const ISRAEL_PRIMARY_SELLER_EMAIL = "pack@tradnest.il"

export const israelSellers: IsraelSeedSeller[] = [
  {
    name: "מחסני ברק",
    email: "pack@tradnest.il",
    first_name: "יוסי",
    last_name: "ברק",
    city: "פתח תקווה",
    address_1: "המלאכה 18",
    description: "ספק סיטונאי לאריזות קרטון, משטחים וציוד מחסן לכל הארץ.",
  },
  {
    name: "שדות הגליל",
    email: "galil@tradnest.il",
    first_name: "נועה",
    last_name: "לוי",
    city: "עפולה",
    address_1: "העמק 7",
    description: "תוצרת חקלאית סיטונאית: ירקות, פירות יבשים וקטניות למטבחים מוסדיים.",
  },
  {
    name: "פלדה וברזל דרום",
    email: "steel@tradnest.il",
    first_name: "דוד",
    last_name: "מזרחי",
    city: "אשדוד",
    address_1: "הנמל 4",
    description: "חומרי בניין ומתכת: ברזל בניין, רשתות וברגים בכמויות משטחים.",
  },
  {
    name: "נייר ומשרד תל אביב",
    email: "office@tradnest.il",
    first_name: "מיכל",
    last_name: "כהן",
    city: "תל אביב",
    address_1: "הרצל 92",
    description: "נייר, טונר וציוד משרדי למשרדים, רשתות ומוסדות.",
  },
  {
    name: "כימיה נקייה",
    email: "clean@tradnest.il",
    first_name: "אמיר",
    last_name: "חדד",
    city: "חיפה",
    address_1: "העצמאות 55",
    description: "חומרי ניקוי תעשייתיים, חומרי חיטוי וציוד לניקיון מוסדי.",
  },
]

export const israelCategories = [
  { name: "אריזות", handle: "packaging" },
  { name: "מזון סיטונאי", handle: "food" },
  { name: "חומרי בניין", handle: "building" },
  { name: "ציוד משרדי", handle: "office" },
  { name: "ניקיון תעשייתי", handle: "cleaning" },
] as const

export const israelProducts: IsraelSeedProduct[] = [
  {
    title: "קרטונים גליים דופן כפולה — חבילת 100",
    handle: "corrugated-boxes-100",
    category: "אריזות",
    description: "קרטוני משלוח 40×30×30 ס״מ, חוזק גבוה למשטחים. מינימום הזמנה חבילה.",
    priceIls: 189,
  },
  {
    title: "משטחי עץ אירו 120×80",
    handle: "euro-pallets",
    category: "אריזות",
    description: "משטחי עץ משומשים במצב טוב, מתאימים למחסן ולמשאיות. מחיר ליחידה במשטח מלא.",
    priceIls: 42,
  },
  {
    title: "סרט הדבקה שקוף 48 מ״מ — ארגז 36",
    handle: "packing-tape-36",
    category: "אריזות",
    description: "סרט אריזה תעשייתי, גליל 66 מטר. ארגז סיטונאי של 36 יחידות.",
    priceIls: 96,
  },
  {
    title: "ניילון נצמד למשטחים — גליל 20 ק״ג",
    handle: "stretch-film-20kg",
    category: "אריזות",
    description: "סרט מתיחה ידני לאריזת משטחים במחסן. מתאים לעומס כבד.",
    priceIls: 118,
  },
  {
    title: "ניילון בועות — גליל 50 מטר",
    handle: "bubble-wrap-50m",
    category: "אריזות",
    description: "הגנה למשלוחי ציוד שביר. גליל סיטונאי למחסן אריזה.",
    priceIls: 74,
  },
  {
    title: "עגבניות שרי — קרטון 5 ק״ג",
    handle: "cherry-tomatoes-5kg",
    category: "מזון סיטונאי",
    description: "תוצרת ישראל, אריזה למוסדות ומסעדות. אספקה שבועית לצפון ולמרכז.",
    priceIls: 38,
  },
  {
    title: "חומוס יבש — שק 25 ק״ג",
    handle: "dry-chickpeas-25kg",
    category: "מזון סיטונאי",
    description: "קטניות לבישול מוסדי. שקים אטומים, מתאים למטבחים גדולים.",
    priceIls: 124,
  },
  {
    title: "שמן זית כתית מעולה — מיכל 5 ליטר",
    handle: "olive-oil-5l",
    category: "מזון סיטונאי",
    description: "שמן זית ישראלי לבישול מוסדי. מיכל פלסטיק עם פקק מזיגה.",
    priceIls: 98,
  },
  {
    title: "אורז עגול — שק 25 ק״ג",
    handle: "round-rice-25kg",
    category: "מזון סיטונאי",
    description: "אורז לבישול מוסדי ומסעדות. שק תעשייתי אטום.",
    priceIls: 86,
  },
  {
    title: "אפונה קפואה — קרטון 10 ק״ג",
    handle: "frozen-peas-10kg",
    category: "מזון סיטונאי",
    description: "ירק קפוא למטבחים מוסדיים. שמירה בשרשרת קור.",
    priceIls: 52,
  },
  {
    title: "ברזל בניין 12 מ״מ — צרור 1 טון",
    handle: "rebar-12mm-ton",
    category: "חומרי בניין",
    description: "מוטות ברזל מצולע לפי תקן. איסוף ממחסן אשדוד או משלוח אתר.",
    priceIls: 2850,
  },
  {
    title: "רשת ברזל 150×150 — גליל",
    handle: "welded-mesh-roll",
    category: "חומרי בניין",
    description: "רשת ריתוך לעבודות בטון וגדרות. גליל סטנדרטי לאתר בנייה.",
    priceIls: 410,
  },
  {
    title: "ברגי גבס 3.5×25 — קופסה 1000",
    handle: "drywall-screws-1000",
    category: "חומרי בניין",
    description: "ברגי גבס שחורים, ראש שקוע. אריזה סיטונאית לקבלנים.",
    priceIls: 54,
  },
  {
    title: "מלט פורטלנד — שק 50 ק״ג",
    handle: "portland-cement-50kg",
    category: "חומרי בניין",
    description: "מלט לאתרי בנייה. איסוף ממחסן או משלוח לאתר.",
    priceIls: 28,
  },
  {
    title: "בלוקי בטון — משטח 100",
    handle: "concrete-blocks-100",
    category: "חומרי בניין",
    description: "בלוקים סטנדרטיים לקירות. מכירה במשטח מלא.",
    priceIls: 620,
  },
  {
    title: "נייר A4 80 גרם — חבילת 5 רים",
    handle: "a4-paper-5ream",
    category: "ציוד משרדי",
    description: "נייר לבן למדפסות לייזר והזרקה. חבילת סיטונאות למשרד.",
    priceIls: 89,
  },
  {
    title: "טונר תואם מדפסת לייזר — מארז 4",
    handle: "laser-toner-4pack",
    category: "ציוד משרדי",
    description: "מארז טונר תואם נפוץ למשרדים. בדיקת התאמה לפי דגם לפני הזמנה.",
    priceIls: 276,
  },
  {
    title: "עטים כדוריים כחול — קרטון 50",
    handle: "ballpoint-pens-50",
    category: "ציוד משרדי",
    description: "עטי כתיבה למשרד ולמוסדות חינוך. קרטון סיטונאי.",
    priceIls: 32,
  },
  {
    title: "קרטוני ארכיון — חבילת 25",
    handle: "archive-boxes-25",
    category: "ציוד משרדי",
    description: "קופסאות קרטון לתיעוד משרדי. חבילת סיטונאות.",
    priceIls: 64,
  },
  {
    title: "טושי מחיקה ללוח — מארז 48",
    handle: "whiteboard-markers-48",
    category: "ציוד משרדי",
    description: "טושים לחדרי ישיבות ולהדרכות. מארז מעורב צבעים.",
    priceIls: 79,
  },
  {
    title: "חומר ניקוי רצפות תעשייתי — מיכל 10 ליטר",
    handle: "floor-cleaner-10l",
    category: "ניקיון תעשייתי",
    description: "תרכיז לניקוי אולמות ומחסנים. מתאים למכונות שטיפה.",
    priceIls: 67,
  },
  {
    title: "מגבוני חיטוי משטחים — דלי 300",
    handle: "disinfectant-wipes-300",
    category: "ניקיון תעשייתי",
    description: "מגבונים לחיטוי משטחי עבודה במטבח מוסדי ובמעבדה.",
    priceIls: 48,
  },
  {
    title: "כפפות ניטריל L — קרטון 10 קופסאות",
    handle: "nitrile-gloves-l-carton",
    category: "ניקיון תעשייתי",
    description: "כפפות חד־פעמיות ללא אבקה. קרטון סיטונאי למוסדות.",
    priceIls: 155,
  },
  {
    title: "שקי אשפה תעשייתיים — גליל 200",
    handle: "trash-bags-200",
    category: "ניקיון תעשייתי",
    description: "שקי ניילון עבים לפחים גדולים במחסן ובמפעל.",
    priceIls: 91,
  },
  {
    title: "אקונומיקה תעשייתית — מיכל 20 ליטר",
    handle: "industrial-bleach-20l",
    category: "ניקיון תעשייתי",
    description: "תרכיז חיטוי למשטחים ולחדרי שירות. מיכל גדול למוסדות.",
    priceIls: 58,
  },
]
