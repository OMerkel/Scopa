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

function ClassicMatch() 
{
    this.name = "Classic Scopa";
    this.number_of_players = [2,4];
    
    this.cardsToPlayers = 3;
    this.cardsToTable = 4;
    
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
}

ClassicMatch.prototype.start = function(players)
{
    response = {
        "cards": [],
        "moves": [],
        "infos": []
    }
    
    var cards = [];
    
    this._reset = false;
    this._pendingMove = null;
    this.players = [];
    
    if (players.length === 2) {
        this.teams = [
        {
            "name": players[0].name,
            "takenCards": new CardsGroup("deck", "cards_0", [players[0].name]),
            "points": 0
        },
        {
            "name": players[1].name,
            "takenCards": new CardsGroup("deck", "cards_1", [players[1].name]),
            "points": 0
        }
        ];
        
        for (var i=0; i<2; i++) {
            var player = new Player(players[i].name, players[i].type, this.teams[i]);
            this.players.push(player);
            player.hand.length = this.cardsToPlayers;
            cards.push(player.hand.toObject(), this.teams[i].takenCards.toObject());
            player.hand.length = 0;
        }
    }
    
    if (players.length === 4) {
        this.teams = [
        {
            "name": players[0].name+"/"+players[2].name,
            "takenCards": new CardsGroup("deck", "cards_0", [players[0].name, players[2].name]),
            "points": 0
        },
        {
            "name": players[1].name+"/"+players[3].name,
            "takenCards": new CardsGroup("deck", "cards_1", [players[1].name, players[3].name]),
            "points": 0
        }
        ];
        
        for (var i=0; i<4; i++) {
            var player = new Player(players[i].name, players[i].type, this.teams[i%2])
            this.players.push(player);
            player.hand.length = this.cardsToPlayers;
            cards.push(player.hand.toObject());
            player.hand.length = 0;
            
        }
        cards.push(this.teams[0].takenCards.toObject(),
            this.teams[1].takenCards.toObject()
        )
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

ClassicMatch.prototype.hideCards = function(move)
{
    for (var i=0; i<move.cards.length; i++)
    {
        move.cards[i].value = 0;
        move.cards[i].suit  = 0;
    }
    
    return move;
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
        
        if (i != 0) move = this.hideCards(move);
        
        response.moves.push(move);        
        response.cards.push(this.players[i].hand.toObject());
    }
    response.cards.push(this.deck.toObject());
}

ClassicMatch.prototype.send = function(message)
{
    if (message.command === "info")
        return {
            "name": this.name,
            "number_of_players": this.number_of_players,
            "description": ""
        };
    
    if (message.command === "start")
        return this.start(message.data);
    
    if (message.command === "next")
    {
        var response = {
            "cards": [],
            "moves": [],
            "infos": []
        }

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
        
        if (this._pendingMove)
        {
            return this.completeMove();
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
                    this._pendingMove = this.tableCards.toArray();
                    return this.completeMove(this.lastTaker);
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
                bestMove = this.cpuBestMove();
                response = this.playCard(bestMove[0], bestMove[1]);
            }
        }
        return response;
    }
    
    if (message.command === "human_play")
    {
        var response = {
            "cards": [],
            "moves": [],
            "infos": []
        }
        if (message.data.player != this.players[this.currentPlayer].name ||
            this.players[this.currentPlayer].type === "cpu")
            return response;
        
        possibleTakes = this.take(message.data.card, this.tableCards);
        if (possibleTakes.length == 0) possibleTakes.push([]);
        if (possibleTakes.length > 1 && message.data.take === undefined)
        {
            response.infos.push({info: "choice", data: possibleTakes});
        }
        else
        {
            if (message.data.take === undefined) message.data.take = 0;
            response = this.playCard(message.data.card, possibleTakes[message.data.take]);
        }
        return response;
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
    response = {
        "moves": [],
        "cards": [],
        "infos": []
    };
    
    var move = this.players[this.currentPlayer].hand.move(this.tableCards, [card]);
    
    if (cardsToTake.length != 0)
    {
        move.move_on = new Card(cardsToTake[0]);
        this._pendingMove = cardsToTake;
        this._pendingMove.unshift(card);
    }
    else
    {
        this.currentPlayer = this.nextPlayer();
    }
    
    response.moves.push(move);
    
    return response;
}

ClassicMatch.prototype.completeMove = function(player)
{
    response = {
        "moves": [],
        "cards": [],
        "infos": []
    };
    
    if (this._pendingMove)
    {
        if (!player)
        {
            player = this.currentPlayer;
            this.lastTaker = this.currentPlayer;
            this.currentPlayer = this.nextPlayer();
        }
        
        if (this._pendingMove.length == this.tableCards.toArray().length &&
            this.players[this.currentPlayer].hand.length != 0)
        {
            this.players[player].team.takenCards.side_cards.push(new Card(this._pendingMove[0]));
            response.infos.push({"scopa": this.players[player].name});
        }
        
        response.moves.push(this.tableCards.move(this.players[player].team.takenCards, this._pendingMove));
        response.cards.push(this.players[player].team.takenCards.toObject());
        this._pendingMove = null;
    }
    
    return response;
}

ClassicMatch.prototype.countPoints = function() {
    var primieraValues = [0, 16, 12, 13, 14, 15, 18, 21, 10, 10, 10];
    
    var summary = [];
    
    var points = [];
    var partial = [];
    
    for (var i=0; i<this.teams.length; i++)
    {
        points[i] = [0,0,0,0];
        partial[i] = 0;
        
        //cards
        points[i][0] = (this.teams[i].takenCards.length);
        
        var suitsValues = [0,0,0,0];
        
        for (var j=0; j<this.teams[i].takenCards.length; j++)
        {
            if (primieraValues[this.teams[i].takenCards[j].value] > suitsValues[this.teams[i].takenCards[j].suit])
                suitsValues[this.teams[i].takenCards[j].suit] = primieraValues[this.teams[i].takenCards[j].value];
            
            if (this.teams[i].takenCards[j].suit === 0)
            {
                //coins
                points[i][3] += 1;
                
                //seven bello
                if (this.teams[i].takenCards[j].value === 7) points[i][2] = 1;
            }
        }
        
        //primiera
        points[i][1] = suitsValues[0]+suitsValues[1]+suitsValues[2]+suitsValues[3];
        
        partial[i] += this.teams[i].takenCards.side_cards.length;
    }
    
    for (var j=0; j<points[0].length; j++) {
        var max = 0;
        var same = false;
        for (var i=1; i<this.teams.length; i++)
        {
            if (points[i][j] > points[max][j])
            {
                max = i;
                same = false;
            }
            
            else if (points[i][j] === points[max][j])
            {
                same = true;
            }
        }
        
        if (!same) partial[max] += 1;
    }
    
    for (var i=0; i<this.teams.length; i++) {
        this.teams[i].points += partial[i];
        
        summary.push({
            "players": this.teams[i].takenCards.owners,
            "cards": points[i][0],
            "primiera": points[i][1],
            "seven_of_coins": points[i][2],
            "coins": points[i][3],
            "scopa": this.teams[i].takenCards.side_cards.length,
            "partial": partial[i],
            "total": this.teams[i].points
        });
        this.teams[i].takenCards.reset();
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
