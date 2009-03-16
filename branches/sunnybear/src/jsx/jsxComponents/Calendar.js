jsxComponents.Calendar = new function(){
    jsx.Links.createLink({href: jsx.ConstructURL.construct('{jsxComponents}.Calendar.style', 'css')});
    this.init = function(element, params){
        return new jsxComponents.Calendar.Constructor(element, params);
    };
};

jsxComponents.Calendar.Constructor = function(element, params){
    this.element = element;
    this.dates = this.createDates(params.lang);
    this.init();
    this.beginFrom = params.beginFrom || null;
    this.draw(params.date || new Date());
    jsx.Events.observe(window, 'unload', jsx.bind(this, this.garbageCollector));
    element = null;
};

jsxComponents.Calendar.Constructor.prototype = new function(){
    this.init = function(){
      this.drawHeaderAndBody();
      jsx.Dom.addClassName(this.element, 'b-jsxComponents-calendar');  
      jsx.Events.observe(this.element, 'click', jsx.bind(this, this.onClick));
    };
    
    this.createDates = function(lang){
      function dates(lang){
        if (lang){
          this.lang = lang;
        }
        if (lang == 'en'){
          this.firstDay = 'Sunday';
        }
      }
      dates.prototype = jsx.Dates;
      return new dates(lang);
    };
    
    this.open = function(date){
      if (date instanceof Date && this.dates.getDays(this.date) != this.dates.getDays(date)){
        this.draw(date);
      }
      jsx.Dom.removeClassName(this.element, 'g-hidden');
    };

    this.close = function(){
      jsx.Dom.addClassName(this.element, 'g-hidden');
    };
    
    this.toggle = function(date){
      if (jsx.Dom.hasClassName(this.element, 'g-hidden')){
        this.open(date);
      }else{
        this.close();
      }
    };
    
    this.onClick = function(event){
      jsx.Events.stop(event);
      var dateStr = jsx.Events.element(event).getAttribute('abbr');
      if (!dateStr || dateStr.length == 0){
        return;
      }
      var date = new Date(dateStr);
      if(this.date.getMonth() != date.getMonth()){
        var monthChanged = true;
        jsx.CallBacks.dispatch('jsxComponents-Calendar-ChangeMonth', this.element, date);
      }
      jsx.CallBacks.dispatch('jsxComponents-Calendar-ClickDate', this.element, date);
      if (this.dates.getDays(date) != this.dates.getDays(this.date)){
        jsx.CallBacks.dispatch('jsxComponents-Calendar-ChangeDate', this.element, date);        
        this.draw(date);
      }
      if(monthChanged){
        jsx.CallBacks.dispatch('jsxComponents-Calendar-AfterChangeMonth', this.element, date);
      }
      
    };
    
    this.drawHeaderAndBody = function(){
        var tmpDiv = document.createElement('div');
        var headerClass = 'b-jsxComponents-calendar-header';
        var bodyClass = 'b-jsxComponents-calendar-body';        
        tmpDiv.innerHTML = '<div class="' + headerClass + '"></div><div class="' + bodyClass + '">';

        this.header = jsx.Dom.getElementsBySelector(tmpDiv, '.' + headerClass)[0];
        this.body = jsx.Dom.getElementsBySelector(tmpDiv, '.' + bodyClass)[0];
        this.element.appendChild(this.header);
        this.element.appendChild(this.body);
    };
    this.draw = function(date){
        this.date = date;
        this.matrix = jsxComponents.Calendar.NumberDates.create(date, this.dates);
        this.result  = '<table class="b-jsxComponents-calendar-body-dates" cellpadding="0" cellspacing="0"><tbody>';
        jsx.toArray(this.matrix.dates).map(jsx.bind(this, this.drawWeek));
        this.result += '</tbody></table>';
        this.body.innerHTML = this.result;

        var prevMonth = this.dates.changeMonthAndYear(new Date(this.matrix.info.date), -1);
        this.result =  '<a href="#" abbr="' + prevMonth.toString() + '" class="b-jsxComponents-calendar-monthswitch b-jsxComponents-calendar-prevmonth">&lt;</a>';
        var nextMonth = this.dates.changeMonthAndYear(new Date(this.matrix.info.date), +1);
        this.result += '<a href="#" abbr="' + nextMonth.toString() + '" class="b-jsxComponents-calendar-monthswitch b-jsxComponents-calendar-nextmonth">&gt;</a>';
        
        this.result += this.dates.toFormat(this.matrix.info.date, '%B, %Y');

        this.header.innerHTML = this.result;
        jsx.CallBacks.dispatch('jsxComponents-Calendar-Redraw', this.element);
    };
    this.drawWeek = function(week){
        this.result += '<tr>';
        jsx.toArray(week).map(jsx.bind(this, this.drawDate));
        this.result += '</tr>';
    };
    this.drawDate = function(date){
        var prefix = 'b-jsxComponents-calendar-date-';
        var className = 'b-jsxComponents-calendar-date';
        className += date.month != 'current' ? ' ' + prefix + 'anothermonth ' : '';
        className += date.today ? ' ' + prefix + 'today ' : '';
        className += date.selected ? ' ' + prefix + 'selected ' : '';
        className += date.holiday ? ' ' + prefix + 'holiday ' : '';

        this.result += '<td class="' + className + '">';
        this.result += this.drawDateHref(date.date);
        this.result += '</td>';
    };
    this.drawDateHref = function(date){
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        if(this.beginFrom && this.dates.getDays(this.beginFrom) > this.dates.getDays(date)){
          return '<span class="b-jsxComponents-calendar-date-disable">' + this.dates.toFormat(date, '%d') + '</span>';
        }
        return '<a href="#" abbr="' + date.toString() + '">' + this.dates.toFormat(date, '%d') + '</a>';
    };

    this.garbageCollector = function(){
        this.element = null;
        this.header = null;
        this.body = null;
    };
};

jsx.require(['Dom', 'Events', 'Dates', 'CallBacks', '{jsxComponents}.Calendar.NumberDates'], jsx.bind(jsx, jsx.loaded, '{jsxComponents}.Calendar'));