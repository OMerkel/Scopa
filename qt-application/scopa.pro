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

lessThan(QT_MAJOR_VERSION, 5): error("Scopa requires at least Qt 5.7")
equals(QT_MAJOR_VERSION, 5) {
    lessThan(QT_MINOR_VERSION, 7): error("Scopa requires at least Qt 5.7")
}

QT       += core gui webenginewidgets

TARGET   =  scopa
TEMPLATE =  app

SOURCES  += main.cpp mainwindow.cpp webenginepage.cpp

HEADERS  += mainwindow.h webenginepage.h
