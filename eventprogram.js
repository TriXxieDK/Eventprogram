// ==UserScript==
// @name         Eventprogram
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @updateURL    https://raw.githubusercontent.com/TriXxieDK/Eventprogram/master/eventprogram.js
// @downloadURL  https://raw.githubusercontent.com/TriXxieDK/Eventprogram/master/eventprogram.js
// @match        https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vS2zzGTsnJe06I6I7YLMlkasqFEvetVkMXJxs7lFgT2iwnT9YG0wxwKbUNsPK2orJe1DL4zspCL1XQR/pubhtml/sheet?headers=false&gid=340956028
// @match        https://docs.google.com/spreadsheets/d/e/2PACX-1vQii6jcYTqQyVLSBZaiADpIxrQzULMxeTK-H_cZoT-XexcObPFBuFpL2QPOJWtAlNt5NJhJyOaPPJEt/pubhtml?headers=false&gid=340956028
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==
var $ = window.jQuery;

(function() {
    'use strict';
    //Start af event (første dag)
    var startdate = new Date('2020-07-23');

    //Regex til at teste for tidspunkt
    var regex = new RegExp("[0-9][0-9]?\.[0-9][0-9]");
    var currentHour;
    var currentMinutes;
    var currentDay;
    var lastMessages;

    function isNow(timestr, day) {
        if (timestr.includes(' - ')) timestr = timestr.split(' - ')[0];
        var splitted = timestr.split(/[\.:]/);
        var targetHour = parseInt(splitted[0]);
        var targetMinutes = parseInt(splitted[1]);
        //Tag højde for tidspunkter efter midnat
        if (((day == currentDay - 1) && (targetHour < 5)) || (day == currentDay)) {
            if ((currentHour == targetHour) && (currentMinutes == targetMinutes)) return true;
        }
        return false;
    }

    var reloadfunc = function() {
        console.log('reloading');
        var now = new Date();
        //now = new Date(Date.parse('14 Nov 2020 13:45:00 GMT+1')); //Bruges til at simulere et tidspunkt for test

        //Nuværende dag nummer i eventet og time / minut afrundet til halve timer
        currentDay = Math.round((now - startdate) / (1000 * 60 * 60 * 24));
        currentHour = now.getHours();
        currentMinutes = now.getMinutes();
        if (currentMinutes < 30) currentMinutes = 0;
        if (currentMinutes >= 30) currentMinutes = 30;
        var percentpassed = ((now.getMinutes() - currentMinutes) / 30 * 100);

        //Genindlæs dokument indhold fra docs
        $('#sheets-viewport').load(document.URL + ' #sheets-viewport > div', function() {
            $('#sheets-viewport div').css('display', '');
            //Fjern event kategorier i række to, kolonne to
            $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(2) td:nth-child(2)').html('');

            //Lav overskriftsrække
            $("<div>", {
                id: 'headertable',
                style: 'position: fixed; top: 0px; left: 0px; height: 30px; width: 100%; background-color: orange; z-index: 10000'
            }).prependTo("#sheets-viewport > div > div");
            $('#sheets-viewport > div > div > table.waffle > tbody > tr:nth-child(3) > td').each(function(index, value) {
                if (index < 2) return true;
                $("<div>", {
                    style: 'position: absolute; bottom: 2px; left: ' + this.offsetLeft + 'px; width: ' + (this.offsetWidth - 4) + 'px; border-right: 1px solid white; text-align: center; padding: 2px; background-color: orange; z-index: 10000',
                }).html($(this).text()).prependTo("#headertable");
            });

            var el;
            var curday = 0;
            var wastimestamp = false;
            var trs = $('#sheets-viewport > div > div > table.waffle tbody tr').each(function(index, value) {
                var txt = $('td:nth-child(3)', $(this)).text();
                var isthisatimestamp = regex.test(txt);
                if (!wastimestamp && isthisatimestamp) curday++;
                wastimestamp = isthisatimestamp;

                if (isNow(txt.trim(), curday)) {
                    el = $(this);
                    return false;
                }
            });
            //Hvis tidspunktet ikke findes i skemaet, så gør ikke mere
            if (!el) return false;

            //Scroll til det rigtige sted på siden, og lav stregen henover
            var elOffset = el.offset().top + $('#sheets-viewport').scrollTop();
            var elHeight = el.height();
            elOffset = elOffset + Math.floor(percentpassed / 100 * elHeight);

            $("<div>", {
            	id: 'overlay',
            }).css({
            	position: 'absolute',
            	top: '0px',
            	left: '0px',
            	height: elOffset+'px',
            	width: '100%',
            	backgroundColor: 'rgba(0, 0, 0, 0.2)',
                'border-bottom': '5px solid rgba(0, 0, 0, 0.4)'
            }).appendTo("#sheets-viewport > div > div");

            var windowHeight = $(window).height();
            var scrollOffset = Math.round(elOffset - ((windowHeight / 3) - (elHeight / 2)));

            $('#sheets-viewport').animate({ scrollTop: scrollOffset }, 700);

            var messages = "";
            [
                $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(101) td:nth-child(3) div').html(),
                $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(102) td:nth-child(3) div').html(),
                $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(103) td:nth-child(3) div').html(),
                $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(104) td:nth-child(3) div').html(),
                $('#sheets-viewport > div > div > table.waffle tbody tr:nth-child(105) td:nth-child(3) div').html(),
            ].filter(Boolean).forEach(function (currentValue, index) { messages = messages + "<div style=\"background-color: orange; padding: 10px; "+(index == 0 ? "" : "margin-top: 5px;")+"\">"+currentValue+"</div>"; });

            if (messages != lastMessages) {
                $('#newsticker').html(messages);
            }
            $('#newsticker').css('display', messages == "" ? 'none' : 'block');
            lastMessages = messages;
        });
    };

    setInterval(reloadfunc, 60000);
    reloadfunc();
    $('<div>', {
        id: 'newsticker',
    }).css({
        display: 'none',
        position: 'fixed',
        bottom: '0px',
        height: 'auto',
        width: '100%',
        'background-color': '#4e8ecb',
        color: 'white',
        'font-size': '80px',
        'transform': 'none !important'
    }).appendTo('body');

    var ratio = (document.body.offsetWidth - 50) / $('table.waffle')[0].offsetWidth;
    var style = document.createElement('style');
    style.innerHTML =
        'table.waffle, #headertable {' +
        'transform: scale(' + ratio + ');' +
        'transform-origin: top left;' +
        '}';
    // Get the first script tag
    var ref = document.querySelector('script');
    // Insert our new styles before the first script tag
    ref.parentNode.insertBefore(style, ref);
    document.body.style.overflow = 'hidden';
})();
