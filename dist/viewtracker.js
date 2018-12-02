var Viewtracker = function(month, year) {

    this.month = month;
    this.year = year;

    this.changemonth = function(i) {
        this.month+=i;
        if(this.month==12) {
            this.month=0;
            this.year+=1;
        }
        if(this.month==-1) {
            this.month=11;
            this.year-=1;
        }
    };

    this.changeyear = function(i) {
        this.year+=i;
    };

    this.modes = [
        {
            "param":"changemonth",
            "step":1
        },
        {
            "param":"changeyear",
            "step":1
        },
        {
            "param":"changeyear",
            "step":16
        }
    ]
};

module.exports = Viewtracker;