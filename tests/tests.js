/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2016 Marco Scarpetta
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

function ClassicMatchTest() 
{
    this.name = "Classic match test";
    this.cardsToPlayers = 1;
    CardsGroup.prototype.populate = function() 
    {
        while (this.length > 0)
        {
            this.pop();
        }
        for (var i=0; i<4; i++) {
            for (var j=1; j<11; j++) {
                this.push({"suit": i, "value": j, "id": j+10*i});
            }
        }
    }
}
ClassicMatchTest.prototype = new ClassicMatch();

function ScoponeMatchTest() 
{
    this.name = "Scopone match test";
    this.cardsToPlayers = 1;
    CardsGroup.prototype.populate = function() 
    {
        while (this.length > 0)
        {
            this.pop();
        }
        for (var i=0; i<4; i++) {
            for (var j=1; j<2; j++) {
                this.push({"suit": i, "value": j, "id": j+10*i});
            }
        }
    }
}
ScoponeMatchTest.prototype = new ScoponeMatch();

function CucitaMatchTest() 
{
    this.name = "Cucita match test";
    this.cardsToPlayers = 3;
    CardsGroup.prototype.populate = function() 
    {
        this.push(
            {suit: 0, value:1, id: "01"},
            {suit: 0, value:2, id: "02"},
            {suit: 0, value:3, id: "03"},
            {suit: 0, value:4, id: "04"},
            {suit: 0, value:5, id: "05"},
            {suit: 0, value:6, id: "06"},
            {suit: 0, value:7, id: "07"},
            {suit: 0, value:8, id: "08"},
            {suit: 0, value:9, id: "09"},
            {suit: 0, value:10, id: "010"},
            {suit: 1, value:1, id: "10"},
            {suit: 2, value:1, id: "20"}
        )
    }
}
CucitaMatchTest.prototype = new CucitaMatch();

function CirullaMatchTest() 
{
    this.name = "Cirulla match test";
    this.cardsToPlayers = 3;
    CardsGroup.prototype.populate = function() 
    {
        this.push(
            {suit: 0, value:1, id: "01"},
            {suit: 0, value:2, id: "02"},
            {suit: 0, value:3, id: "03"},
            {suit: 0, value:4, id: "04"},
            {suit: 0, value:5, id: "05"},
            {suit: 0, value:6, id: "06"},
            {suit: 0, value:7, id: "07"},
            {suit: 0, value:8, id: "08"},
            {suit: 0, value:9, id: "09"},
            {suit: 0, value:10, id: "010"},
            {suit: 1, value:1, id: "10"},
            {suit: 2, value:1, id: "20"}
        )
    }
}
CirullaMatchTest.prototype = new CirullaMatch();

function ReBelloMatchTest() 
{
    this.name = "Re Bello match test";
    this.cardsToPlayers = 1;
    CardsGroup.prototype.populate = function() 
    {
        while (this.length > 0)
        {
            this.pop();
        }
        for (var i=0; i<4; i++) {
            for (var j=9; j<11; j++) {
                this.push({"suit": i, "value": j, "id": j+10*i});
            }
        }
    }
}
ReBelloMatchTest.prototype = new ReBelloMatch();

function TestGame() 
{
    this.name = "Test Game";
    this.number_of_players = [2];
}

TestGame.prototype.response = function() {
    return {infos:[], cards:[], moves:[]}
}

TestGame.prototype.send = function(message)
{
    console.log(message);
    if (message.command === "info")
        return {
            "name": this.name,
            "number_of_players": this.number_of_players,
            "description": ""
        };
    else
        return this.response();
}

//Summary test
function SummaryTest() 
{
    this.name = "Summary test";
}

SummaryTest.prototype = new TestGame();

SummaryTest.prototype.response = function() {
    return {
        infos: [
            {
                info: "summary",
                data: [{
                     players: ["test1", "test2"],
                     primiera: Math.floor(Math.random()*10),
                     cards: 23,
                     sevenOfCoins: 1,
                     coins: 1,
                     scopa: 0,
                     partial: 2,
                     total: 2 
                },{
                     players: ["test3", "test4"],
                     primiera: 1,
                     cards: 17,
                     sevenOfCoins: 0,
                     coins: 9,
                     scopa: Math.floor(Math.random()*10),
                     partial: 2,
                     total: 2 
                }]
            }
        ],
        cards: [],
        moves: []
    }
}

//Cards choice test
function CardsChoiceTest() 
{
    this.name = "Cards choice";
}

CardsChoiceTest.prototype = new TestGame();

CardsChoiceTest.prototype.response = function() {
    return {
        infos: [
            {
                info: "choice",
                data: [
                    [
                        {suit:0, value: 3, id: "1"},
                        {suit:2, value: 5, id: "2"},
                        {suit:1, value: 1, id: "3"}
                    ],
                    [
                        {suit:0, value: 4, id: "4"},
                        {suit:2, value: 5, id: "2"}
                    ]
                ]
            }
        ],
        cards: [],
        moves: []
    }
}

//Match end test
function MatchEndTest() 
{
    this.name = "Match end";
}

MatchEndTest.prototype = new TestGame();

MatchEndTest.prototype.response = function() {
    return {
        infos: [
            {
                info: "winner",
                data: Math.floor(Math.random()*10)
            }
        ],
        cards: [],
        moves: []
    }
}


app.registerGame(SummaryTest);
app.registerGame(CardsChoiceTest);
app.registerGame(MatchEndTest);
app.registerGame(ClassicMatchTest);
app.registerGame(ScoponeMatchTest);
app.registerGame(CirullaMatchTest);
app.registerGame(CucitaMatchTest);
app.registerGame(ReBelloMatchTest);
