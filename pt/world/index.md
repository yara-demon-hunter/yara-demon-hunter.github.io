---
layout: default
title: Atlas do Mundo
lang: pt
book_id: book-1
translation_id: world
last_updated: 2026-09-27
---

<section class="location-directory">
	<header class="location-directory__header">
		<p class="section-label">O mundo de Yara, Caçadora de Demônios</p>
		<h1>Atlas do Mundo</h1>
		<p>Explore os lugares que moldam o mundo de Yara, de vales habitados às terras selvagens além deles.</p>
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