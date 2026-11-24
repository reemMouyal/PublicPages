window.core = [
  {
    id: "collections", title: "מילונים, קבוצות וסדר הכנסה", group: "יסודות השפה",
    intro: "בשירות שסופר מילים, המילון של Python ממלא את התפקיד של Dictionary. גישה באמצעות סוגריים מרובעים למפתח חסר מעלה KeyError. הפעולה get מאפשרת לקרוא ערך ולספק ברירת מחדל בלי לשנות את המילון.",
    cs: `var counts = new Dictionary<string, int>();
foreach (var word in words)
    counts[word] = counts.GetValueOrDefault(word) + 1;`,
    py: `words = ["api", "db", "api"]
counts = {}
for word in words:
    counts[word] = counts.get(word, 0) + 1
print(list(counts.items()))  # [('api', 2), ('db', 1)]`,
    insight: "מילון שומר על סדר ההכנסה של המפתחות, ועדכון ערך של מפתח קיים משאיר אותו במקומו. set מתאים לבדיקת חברות כאשר אין חשיבות לסדר. בשניהם המפתחות או האיברים צריכים להיות hashable.",
    task: "כתוב word_counts שמקבלת רצף של מילים, מאחדת רישיות בעזרת casefold, ומחזירה מילון ספירות לפי סדר ההופעה הראשונה של כל מילה. המילים כבר מפוצלות.",
    starter: `def word_counts(words):
    pass`,
    solution: `def word_counts(words):
    counts = {}
    for word in words:
        key = word.casefold()
        counts[key] = counts.get(key, 0) + 1
    return counts`,
    tests: [`assert word_counts([]) == {}, "Empty input should produce an empty dict"`, `assert list(word_counts(["b", "A", "B"]).items()) == [("b", 2), ("a", 1)], "Preserve first appearance and combine case variants"`, `assert word_counts(iter(["Straße", "STRASSE"])) == {"strasse": 2}, "Use casefold and accept iterators"`],
    hint: "בכל איטרציה נרמל את המילה, קרא את הספירה הנוכחית עם get ועדכן את אותו מפתח."
  },
  {
    id: "unpacking", title: "לולאות ופירוק ערכים", group: "יסודות השפה",
    intro: "כאשר מעניינים אותך גם האיבר וגם המיקום שלו, enumerate מחזיר בכל צעד זוג. Python מפרקת את הזוג ישירות לשני שמות בכותרת הלולאה. זה דומה ל־deconstruction ב־C#.",
    cs: `foreach (var (name, i) in names.Select((n, i) => (n, i)))
    Console.WriteLine($"{i + 1}. {name}");`,
    py: `names = ["api", "worker"]
for number, name in enumerate(names, start=1):
    print(f"{number}. {name}")`,
    insight: "enumerate עובד גם על איטרטור שאין לו אורך או גישה לפי אינדקס. continue מאפשר לדלג על פלט ועדיין לשמור את מספר השורה המקורית. אפשר לפרק זוגות באופן דומה בעת מעבר על dict.items().",
    task: "כתוב slow_rows שמקבלת מדידות זמן בסדר הגעתן וסף. החזר רשימה של זוגות (מספר שורה, זמן) לכל מדידה שגדולה מהסף או שווה לו. מספור השורות מתחיל ב־1.",
    starter: `def slow_rows(samples, threshold):
    pass`,
    solution: `def slow_rows(samples, threshold):
    result = []
    for row, elapsed in enumerate(samples, start=1):
        if elapsed >= threshold:
            result.append((row, elapsed))
    return result`,
    tests: [`assert slow_rows([3, 9, 8], 8) == [(2, 9), (3, 8)], "Use original 1-based row numbers and include the threshold"`, `assert slow_rows(iter([1, 2]), 3) == [], "Handle one-pass input and no matches"`],
    hint: "העבר start=1 ל־enumerate לפני בדיקת הסף."
  },
  {
    id: "defaults", title: "ברירות מחדל וארגומנטים בשם", group: "יסודות השפה",
    intro: "פרמטר אופציונלי נראה מוכר למפתח C#, אבל Python מחשבת את ביטוי ברירת המחדל פעם אחת בזמן הגדרת הפונקציה. אם תכתוב items=[] ותשנה את הרשימה, הקריאה הבאה תראה את אותו אובייקט.",
    cs: `List<string> Add(string item, List<string>? items = null) {
    items ??= new();
    items.Add(item);
    return items;
}`,
    py: `def add(item, *, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add("api"))
print(add("db"))  # ['db']`,
    insight: "הכוכבית בחתימה הופכת את הפרמטרים שאחריה ל־keyword-only. הבדיקה is None מבחינה בין פרמטר חסר לבין רשימה ריקה שהקורא העביר. בדיקת if not items תתייחס לשני המצבים כאילו הם זהים.",
    task: "ממש record שמוסיפה שם אירוע לרשימה ומחזירה אותה. אם הקורא מעביר history בשם, עדכן את הרשימה המקורית גם כשהיא ריקה. לכל קריאה בלי history צריכה להיות רשימה חדשה.",
    starter: `def record(event, *, history=None):
    pass`,
    solution: `def record(event, *, history=None):
    if history is None:
        history = []
    history.append(event)
    return history`,
    tests: [`assert record("a") == ["a"] and record("b") == ["b"], "Default calls must be independent"`, `given = []
assert record("x", history=given) is given and given == ["x"], "Reuse even an empty caller-owned list"`, `import inspect
assert inspect.signature(record).parameters["history"].kind is inspect.Parameter.KEYWORD_ONLY, "history must be keyword-only"`],
    hint: "צור רשימה רק בענף שבו history is None."
  },
  {
    id: "comprehensions", title: "מ־LINQ ל־comprehensions", group: "אוספים ופונקציות",
    intro: "ב־LINQ אתה מסנן עם Where וממפה עם Select. ב־list comprehension מתחילים דווקא עם ערך הפלט, ממשיכים במקור הנתונים ומסיימים בתנאי. הרשימה נבנית מיד, בדומה ל־ToList().",
    cs: `var upper = services.Where(s => s.Enabled)
    .Select(s => s.Name.ToUpperInvariant()).ToList();`,
    py: `services = [("api", True), ("batch", False)]
upper = [name.upper() for name, enabled in services if enabled]
print(upper)  # ['API']`,
    insight: "סוגריים מסולסלים סביב ביטוי יוצרים set comprehension, והצורה key: value יוצרת מילון. אם שני איברים יוצרים מפתח זהה, הערך האחרון נשמר. לולאה מפורשת תתאים כשפעולה דורשת כמה שלבים עם שמות ביניים.",
    task: "כתוב healthy_names שמקבלת זוגות (שם שירות, קוד HTTP). החזר רשימת שמות באותיות קטנות עבור קודים בטווח 200–299 כולל. שמור על סדר המקור ועל כפילויות.",
    starter: `def healthy_names(responses):
    pass`,
    solution: `def healthy_names(responses):
    return [name.lower() for name, code in responses if 200 <= code < 300]`,
    tests: [`assert healthy_names([("A", 199), ("API", 200), ("API", 299), ("Z", 300)]) == ["api", "api"], "Keep successful codes, duplicates, and order"`, `assert healthy_names(iter([])) == [], "Return an empty list when the input is empty"`],
    hint: "הביטוי הראשון הוא name.lower(). התנאי בסוף יכול להשתמש בהשוואה משורשרת."
  },
  {
    id: "closures", title: "Lambda ופונקציות שסוגרות על משתנה", group: "אוספים ופונקציות",
    intro: "אפשר להעביר פונקציה כערך בדומה ל־Func. פונקציה פנימית יכולה להשתמש בשמות מהפונקציה החיצונית גם אחרי שהקריאה החיצונית הסתיימה. כך אפשר למשל לבנות בדיקת סף ולשמור אותה להפעלה מאוחרת.",
    cs: `Func<int, bool> Above(int threshold) =>
    value => value > threshold;`,
    py: `def above(threshold):
    return lambda value: value > threshold

is_slow = above(100)
print(is_slow(120))  # True`,
    insight: "פונקציות שנוצרות באותה לולאת for עלולות להתייחס לאותו משתנה לולאה ולראות כולן את ערכו האחרון. קריאה לפונקציית יצרן עבור כל ערך יוצרת מסגרת נפרדת. אפשרות נוספת היא לקבע ערך כברירת מחדל ב־lambda.",
    task: "כתוב make_checks שמקבלת אוסף ספים ומחזירה רשימת פונקציות לפי הסדר. הפונקציה במקום i תחזיר אמת אם ורק אם הערך שקיבלה גדול ממש מהסף המתאים.",
    starter: `def make_checks(limits):
    pass`,
    solution: `def make_checks(limits):
    def above(limit):
        return lambda value: value > limit
    return [above(limit) for limit in limits]`,
    tests: [`checks = make_checks([2, 10, 5])
assert [fn(6) for fn in checks] == [True, False, True], "Each function must keep its own threshold"`, `assert make_checks([3])[0](3) is False and make_checks([]) == [], "Compare strictly and handle empty input"`],
    hint: "בגרסת ברירת המחדל אפשר לכתוב lambda value, limit=limit: ... ולהשלים את ההשוואה."
  },
  {
    id: "generators", title: "Generators וצריכה עצלה", group: "אוספים ופונקציות",
    intro: "yield דומה ל־yield return. קריאה לפונקציית generator יוצרת אובייקט שמתקדם לפי דרישה. בכל בקשת ערך הוא ממשיך אחרי נקודת ה־yield הקודמת, ולכן אפשר לעבד זרם מדידות בלי לצבור אותו בזיכרון.",
    cs: `IEnumerable<int> Positive(IEnumerable<int> items) {
    foreach (var x in items)
        if (x > 0) yield return x;
}`,
    py: `def positive(items):
    for x in items:
        if x > 0:
            yield x

stream = positive([-1, 2, 4])
print(next(stream), list(stream))  # 2 [4]`,
    insight: "אובייקט generator הוא איטרטור חד־פעמי. מעבר שני על אותו אובייקט אחרי שמוצה יהיה ריק. להפעלה חוזרת על מקור שניתן לקרוא שוב, קרא לפונקציית ה־generator מחדש.",
    task: "כתוב batches שמקבלת איטרטור וגודל חיובי ומניבה רשימות בגודל זה. אם נותרו איברים, הנב גם קבוצה חלקית אחרונה. עצור לקריאת הצרכן אחרי כל קבוצה, בלי לקרוא מראש את כל המקור. בגודל לא חיובי העלה ValueError בעת הצריכה.",
    starter: `def batches(items, size):
    pass`,
    solution: `def batches(items, size):
    if size <= 0:
        raise ValueError("size must be positive")
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch`,
    tests: [`assert list(batches(iter(range(5)), 2)) == [[0, 1], [2, 3], [4]], "Keep the partial final batch"`, `assert list(batches([], 1)) == [], "An empty source yields no batches"`, `def guarded():
    yield 1
    yield 2
    raise AssertionError("Read beyond the requested batch")
assert next(batches(guarded(), 2)) == [1, 2], "Yield as soon as a batch is complete"`, `try:
    list(batches([], 0))
except ValueError:
    pass
else:
    raise AssertionError("Reject a size of zero with ValueError")`],
    hint: "אחרי yield שמור את הקבוצה הבאה ברשימה חדשה. clear על אותה רשימה ישנה גם את הקבוצה שכבר מסרת לצרכן."
  },
  {
    id: "dataclasses", title: "מ־record ל־dataclass", group: "מודלים וטיפוסים",
    intro: "הדקורטור dataclass מייצר פעולות נפוצות כמו אתחול, תצוגה והשוואת ערכי שדות. הגדרת frozen=True מונעת השמה רגילה לשדות אחרי האתחול. היא שימושית במודלי ערך כמו כתובת של שירות.",
    cs: `public record Endpoint(string Host, int Port = 443);
var dev = new Endpoint("api");
var local = dev with { Port = 8080 };`,
    py: `from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Endpoint:
    host: str
    port: int = 443

dev = Endpoint("api")
print(replace(dev, port=8080))`,
    insight: "frozen מגביל השמה לשדה, אך אובייקט בר־שינוי שנמצא בתוך השדה עדיין יכול להשתנות. לשדה רשימה שאמור להיות נפרד בכל מופע משתמשים ב־field(default_factory=list). לנתוני ערך קבועים אפשר לבחור tuple.",
    task: "הגדר dataclass קפואה בשם Window עם שדות name ו־seconds, כשהערך ההתחלתי של seconds הוא 60. כתוב doubled שמקבלת חלון ומחזירה חלון חדש באותו שם עם משך כפול.",
    starter: `from dataclasses import dataclass, replace

# Define Window here.

def doubled(window):
    pass`,
    solution: `from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Window:
    name: str
    seconds: int = 60

def doubled(window):
    return replace(window, seconds=window.seconds * 2)`,
    tests: [`from dataclasses import is_dataclass
assert is_dataclass(Window) and Window.__dataclass_params__.frozen, "Window should be a frozen dataclass"`, `w = Window("api")
assert w.seconds == 60 and doubled(w) == Window("api", 120) and w.seconds == 60, "Use the default and keep the original instance unchanged"`, `assert doubled(Window("db", 7)) == Window("db", 14), "Double the supplied duration"`],
    hint: "העבר ל־replace את האובייקט הקיים ואת seconds כארגומנט בשם."
  },
  {
    id: "protocol", title: "Protocol והזרקת תלויות", group: "מודלים וטיפוסים",
    intro: "ב־C# ספק תלות מצהיר בדרך כלל שהוא מממש interface. עם Protocol, בודק טיפוסים יכול לזהות התאמה מבנית לפי המתודות והחתימות. הקריאה עצמה משתמשת במתודה של האובייקט שסיפקת.",
    cs: `interface IClock { int Now(); }
int Deadline(IClock clock, int ttl) => clock.Now() + ttl;`,
    py: `from typing import Protocol

class Clock(Protocol):
    def now(self) -> int: ...

def deadline(clock: Clock, ttl: int) -> int:
    return clock.now() + ttl`,
    insight: "אפשר להעביר fake בבדיקה בלי מכולת DI ובלי ירושה מפורשת. הערות טיפוס מסייעות ל־mypy או ל־Pyright. מנגנון הקריאה הרגיל של Python אינו בודק אוטומטית שהארגומנטים תואמים להערות.",
    task: "כתוב Protocol בשם Reader עם read(key: str) -> str | None, ופונקציה get_name(reader: Reader, key: str) -> str. קרא פעם אחת לפי המפתח. אם התוצאה None החזר 'unknown'. מחרוזת ריקה היא ערך תקין.",
    starter: `from typing import Protocol

class Reader(Protocol):
    pass

def get_name(reader: Reader, key: str) -> str:
    pass`,
    solution: `from typing import Protocol

class Reader(Protocol):
    def read(self, key: str) -> str | None: ...

def get_name(reader: Reader, key: str) -> str:
    value = reader.read(key)
    return "unknown" if value is None else value`,
    tests: [`from typing import Protocol
assert Protocol in Reader.__bases__ and callable(getattr(Reader, "read", None)), "Declare the read method on a Protocol"`, `class Fake:
    def __init__(self):
        self.calls = []
    def read(self, key):
        self.calls.append(key)
        return {"a": "api", "b": ""}.get(key)
fake = Fake()
assert [get_name(fake, k) for k in ("a", "b", "c")] == ["api", "", "unknown"], "Distinguish an empty name from a missing value"
assert fake.calls == ["a", "b", "c"], "Read each key exactly once"`],
    hint: "ה־fake אינו צריך לרשת מ־Reader. שמור את ערך הקריאה במשתנה ובדוק במפורש value is None."
  }
];
