#
# Copyright (C) 2016 Marco Scarpetta
# 
# This file is part of Scopa.
# 
# Scopa is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
# 
# Scopa is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with Scopa.  If not, see <http://www.gnu.org/licenses/>.
#

DESTDIR       ?= /

ifeq ($(MAKECMDGOALS), install-html-only)
DESTDIR = ./dist
endif

# static files
TEN           = 1 2 3 4 5 6 7 8 9 10

CARDS_FILES   = $(addsuffix .jpg, $(addsuffix d, $(TEN)) $(addsuffix c, $(TEN)) \
                                  $(addsuffix b, $(TEN)) $(addsuffix s, $(TEN)) bg)

ALL_CARDS     = $(addprefix Napoletane/, $(CARDS_FILES)) \
                $(addprefix Piacentine/, $(CARDS_FILES)) \
                $(addprefix Poker/, $(CARDS_FILES)) \
                $(addprefix Poker_figures/, $(CARDS_FILES)) \
                $(addprefix Bergamasche/, $(CARDS_FILES))

DATA_DIR      = $(addprefix data/cards/, $(ALL_CARDS)) \
                $(addprefix data/, close.svg menu.svg icon.svg icon.png) \
                $(addprefix data/backgrounds/, red.png green.png blue.png)

LOCALES       = it
LOCALES_FILES = $(addprefix locales/, $(addsuffix .js, $(LOCALES)))
LOCALES_JSON  = $(addprefix locales_json/, $(addsuffix .json, $(LOCALES)))

ALL_FILES     = $(DATA_DIR) index.html style.css \
                $(addprefix docs/, index.html style.css game-class.html) \
                $(addprefix js/, app.js utils.js classic.js scopone.js cucita.js \
                                 cirulla.js rebello.js) \
                $(LOCALES_FILES)

STATIC_FILES  = $(addprefix build/share/scopa/, $(ALL_FILES))

SRC           = $(addprefix qt-application/, main.cpp mainwindow.cpp mainwindow.h \
                                             webenginepage.cpp webenginepage.h)

.PHONY:
all: build/bin/scopa $(STATIC_FILES)

build/bin/scopa: qt-application/scopa
	mkdir -p build/bin
	cp qt-application/scopa build/bin/scopa

qt-application/scopa: $(SRC) qt-application/scopa.pro
	cd qt-application; qmake scopa.pro; make

.SECONDEXPANSION:
$(STATIC_FILES): $$(subst build/share/scopa/,,$$@)
	mkdir -p $(dir $@)
	cp -r $(subst build/share/scopa/,,$@) $@

.PHONY: locales
locales: $(LOCALES_FILES)
$(LOCALES_FILES): $$(subst .js,.json,$$(subst locales,locales_json,$$@))
	echo "var locale =" > $@
	cat $(subst .js,.json,$(subst locales,locales_json,$@)) >> $@
	echo "app.loadLocale(locale);" >> $@

.PHONY: fetch-locales
fetch-locales: clean-locales-json $(LOCALES_JSON) locales_json/en.json
$(LOCALES_JSON):
	mkdir -p locales_json
	lang=$(basename $(notdir $@)); \
	curl -X GET https://hosted.weblate.org/api/translations/scopa/Translations/$$lang/file/ > locales_json/$$lang.json;

locales_json/en.json: index.html
	python3 locale_extractor.py index.html locales_json/en.json

.PHONY: clean-locales-json
clean-locales-json:
	rm locales_json/*

.PHONY: install
install: all scopa.desktop
	mkdir -p $(DESTDIR)/usr/share/applications
	mkdir -p $(DESTDIR)/usr/share/icons/hicolor/scalable/apps
	mkdir -p $(DESTDIR)/usr/share/icons/hicolor/256x256/apps
	cp -r build/* $(DESTDIR)/usr/
	cp scopa.desktop $(DESTDIR)/usr/share/applications/
	cp data/icon.svg $(DESTDIR)/usr/share/icons/hicolor/scalable/apps/scopa.svg
	cp data/icon.png $(DESTDIR)/usr/share/icons/hicolor/256x256/apps/scopa.png

.PHONY: install-html-only
install-html-only: $(STATIC_FILES)
	mkdir -p $(DESTDIR)
	cp -r build/share/scopa/* $(DESTDIR)/

.PHONY: tests
tests: tests.html
tests.html: index.html
	fromBottom=2; \
	fromTop=$$(($$(sed -n '$$=' index.html)-$$fromBottom)); \
	head -n $$fromTop index.html > tests.html; \
	echo "<script type=\"text/javascript\" src=\"tests/tests.js\"></script>" >> tests.html; \
	tail -n $$fromBottom index.html >> tests.html

.PHONY: clean
clean:
	rm -f tests.html
	rm -f qt-application/*.o qt-application/moc_*
	rm -f -r build
