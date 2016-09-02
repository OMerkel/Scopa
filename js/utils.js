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

function combinations(n) {
    if (n==0) {return [];}
    var result = [];
    var lastLayer = [];
    for (var i=0; i<n; i++) {
        lastLayer.push([i]);
    }
    while (lastLayer[0].length < n) {
        var newLayer = [];
        for (var i=0; i<lastLayer.length; i++) {
            for (var j=lastLayer[i][lastLayer[i].length-1]+1; j<n; j++) {
                newLayer.push(lastLayer[i].concat([j]));
            }
        }
        result = result.concat(lastLayer);
        lastLayer = newLayer;
    }
    return result.concat(lastLayer);
}

function Card(card)
{
    if (card) {
        this.suit = card.suit;
        this.value = card.value;
        this.id = card.id;
        this.new_value = card.new_value;
    }
}

function CardsGroup(type, id, owners)
{
    this.type = type;
    this.id = id;
    this.owners = owners;
    this.covered = true;
    this.side_cards = [];
}

CardsGroup.prototype = new Array;

CardsGroup.prototype.toObject = function()
{
    return {
        "id": this.id,
        "type": this.type,
        "owners": this.owners,
        "covered": this.covered,
        "length": this.length,
        "side_cards": this.side_cards
    }
}

CardsGroup.prototype.toArray = function() 
{
    var array = [];
    for (var i=0; i<this.length; i++) {
        if (this[i]) {array.push(this[i]);}
    }
    return array;
}

CardsGroup.prototype.getById = function(id) 
{
    for (var i=0; i<this.length; i++) {
        if (this[i].id == id) {
            return this[i];
        }
    }
}

CardsGroup.prototype.popById = function(id) 
{
    for (var i=0; i<this.length; i++) {
        if (this[i].id == id) {
            return this.splice(i,1)[0];
        }
    }
}

CardsGroup.prototype.insert = function(card) 
{
    var i=0;
    while (this[i]) {i++;}
    this.splice(i, 1, card);
    return i;
}

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

CardsGroup.prototype.mix = function() 
{
    for (var i=0; i<this.length; i++) 
    {
        var j = Math.floor(Math.random()*this.length);
        var tmp = this[i];
        this[i] = this[j];
        this[j] = tmp;
    }
    if (this.type === "deck")
    {
        for (var i=0; i<this.length; i++)
        {
            this[i].id=i;
        }
    }
}

CardsGroup.prototype.move = function(dest, arg)
{
    var move = {
        source: this.id,
        dest: dest.id,
        cards: [],
        visible: !(dest.type === "hand"),
        visible_to: (dest.type === "hand") ? dest.owners[0] : undefined
    };
    if (typeof arg === "number")
    {
        for (var i=0; i<arg; i++)
        {
            var card = this.pop();
            dest.push(card);
            move.cards.push(new Card(card));
        }
    }
    else
    {
        for (var i=0; i<arg.length; i++)
        {
            var card = this.popById(arg[i].id);
            move.cards.push(new Card(card));
            dest.push(card);
        }
    }
    return move;
}

CardsGroup.prototype.reset = function()
{
    while (this.pop()) {}
    this.side_cards = [];
}

function Player(name, type, team) 
{
    this.type = type;
    this.name = name;
    this.team = team;
    this.hand = new CardsGroup("hand", "hand_"+name, [name]);
    if (type == "cpu")
    {
        this.memory = {};
    }
}

Player.prototype.value = function(par, values) 
{
    //console.log(this.name);
    var value = 0;
    for (var key in par) {
        if (key in values)
        {
            value += par[key]*values[key](this.memory);
            //console.log(key, par[key], par[key]*values[key](this.memory));
        }
    }
    //console.log(value);
    return value;
}

Player.prototype.update_memory = function(cards, scopa) 
{
    this.memory['points'] = this.points + scopa;
    
    for (var i=0; i<cards.length; i++) {
        if (cards[i].value == 7) {this.memory['7'] += 1}
        if (cards[i].suit == 0) {this.memory['coins'] += 1} 
    }
}

function Response(infos=[], moves=[], cards=[])
{
    this.infos = infos;
    this.moves = moves;
    this.cards = cards;
}

//export node.js server module
if (typeof module !== "undefined")
{
    module.exports = {
        combinations: combinations,
        Card: Card,
        CardsGroup: CardsGroup,
        Player: Player,
        Response: Response
    };
}
