window.releases = [
  {
    version: "3.10",
    title: "התאמת תבניות עם match",
    intro: "אירוע שמגיע כ־dict יכול להכיל שדות שונים בכל פעם. תבנית אחת יכולה לבדוק אילו מפתחות קיימים, לחלץ ערכים ולתת להם שמות. התנאי שאחרי if נבדק רק אחרי הצלחת ההתאמה.",
    cs: "אם השתמשת ב־switch עם property patterns ו־when, המבנה מוכר. כאן אפשר להתאים ישירות גם מילון שהגיע מפענוח JSON.",
    py: `def action(event):
    match event:
        case {"kind": "scale", "count": int(n)} if n > 0:
            return f"scale to {n}"
        case _:
            return "ignore"

print(action({"kind": "scale", "count": 3, "zone": "eu"}))`,
    question: "מה יודפס למרות שהאירוע כולל גם את המפתח zone?",
    options: ["ignore כי מספר המפתחות שונה", "scale to 3", "תיזרק KeyError"],
    correct: 1,
    why: "תבנית מילון דורשת שהמפתחות הרשומים בה יתאימו. מפתחות נוספים מותרים. המספר 3 מתאים ל־int ועובר גם את התנאי.",
    url: "https://docs.python.org/3/whatsnew/3.10.html"
  },
  {
    version: "3.11",
    title: "טיפול בקבוצת שגיאות",
    intro: "כאשר כמה פעולות נכשלות יחד, ExceptionGroup שומרת את החריגות כקבוצה. סעיף except* בוחר מתוכה את החריגות שמתאימות לטיפוס שלו. יותר מסעיף אחד יכול לפעול באותו אירוע.",
    cs: "בדומה ל־AggregateException ב־.NET אפשר לשמור כמה כשלונות. התחביר except* מאפשר לטפל בתת־קבוצה של כשלונות מאותו סוג ישירות.",
    py: `try:
    raise ExceptionGroup("deployment", [
        TimeoutError("registry"),
        ValueError("invalid region"),
    ])
except* TimeoutError as errors:
    print("retry", len(errors.exceptions))
except* ValueError as errors:
    print("fix", len(errors.exceptions))`,
    question: "אילו הודעות יופיעו?",
    options: ["רק retry 1", "רק fix 1", "תחילה retry 1 ואחריה fix 1"],
    correct: 2,
    why: "הסעיף הראשון מקבל את שגיאת הזמן. שגיאת הערך ממשיכה לסעיף הבא ומטופלת שם. שגיאות שאינן מתאימות לשום סעיף ממשיכות החוצה.",
    url: "https://docs.python.org/3/whatsnew/3.11.html"
  },
  {
    version: "3.12",
    title: "חתימות גנריות קריאות",
    intro: "אפשר להצהיר על פרמטר טיפוס בתוך חתימת הפונקציה. בדוגמה, T קושר בין טיפוס האיברים ברשימה לטיפוס הערך המוחזר. בודק טיפוסים יכול להסיק את התוצאה בכל שימוש.",
    cs: "החתימה מזכירה T Last<T>(List<T> items). בפייתון הבדיקה הסטטית נעשית בכלי כמו Pyright או mypy. המפרש מאפשר לקרוא לפונקציה גם עם ערכים אחרים.",
    py: `def last[T](items: list[T]) -> T:
    return items[-1]

name = last(["api", "worker"])
port = last([443, 8080])`,
    question: "אילו טיפוסים יסיק בודק טיפוסים עבור name ו־port?",
    options: ["str ו־int בהתאמה", "list בשני המקרים", "חייבים לבחור טיפוס אחד לכל הקריאות"],
    correct: 0,
    why: "בכל קריאה T נקבע מחדש מטיפוס האיברים. חתימת ההחזרה מבטיחה לאותו בודק שגם התוצאה משתמשת באותו T.",
    url: "https://docs.python.org/3/whatsnew/3.12.html"
  },
  {
    version: "3.13",
    title: "תהליכונים ובנייה ללא GIL",
    intro: "ב־CPython 3.13 נוספה בנייה ניסיונית המאפשרת לתהליכונים להריץ קוד פייתון במקביל על כמה ליבות. בבנייה הרגילה נעילת ה־GIL עדיין פעילה. פקודת האבחון הבאה בודקת את מצב התהליך הנוכחי.",
    cs: "ב־.NET אתה רגיל לכך ששתי משימות CPU יכולות להתקדם על שתי ליבות. כשאתה מתכנן שירות CPython, בדוק גם את סוג הבנייה. גישה משותפת למצב משתנה עדיין דורשת תכנון סנכרון.",
    py: `import sys
import sysconfig

print("Free-threaded build:",
      bool(sysconfig.get_config_var("Py_GIL_DISABLED")))
print("GIL enabled:", sys._is_gil_enabled())`,
    question: "התקנת CPython 3.13 רגיל. האם הוספת ThreadPoolExecutor מבטיחה ששתי לולאות Python טהורות ירוצו במקביל על שתי ליבות?",
    options: ["כן, החל מ־3.13 בכל התקנה", "רק אם שתי הלולאות באותו מודול", "לא, בבנייה הרגילה ה־GIL עדיין פעיל"],
    correct: 2,
    why: "בגרסה הזו עבודה ללא GIL דורשת בנייה ייעודית. גם עם GIL, תהליכונים עדיין יכולים להועיל בזמן המתנה ל־I/O.",
    url: "https://docs.python.org/3/whatsnew/3.13.html"
  },
  {
    version: "3.14",
    title: "הערכת אנוטציות לפי דרישה",
    intro: "אפשר לציין טיפוס שיוגדר בהמשך הקובץ. בברירת המחדל החדשה, ביטויי האנוטציות מוערכים כשמבקשים את ערכיהם. בדוגמה המחלקה כבר קיימת בזמן הקריאה ל־get_type_hints.",
    cs: "ב־C# סדר הגדרת המחלקות בקובץ לרוב אינו משנה. בפייתון ההגדרות נוצרות בזמן הרצת המודול, ולכן לעיתוי שבו קוראים מידע על טיפוסים יש משמעות.",
    py: `from typing import get_type_hints

def enqueue(job: Job) -> None:
    print(job)

class Job:
    pass

print(get_type_hints(enqueue)["job"] is Job)`,
    question: "מה יודפס ב־3.14 עם הגדרות ברירת המחדל?",
    options: ["True", "False כי האנוטציה נשמרת תמיד כמחרוזת", "NameError בשורת def"],
    correct: 0,
    why: "האנוטציה נפתרת אחרי ש־Job הוגדרה. אם תעביר את הקריאה ל־get_type_hints לפני הגדרת המחלקה, פתרון השם ייכשל.",
    url: "https://docs.python.org/3/whatsnew/3.14.html"
  },
  {
    version: "3.15",
    title: "להבדיל בין ערך חסר ל־None",
    intro: "בממשק לעדכון הגדרות יש הבדל בין השמטת שדה לבין איפוס מפורש שלו. הטיפוס המובנה sentinel יוצר סמן ייחודי. אפשר להשתמש בו כברירת מחדל ולהשוות לפי זהות באמצעות is.",
    cs: "אם השתמשת ב־overload נפרד כדי להבדיל בין Patch() לבין Patch(null), סמן ייחודי מאפשר לייצג את שני המצבים בחתימת Python אחת.",
    py: `UNSET = sentinel("UNSET")

def patch_region(value=UNSET):
    if value is UNSET:
        return {}
    return {"region": value}

print(patch_region())
print(patch_region(None))`,
    question: "מה תחזיר הקריאה שמקבלת None במפורש?",
    options: ["מילון ריק", "מילון עם מפתח region שערכו None", "את הסמן UNSET"],
    correct: 1,
    why: "ברירת המחדל נבחרת רק כשהארגומנט מושמט. None הוא ערך אחר, ולכן הקוד יכלול אותו במילון העדכון.",
    url: "https://docs.python.org/3/whatsnew/3.15.html"
  }
];
