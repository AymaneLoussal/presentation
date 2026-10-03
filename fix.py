import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the double index 2 and ensure correct order
# Let's just find all <section class="page"...> and re-number them
sections = re.findall(r'<section class="page".*?>', html)
for i in range(len(sections)):
    # We will replace them sequentially
    pass

# Actually it's easier to just do it via regex substitution with a function
def replacer(match):
    replacer.counter += 1
    # replace data-index="..." with new index
    return re.sub(r'data-index="\d+"', f'data-index="{replacer.counter - 1}"', match.group(0))

replacer.counter = 0
html = re.sub(r'<section class="page".*?>', replacer, html)

# Also check if Video page exists
if 'class="video-grid' not in html:
    # Insert video page before sunset
    video_page = '''    <!-- PAGE X — Videos -->
    <section class="page" data-index="X">
      <div class="page-bg why-bg"></div>
      <div class="content content-center" style="max-width: 1000px;">
        <h1 class="section-title anim-up">THIS IS STARTS SCHOOL.</h1>
        <div class="video-grid anim-up delay-1">
          <video src="assests/videos/6214743-uhd_4096_2160_25fps.mp4" controls class="showcase-video"></video>
          <video src="assests/videos/8342695-uhd_3840_2160_25fps.mp4" controls class="showcase-video"></video>
          <video src="assests/videos/endOfPresentation.mp4" controls class="showcase-video"></video>
        </div>
      </div>
    </section>
'''
    html = html.replace('<section class="page" data-index="17" id="sunset-page">', video_page + '\n    <section class="page" data-index="17" id="sunset-page">')
    # Re-run the indexer to fix indices after insertion
    replacer.counter = 0
    html = re.sub(r'<section class="page".*?>', replacer, html)

# Fix total pages
total_pages = replacer.counter
html = re.sub(r'<span id="tot-pages">\d+</span>', f'<span id="tot-pages">{total_pages}</span>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print(f"Total pages fixed: {total_pages}")
