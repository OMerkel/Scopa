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

if (typeof module !== "undefined")
{
    var scopa_utils = require("./utils.js");
    global.combinations = scopa_utils.combinations;
    global.Card = scopa_utils.Card;
    global.CardsGroup = scopa_utils.CardsGroup;
    global.Player = scopa_utils.Player;
    global.Response = scopa_utils.Response;
}

function ClassicMatch() 
{
    this.name = "Classic Scopa";
    this.number_of_players = [[2,1],[2,2]];
    
    this.cardsToPlayers = 3;
    this.cardsToTable = 4;
    
    this.assignedPoints = ["cards", "primiera", "seven_of_coins", "coins"];
    
    this.aiValues = {
        no_takes_2_equal_cards:         function (mem) {return 1},
        no_takes_not_coin:              function (mem) {return 2},
        no_takes_not_seven:             function (mem) {return 1},
        no_takes_lower_card:            function (mem) {return 1},
        no_takes_not_seven_on_table:    function (mem) {return 1},
        no_takes_possible_take_after:   function (mem) {return 1},
        no_takes_opponent_scopa_after:  function (mem) {return -6},
        
        scopa:                          function (mem) {return 20},
        opponent_scopa_after:           function (mem) {return -6},

        no_cards_not_coin:              function (mem) {return 1},
        no_cards_not_seven:             function (mem) {return 1},
        no_cards_lower_card:            function (mem) {return 1},
        
        take_one_card:                  function (mem) {return 1},
        take_one_coin:                  function (mem) {return ((0 || mem['denari']) < 6)*3},
        take_one_seven:                 function (mem) {return ((0 || mem['7']) < 3)*4},
        take_seven_bello:               function (mem) {return 20},
        take_one_six:                   function (mem) {return 6},
        take_one_ace:                   function (mem) {return 1},
    }
    
    this.victoryPoints = 11;
    
    this._responsesQueue = [];
}

ClassicMatch.prototype.start = function(teams)
{
    if (teams.length !== 2) return;
    
    this._responsesQueue = [];
    var response = new Response();
    
    var cards = [];
    
    this._reset = false;
    this.players = [];
    this.teams = [];
    
    for (var i=0; i<teams.length; i++)
    {
        var name = teams[i][0].name;
        var owners = [teams[i][0].name];
        
        if (teams[i].length === 2)
        {
            name = `${teams[i][0].name}/${teams[i][1].name}`;
            owners = [teams[i][0].name, teams[i][1].name];
        }

        this.teams.push({
            "name": teams[i][0].name,
            "takenCards": new CardsGroup("deck", `cards_${i}`, owners),
            "points": 0
        });
        
        cards.push(this.teams[i].takenCards.toObject())
    }
    
    for (var j=0; j<teams[0].length; j++)
    {
        for (var i=0; i<teams.length; i++)
        {
            var player = new Player(teams[i][j].name, teams[i][j].type, this.teams[i]);
            this.players.push(player);
            player.hand.length = this.cardsToPlayers;
            cards.push(player.hand.toObject());
            player.hand.length = 0;
        }
    }
    
    this.deck = new CardsGroup("deck", "main_deck", []);
    this.deck.populate();
    this.deck.mix();
    this.tableCards = new CardsGroup("table", "table_cards", []);
    this.tableCards.covered = false;
    this.lastTaker = 0;
    this.currentPlayer = Math.floor(Math.random()*this.players.length);
    
    cards.push(this.deck.toObject(), this.tableCards.toObject());
    
    response.infos.push({"info": "cards_description", "data": cards});
    
    return response;
}

ClassicMatch.prototype.nextPlayer = function()
{
    return (this.currentPlayer+1 >= this.players.length) ? 0 : this.currentPlayer+1;
}

ClassicMatch.prototype.giveCardsToPlayers = function(response)
{
    for (var i=0; i<this.players.length; i++)
    {
        var move = this.deck.move(this.players[i].hand, this.cardsToPlayers);
        
        response.moves.push(move);        
        response.cards.push(this.players[i].hand.toObject());
    }
    response.cards.push(this.deck.toObject());
}

ClassicMatch.prototype.send = function(message)
{    
    if (message.command === "info")
        return new Response([{
            "name": this.name,
            "number_of_players": this.number_of_players,
            "description": ""
        }]);
    
    if (message.command === "start")
        return this.start(message.data);
    
    if (message.command === "next")
    {
        if (this._responsesQueue.length > 0)
            return this._responsesQueue.shift();
        
        var response = new Response();

        if (this._reset)
        {
            var winner = this.winner()
            if (winner > -1)
            {
                response.infos.push({"info": "winner", "data": this.teams[winner].takenCards.owners});
                return response;
            }
            this._reset = false;
            this.deck.populate();
            this.deck.mix();
            this.currentPlayer = this.nextPlayer();
            response.cards.push(this.deck.toObject(), this.teams[0].takenCards.toObject(),
                this.teams[1].takenCards.toObject()
            );
        }
        
        if (this.players[this.currentPlayer].hand.length === 0)
        {
            if (this.deck.length === 40) //match start
            {
                if (this.cardsToTable > 0)
                    response.moves.push(this.deck.move(this.tableCards, this.cardsToTable));
                response.infos.push({"info": "first_player", "data": this.players[this.currentPlayer].name});
                response.cards.push(this.tableCards.toObject());
            }
            if (this.deck.length > 0) //give cards
            {
                this.giveCardsToPlayers(response);
            }
            else //match end
            {
                if (this.tableCards.toArray().length > 0)
                {
                    var move = this.tableCards.move(this.players[this.lastTaker].team.takenCards, this.tableCards.toArray());
                    return new Response([], [move]);
                }
                this._reset = true;
                response.infos.push({"info": "summary", "data": this.countPoints()});
            }
        }
        else
        {
            if (this.players[this.currentPlayer].type === "human")
            {
                response.infos.push({"info": "waiting", "data": this.players[this.currentPlayer].name});
            }
            else if (this.players[this.currentPlayer].type === "cpu")
            {
                var bestMove = this.cpuBestMove();
                response = this.playCard(bestMove[0], bestMove[1]);
            }
        }
        return response;
    }
    
    if (message.command === "human_play")
    {        
        if (message.data.player !== this.players[this.currentPlayer].name ||
            this.players[this.currentPlayer].type === "cpu")
            return new Response();
        
        var card = this.players[this.currentPlayer].hand.getById(message.data.card);
        console.log(card, message.data.card);
        var possibleTakes = this.take(card, this.tableCards);
        if (possibleTakes.length == 0) possibleTakes.push([]);
        
        if (possibleTakes.length > 1 && message.data.take === undefined)
            return new Response([{
                info: "choice",
                data: {
                    player: this.players[this.currentPlayer].name,
                    takes: possibleTakes
                }
            }]);

        if (message.data.take === undefined) message.data.take = 0;
        
        return this.playCard(card, possibleTakes[message.data.take]);
    }
}

/*
 * card = Card
 * result = [[Card, Card...]...]
 */
ClassicMatch.prototype.take = function(card, tableCards) {
    var result = [];
    for (var i=0; i<tableCards.length; i++) {
        if (card.value == tableCards[i].value) {
            result.push([tableCards[i]]);
        }
    }
    
    if (result.length == 0) {
        var combinationsArray = combinations(tableCards.length);
        for (var i=0; i<combinationsArray.length; i++) {
            var value = 0;
            for (var j=0; j<combinationsArray[i].length; j++) {
                value = value + tableCards[combinationsArray[i][j]].value;
                combinationsArray[i][j] = tableCards[combinationsArray[i][j]];
            }
            if (value == card.value) {
                result.push(combinationsArray[i]);
            }
        }
    }
    
    return result;
}

// return = [Card, [Card,Card...]]
ClassicMatch.prototype.cpuBestMove = function() {
    var aiCards = this.players[this.currentPlayer].hand.toArray();
    var plays = [];
    var notTakes = true;
    for (var i=0; i<aiCards.length; i++) {
        var possibleTakes = this.take(aiCards[i], this.tableCards);
        if (possibleTakes.length != 0) {
            notTakes = false;
        }
        else {
            plays.push([aiCards[i], []]);
        }
        for (var j=0; j<possibleTakes.length; j++) {
            plays.push([aiCards[i], possibleTakes[j]]);
        }
    }

    if (plays.length == 1) {
        return [plays[0][0], plays[0][1]];
    }
    
    var best = [aiCards[0], [], -1000];

    for (var i=0; i<plays.length; i++)
    {
        var par = {};
        if (notTakes) //0 takes
        {
            //2 equal cards
            var n=0;
            for (var j=0; j<aiCards.length; j++) {
                if (aiCards[j].value == plays[i][0].value) {
                    n++;
                }
            }
            par.no_takes_2_equal_cards = (n >= 2);
            
            //not coin
            par.no_takes_not_coin = (plays[i][0].suit != 0);
            
            //not seven
            par.no_takes_not_seven = (plays[i][0].value != 7);
            
            //lower card
            n = 0
            for (var j=0; j<aiCards.length; j++) {
                if (aiCards[j].value >= plays[i][0].value) {
                    n++;
                }
            }
            par.no_takes_lower_card = (n == aiCards.length);
            
            //not seven on table
            var tableCards = this.tableCards.toArray();
            tableCards.push(plays[i][0]);
            par.no_takes_not_seven_on_table = (this.take({suit: 0,value: 7}, tableCards).length != 0);
            
            //take after
            var takeAfter = 0;
            for (var j=0; j<aiCards.length; j++) {
                if (aiCards[j] != plays[i][0]) {
                    if (this.take(aiCards[j], tableCards).length != 0) {
                        takeAfter = 1;
                    }
                }
            }
            
            par.no_takes_possible_take_after = takeAfter;
            
            //next player uncovered cards
            if (this.players[this.nextPlayer()].hand.covered == false)
            {
                for (var j=0; j<this.players[this.nextPlayer()].hand.length; j++)
                {
                    opponentTakes = this.take(this.players[this.nextPlayer()].hand[j], tableCards);
                    for (var k=0; k<opponentTakes.length; k++)
                    {
                        par.opponent_certain_take_after = 1;
                        if (opponentTakes[k].length == tableCards.length)
                        {
                            par.opponent_certain_scopa_after = 1;
                            break;
                        }
                    }
                }
            }
            
            //opponent scopa after
            var tableValue = plays[i][0].value;
            for (var j=0; j<tableCards.length; j++) {
                tableValue += tableCards[j].value;
            }
            par.no_takes_opponent_scopa_after = (tableValue <= 10);
        }
        else //at least 1 take
        {
            //scopa
            par.scopa = (plays[i][1].length == this.tableCards.length);
            
            var tableValue = 0
            var leftTableCards = [];
            for (var j=0; j<this.tableCards.length; j++) {
                if (plays[i][1].indexOf(this.tableCards[j]) < 0) {
                    tableValue += this.tableCards.value;
                    leftTableCards.push(this.tableCards[j])
                }
            }
            if (plays[i][1].length === 0) {
                tableValue += plays[i][0].value;
                leftTableCards.push(plays[i][0]);
            }
            
            //next player uncovered cards
            if (this.players[this.nextPlayer()].hand.covered == false)
            {
                for (var j=0; j<this.players[this.nextPlayer()].hand.length; j++)
                {
                    opponentTakes = this.take(this.players[this.nextPlayer()].hand[j], leftTableCards);
                    for (var k=0; k<opponentTakes.length; k++)
                    {
                        par.opponent_certain_take_after = 1;
                        if (opponentTakes[k].length == leftTableCards.length)
                        {
                            par.opponent_certain_scopa_after = 1;
                            break;
                        }
                    }
                }
            }
            
            else
            {
                //opponent scopa after
                par.opponent_scopa_after = (tableValue <= 10 && tableValue != 0);
            }
            
            if (plays[i][1].length == 0) //take nothing with this card
            {
                //not coin
                par.no_cards_not_coin = (plays[i][0].suit != 0);
                
                //not seven
                par.no_cards_not_seven = (plays[i][0].value != 7);
                
                //lower card
                n=0;
                for (var j=0; j<aiCards.length; j++) {
                    if (aiCards[j].value > plays[i][0].value) {
                        n++;
                    }
                }
                par.no_cards_lower_card = (n == aiCards.length);
            }
            
            else //take something
            {
                par.take_one_card = 0;
                par.take_one_coin = 0;
                par.take_re_bello = 0;
                par.take_one_seven = 0;
                par.take_seven_bello = 0;
                par.take_one_six = 0;
                par.take_one_ace = 0;
                
                plays[i][1].push(plays[i][0]);
                
                //number of taken cards
                par.take_one_card = plays[i][1].length;
                
                for (var j=0; j<plays[i][1].length; j++) {
                    //number of coins
                    if (plays[i][1][j].suit == 0)
                    {
                        par.take_one_coin += 1;
                        
                        //seven bello
                        if (plays[i][1][j].value == 7)
                        {
                            par.take_seven_bello = 1;
                        }
                        
                        //re bello
                        if (plays[i][1][j].value == 10)
                        {
                            par.take_re_bello = 1;
                        }
                    }
                    
                    //number of seven
                    if (plays[i][1][j].value == 7) par.take_one_seven += 1;
                    
                    //number of six
                    if (plays[i][1][j].value == 6) par.take_one_six += 1;

                    //number of aces
                    if (plays[i][1][j].value == 1) par.take_one_ace += 1;
                }
                
                plays[i][1].pop();
            }
        }
        
        var value = this.players[this.currentPlayer].value(par, this.aiValues);
            
        if (value > best[2]) {
            best[0] = plays[i][0];
            best[1] = plays[i][1];
            best[2] = value;
        }
    }
    
    this.players[this.currentPlayer].update_memory(best[1], best[1].length == this.tableCards.length);
    return [best[0], best[1]];
}

/*
 * card = Card
 * cardsToTake = [Card,Card...]
 */
ClassicMatch.prototype.playCard = function(card, cardsToTake) {
    //move 'card' to tableCards 
    var move = this.players[this.currentPlayer].hand.move(this.tableCards, [card]);    
    
    if (cardsToTake.length != 0)
    {
        move.move_on = new Card(cardsToTake[0]);
        this.lastTaker = this.currentPlayer;
        
        cardsToTake.push(card);
        
        var nextResponse = new Response();
        
        //check if there is a Scopa
        if (cardsToTake.length === this.tableCards.toArray().length &&
            !(this.players[this.nextPlayer()].hand.length === 0 && this.deck.length === 0))
        {
            this.players[this.currentPlayer].team.takenCards.side_cards.push(new Card(card));
            nextResponse.infos.push({"scopa": this.players[this.currentPlayer].name});
        }
        nextResponse.moves.push(this.tableCards.move(this.players[this.currentPlayer].team.takenCards, cardsToTake));
        this._responsesQueue.push(nextResponse);
        
        this._responsesQueue.push(new Response([], [], [this.players[this.currentPlayer].team.takenCards.toObject()]));
    }
    
    this.currentPlayer = this.nextPlayer();
    
    return new Response([], [move]);
}

ClassicMatch.prototype.assignPoints = function(summary)
{
    for (var i=0; i<this.assignedPoints.length; i++)
    {
        var max = 0;
        var same = false;
        for (var j=1; j<summary.length; j++)
        {
            if (summary[j][this.assignedPoints[i]] > summary[max][this.assignedPoints[i]])
            {
                max = j;
                same = false;
            }
            
            else if (summary[j][this.assignedPoints[i]] === summary[max][this.assignedPoints[i]])
            {
                same = true;
            }
        }
        
        if (!same) summary[max].partial += 1;
    }
}


ClassicMatch.prototype.extraPoints = function(teamSummary)
{
    teamSummary.coins = teamSummary.coins.length;
    teamSummary.partial = teamSummary.scopa;
    
    return teamSummary;
}

ClassicMatch.prototype.countPoints = function() {
    var primieraValues = [0, 16, 12, 13, 14, 15, 18, 21, 10, 10, 10];
    
    var summary = [];
    
    for (var i=0; i<this.teams.length; i++)
    {
        var teamSummary = {
            players: this.teams[i].takenCards.owners,
            cards: this.teams[i].takenCards.length,
            primiera: 0,
            seven_of_coins: 0,
            coins: [],
            scopa: this.teams[i].takenCards.side_cards.length
        };
        
        var suitsValues = [0,0,0,0];
        
        for (var j=0; j<this.teams[i].takenCards.length; j++)
        {
            if (primieraValues[this.teams[i].takenCards[j].value] > suitsValues[this.teams[i].takenCards[j].suit])
                suitsValues[this.teams[i].takenCards[j].suit] = primieraValues[this.teams[i].takenCards[j].value];
            
            if (this.teams[i].takenCards[j].suit === 0)
            {
                //coins
                teamSummary.coins.push(new Card(this.teams[i].takenCards[j]));
                
                //seven bello
                if (this.teams[i].takenCards[j].value === 7)
                    teamSummary.seven_of_coins = 1;
            }
        }
        
        //primiera
        teamSummary.primiera = suitsValues[0]+suitsValues[1]+suitsValues[2]+suitsValues[3];
        
        this.extraPoints(teamSummary);
        
        summary.push(teamSummary);
    }
    
    this.assignPoints(summary);
    
    for (var i=0; i<this.teams.length; i++) {
        this.teams[i].takenCards.reset();
        if (!summary[i].total)
            summary[i].total = this.teams[i].points + summary[i].partial;
        
        this.teams[i].points = summary[i].total;
    }
    
    return summary;
}

ClassicMatch.prototype.winner = function() {
    var max = 0;
    var same = false;
    for (var i=1; i<this.teams.length; i++) {
        if (this.teams[i].points > this.teams[max].points) {
            max = i;
            same = false;
        }
        else if (this.teams[i].points === this.teams[max].points) {
            same = true;
        }
    }
    if ((!same) && (this.teams[max].points >= this.victoryPoints)) {
        return max;
    }
    return -1;
}

//export node.js server module
if (typeof module !== "undefined")
{
    module.exports = {
        GameClass: ClassicMatch
    };
}
