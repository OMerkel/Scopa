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
INSTALLPATH   ?= .

DEFINES       = -DQT_NO_DEBUG -DQT_WEBENGINEWIDGETS_LIB -DQT_WEBENGINECORE_LIB \
                -DQT_QUICK_LIB -DQT_WIDGETS_LIB -DQT_GUI_LIB -DQT_WEBCHANNEL_LIB \
                -DQT_QML_LIB -DQT_NETWORK_LIB -DQT_CORE_LIB

CXXFLAGS      = -pipe -O2 -std=gnu++11 -Wall -W -D_REENTRANT -fPIC $(DEFINES)

INCPATH       = -I$(QTINCPATH)

LIBS          = -L$(LIBSPATH) -lGL -lpthread -lQt5Core -lQt5WebEngineWidgets \
                -lQt5Widgets -lQt5Gui \

LFLAGS        = -Wl,-O1 -Wl,-rpath,$(LIBSPATH) \
                -Wl,-rpath-link,$(LIBSPATH)
                 
scopa: update-main-h scopa.o
	g++ $(LFLAGS) -o scopa scopa.o $(LIBS)

scopa.o: qt-application/main.cpp qt-application/main.h
	g++ -c $(CXXFLAGS) $(INCPATH) -o scopa.o qt-application/main.cpp

.PHONY: update-main-h
update-main-h:
ifeq "$(INSTALLPATH)" "."
	sed -i '$$ d' qt-application/main.h
	echo '#define RELPATH "/./"' >> qt-application/main.h
else
	sed -i '$$ d' qt-application/main.h
	echo '#define RELPATH "/../share/scopa/"' >> qt-application/main.h
endif

.PHONY: install
install: scopa
ifneq "$(INSTALLPATH)" "."
	mkdir -p $(INSTALLPATH)/bin
	mkdir -p $(INSTALLPATH)/share/scopa
	install -c scopa $(INSTALLPATH)/bin/scopa
	cp index.html $(INSTALLPATH)/share/scopa/
	cp style.css $(INSTALLPATH)/share/scopa/
	cp -r data $(INSTALLPATH)/share/scopa/
	cp -r docs $(INSTALLPATH)/share/scopa/
	cp -r js $(INSTALLPATH)/share/scopa/
	cp -r locales $(INSTALLPATH)/share/scopa/
endif

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
	rm -f scopa scopa.o tests.html
