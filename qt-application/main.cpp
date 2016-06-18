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

#include <QtWidgets/QApplication>
#include <QtWidgets/QMainWindow>
#include <QtWebEngineWidgets/QWebEngineView>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    QMainWindow mainWindow;
    QWebEngineView view;
    QIcon icon("../share/scopa/data/icon.png");
    
    mainWindow.setCentralWidget(&view);
    mainWindow.setWindowIcon(icon); //mainWindow.setWindowIcon(view.page()->icon());
    mainWindow.setWindowTitle("Scopa");
    
    view.load(QUrl::fromLocalFile(a.applicationDirPath()+"/../share/scopa/index.html"));
    mainWindow.show();

    return a.exec();
}
