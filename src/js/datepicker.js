var Viewtracker = require('./viewtracker'),
    util = require('./util')

var Datepicker = function(el) {
    this.element = document.querySelector(el);

    this.today = new Date();
    this.today.setHours(0,0,0,0);

    this.prevState = "";

    this.view = new Viewtracker(this.today.getMonth(), this.today.getFullYear());

    this.mode = 0;              //0-days, 1-month, 2-years
    this.selected = undefined;  //because why not
    this.element.addEventListener('focus', this.hide.bind(this), false);
    this.element.addEventListener('input', this.parse.bind(this), false);

    var wrap = document.createElement('div');

    wrap.innerHTML = util.template;
    this.calendar = wrap.firstChild;
    document.body.appendChild(this.calendar);
    this.calendar.addEventListener('click', this.click.bind(this));
    window.addEventListener('keydown', this.keydown.bind(this));

    wrap.innerHTML = util.secretTemplate;
    var buttonwrap = wrap.firstChild;
    this.showbutton = buttonwrap.querySelector('span.button-show');
    this.showbutton.addEventListener('click', this.hideshow.bind(this), false);
    util.insertAfter(buttonwrap, this.element);

    wrap.innerHTML = util.suggestionTemplate;
    buttonwrap = wrap.firstChild;
    util.insertAfter(buttonwrap, this.showbutton);
    this.suggestion = buttonwrap.querySelector('input.suggestion');
    this.tips = [];
    this.tipmode = false;

    this.daysview = this.calendar.querySelector('div.daysview');
    this.monthsview = this.calendar.querySelector('div.monthsview');
    this.yearsview = this.calendar.querySelector('div.yearsview');
    this.display =  this.calendar.querySelector('.display');
    this.calendarbody = this.calendar.querySelector('.calendar');

    this.hide();
    this.fillDow();
    this.fill();
};

Datepicker.prototype = {
    constructor: Datepicker,

    parse: function() {
        var val = this.element.value, num;
        val = val.split(new RegExp(util.separators.join('|'), 'g'));
        var templen = val.length;

        val = val.filter(function(n){ return n != "" });

        if((templen - val.length) > 1 || templen==4) {
            this.element.value = this.prevState;
            this.resetsuggestion();
            val = this.element.value.split(new RegExp(util.separators.join('|'), 'g'));
        }

        console.log(val, val.length);

        if(val.length==0) {
            this.prevState = "";
            this.suggestion.value = "";
            return;
        }

        var count = 0;

        if(val.length>0) {
            if (util.checkText(val[0])) {
                this.tips = util.gettips(val[0]);
                this.tipmode = true;
                this.suggestion.value = this.tips[0];
                count+=1;
            } else {
                this.element.value = this.prevState;
            }
        }

        if(val.length>1) {
            if (isNaN(val[1])) {
                this.element.value = this.prevState;
            } else {
                num = parseInt(val[1]);
                if (1 <= num && num <= util.getDaysInMonth(2015, util.parseMonth(val[0]))) {
                    count+=1;
                    this.suggestion.value = "";
                    this.tipmode = false;
                } else {
                    this.element.value = this.prevState;
                }
            }
        }

        if(val.length>2) {

            if(isNaN(val[2])) {
                this.element.value = this.prevState;
            } else {
                num = parseInt(val[2]);
                if( 1 <= num && num <= 9999) {
                    count+=1;
                } else {
                    this.element.value = this.prevState;
                }
            }
        }


        if(val.length>3) {
            this.element.value = this.prevState;
        }

        if(count==val.length) {
            this.prevState = this.element.value;
        }

        val = this.element.value;
        var date = Date.parse(val);

        if(isNaN(date)==false) {
            this.selected = new Date(date);
            this.view.year = this.selected.getFullYear();
            this.view.month = this.selected.getMonth();
            this.fill();
        }

    },

    isOpen: function() {
      return this.calendar.style.display==='block';
    },

    setSelected: function(year, month, date) {
        this.selected = new Date(year,month,date,0,0,0,0);
        this.resetsuggestion();
    },

    keydown: function(e) {

        var d;

        if(!this.selected && this.isOpen()) {
            console.log(this.today.getMonth());
            this.setSelected(this.today.getFullYear(),this.today.getMonth(),this.today.getDate());
            this.set();
            this.fill();
            return;
        }

        if(!this.isOpen()) {
            var val = this.element.value;
            val = val.split(new RegExp(util.separators.join('|'), 'g'));
            var pos = this.element.selectionStart;
        }

        if(util.letters.indexOf(e.keyCode)>-1 && pos<=val[0].length && val.length>2) {
            e.preventDefault();
            if(pos<=val[0].length) {
                val[0] = String.fromCharCode(e.keyCode);

                if(val[1] && val[1].trim())
                    val.splice(1, 0, "                     ");

                this.element.value = val.join(' ');

                this.tips = util.gettips(val[0]);
                this.tipmode = true;
                this.suggestion.value = this.tips[0];

                this.element.selectionStart = pos;
                this.element.selectionEnd = pos;
            }
        }

        if(e.keyCode >= 48 && e.keyCode <= 57 && !this.isOpen()) {
            e.preventDefault();
            val = val.join(' ');

            if(pos==val.length)
                val += String.fromCharCode(e.keyCode);
            else
                val = util.setCharAt(val,pos,String.fromCharCode(e.keyCode));

            this.element.value = val;
            this.parse();

            this.element.selectionStart = pos+1;
            this.element.selectionEnd = pos+1;
        }

        if((e.keyCode==39 || e.keyCode==32) && !this.isOpen() && this.tipmode) {
            if(val.length>3) {
                val = val.filter(function(n){ return n != "" });
                val[0] = this.suggestion.value;
                this.element.value = val.join(' ');
                this.parse();
            }
            else {
                this.element.value = this.suggestion.value + " ";
                this.tipmode = false;
            }
        }

        if((e.keyCode==38 || e.keyCode==40) && !this.isOpen() && this.tipmode) {
            e.preventDefault();

            d = (e.keyCode == 38) ? 1 : -1;
            var index = this.tips.indexOf(this.suggestion.value) + d;

            if(index == this.tips.length) {
                index = 0;
            }
            if(index < 0) {
                index = this.tips.length - 1;
            }

            this.suggestion.value = this.tips[index];
        }

        if((e.keyCode==38 || e.keyCode==40) && !this.isOpen() && !this.tipmode) {
            e.preventDefault();

            if(val.length < 3) return;

            d = (e.keyCode == 38) ? 1 : -1;

            if(pos<=val[0].length) {
                this.view.changemonth(d);
                this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                this.set();
                this.element.selectionStart = pos;
                this.element.selectionEnd = pos;
            }

            if(pos>val[0].length && pos<=(val[0].length+1+val[1].length)) {
                this.setSelected(this.view.year, this.view.month, this.selected.getDate() + d);
                this.set();
                this.element.selectionStart = pos;
                this.element.selectionEnd = pos;

                this.view.year = this.selected.getFullYear();
                this.view.month = this.selected.getMonth();
            }

            if(pos>(val[0].length+1+val[1].length)) {
                this.view.changeyear(d);
                this.setSelected(this.view.year, this.view.month, this.selected.getDate());

                this.set();
                this.element.selectionStart = pos;
                this.element.selectionEnd = pos;

                this.view.year = this.selected.getFullYear();
                this.view.month = this.selected.getMonth();
            }
        }

        if(this.isOpen() && [37,38,39,40,32,16].indexOf(e.keyCode)>-1) {
            e.preventDefault();
            switch (e.keyCode) {
                case 37:
                    switch (this.mode) {
                        case 0:
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate() - 1);
                            break;
                        case 1:
                            this.view.changemonth(-1);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                        case 2:
                            this.view.changeyear(-1);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                    }
                    break;
                case 38:
                    switch (this.mode) {
                        case 0:
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate() - 7);
                            break;
                        case 1:
                            this.view.changemonth(-3);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                        case 2:
                            this.view.changeyear(-4);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                    }
                    break;
                case 39:
                    switch (this.mode) {
                        case 0:
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate() + 1);
                            break;
                        case 1:
                            this.view.changemonth(1);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                        case 2:
                            this.view.changeyear(1);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                    }
                    break;
                case 40:
                    switch (this.mode) {
                        case 0:
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate() + 7);
                            break;
                        case 1:
                            this.view.changemonth(3);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                        case 2:
                            this.view.changeyear(4);
                            this.setSelected(this.view.year, this.view.month, this.selected.getDate());
                            break;
                    }
                    break;
                case 32:
                    if (this.mode == 0) {
                        this.hide();
                    }
                    else this.changeView(-1);
                    break;
                case 16:
                    this.changeView(1);
                    break;
            }

            this.view.year = this.selected.getFullYear();
            this.view.month = this.selected.getMonth();
            this.set();
            this.fill();
        }
    },

    set: function() {
        var str = '';

        str += util.dates.months[this.selected.getMonth()] + " ";
        str += this.selected.getDate() + " ";
        str += this.selected.getFullYear();

        this.element.value = str;
        this.prevState = str;
    },

    fillDow: function() {
        var html = '',
            i = 0;
        while (i < 7) {
            html += '<div class="dow">'+util.dates.daysShort[(i++)].toUpperCase()+'</div>';
        }
        this.calendar.querySelector('div.calendarhead').innerHTML = html;
    },

    fillMonths: function(month) {
        var html = '',
            cl,
            i = 0;
        while (i < 12) {
            cl = '';
            if(this.selected && i==this.selected.getMonth()) {
                cl = ' active';
            }
            html += '<div class="month'+cl+'">'+util.dates.monthsShort[(i++)]+'</div>';
        }
        this.monthsview.innerHTML = html;
    },

    updateDisplay: function() {
        var year = this.view.year,
            month = this.view.month;

        if(this.mode==0)
            this.display.innerHTML = util.dates.months[month] + " " + year;
        else if(this.mode==1)
            this.display.innerHTML = year;
        else if(this.mode==2) {
            year = Math.floor(year / 16) * 16;
            this.display.innerHTML = year + " - " + (year + 15);
        }
    },

    settoday: function() {
        this.selected = this.today;
        this.view.year = this.selected.getFullYear();
        this.view.month = this.selected.getMonth();
        this.set();
        this.fill();
        this.hide();
    },

    fill: function() {
        var year = this.view.year,
            month = this.view.month,
            today = 0;

            if(this.selected) {
                today = this.selected.valueOf();
            }

        switch(this.mode) {
            case 0:
                this.updateDisplay();

                var prevMonth = new Date(year, month-1, 28, 0, 0, 0, 0),
                    day = util.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
                prevMonth.setDate(day);
                prevMonth.setDate(day - (prevMonth.getDay() + 7) % 7);

                var nextMonth = new Date(prevMonth);
                nextMonth.setDate(nextMonth.getDate() + 42);
                nextMonth = nextMonth.valueOf();

                var html = "",
                    classname,
                    prevY,
                    prevM;

                while(prevMonth.valueOf() < nextMonth) {
                    prevY = prevMonth.getFullYear();
                    prevM = prevMonth.getMonth();
                    classname = "";
                    if ((prevM < month && prevY === year) ||  prevY < year) {
                        classname = ' old';
                    } else if ((prevM > month && prevY === year) || prevY > year) {
                        classname = ' new';
                    }
                    if (prevMonth.valueOf() === this.today.valueOf()) {
                        classname = ' now';
                    }
                    if (prevMonth.valueOf() === today) {
                        classname = ' active';
                    }
                    html+='<div class="day'+classname+'">'+ prevMonth.getDate() + '</div>';
                    prevMonth.setDate(prevMonth.getDate()+1);
                }

                this.calendarbody.innerHTML = html;
                break;

            case 1:
                this.fillMonths(month);
                this.updateDisplay();
                break;

            case 2:
                html = '';
                year = Math.floor(year/16) * 16;

                var selectedyear = 0;
                if(this.selected) {
                    selectedyear = this.selected.getFullYear();
                }

                this.updateDisplay();
                for (var i = -1; i < 15; i++) {
                    html += '<div class="year'+( selectedyear === year ? ' active' : '')+'">'+year+'</div>';
                    year += 1;
                }
                this.yearsview.innerHTML = html;
                break;
        }

    },

    hideshow: function() {
        if(this.calendar.style.display=='block') {
            this.hide();
        }  else {
            this.show();
        }
    },

    resetsuggestion: function() {
        this.suggestion.value = "";
        this.tipmode = false;
    },

    show: function() {
        this.place();
        this.parse();
        this.calendar.style.display = 'block';
        window.addEventListener('resize', this.place.bind(this));
    },

    hide: function() {
        this.calendar.style.display = 'none';
    },

    place: function() {
        var off = util.calculateOffset(this.element);
        this.calendar.style.top = off.top + this.element.offsetHeight + 3 + 'px';
        this.calendar.style.left = off.left + 'px';
    },

    click: function(e) {
        e.preventDefault();
        e.stopPropagation();
        var target = e.target;
        switch(target.className) {
            case 'inc control':
            case 'dec control':
                    this.view[this.view.modes[this.mode].param].call(
                        this.view,
                           (target.className.indexOf('dec') > -1 ? -1 : 1) * this.view.modes[this.mode].step
                        );
                    this.fill();
                break;
            case 'display':
                    this.changeView(1);
                    this.fill();
                break;
            case 'day':
            case 'day old':
            case 'day new':
            case 'day now':
            case 'day active':
                    var curmonth = this.view.month;
                    if(target.className.indexOf('old') > -1) {
                       curmonth -= 1;
                       this.view.changemonth(-1);
                    }
                    if(target.className.indexOf('new') > -1) {
                       curmonth += 1;
                       this.view.changemonth(1);
                    }
                    var day = parseInt(target.innerHTML,10);
                    this.setSelected(this.view.year,curmonth,day);
                    this.set();
                    this.fill();
                    this.hide();
                break;
            case 'month':
            case 'month active':
                    this.view.month = util.dates.monthsShort.indexOf(target.innerHTML);
                    this.changeView(-1);
                    this.fill();
                break;
            case 'year':
            case 'year active':
                    this.view.year = parseInt(target.innerHTML,10);
                    this.changeView(-1);
                    this.updateDisplay();
                break;
            case 'today':
                    this.settoday();
                break;

        }
    },

    changeView: function(i) {
        if(this.mode >= 2 && i==1) return;
        this.mode += i;
        if(this.mode==0) {
            this.monthsview.style.display = 'none';
            this.daysview.style.display = 'block';
        }
        else if(this.mode==1) {
            this.daysview.style.display = 'none';
            this.yearsview.style.display = 'none';
            this.monthsview.style.display = 'block';
        }
        else if(this.mode==2){
            this.monthsview.style.display = 'none';
            this.yearsview.style.display = 'block';
        }
    }
};

window.Datepicker = Datepicker;