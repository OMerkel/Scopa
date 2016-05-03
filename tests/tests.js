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

function TestGame() 
{
    this.name = "Test Game";
    this.number_of_players = [0];
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


app.registerGame(SummaryTest);
app.registerGame(CardsChoiceTest);
