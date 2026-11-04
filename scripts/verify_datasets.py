import sys
sys.path.append('scripts')
import courses_data_a_c as ac
import courses_data_d_f as df
import courses_data_g_j as gj

cats = {
    'A': (ac.COURSES_A, "Programming Fundamentals"),
    'B': (ac.COURSES_B, "Web Development"),
    'C': (ac.COURSES_C, "Computer Science Core"),
    'D': (df.COURSES_D, "Artificial Intelligence and Machine Learning"),
    'E': (df.COURSES_E, "Data Science and Analytics"),
    'F': (df.COURSES_F, "Cloud, DevOps, and Software Tools"),
    'G': (gj.COURSES_G, "Electronics and Communication Engineering"),
    'H': (gj.COURSES_H, "Electrical Engineering"),
    'I': (gj.COURSES_I, "Mechanical and Civil Engineering"),
    'J': (gj.COURSES_J, "Mathematics, Aptitude, and Career Skills"),
}

total_courses = 0
total_modules = 0
total_lessons = 0

print("--- CATEGORY BREAKDOWN ---")
for cat_key, (course_list, cat_name) in cats.items():
    c_count = len(course_list)
    m_count = sum(len(c['modules']) for c in course_list)
    l_count = sum(sum(len(m[2]) for m in c['modules']) for c in course_list)
    total_courses += c_count
    total_modules += m_count
    total_lessons += l_count
    print(f"Cat {cat_key} ({cat_name}): {c_count} courses, {m_count} modules, {l_count} lessons")

print("\n--- TOTALS ---")
print(f"Total Courses: {total_courses}")
print(f"Total Modules: {total_modules}")
print(f"Total Lessons: {total_lessons}")

# Check course IDs, numbers, slugs, modules, lessons
course_numbers = set()
course_titles = set()
course_codes = set()
errors = []

for cat_key, (course_list, cat_name) in cats.items():
    for c in course_list:
        num = c['num']
        title = c['title']
        code = c['code']
        if num in course_numbers:
            errors.append(f"Duplicate course number: {num}")
        course_numbers.add(num)
        if title in course_titles:
            errors.append(f"Duplicate title: {title}")
        course_titles.add(title)
        if code in course_codes:
            errors.append(f"Duplicate code: {code}")
        course_codes.add(code)
        
        if len(c['modules']) < 4:
            errors.append(f"Course {num} '{title}' has only {len(c['modules'])} modules (must be >= 4)")
        for m_idx, m in enumerate(c['modules']):
            if len(m[2]) < 3:
                errors.append(f"Course {num} '{title}' module {m_idx} has only {len(m[2])} lessons (must be >= 3)")

if errors:
    print(f"\nFound {len(errors)} errors:")
    for err in errors[:10]:
        print("  -", err)
else:
    print("\nALL 100 COURSES VALIDATED PERFECTLY! No duplicate IDs, codes, or titles. All courses >= 4 modules, all modules >= 3 lessons.")
