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

function get_generator(property, default_value)
{
    return function() {
        return localStorage[property] || default_value;
    }
}

function set_generator(property)
{
    return function(value) {
        localStorage[property] = value;
    }
}

function get_and_check_generator(property, allowed_values, default_value)
{
    if (Array.isArray(allowed_values))
        return function() {
            if (allowed_values.indexOf(localStorage[property]) > -1)
                return localStorage[property];
            else
                return default_value;
        }
    else
        return function() {
            if (allowed_values.hasOwnProperty(localStorage[property]))
                return localStorage[property];
            else
                return default_value;
        }
}

function check_and_set_generator(property, allowed_values)
{
    if (Array.isArray(allowed_values))
        return function(value) {
            if (allowed_values.indexOf(value) > -1)
                localStorage[property] = value;
        }
    else
        return function(value) {
            if (allowed_values.hasOwnProperty(value))
                localStorage[property] = value;
        }
}

var global_variables = {
    types_of_cards: {
        Bergamasche: {number: 40, w: 296, h: 545},
        Napoletane:  {number: 40, w: 331, h: 547},
        Piacentine:  {number: 40, w: 330, h: 584},
        //Francitalia: {number: 40, w: 72,  h: 113},
        //Poker:       {number: 40, w: 75,  h: 113},
        //Scartini:    {number: 40, w: 72,  h: 113},
        //Siciliane:   {number: 40, w: 67,  h: 113},
        //Toscane:     {number: 40, w: 75,  h: 113},
        //Trevisane:   {number: 40, w: 54,  h: 113},
    },
    suits: "dcbs",
    notifications_duration: 5,
}

var properties = {
    cards: {
        get: get_and_check_generator("cards", global_variables.types_of_cards, "Napoletane"),
        set: check_and_set_generator("cards", global_variables.types_of_cards)
    },
    background: {
        get: get_generator("background", "data/backgrounds/green.png"),
        set: set_generator("background")
    },
    username: {
        get: get_generator("username", "Player"),
        set: set_generator("username")
    },
    variant: {
        get: get_generator("variant", "Classic Scopa"),
        set: set_generator("variant")
    },
    number_of_players: {
        get: get_generator("number_of_players", "2"),
        set: set_generator("number_of_players")
    },
}

var settings = {};
Object.defineProperties(settings, properties);
for (key in global_variables)
{
    Object.defineProperty(settings, key, {value: global_variables[key], writable: false});
}

GraphicsManager = function(cardsType)
{
    this.loadCardsLocked = false;
    this.loadedCards = 0;
    this.onLoad = null;
    
    this.canvasCache = {};
    
    this.ch = settings.types_of_cards[cardsType].h;
    this.cw = settings.types_of_cards[cardsType].w;
    
    if (cardsType) this.setCardsType(cardsType);
    else this.setCardsType("Napoletane")
}

GraphicsManager.prototype.updateCardImg = function(img, card)
{
    img.dataset.card = `${card.value}${this.suits[card.suit]}`;
    if (card.new_value) img.dataset.new_value = card.new_value;
    
    this.drawCardImg(img);
}

GraphicsManager.prototype.drawCardImg = function(img)
{
    if (img.dataset.new_value) {
        var canvas = document.createElement("canvas");
        
        canvas.width = this.cw;
        canvas.height = this.ch;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.canvasCache[img.dataset.card],
                      0, 0, this.cw, this.ch,
                      0, 0, this.cw, this.ch);
        
        if (img.dataset.new_value)
        {
            var m = Math.floor(this.cw/10);
            var s = Math.floor(this.ch/8);
            
            ctx.font = `${s}px serif`;
            var text = ctx.measureText(img.dataset.new_value);
            ctx.fillStyle = "red";
            ctx.fillRect(canvas.width-text.width-2*m, 0, text.width+2*m, s+2*m);
            ctx.fillStyle = "black";
            ctx.fillText(img.dataset.new_value, canvas.width-text.width-m, s+m);
            
            img.src = canvas.toDataURL();
        }
    }
    else 
    {
        img.src = this.canvasCache[img.dataset.card].toDataURL();
    }
}

GraphicsManager.prototype.updateDeckImg = function(img, cards)
{
    img.dataset.length = cards.length;
    img.dataset.sideCardsLength = cards.side_cards.length;
    
    var card = cards.side_cards[0];
    for (var i=0; i<cards.side_cards.length; i++)
    {
        if (cards.side_cards[i])
            card = cards.side_cards[i];
    }
    if (card) img.dataset.sideCard = `${card.value}${this.suits[card.suit]}`;
    
    this.drawDeckImg(img);
}

GraphicsManager.prototype.drawDeckImg = function(img)
{
    var numberOfCards = Math.ceil(parseInt(img.dataset.length)/4);
    
    var canvas = document.createElement("canvas");
    canvas.width = 2*this.cw;
    canvas.height = this.ch+20;
    
    var ctx = canvas.getContext("2d");
    
    if (img.dataset.sideCardsLength > 0)
    {
        if (img.dataset.sideCard)
        {
            ctx.drawImage(this.canvasCache[img.dataset.sideCard],
                          0,       0, this.cw, this.ch,
                          this.cw, 0, this.cw, this.ch);
        }
        
        var m = Math.floor(this.cw/10);
        var s = Math.floor(this.ch/8);
        
        ctx.font = `${s}px serif`;
        var text = ctx.measureText(img.dataset.sideCardsLength);
        ctx.fillStyle = "black";
        ctx.fillRect(canvas.width-text.width-2*m, 0, text.width+2*m, s+2*m);
        ctx.fillStyle = "white";
        ctx.fillText(img.dataset.sideCardsLength, canvas.width-text.width-m, s+m);
    }
    
    for (var i=0; i<numberOfCards; i++) {
        ctx.drawImage(this.canvasCache[`0${this.suits[0]}`],
                      0, 0, this.cw, this.ch,
                      i, i, this.cw, this.ch);
    }
    
    img.src = canvas.toDataURL();
}

GraphicsManager.prototype.updateCanvasCache = function(onLoad)
{
    if (this.loadCardsLocked) return;
    
    this.loadCardsLocked = true;
    this.loadedCards = 0;
    this.onLoad = onLoad;
    
    var manager = this;
    
    var resize = function (image, suit, value)
    {
        var canvas = document.createElement("canvas");
        var tmp = document.createElement("canvas");
        
        canvas.width = manager.cw;
        canvas.height = manager.ch;
        
        var n = 1;
        while (n*manager.cw < settings.types_of_cards[manager.cardsType].w)
            n = n*2;
        
        tmp.width = manager.cw*n;
        tmp.height = manager.ch*n;
        tmpCtx = tmp.getContext("2d");
        
        tmpCtx.drawImage(image, 0, 0,
                         settings.types_of_cards[manager.cardsType].w,
                         settings.types_of_cards[manager.cardsType].h,
                         0, 0,
                         manager.cw*n,
                         manager.ch*n);
        
        while (n > 1)
        {
            tmpCtx.drawImage(tmp, 0, 0,
                             manager.cw*n,
                             manager.ch*n,
                             0, 0,
                             manager.cw*(n/2),
                             manager.ch*(n/2));
            n = n/2;
        }
        
        var ctx = canvas.getContext("2d");
        
        //round corners
        var r = Math.floor(manager.cw/8);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(manager.cw-r, 0);
        ctx.arc(manager.cw-r, r, r, -Math.PI/2, 0, false);
        ctx.lineTo(manager.cw, manager.ch-r);
        ctx.arc(manager.cw-r, manager.ch-r, r, 0, Math.PI/2, false);
        ctx.lineTo(r, manager.ch);
        ctx.arc(r, manager.ch-r, r, Math.PI/2, Math.PI, false);
        ctx.lineTo(0, r);
        ctx.arc(r, r, r, -Math.PI, -Math.PI/2, false);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(tmp, 0, 0,
                      manager.cw,
                      manager.ch,
                      0, 0,
                      manager.cw,
                      manager.ch);
        
        manager.canvasCache[`${value}${manager.suits[suit]}`] = canvas;
        
        manager.loadedCards += 1;
        if (manager.loadedCards == settings.types_of_cards[manager.cardsType].number+1)
        {
            if (manager.onLoad) manager.onLoad();
            manager.loadCardsLocked = false;
            manager.onLoad = null;
        }
    }
    
    var img = new Image();
    
    img.onload = function () {
        resize(this, 0, 0);
    }
    
    img.src = `data/cards/${this.cardsType}/bg.jpg`;
    
    for (var suit=0; suit<4; suit++)
    {
        for (var value=0; value<11; value++)
        {
            var img = new Image();
            
            img.onload = (function(suit, value) {
                return function() {resize(this, suit, value)}
            })(suit, value);
            
            img.src = `data/cards/${this.cardsType}/${value}${settings.suits[suit]}.jpg`;
        }
    }
}

GraphicsManager.prototype.updateCards = function()
{
    var manager = this;
    
    this.updateCanvasCache(function() {
        var fixedCards = document.querySelectorAll(".fixedCard");
        for (var i=0; i<fixedCards.length; i++) manager.drawCardImg(fixedCards[i]);
        
        fixedCards = document.querySelectorAll(".fixedDeck");
        for (var i=0; i<fixedCards.length; i++) manager.drawDeckImg(fixedCards[i]);
    });
}

GraphicsManager.prototype.setCardHeight = function(height)
{
    this.ch = Math.floor(height);
    this.cw = Math.floor(settings.types_of_cards[this.cardsType].w*this.ch/settings.types_of_cards[this.cardsType].h);
    
    this.updateCards();
}

GraphicsManager.prototype.setCardWidth = function(width)
{
    this.cw = Math.floor(width);
    this.ch = Math.floor(settings.types_of_cards[this.cardsType].h*this.cw/settings.types_of_cards[this.cardsType].w);
    
    this.updateCards();
}

GraphicsManager.prototype.setCardsType = function(cardsType)
{
    this.cardsType = cardsType;
    
    this.setCardHeight(this.ch); //FIXME
    
    if (settings.types_of_cards[cardsType].number == 40) this.suits = "dcbs";
    
    this.updateCards();
}

ScopaApplication = function()
{
    this.variants = [];
    this.match = null;
    
    this.graphicsManager = new GraphicsManager(settings.cards);
    
    this.resizeLock = false;
    this.resizeRequested = true;
    
    this.userCanPlay = false;
    this.playedCard = null;
    
    //load settings
    document.body.style.backgroundImage = `url(${settings.background})`;
    document.getElementById("userName").value = settings.username;
    
    var cardTypeSelect = document.querySelector("#cardType");
    for (var cardType in settings.types_of_cards)
    {
        var option = document.createElement("option");
        option.id = cardType;
        option.appendChild(document.createTextNode(cardType));
        cardTypeSelect.appendChild(option);
    }
    document.getElementById(settings.cards).selected = true;
    
    //add event listeners
    var app = this;
    
    var backgroundPreviews = document.querySelectorAll(".backgroundPreview");
    
    for (var i=0; i<backgroundPreviews.length; i++) {
        backgroundPreviews[i].addEventListener("click", function(evt) {
            document.body.style.backgroundImage = `url(${evt.target.src})`;
            settings.background = evt.target.src;
        });
    }
    
    document.querySelector("#variant").addEventListener("change", function(){
        app.updateNumberOfPlayers();
    });
    
    document.querySelector("#cardType").addEventListener("change", function(){
        settings.cards = document.querySelector("#cardType").selectedOptions[0].id;
        app.graphicsManager.setCardsType(settings.cards)
        app.onResize();
    });
    
    var menu = document.querySelector("#menu");
    
    document.querySelector("#menu-btn").addEventListener("click", function() {
        if (menu.hidden == false) menu.hidden = true;
        else menu.hidden = false;
    });
    
    //menu items
    var items = document.querySelectorAll("#menu > label");
    for (var i=0; i<items.length; i++)
    {
        items[i].addEventListener("click", function(event) {
            app.showDialog(event.target.dataset.dialog);
            menu.hidden = true;
        });
    }
    
    //dialogs' close buttons
    var buttons = document.querySelectorAll(".close");
    for (var i=0; i<buttons.length; i++)
    {
        buttons[i].addEventListener("click", function(event) {
            document.getElementById(event.target.dataset.dialog).hidden = true;
        });
    }
    
    //windows movements
    var titles = document.querySelectorAll(".titlebar > *:first-child");
    for (var i=0; i<titles.length; i++)
    {
        titles[i].addEventListener("mousedown", function(event) {
            if (event.button == 0)
            {
                var dialog = event.target.parentNode.parentNode;
                dialog.style.top = `${dialog.offsetTop}px`;
                dialog.style.left = `${dialog.offsetLeft}px`;
                dialog.style.margin =  "0px";
                dialog.style.position = "fixed";
                
                
                var mouseMoveHandler = function(evt) {
                    dialog.style.top = `${dialog.offsetTop+evt.movementY}px`;
                    dialog.style.left = `${dialog.offsetLeft+evt.movementX}px`;
                }
                
                window.addEventListener("mousemove", mouseMoveHandler);
                
                var endMove;
                endMove = function(evt) {
                    window.removeEventListener("mousemove", mouseMoveHandler);
                    window.removeEventListener("mouseup", endMove);
                }
                
                window.addEventListener("mouseup", endMove);
            }
        });
    }
    
    document.querySelector("#start-game").addEventListener("click", function() {
        app.onStartGame();
    });
    
    window.addEventListener("resize", function() {
        app.onResize();
    });
    
    document.querySelector("#summary-close-btn").addEventListener("click", function() {
        var newResponse = app.match.send({"command": "next"});
        app.analyze(newResponse);
    });
    
    document.querySelector("#match-end-close-btn").addEventListener("click", function() {
        var fixedCards = document.querySelectorAll(".fixedCard, .fixedDeck");
        
        for (var i=0; i<fixedCards.length; i++)
        {
            document.body.removeChild(fixedCards[i]);
        }
        
        app.showDialog("new-game");
    });
    
    this.onResize();
}

ScopaApplication.prototype.registerGame = function(Game)
{
    var game = new Game();
    
    var info = game.send({"command": "info"});
    
    this.variants.push({
        "class": Game,
        "name": info.name,
        "number_of_players": info.number_of_players,
        "description": info.description
    });
    
    var variantSelect = document.querySelector("#variant");
    var option = document.createElement("option");
    option.dataset.index = this.variants.length-1;
    option.appendChild(document.createTextNode(info.name));
    variantSelect.appendChild(option);
    
    if (settings.variant == info.name) option.selected = true;
}

ScopaApplication.prototype.updateNumberOfPlayers = function() {
    var variant = this.variants[document.querySelector("#variant").selectedOptions[0].dataset.index];
    var number_of_players = document.querySelector("#numberOfPlayers");
    while (number_of_players.firstChild) {
        number_of_players.removeChild(number_of_players.firstChild);
    }
    for (var i=0; i<variant.number_of_players.length; i++) {
        var option = document.createElement("option");
        option.innerHTML = variant.number_of_players[i];
        option.id = "numberOfPlayers-"+variant.number_of_players[i];
        number_of_players.appendChild(option);
    }
    if (document.querySelector("#numberOfPlayers-"+settings.number_of_players)) {
        document.querySelector("#numberOfPlayers-"+settings.number_of_players).selected = true;
    }
}


ScopaApplication.prototype.showDialog = function(dialogId)
{
    var dialogs = document.querySelectorAll(".dialog");
    for (var i=0; i<dialogs.length; i++) 
    {
        if (dialogs[i].id != dialogId) dialogs[i].hidden = true;
        else
        {
            //reset window's margin
            dialogs[i].querySelector(".window").style.margin = "calc(0.05 * var(--h))";
            dialogs[i].querySelector(".window").style.position = "static";
            
            dialogs[i].hidden = false;
        }
    }
}

ScopaApplication.prototype.displayMessage = function(data) {
    var messages = document.getElementById("messages");
    
    var message = document.createElement("label");
    var br = document.createElement("br");
    
    for (var key in data) message.dataset[key] = data[key];
    
    //update messages log
    var messagesLog = document.getElementById("messages-log");
    messagesLog.appendChild(message.cloneNode(false));
    messagesLog.appendChild(br.cloneNode(false));
    
    //display notification
    message.style.animation = `message ${settings.notifications_duration}s forwards`;
    
    message.addEventListener("animationend", function() {
        messages.removeChild(message);
        messages.removeChild(br);
    });
    
    messages.insertBefore(br, messages.firstChild);
    messages.insertBefore(message, messages.firstChild);
}

ScopaApplication.prototype.onResize = function(e)
{
    if (!this.resizeLock && this.resizeRequested)
    {
        this.resizeLock = true;
        this.resizeRequested = false;
        var s = 50;
        
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        
        var ch = Math.min(h/4.5, settings.types_of_cards[settings.cards].h)
        this.graphicsManager.setCardHeight(ch);
        
        css = `:root {
                --w: ${w}px;
                --h: ${h}px;
                --ch: ${this.graphicsManager.ch}px;
                --cw: ${this.graphicsManager.cw}px;
                --cn: 3;
                --s: ${s}px;
            }`;
            
        document.querySelector("#root").innerHTML = css;
        
        //this.loadCards(settings.cards);
        
        var fixedCards = document.querySelectorAll(".fixedCard, .fixedDeck");
        
        for (var i=0; i<fixedCards.length; i++)
        {
            offset = this.getOffset(`#${fixedCards[i].dataset.placeHolder}`);
            fixedCards[i].style.top = `${offset.top}px`;
            fixedCards[i].style.left = `${offset.left}px`;
        }
        
        setTimeout(function(app){
            app.resizeLock = false;
            app.onResize();
        }, 100, this)
    }
    else
        this.resizeRequested = true;
}

ScopaApplication.prototype.onStartGame = function()
{
    var fixedCards = document.querySelectorAll(".fixedCard, .fixedDeck");
    
    for (var i=0; i<fixedCards.length; i++)
    {
        document.body.removeChild(fixedCards[i]);
    }
    
    var used = document.querySelectorAll("*[data-used='1']");
    
    for (var i=0; i<used.length; i++)
    {
        used[i].dataset.used = 0;
    }
    
    //clean animations
    document.getElementById("animations").innerHTML = "";
    
    var number_of_players = document.querySelector("#numberOfPlayers").selectedOptions[0].id.replace("numberOfPlayers-","");
    var variant = this.variants[document.querySelector("#variant").selectedOptions[0].dataset.index];
    var username = document.getElementById("userName").value;
    
    this.match = new variant.class();
    
    var message;
    
    if (number_of_players == 2)
    {
        message = {"command": "start", "data": [
            {"type": "human", "name": username},
            {"type": "cpu", "name": "cpu1"},
        ]};
    }
    else
    {
        message = {"command": "start", "data": [
            {"type": "human", "name": username},
            {"type": "cpu", "name": "cpu2"},
            {"type": "cpu", "name": "cpu1"},
            {"type": "cpu", "name": "cpu3"},
        ]};
    }
    
    var response = this.match.send(message);
    
    settings.number_of_players = number_of_players;
    settings.variant = variant.name;
    settings.username = username;
    
    document.querySelector("#new-game").hidden = true;
    
    this.analyze(response);
}

ScopaApplication.prototype.getOffset = function(selector)
{
    var el = document.querySelector(selector);
    
    var offset = {"top": el.offsetTop, "left": el.offsetLeft};
    
    while (el.offsetParent)
    {
        offset["left"] += el.offsetParent.offsetLeft;
        offset["top"] += el.offsetParent.offsetTop;
        el = el.offsetParent;
    }

    return offset;
}

ScopaApplication.prototype.initTable = function(cards)
{
    for (var i=0; i<cards.length; i++)
    {
        var div;
        if (cards[i].type === "deck")
        {
            if (cards[i].owners.length === 0)
                div = document.querySelector("#mainDeck");
            
            else if (cards[i].owners.indexOf(settings.username) > -1)
                div = document.querySelector("#team0Deck");
            
            else
                div = document.querySelector("#team1Deck");
        }
        
        if (cards[i].type === "hand")
        {
            var orientation = "v";
            if (cards[i].owners[0] === settings.username)
            {
                div = document.querySelector("#humanCards");
                orientation = "h";
            }
            
            else
                div = document.querySelector(`#${cards[i].owners[0]}Cards`);
            
            if (cards[i].owners[0] == "cpu1")
                orientation = "h"
            
            while (div.firstChild) div.removeChild(div.firstChild);
            
            for (var j=0; j<cards[i].length; j++)
            {
                var placeHolder = document.createElement("div");
                placeHolder.id = `${cards[i].owners[0]}card_${j}`;
                placeHolder.className = `c${orientation}${cards[i].length}`
                div.appendChild(placeHolder);
                if (orientation == "v" && j != cards[i].length-1)
                    div.appendChild(document.createElement("br"));
            }
            div.lastChild.className = "card";
        }
        
        if (cards[i].type === "table")
            div = document.querySelector("#tableCards");
            
        
        div.dataset.id = cards[i].id;
    }
}

ScopaApplication.prototype.updateCards = function(cards, id)
{
    for (var i=0; i<cards.length; i++)
    {
        if (cards[i].id === id || !id)
        {
            if (cards[i].type === "deck")
            {
                var deckImg = document.querySelector(`#${cards[i].id}Img`);
                if (!deckImg)
                {
                    deckImg = document.createElement("img");
                    deckImg.className = "fixedDeck";
                    deckImg.id = `${cards[i].id}Img`;
                    deckImg.dataset.placeHolder = document.querySelector(`div[data-id='${cards[i].id}']`).id;
                    document.body.appendChild(deckImg);
                    offset = this.getOffset(`div[data-id='${cards[i].id}']`);
                    deckImg.style.top = `${offset.top}px`;
                    deckImg.style.left = `${offset.left}px`;
                }
                
                this.graphicsManager.updateDeckImg(deckImg, cards[i]);
            }
        }
    }
}

ScopaApplication.prototype.analyze = function(response)
{
    //console.log(response);
    if (response.moves.length === 0 && response.cards.length === 0 && response.infos.length === 0)
        return;
    
    for (var i=0; i<response.infos.length; i++)
    {
        if (response.infos[i].info === "cards_description")
        {
            this.initTable(response.infos[i].data);
            this.updateCards(response.infos[i].data);
        }
        
        if (response.infos[i].info === "first_player" ||
            response.infos[i].info === "cards_value_lt_10" ||
            response.infos[i].info === "2_equal_cards" ||
            response.infos[i].info === "3_equal_cards")
        {
            this.displayMessage({
                stringId: response.infos[i].info,
                player: response.infos[i].data,
            });
        }
        
        if (response.infos[i].info === "waiting")
        {
            this.userCanPlay = true;
            return;
        }
        
        if (response.infos[i].info === "choice")
        {
            this.userCanPlay = true;
            var choices = document.querySelector("#choices");
            
            while (choices.firstChild) choices.removeChild(choices.firstChild);
            
            var takes = response.infos[i].data;
            for (var j=0; j<takes.length; j++)
            {
                for (var k=0; k<takes[j].length; k++)
                {
                    cardImg = document.createElement("img");
                    this.graphicsManager.updateCardImg(cardImg, takes[j][k]);
                    choices.appendChild(cardImg);

                    cardImg.addEventListener("click", (function(app, index){return function(){
                        app.userCanPlay = false;
                        
                        document.querySelector("#move-choice").hidden = true;
                        
                        var newResponse = app.match.send({"command": "human_play", "data": {
                            player: settings.username,
                            card: app.playedCard,
                            take: index
                        }});
                        app.analyze(newResponse);
                    }})(this, j));
                }
                choices.appendChild(document.createElement("br"));
            }
            
            document.querySelector("#move-choice").hidden = false;
            return;
        }
        
        if (response.infos[i].info === "summary")
        {
            var summary = response.infos[i].data;
            
            var table = document.querySelector("#summaryTable");
            
            //remove all columns except the first one
            for (var j=0; j<table.children.length; j++)
                for (var k=table.children[j].children.length-1; k>0; k--)
                    table.children[j].removeChild(table.children[j].children[k]);
            
            for (var j=0; j<summary.length; j++)
            {
                summary[j].players = summary[j].players.length == 1 ?
                    summary[j].players[0]: `${summary[j].players[0]}, ${summary[j].players[1]}`;
                
                for (var k=0; k<table.children.length; k++)
                {
                    var row = table.children[k];
                    
                    if (summary[j][row.id] != undefined)
                    {
                        var td = document.createElement("td");
                        td.appendChild(document.createTextNode(`${summary[j][row.id]}`));
                        row.appendChild(td);
                        row.hidden = false;
                    }
                    else
                    {
                        row.hidden = true;
                    }
                }
            }
            
            this.showDialog("summary");
            
            //clear messages messages log
            document.getElementById("messages-log").innerHTML = "";
            
            return;
        }
        
        if (response.infos[i].info === "winner")
        {
            document.querySelector("#winner").innerHTML = `Team ${response.infos[i].data} wins!`;
            document.querySelector("#match-end").hidden = false;
            return;
        }
    }

    this.updateCards(response.cards, document.querySelector("#mainDeck").dataset.id);
    var animations = document.querySelector("#animations");
    animations.innerHTML = "";
    
    for (var i=0; i<response.moves.length; i++)
    {
        var source = document.querySelector(`*[data-id='${response.moves[i].source}']`);
        var dest = document.querySelector(`*[data-id='${response.moves[i].dest}']`);
        
        for (var j=0; j<response.moves[i].cards.length; j++)
        {
            var card = response.moves[i].cards[j];
            var cardImg;
            
            if (source.id === "mainDeck")
            {
                cardImg = document.createElement("img");
                cardImg.className = "fixedCard";
                cardImg.id = `absCard${card.id}`;
                document.body.appendChild(cardImg);
                offset = this.getOffset("#mainDeck");
                cardImg.style.top = `${offset.top}px`;
                cardImg.style.left = `${offset.left}px`;
                this.graphicsManager.updateCardImg(cardImg, card);
                
                if (dest.id === "humanCards")
                {
                    cardImg.addEventListener("click", (function(app, card){return function(){
                        if (app.userCanPlay)
                        {
                            app.userCanPlay = false;
                            
                            app.playedCard = card;
                            var newResponse = app.match.send({"command": "human_play", "data": {
                                player: settings.username,
                                card: card
                            }});
                            
                            app.analyze(newResponse);
                        }
                    }})(this, card));
                }
            }
            else
            {
                cardImg = document.querySelector(`#absCard${card.id}`);
                document.getElementById(cardImg.dataset.placeHolder).dataset.used = 0;
                if (source.id != "humanCards" && source.id != "tableCards")
                {
                    this.graphicsManager.updateCardImg(cardImg, card);
                }
                
                if (source.id === "tableCards")
                {
                    setTimeout((function(cardImg) {return function(){document.body.removeChild(cardImg);}})(cardImg), 1000);
                }
            }
            
            var placeHolders  = dest.querySelectorAll("div");
            var placeHolder = dest;
            
            for (var k=0; k<placeHolders.length; k++)
            {
                if (!placeHolders[k].dataset.used || placeHolders[k].dataset.used == 0)
                {
                    placeHolder = placeHolders[k];
                    placeHolder.dataset.used = 1;
                    break;
                }
            }
            
            cardImg.dataset.placeHolder = placeHolder.id;
            
            var offset = this.getOffset(`#${placeHolder.id}`);
            if (response.moves[i].move_on)
            {
                offset = this.getOffset(`#absCard${response.moves[i].move_on.id}`);
                offset.top += 30;
                offset.left += 30;
            }
            
            var animation = `
            @keyframes card${card.id} {
                0%    {
                    top: ${cardImg.y}px; 
                    left: ${cardImg.x}px;
                }
                100% {
                    top: ${offset.top}px;
                    left: ${offset.left}px;
                }
            }`;
            
            animations.innerHTML += animation;
            cardImg.style.animation = `card${card.id} 1s`;
            cardImg.style.top = `${offset.top}px`;
            cardImg.style.left = `${offset.left}px`;
        }
    }
    
    setTimeout(function(app){app.updateCards(response.cards)}, 1000, this);
    setTimeout(function(app){
        var newResponse = app.match.send({"command": "next"});
        app.analyze(newResponse);
    }, 1000, this);
}

//language settings
if (navigator.language)
{
    var css = document.getElementById("locale");
    css.href = `locales/${navigator.language}.css`;
}

app = new ScopaApplication();
app.registerGame(ClassicMatch);
app.registerGame(ScoponeMatch);
app.registerGame(ReBelloMatch);
app.registerGame(CucitaMatch);
app.registerGame(CirullaMatch);
app.updateNumberOfPlayers();
app.showDialog("new-game");
