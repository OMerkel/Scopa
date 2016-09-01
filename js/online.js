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

function OnlineMatch()
{
    this.messagesQueue = [];
    this.socket = null;
    this.status = "closed";
    this.waitingMsg = false;
    
    //callbacks
    this.onconnection = null;
    this.onconnectionfail = null;
    this.onconnectionclose = null;
    this.onregister = null;
    this.onregisterfail = null;
    this.onlogin = null;
    this.onloginfail = null;
    this.onplayerslistupdate = null;
    this.onmatchproposal = null;
    this.onmatchfail = null;
    this.onmatchstart = null;
    this.onmatchend = null;
    
    this.onmsgavailable = null;
}

OnlineMatch.prototype.onmessage = function(msg)
{
    console.log(msg);
    switch (msg.control)
    {
        case "match_data":
            this.messagesQueue.push(msg.data);
            
            if (this.waitingMsg)
            {
                this.waitingMsg = false;                
                this.onmsgavailable();
            }
            
            break;
    
        case "username_unavailable":
            if (this.onregisterfail) this.onregisterfail(msg.data);
            break;
        case "registered":
            if (this.onregister) this.onregister(msg.data);
            break;
        case "wrong_password":
            if (this.onloginfail) this.onloginfail("wrong_password", msg.data);
            break;
        case "unknown_username":
            if (this.onloginfail) this.onloginfail("unknown_username", msg.data);
            break;
        case "logged_in":
            if (this.onlogin) this.onlogin(msg.data);
            this.status = "logged_in";
            break;
        case "players":
            if (this.onplayerslistupdate) this.onplayerslistupdate(msg.data);
            break;
        case "match_proposal":
            this.status = "playing";
            if (this.onmatchproposal) this.onmatchproposal(msg.data);
            break;
        case "player_refused":
            this.status = "logged_in";
            if (this.onmatchfail) this.onmatchfail(msg.data);
            break;
        case "match_started":
            this.status = "playing";
            if (this.onmatchstart) this.onmatchstart(msg.data);
            break;
        case "match_end":
            this.status = "logged_in";
            this.messagesQueue = [];
            this.waitingMsg = false;
            if (this.onmatchend) this.onmatchend(msg.data);
            break;
        default:
            console.log("Unknown message:", msg);
    }
    
    
}

OnlineMatch.prototype.connect = function(server)
{
    this.clear();
    
    this.socket = new WebSocket(server, "scopa");
    
    var _this = this;
    
    this.socket.onopen = function(event) {
        _this.status = "connected";
        if (_this.onconnection) _this.onconnection();
    };
    
    this.socket.onerror = function(event) {
        _this.clear();
        if (_this.onconnectionfail) _this.onconnectionfail();
    }
    
    this.socket.onclose = function(event) {
        _this.clear();
        if (_this.onconnectionclose) _this.onconnectionclose();
    }
    
    this.socket.onmessage = function(event) {
        msg = JSON.parse(event.data);
        _this.onmessage(msg);
    }
}

OnlineMatch.prototype.sendToServer = function(message)
{
    if (this.socket)
    {
        this.socket.send(JSON.stringify(message));
    }
}

OnlineMatch.prototype.send = function(message)
{
    console.log(message);
    if (message.command === "next")
    {
        if (this.messagesQueue.length > 0)
        {
            var match_data = this.messagesQueue.shift();
            
            for (var i in match_data.infos)
                if (match_data.infos[i].info === "waiting")
                    this.waitingMsg = true;
            
            return match_data;
        }
        else
            this.waitingMsg = true;
    }
    
    if (message.command === "human_play")
    {
        this.waitingMsg = true;
        this.sendToServer({
            control: "match_data",
            data: message
        });
    }
    return new Response();
}

OnlineMatch.prototype.clear = function()
{
    if (this.socket)
        this.socket.close();
    
    this.messagesQueue = [];
    this.socket = null;
    this.status = "closed";
}
