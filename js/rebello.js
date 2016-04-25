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

function ReBelloMatch() 
{
    this.name = "Re Bello";
    this.number_of_players = [2, 4];    
    this.victoryPoints = 11;
    
    var classic = new ClassicMatch();
    this.aiValues = classic.aiValues;
    
    this.aiValues.take_re_bello = function (mem) {return 20};
    
    this.cardsToPlayers = 3;
    this.cardsToTable = 4;
}

ReBelloMatch.prototype = new ClassicMatch();

ReBelloMatch.prototype.countPoints = function() {
    var primieraValues = [0, 16, 12, 13, 14, 15, 18, 21, 10, 10, 10];
    
    var summary = {
        "keys": ["Teams", "Cards", "Primiera", "Seven of Coins", "Re Bello",
                 "Coins", "Scope", "Partial", "Total"],
        "values": []
    }
    
    var points = [];
    var partial = [];
    
    for (var i in this.teams)
    {
        points[i] = [0,0,0,0,0];
        partial[i] = 0;
        
        //cards
        points[i][0] = (this.teams[i].takenCards.length);
        
        var suitsValues = [0,0,0,0];
        
        for (var j in this.teams[i].takenCards)
        {
            if (primieraValues[this.teams[i].takenCards[j].value] > suitsValues[this.teams[i].takenCards[j].suit])
                suitsValues[this.teams[i].takenCards[j].suit] = primieraValues[this.teams[i].takenCards[j].value];
            
            if (this.teams[i].takenCards[j].suit === 0)
            {
                //coins
                points[i][3] += 1;
                
                //seven bello
                if (this.teams[i].takenCards[j].value === 7) points[i][2] = 1;
                
                //re bello
                if (this.teams[i].takenCards[j].value === 7) points[i][4] = 1;
            }
        }
        
        //primiera
        points[i][1] = suitsValues[0]+suitsValues[1]+suitsValues[2]+suitsValues[3];
        
        partial[i] += this.teams[i].scope;
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
        
        summary.values.push({
            "Teams": this.teams[i].takenCards.owners,
            "Cards": points[i][0],
            "Primiera": points[i][1],
            "Seven of Coins": points[i][2],
            "Re Bello": points[i][4],
            "Coins": points[i][3],
            "Scope": this.teams[i].scope,
            "Partial": partial[i],
            "Total": this.teams[i].points
        });
        this.teams[i].takenCards.reset();
        this.teams[i].scope = 0;
    }
    return summary;
}
