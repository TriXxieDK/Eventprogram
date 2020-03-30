// ==UserScript==
// @name         Eventprogram
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://docs.google.com/spreadsheets/u/0/d/e/2PACX-1vS2zzGTsnJe06I6I7YLMlkasqFEvetVkMXJxs7lFgT2iwnT9YG0wxwKbUNsPK2orJe1DL4zspCL1XQR/pubhtml/sheet?headers=false&gid=340956028
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==
var $ = window.jQuery;

(function() {
    'use strict';
    //Start af event (første dag)
    var startdate = new Date('2020-3-29');

    //Regex til at teste for tidspunkt
    var regex = new RegExp("[0-9][0-9]?\.[0-9][0-9]");
    var currentHour;
    var currentMinutes;
    var currentDay;

    function isNow(timestr, day) {
        var splitted = timestr.split('.');
        var targetHour = parseInt(splitted[0]);
        var targetMinutes = parseInt(splitted[1]);
        //Tag højde for tidspunkter efter midnat
        if (((day == currentDay - 1) && (targetHour < 5)) || (day == currentDay)) {
            if ((currentHour == targetHour) && (currentMinutes == targetMinutes)) return true;
        }
        return false;
    }

    var reloadfunc = function() {
        var now = new Date();
        //now = new Date('2020-3-30T00:40:00'); //Bruges til at simulere et tidspunkt for test

        //Nuværende dag nummer i eventet og time / minut afrundet til halve timer
        currentDay = Math.round((now - startdate) / (1000 * 60 * 60 * 24));
        currentHour = now.getHours();
        currentMinutes = now.getMinutes();
        if (currentMinutes < 30) currentMinutes = 0;
        if (currentMinutes >= 30) currentMinutes = 30;

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

            //Farv alle tidligere events grå
            el.prevAll().find('td').css('color', 'lightgray');

            //Scroll til det rigtige sted på siden, og lav stregen henover
            var elOffset = el.offset().top + $('#sheets-viewport').scrollTop();
            var elHeight = el.height();
            var windowHeight = $(window).height();
            var offset;

            if (elHeight < windowHeight) {
                offset = Math.round(elOffset - ((windowHeight / 3) - (elHeight / 2)));
            } else {
                offset = elOffset;
            }

            $("<div>", {
                id: 'divline',
                style: 'position: absolute; top: 10px; left: 0px; width: 100%; height: 5px; background-color: black; z-index: 10000'
            }).appendTo("#sheets-viewport > div > div").css('top', (elOffset - 5) + 'px');;

            $('#sheets-viewport').animate({ scrollTop: offset }, 700);
        });
    };

    setInterval(reloadfunc, 60000);
    reloadfunc();
})();
