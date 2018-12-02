var util = {
    dates:{
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        daysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
        //months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        //monthslow: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    separators: [' ', ',', '-', '\\.', '/', ':'],
    letters: [70,65,68,83,79,78,74],
    parseMonth: function(month) { 
      if(isNaN(month)) {
          return util.dates.monthslow.indexOf(month.toLowerCase());
      } else {
          return month - 1;
      }
    },
    isLeapYear: function (year) {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    },
    getDaysInMonth: function (year, month) {
        return [31, (util.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
    },
    calculateOffset: function(element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);

        return {
            top: top,
            left: left
        };
    },
    setCharAt: function(str, index, chr) {
        if(index > str.length-1) return str;
        return str.substr(0,index) + chr + str.substr(index+1);
    },
    checkText: function(text) {
        for(var i=0; i<12; i++) {
            if(util.dates.monthslow[i].indexOf(text.toLowerCase()) == 0 || text == (i+1).toString()) {
                return true;
            }
        }
        return false;
    },
    gettips: function(text) {
        var arr = [], months;
        if(text[0] == text[0].toUpperCase()) {
            months = util.dates.months;
        } else {
            months = util.dates.monthslow;
        }

        for(var i=0; i<12; i++) {
            if(util.dates.monthslow[i].indexOf(text.toLowerCase()) == 0) {
                arr.push(months[i]);
            }
        }
        return arr;
    },
    insertAfter: function(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    },
    template:   '<div class="datepickerbody">'+
                    '<div class="head">'+
                        '<div class="dec control"></div>'+
                        '<div class="display"></div>'+
                        '<div class="inc control"></div>'+
                    '</div>'+
                    '<div class="body">'+
                        '<div class="daysview">'+
                            '<div class="calendarhead">'+
                            '</div>'+
                            '<div class="calendar">'+
                            '</div>'+
                        '</div>'+
                        '<div class="monthsview">'+
                        '</div>'+
                        '<div class="yearsview">'+
                        '</div>'+
                    '</div>'+
                    '<div class="today">Today</div>'+
                '</div>',
    secretTemplate: '<span><span class="button-show"></span></span>',
    suggestionTemplate: '<div><input class="suggestion" disabled type="text"></div>'
};

module.exports = util;