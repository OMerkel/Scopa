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

from html.parser import HTMLParser
import argparse, json

class LocaleExtractor(HTMLParser):
    def __init__(self, output_file):
        HTMLParser.__init__(self)
        self.current_id = None
        self.extracted = {}
        self.output_file = output_file
    
    def handle_starttag(self, tag, attrs):
        for attr in attrs:
            if attr[0] == "data-string-id" or attr[0] == "data-string-prototype":
                self.current_id = attr[1]

    def handle_data(self, data):
        if (self.current_id):
            self.extracted[self.current_id] = data
            self.current_id = None
            
    def handle_endtag(self, tag):
        if tag == "html":
            out = open(self.output_file, "w")
            out.write(json.dumps(self.extracted, indent=4, sort_keys=True))

aparser = argparse.ArgumentParser()
aparser.add_argument("input_file", help="input HTML file to parse", type=str)
aparser.add_argument("output_file", help="output JSON file", type=str)
args = aparser.parse_args()

parser = LocaleExtractor(args.output_file)
parser.feed(open(args.input_file, "r").read())
