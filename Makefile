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

QTINCPATH     ?= /usr/include/qt
LIBSPATH      ?= /usr/lib
INSTALLPATH   ?= dist

# c++ compilation stuff
DEFINES       = -DQT_NO_DEBUG -DQT_WEBENGINEWIDGETS_LIB -DQT_WEBENGINECORE_LIB \
                -DQT_QUICK_LIB -DQT_WIDGETS_LIB -DQT_GUI_LIB -DQT_WEBCHANNEL_LIB \
                -DQT_QML_LIB -DQT_NETWORK_LIB -DQT_CORE_LIB

CXXFLAGS      = -pipe -O2 -std=gnu++11 -Wall -W -D_REENTRANT -fPIC $(DEFINES)

INCPATH       = -I$(QTINCPATH)

LIBS          = -L$(LIBSPATH) -lGL -lpthread -lQt5Core -lQt5WebEngineWidgets \
                -lQt5Widgets -lQt5Gui \

LFLAGS        = -Wl,-O1 -Wl,-rpath,$(LIBSPATH) \
                -Wl,-rpath-link,$(LIBSPATH)

# static files
TEN           = 1 2 3 4 5 6 7 8 9 10

CARDS_FILES   = $(addsuffix .jpg, $(addsuffix d, $(TEN)) $(addsuffix c, $(TEN)) \
                                  $(addsuffix b, $(TEN)) $(addsuffix s, $(TEN)) bg)

ALL_CARDS     = $(addprefix Napoletane/, $(CARDS_FILES)) \
                $(addprefix Piacentine/, $(CARDS_FILES)) \
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

.PHONY:
all: build/bin/scopa $(STATIC_FILES)

build/bin/scopa: scopa.o
	mkdir -p build/bin
	g++ $(LFLAGS) -o build/bin/scopa scopa.o $(LIBS)

scopa.o: qt-application/main.cpp
	g++ -c $(CXXFLAGS) $(INCPATH) -o scopa.o qt-application/main.cpp

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
install: all
	mkdir -p $(INSTALLPATH)
	cp -r build/* $(INSTALLPATH)/

.PHONY: install-html-only
install-html-only: $(STATIC_FILES)
	mkdir -p $(INSTALLPATH)
	cp -r build/share/scopa/* $(INSTALLPATH)/

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
	rm -f scopa.o tests.html
	rm -f -r build
