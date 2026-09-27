---
layout: default
title: World Atlas
lang: en
book_id: book-1
translation_id: world
last_updated: 2026-09-27
---

<section class="location-directory">
	<header class="location-directory__header">
		<p class="section-label">The world of Yara, Demon Hunter</p>
		<h1>World Atlas</h1>
		<p>Explore the places that shape Yara's world, from settled valleys to the wild lands beyond them.</p>
	</header>

	<div class="location-directory__list">
		{% assign location_pages = site.pages | where: "layout", "location" | where: "lang", page.lang %}
		{% for location_page in location_pages %}
			{% if location_page.location.directory %}
				{% include location-card.html location_page=location_page %}
			{% endif %}
		{% endfor %}
	</div>
</section>