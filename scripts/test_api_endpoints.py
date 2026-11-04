import urllib.request
import json

def test_api(url, desc):
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read().decode())
        print(f"\n=== {desc} ===")
        if 'data' in data and 'items' in data['data']:
            print(f"Total: {data['data']['total']}, Returned: {len(data['data']['items'])}")
            for it in data['data']['items'][:3]:
                print(f"  - [{it['code']}] {it['title']} ({it.get('category', 'N/A')}) - {it['total_lessons']} lessons")
        elif 'data' in data:
            d = data['data']
            print(f"Course: {d.get('title')} ({d.get('code')})")
            print(f"  Category: {d.get('category')}")
            print(f"  Difficulty: {d.get('difficulty')}")
            print(f"  Chapters/Units: {len(d.get('chapters', []))}")
            print(f"  Total Lessons: {d.get('total_lessons')}")
            for ch in d.get('chapters', [])[:2]:
                print(f"    * {ch['title']} ({len(ch['lessons'])} lessons)")

if __name__ == '__main__':
    test_api('http://localhost:3000/api/v1/courses?limit=3', 'All Courses Page 1')
    test_api('http://localhost:3000/api/v1/courses?search=Python&limit=3', 'Search Python')
    test_api('http://localhost:3000/api/v1/courses?category=Artificial+Intelligence+and+Machine+Learning&limit=3', 'Category AI/ML')
    test_api('http://localhost:3000/api/v1/courses/crs_cat_001', 'Course Detail crs_cat_001')
    test_api('http://localhost:3000/api/v1/courses/crs_cat_044', 'Course Detail crs_cat_044')
    test_api('http://localhost:3000/api/v1/courses/crs_cat_100', 'Course Detail crs_cat_100')
