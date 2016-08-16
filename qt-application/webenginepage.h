/**
 *
 * Copyright (C) 2016 Marco Scarpetta
 * 
 * This file is part of Scopa.
 * 
 * Scopa is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Scopa is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Scopa.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

#ifndef WEBENGINEPAGE_H
#define WEBENGINEPAGE_H

#include <QtWebEngineWidgets/QWebEnginePage>
#include <QDesktopServices>

class WebEnginePage : public QWebEnginePage
{
    Q_OBJECT

public:
    WebEnginePage(QObject* parent = 0);
    
    QWebEnginePage* createWindow(QWebEnginePage::WebWindowType type);
    
public slots:
    void onLinkHovered(QString url);

private:
    QUrl lastHoveredUrl;
};

#endif
