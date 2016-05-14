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
    this.assignedPoints = ["cards", "primiera", "seven_of_coins", "coins", "re_bello"];
    
    var classic = new ClassicMatch();
    this.aiValues = classic.aiValues;
    
    this.aiValues.take_re_bello = function (mem) {return 20};
    
    this.cardsToPlayers = 3;
    this.cardsToTable = 4;
}

ReBelloMatch.prototype = new ClassicMatch();

ReBelloMatch.prototype.extraPoints = function(teamSummary)
{
    teamSummary.re_bello = 0;
    for (var j=0; j<teamSummary.coins.length; j++)
    {
        if (teamSummary.coins[j].value === 10)
            teamSummary.re_bello = 1;
    }
    teamSummary.coins = teamSummary.coins.length;
    teamSummary.partial = teamSummary.scopa;
    
    return teamSummary;
}
