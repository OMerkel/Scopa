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
    global.ClassicMatch = require("./classic.js").GameClass;
}

function CirullaMatch() 
{
    this.name = "Cirulla";
    this.number_of_players = [[2,1],[2,2]];    
    this.victoryPoints = 51;
    
    var classic = new ClassicMatch();
    this.aiValues = classic.aiValues;
    
    this.aiValues.opponent_certain_take_after = function (mem) {return -5};
    this.aiValues.opponent_certain_scopa_after = function (mem) {return -20};
    
    this.cardsToPlayers = 3;
    this.cardsToTable = 4;
}

CirullaMatch.prototype = new ClassicMatch();

CirullaMatch.prototype.giveCardsToPlayers = function(response)
{
    for (var i=0; i<this.players.length; i++)
    {
        var move = this.deck.move(this.players[i].hand, this.cardsToPlayers);
        
        var faceup = false
        var sum = 0;
        var sevenBello = null;
        
        for (var j=0; j<move.cards.length; j++)
        {
            sum += move.cards[j].value;
            if (move.cards[j].value == 7 && move.cards[j].suit == 0)
                sevenBello = j;
        }
        
        if (sum <= 9)
        {
            faceup = true;
            this.players[i].team.takenCards.side_cards.length += 3;
            response.infos.push({info: "cards_value_lt_10", data: this.players[i].name});
        }
        
        else if (sum <= 15 && sevenBello)
        {
            faceup = true;
            this.players[i].team.takenCards.side_cards.length += 3;
            response.infos.push({info: "cards_value_lt_10", data: this.players[i].name});
            
            move.cards[sevenBello].new_value = 1;
            this.players[i].hand[sevenBello].new_value = 1;
        }
        
        if (move.cards[0].value == move.cards[1].value &&
            move.cards[1].value == move.cards[2].value)
        {
            faceup = true;
            this.players[i].team.takenCards.side_cards.length += 10;
            response.infos.push({info: "3_equal_cards", data: this.players[i].name});
        }
        else if (move.cards[0].value == move.cards[1].value && sevenBello == 2||
            move.cards[0].value == move.cards[2].value && sevenBello == 1||
            move.cards[1].value == move.cards[2].value && sevenBello == 0)
        {
            faceup = true;
            this.players[i].team.takenCards.side_cards.length += 10;
            response.infos.push({info: "3_equal_cards", data: this.players[i].name});
            
            var cardIndex = sevenBello == 0 ? 1 : 0;
            move.cards[sevenBello].new_value = this.players[i].hand[cardIndex].value;
            this.players[i].hand[sevenBello].new_value = this.players[i].hand[cardIndex].value;
        }
        
        if (faceup)
        {
            this.players[i].hand.covered = false;
            response.cards.push(this.players[i].team.takenCards.toObject());
        }
        else
            this.players[i].hand.covered = true;
        
        if (!this.players[i].hand.covered)
        {
            move.visible = true;
            move.visible_to = undefined;
        }
        
        response.moves.push(move);        
        response.cards.push(this.players[i].hand.toObject());
    }
    response.cards.push(this.deck.toObject());
}

CirullaMatch.prototype.take = function(card, tableCards) {
    var result = [];
    var cardValue = card.new_value ? card.new_value : card.value;

    var combinationsArray = combinations(tableCards.length);
    for (var i=0; i<combinationsArray.length; i++) {
        var tableValue = 0;
        for (var j=0; j<combinationsArray[i].length; j++) {
            if (tableCards[combinationsArray[i][j]].new_value)
                tableValue = tableValue + tableCards[combinationsArray[i][j]].new_value;
            else
                tableValue = tableValue + tableCards[combinationsArray[i][j]].value;
            combinationsArray[i][j] = tableCards[combinationsArray[i][j]];
        }
        if (tableValue == cardValue) {
            result.push(combinationsArray[i]);
        }
        else if (tableValue + cardValue == 15) {
            result.push(combinationsArray[i]);
        }
    }
    
    var ace = false;
    var tableCardsArray = [];
    
    for (var i=0; i<tableCards.length; i++) {
        if (tableCards[i].value == 1 || tableCards[i].new_value == 1) ace = true;
        tableCardsArray.push(tableCards[i]);
    }
    
    if (cardValue == 1 && !ace)
        result.push(tableCardsArray);
    
    return result;
}

CirullaMatch.prototype.extraPoints = function(teamSummary)
{
    var fromBottom = 0;
    var fromTop = 0;
    
    if (teamSummary.coins.length === 10)
    {
        teamSummary.total = 51;
    }
    else
    {
        for (var i=1; i<=10; i++)
        {
            for (var j=0; j<teamSummary.coins.length; j++)
            {
                if (teamSummary.coins[j].value == i && fromBottom == i-1)
                    fromBottom += 1;
                if (teamSummary.coins[j].value == 11-i && fromTop == i-1)
                    fromTop += 1;
            }
        }
        fromTop = fromTop >= 3 ? fromTop : 0;
        fromBottom = fromBottom >= 3 ? fromBottom : 0;
    }
    
    teamSummary.scopa += fromTop + fromBottom;
    teamSummary.coins = teamSummary.coins.length;
    teamSummary.partial = teamSummary.scopa;
    
    
    
    return teamSummary;
}

//export node.js server module
if (typeof module !== "undefined")
{
    module.exports = {
        GameClass: CirullaMatch
    };
}
