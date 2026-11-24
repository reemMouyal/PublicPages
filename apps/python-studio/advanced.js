window.advanced = [
  {
    id: "adv1", title: "דקורטורים", group: "פונקציות מתקדמות",
    intro: "ב־C# כבר עטפת פעולה ב־delegate כדי להוסיף לוגים או מדידה. בפייתון פונקציה יכולה לקבל פונקציה ולהחזיר עטיפה חדשה. הכתיב ‎@trace‎ מעל הגדרה מבצע את ההשמה ‎fetch = trace(fetch)‎ ברגע שההגדרה מתבצעת.",
    cs: `Func<int, int> Trace(Func<int, int> next)
{
    return value => {
        Console.WriteLine(value);
        return next(value);
    };
}`,
    py: `from functools import wraps

def trace(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print(fn.__name__)
        return fn(*args, **kwargs)
    return wrapper

@trace
def square(n):
    return n * n

print(square(3))  # square, then 9`,
    insight: "הדקורטור מופעל פעם אחת בזמן ההגדרה. הקוד בתוך wrapper רץ בכל קריאה. כוכבית אחת אוספת ארגומנטים לפי מיקום, ושתי כוכביות אוספות ארגומנטים לפי שם. בזמן הקריאה ל־fn הן פורסות אותם בחזרה. wraps משמר בין היתר את שם הפונקציה ואת התיעוד שלה.",
    task: "ממש counted שמוסיף לפונקציה שדה calls, המתחיל באפס. בכל ניסיון קריאה הגדל אותו באחת, גם אם נזרקת חריגה. שמור את שם הפונקציה, את הערך המוחזר ואת התמיכה בארגומנטים לפי שם. לכל פונקציה מעוטרת יהיה מונה משלה.",
    starter: `from functools import wraps

def counted(fn):
    # Build and return the wrapper
    pass`,
    solution: `from functools import wraps

def counted(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        wrapper.calls += 1
        return fn(*args, **kwargs)
    wrapper.calls = 0
    return wrapper`,
    tests: [
      `@counted
def scale(n, *, factor):
    return n * factor
assert scale.calls == 0, "counter must start at zero"
assert scale(3, factor=4) == 12 and scale.calls == 1, "forward arguments and count"
assert scale.__name__ == "scale", "preserve metadata"`,
      `@counted
def broken():
    raise ValueError("bad")
@counted
def ok():
    return 9
try:
    broken()
except ValueError:
    pass
else:
    raise AssertionError("propagate the error")
assert broken.calls == 1 and ok.calls == 0, "separate counters include failures"`
    ],
    hint: "wrapper הוא אובייקט ואפשר להצמיד לו שדה. את האתחול בצע אחרי הגדרת העטיפה, ואת ההגדלה לפני הקריאה לפונקציה המקורית."
  },
  {
    id: "adv2", title: "דקורטור עם פרמטרים", group: "פונקציות מתקדמות",
    intro: "כדי לכתוב ‎@retry(3)‎ צריך שלוש שכבות. הראשונה מקבלת הגדרות, השנייה מקבלת את הפונקציה, והשלישית מקבלת את הארגומנטים בזמן הקריאה. ה־closure שומר את ההגדרות לכל קריאה עתידית.",
    cs: `Func<Func<int>, Func<int>> Add(int delta) =>
    next => () => next() + delta;`,
    py: `from functools import wraps

def add(delta):
    def decorate(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            return fn(*args, **kwargs) + delta
        return wrapper
    return decorate

@add(2)
def score(): return 40

print(score())  # 42`,
    insight: "בשילוב ‎@outer‎ מעל ‎@inner‎ הפונקציה הנוצרת היא ‎outer(inner(fn))‎. בעת הקריאה נכנסים לעטיפה החיצונית תחילה. מדידת זמן מחוץ ל־retry מודדת את כל הניסיונות יחד.",
    task: "כתוב retry(attempts) שמנסה שוב רק במקרה של TimeoutError. attempts כולל את הקריאה הראשונה. דחה ערכים קטנים מאחת ב־ValueError כבר בקריאה ל־retry. לאחר הכישלון האחרון העבר את החריגה המקורית. העבר ארגומנטים ושמור metadata.",
    starter: `from functools import wraps

def retry(attempts):
    pass`,
    solution: `from functools import wraps

def retry(attempts):
    if attempts < 1:
        raise ValueError("attempts must be positive")
    def decorate(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            for i in range(attempts):
                try:
                    return fn(*args, **kwargs)
                except TimeoutError:
                    if i + 1 == attempts:
                        raise
        return wrapper
    return decorate`,
    tests: [
      `calls = []
@retry(3)
def fetch(*, key):
    calls.append(key)
    if len(calls) < 3: raise TimeoutError()
    return key
assert fetch(key="A") == "A" and calls == ["A"] * 3
assert fetch.__name__ == "fetch"`,
      `for error, expected in [(ValueError("x"), 1), (TimeoutError("y"), 2)]:
    seen = []
    @retry(2)
    def fail():
        seen.append(1)
        raise error
    try: fail()
    except Exception as caught: assert caught is error
    else: raise AssertionError("must propagate error")
    assert len(seen) == expected
try: retry(0)
except ValueError: pass
else: raise AssertionError("reject zero attempts")`
    ],
    hint: "מקם את לולאת הניסיונות בתוך wrapper. בתוך except השתמש ב־raise ללא ארגומנט כדי להעביר את אותה החריגה."
  },
  {
    id: "adv3", title: "עטיפה של קוד אסינכרוני", group: "פונקציות מתקדמות",
    intro: "קריאה ל־async def מחזירה אובייקט coroutine. הגוף מתחיל לפעול כשממתינים לו או מתזמנים אותו. עטיפת מדידה סינכרונית סביב הקריאה תמדוד רק את בניית האובייקט. כדי למדוד את העבודה עצמה, העטיפה צריכה לבצע await.",
    cs: `async Task<T> Timed<T>(Func<Task<T>> body)
{
    var start = Stopwatch.StartNew();
    try { return await body(); }
    finally { Console.WriteLine(start.Elapsed); }
}`,
    py: `from functools import wraps
from time import perf_counter

def timed(fn):
    @wraps(fn)
    async def wrapper(*args, **kwargs):
        start = perf_counter()
        try:
            return await fn(*args, **kwargs)
        finally:
            print(perf_counter() - start)
    return wrapper`,
    insight: "finally מתבצע גם ביציאה עקב חריגה או ביטול שהגיע במהלך ההמתנה. callback קצר בסיום יכול לשחרר משאב או לעדכן מדד. אם העטיפה עצמה עוד לא התחילה לרוץ, גם בלוק ה־finally שלה עוד לא פעיל.",
    task: "כתוב דקורטור ‎on_finish(callback)‎ לפונקציה אסינכרונית. העבר את כל הארגומנטים, המתן לתוצאה וקרא פעם אחת ל־callback עם שם הפונקציה בסיום, גם בכישלון. הנח שה־callback סינכרוני ומצליח.",
    starter: `from functools import wraps

def on_finish(callback):
    pass`,
    solution: `from functools import wraps

def on_finish(callback):
    def decorate(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            try:
                return await fn(*args, **kwargs)
            finally:
                callback(fn.__name__)
        return wrapper
    return decorate`,
    tests: [
      `events = []
@on_finish(events.append)
async def work(*, n):
    events.append("working")
    return n + 1
pending = work(n=2)
assert events == []
assert await pending == 3
assert events == ["working", "work"] and work.__name__ == "work"`,
      `events = []
@on_finish(events.append)
async def fail():
    raise RuntimeError("oops")
try: await fail()
except RuntimeError: pass
else: raise AssertionError("expected original exception")
assert events == ["fail"]`
    ],
    hint: "הגדר async def wrapper. מקם return await בתוך try ואת ה־callback בתוך finally."
  },
  {
    id: "adv4", title: "ניהול משאבים עם with", group: "קוד אמין",
    intro: "using ב־C# מקשר את משך החיים של משאב לבלוק. בפייתון with מפעיל את __enter__ ו־__exit__. בעזרת contextmanager אפשר לתאר את אותו מחזור חיים בפונקציית generator עם yield אחד.",
    cs: `using var log = File.OpenText("events.txt");
Console.WriteLine(log.ReadLine());`,
    py: `from contextlib import contextmanager

@contextmanager
def session(log):
    log.append("open")
    try:
        yield log
    finally:
        log.append("close")

events = []
with session(events) as current:
    current.append("read")
print(events)  # ['open', 'read', 'close']`,
    insight: "מה ש־yield מחזיר נקשר למשתנה שאחרי as. כאשר גוף ה־with מעלה חריגה היא נזרקת בנקודת ה־yield. לכן פעולת שחזור חייבת לשבת ב־finally כדי לפעול גם במסלול השגיאה.",
    task: "כתוב temporary(config, key, value) כמנהל הקשר שמציב ערך זמני במילון ומשיב את מצבו המקורי בסיום. אם המפתח היה חסר, הסר אותו. תמוך בערך מקורי None, בבלוקים מקוננים ובחריגות.",
    starter: `from contextlib import contextmanager

@contextmanager
def temporary(config, key, value):
    pass`,
    solution: `from contextlib import contextmanager

@contextmanager
def temporary(config, key, value):
    missing = object()
    previous = config.get(key, missing)
    config[key] = value
    try:
        yield
    finally:
        if previous is missing:
            config.pop(key, None)
        else:
            config[key] = previous`,
    tests: [
      `cfg = {"port": None}
with temporary(cfg, "port", 80):
    assert cfg["port"] == 80
    with temporary(cfg, "port", 90): assert cfg["port"] == 90
    assert cfg["port"] == 80
assert cfg == {"port": None}`,
      `cfg = {}
try:
    with temporary(cfg, "zone", "EU"):
        assert cfg["zone"] == "EU"
        raise ValueError("test")
except ValueError: pass
else: raise AssertionError("error was swallowed")
assert cfg == {}, "remove previously absent key"`
    ],
    hint: "כדי להבחין בין מפתח חסר לערך None שמור גם את תוצאת key in config, או השתמש באובייקט sentinel ייחודי."
  },
  {
    id: "adv5", title: "מקביליות עם TaskGroup", group: "קוד אמין",
    intro: "כשכמה פעולות I/O שייכות לבקשה אחת, TaskGroup נותן להן תחום חיים משותף. יוצרים משימות בתוך async with, וביציאה כולן כבר הסתיימו. אם משימה נכשלת בחריגה רגילה, הקבוצה מבקשת לבטל את המשימות האחיות וממתינה לסיומן.",
    cs: `var jobs = keys.Select(key => FetchAsync(key));
var values = await Task.WhenAll(jobs);`,
    py: `import asyncio

async def fetch(key):
    await asyncio.sleep(0)
    return key.upper()

async def load(keys):
    async with asyncio.TaskGroup() as group:
        tasks = [group.create_task(fetch(k)) for k in keys]
    return [task.result() for task in tasks]`,
    insight: "Task.WhenAll בפני עצמו אינו מבטל את שאר הפעולות כשאחת נכשלת. TaskGroup מרכז כשלים ב־ExceptionGroup. שמירת רשימת ה־Tasks לפי סדר הקלט מאפשרת להשיב תוצאות לפי אותו סדר גם כאשר סדר הסיום שונה.",
    task: "ממש batch(keys, fetch, limit) שמריץ fetch אסינכרונית לכל מפתח, עם עד limit קריאות פעילות. החזר רשימת תוצאות לפי סדר הקלט, כולל כפילויות. דחה limit קטן מאחת ב־ValueError והשתמש ב־TaskGroup ו־Semaphore.",
    starter: `import asyncio

async def batch(keys, fetch, limit):
    pass`,
    solution: `import asyncio

async def batch(keys, fetch, limit):
    if limit < 1:
        raise ValueError("limit must be positive")
    gate = asyncio.Semaphore(limit)
    async def one(key):
        async with gate:
            return await fetch(key)
    async with asyncio.TaskGroup() as group:
        tasks = [group.create_task(one(key)) for key in keys]
    return [task.result() for task in tasks]`,
    tests: [
      `import asyncio
state = {"active": 0, "peak": 0}
async def sample(k):
    state["active"] += 1
    state["peak"] = max(state["peak"], state["active"])
    await asyncio.sleep(0)
    state["active"] -= 1
    return k * 2
assert await batch([3, 1, 3, 4], sample, 2) == [6, 2, 6, 8]
assert state["peak"] == 2, "overlap exactly two calls for this input"`,
      `async def identity(k): return k
assert await batch([], identity, 1) == []
try: await batch([], identity, 0)
except ValueError: pass
else: raise AssertionError("validate limit")`
    ],
    hint: "אם תבצע await לכל fetch בתוך הלולאה, תקבל ריצה סדרתית. צור את המשימות לפני ההמתנה המשותפת, ונעל את הסמפור בתוך כל משימה."
  },
  {
    id: "adv6", title: "חריגות ושימור סיבת הכשל", group: "קוד אמין",
    intro: "שכבת תצורה יכולה לתרגם שגיאת parse לשגיאה עם משמעות עסקית. המקבילה ל־InnerException היא שרשרת חריגות. הכתיב raise ... from exc יוצר קשר מפורש בין החריגה החדשה לסיבה שתפסנו.",
    cs: `try { return int.Parse(raw); }
catch (FormatException error) {
    throw new ConfigException("Invalid count", error);
}`,
    py: `class ConfigError(Exception):
    pass

def parse_count(raw):
    try:
        return int(raw)
    except ValueError as exc:
        raise ConfigError("Invalid count") from exc`,
    insight: "צמצום ה־try לשורת ההמרה מונע תרגום בטעות של חריגה מקוד אחר. אפשר לבדוק את הסיבה המקורית דרך ‎__cause__‎. הכתיב raise בתוך except מעביר את אותה החריגה עם ה־traceback שלה.",
    task: "ממש read_port(config) שקורא את המחרוזת config['port'] וממיר אותה ל־int. במפתח חסר או בטקסט שאינו מספר, זרוק ConfigError ושרשר את החריגה המקורית. ערך מחוץ ל־1 עד 65535 יגרום ל־ConfigError ללא סיבה מפורשת.",
    starter: `class ConfigError(Exception):
    pass

def read_port(config):
    pass`,
    solution: `class ConfigError(Exception):
    pass

def read_port(config):
    try:
        port = int(config["port"])
    except (KeyError, ValueError) as exc:
        raise ConfigError("Invalid port setting") from exc
    if not 1 <= port <= 65535:
        raise ConfigError("Port outside range")
    return port`,
    tests: [
      `assert read_port({"port": "1"}) == 1
assert read_port({"port": "65535"}) == 65535
for cfg, cause in [({}, KeyError), ({"port":"abc"}, ValueError)]:
    try: read_port(cfg)
    except ConfigError as exc: assert isinstance(exc.__cause__, cause)
    else: raise AssertionError("expected chained error")`,
      `for port in ["0", "-1", "65536"]:
    try: read_port({"port": port})
    except ConfigError as exc: assert exc.__cause__ is None
    else: raise AssertionError("expected range validation")`
    ],
    hint: "טפל ב־KeyError וב־ValueError באותו except, והעבר את בדיקת הטווח אל מחוץ ל־try."
  },
  {
    id: "adv7", title: "בדיקות ו־test doubles", group: "קוד אמין",
    intro: "את דפוס Arrange–Act–Assert מ־xUnit אפשר להעביר ישירות לפייתון. תלות ב־clock או בלקוח HTTP יכולה להיות פשוט פונקציה שמתקבלת כארגומנט. Mock מהספרייה התקנית משמש גם כ־stub שמחזיר ערך וגם כ־spy שמתעד קריאות.",
    cs: `var clock = new Mock<IClock>();
clock.Setup(c => c.Now()).Returns(10);
Assert.Equal(15, Expiry(clock.Object, 5));
clock.Verify(c => c.Now(), Times.Once);`,
    py: `from unittest.mock import Mock

def expiry(clock, ttl):
    return clock() + ttl

clock = Mock(return_value=10)
assert expiry(clock, 5) == 15
clock.assert_called_once_with()`,
    insight: "אם תבדוק רק את הערך המוחזר, מימוש שפונה פעמיים לשירות חיצוני עלול לעבור. כשמספר הפניות הוא חלק מהחוזה, תעד ובדוק אותו במפורש. בתרגיל הזה בודקים את הבדיקה שלך על כמה מימושים.",
    task: "כתוב verify_lookup(lookup) כבדיקת חוזה. lookup(cache, key, fetch) אמור להחזיר מהמטמון כשמפתח קיים (כולל ערך 0), ובחוסר לקרוא פעם אחת ל־fetch(key), לשמור ולהחזיר את התוצאה. הבדיקה שלך צריכה לעבור במימוש תקין ולהכשיל מימושים פגומים בעזרת AssertionError.",
    starter: `from unittest.mock import Mock

def verify_lookup(lookup):
    # Arrange a cache hit and a cache miss
    pass`,
    solution: `from unittest.mock import Mock

def verify_lookup(lookup):
    cache = {"hit": 0}
    fetch = Mock(return_value=42)
    assert lookup(cache, "hit", fetch) == 0
    fetch.assert_not_called()
    assert lookup(cache, "miss", fetch) == 42
    fetch.assert_called_once_with("miss")
    assert cache.get("miss") == 42`,
    tests: [
      `def correct(cache, key, fetch):
    if key not in cache:
        cache[key] = fetch(key)
    return cache[key]
verify_lookup(correct)`,
      `def broken(mode):
    def lookup(cache, key, fetch):
        if key in cache and (mode != "truthiness" or cache[key]):
            if mode == "extra_hit": fetch(key)
            return cache[key]
        value = fetch(key)
        if mode == "extra_miss": fetch(key)
        if mode != "skip_save": cache[key] = value
        return None if mode == "wrong_value" else value
    return lookup
for mode in ("truthiness", "skip_save", "extra_hit", "extra_miss", "wrong_value"):
    try: verify_lookup(broken(mode))
    except AssertionError: pass
    else: raise AssertionError("missed faulty behavior: " + mode)`
    ],
    hint: "צור Mock עם return_value שהוא מספר. אחרי פגיעה במטמון בדוק assert_not_called, ואחרי החטאה בדוק assert_called_once_with ואת המילון עצמו."
  },
  {
    id: "adv8", title: "פרויקט סיום · מתזמן משימות", group: "פרויקט סיום",
    intro: "המתזמן שכבר מימשת ב־C# משלב PriorityQueue ומילון. בפייתון heapq הופך רשימה לערימת מינימום. כדי לטפל במשימות בעלות אותו זמן יעד משתמשים ב־tuple עם מספר סידורי עולה. המיון הלקסיקוגרפי שלו מבטיח סדר הכנסה.",
    cs: `var pending = new PriorityQueue<Job, (int Due, long Seq)>();
pending.Enqueue(job, (due, sequence++));`,
    py: `import heapq
from itertools import count

pending, seq = [], count()
heapq.heappush(pending, (10, next(seq), "backup"))
heapq.heappush(pending, (10, next(seq), "index"))
print(heapq.heappop(pending)[2])  # backup`,
    insight: "ערימה אינה מציעה מחיקה זולה לפי מזהה. בביטול מוחקים רק מהמילון. בעת שליפה משווים את המספר הסידורי לגרסה הפעילה וכך מדלגים גם על רשומה שבוטלה וגם על תזמון שהוחלף. מחיר הנוחות הוא שרשומות ישנות תופסות זיכרון עד מועד השליפה.",
    task: "השלם Scheduler. schedule(key, due) מוסיף או מחליף תזמון למזהה. cancel(key) מחזיר True אם בוטלה משימה פעילה. pop_due(now) מחזיר ומסיר את כל המזהים שזמנם עד now, לפי זמן ואז לפי סדר ההכנסה. דרישות היעילות הן הוספה ב־O(log n) וביטול ב־O(1) בממוצע.",
    starter: `import heapq
from itertools import count

class Scheduler:
    def __init__(self):
        pass

    def schedule(self, key, due):
        pass

    def cancel(self, key):
        pass

    def pop_due(self, now):
        pass`,
    solution: `import heapq
from itertools import count

class Scheduler:
    def __init__(self):
        self.queue = []
        self.active = {}
        self.seq = count()

    def schedule(self, key, due):
        token = next(self.seq)
        self.active[key] = token
        heapq.heappush(self.queue, (due, token, key))

    def cancel(self, key):
        return self.active.pop(key, None) is not None

    def pop_due(self, now):
        ready = []
        while self.queue and self.queue[0][0] <= now:
            _, token, key = heapq.heappop(self.queue)
            if self.active.get(key) == token:
                del self.active[key]
                ready.append(key)
        return ready`,
    tests: [
      `s = Scheduler()
s.schedule("first", 5)
s.schedule("later", 7)
s.schedule("second", 5)
assert s.pop_due(4) == []
assert s.pop_due(5) == ["first", "second"], "inclusive due time and stable ties"
assert s.pop_due(5) == [] and s.pop_due(10) == ["later"]`,
      `s = Scheduler()
s.schedule("A", 1)
assert s.cancel("A") is True and s.cancel("A") is False
s.schedule("A", 9)
s.schedule("B", 2)
s.schedule("B", 9)
assert s.pop_due(8) == [], "skip obsolete entries"
assert s.pop_due(9) == ["A", "B"]
assert s.cancel("B") is False`
    ],
    hint: "שמור במילון לכל מזהה את המספר הסידורי של התזמון העדכני. היזהר מבדיקת אמת למספר הסידורי, כי הערך הראשון של count() הוא אפס."
  }
];
