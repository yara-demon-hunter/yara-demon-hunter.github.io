---
layout: default
title: Character Archive
description: "Explore character profiles from Yara, Demon Hunter, including their roles, story connections, visual archives, and appearances in the books and mini games."
lang: en
book_id: book-1
translation_id: characters-index
last_updated: 2026-11-10
---

<section class="character-directory">
	<p class="character-hero__eyebrow">The world of Yara, Demon Hunter</p>
	<h1>Character Archive</h1>
	<p class="character-directory__intro">Meet the people whose choices shape the story.</p>

	<div class="character-directory__list">
		{% assign character_pages = site.pages | where: "layout", "character" | where: "lang", page.lang| sort: "character.order" %}
		{% for profile_page in character_pages %}
			{% if profile_page.character.directory %}
				{% include character-card.html profile_page=profile_page %}
			{% endif %}
		{% endfor %}
	</div>
</section>
