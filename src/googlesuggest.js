;(function(global, $){
    
    var defaults =  {
        menuContainer: null,
        menuClass: null,
        itemClass: null,
        itemHighlightedClass: null,
        interval: 100,
        maxItemCount: 5
    };
    
    var GoogleSuggest = function($input, options) { 
        if($input.length === 0 ) return;
        if($input[0].tagName.toLowerCase() !== 'input' || $.inArray($input.attr('type').toLowerCase(), ['text', 'search', 'email', 'url', 'tel' ]) === -1) throw new Error('Only support "input" element with type of "text", "search", "email", "url" and "tel" ');
        if(!!options.menuContainer && $(options.menuContainer).length === 0) throw new Error('menuContainer is invalid');
        var idOrName = $input.attr('id') || $input.attr('name');
        if(!idOrName) throw new Error('Element must have an id or name');
        
        var self = this;
        self.options = $.extend({}, defaults, options);
        self.inputField = $input[0];
        self.$inputField = $input;
        self.idOrName = idOrName;
        self.inputField.googleSuggest = self;
        self.$menu = $('<ul/>').addClass(self.options.menuClass || '');
        self.menuContainer = (!!self.options.menuContainer) ? $(self.options.menuContainer)[0] : self.$inputField.parent()[0];
        
        $(document).on('click touch', function(e) {
            //remove menu if page is clicked anywhere except the input field
            if(self.$inputField[0] !== e.target)  {
               self.$menu.remove();
            }
        });
        
        self.$inputField.on('keydown', function(e) {
                            if(!!e && !!self.$menu.parent()) {
                                if(e.which === 38) {
                                    //UP key
                                    e.preventDefault();
                                    self.lastSelectedIndex--;
                                    self.selectItem();
                                    
                                } else if(e.which === 40) {
                                    //DOWN key
                                    e.preventDefault();
                                    self.lastSelectedIndex++;
                                    self.selectItem();
                                } else if(e.which === 27) {
                                    //ESCAPE key
                                    //remove menu
                                    self.$menu.remove();
                                }
                            }
                        }).on('focus', function() {
                            //start suggesting if input field is focued
                            self.startSuggest();
                        }).on('blur', function() {
                            //stop suggesting if input field lost focus
                            self.stopSuggest();
                        });
    };
    
    //to globally store callbacks
    GoogleSuggest.callbacks = {};
    GoogleSuggest.defaults = defaults;
    
    $.extend(GoogleSuggest.prototype, {
        options: null,
        id: null,
        $inputField: null,
        inputField: null,
        $menu: null,
        timer: null,
        lastInput: null,
        lastSelectedIndex: null,
        
        showSuggestions : function(data) {
            var self = this;
            if($.isArray(data) && data.length > 1 && data[1].length > 0) {
                self.lastSelectedIndex = -1;
                //first remove menu from page and clear items
                //add menu into document first, and then append menu items
                self.$menu.empty().appendTo(self.menuContainer);
                
                var items = [];
                for(var i = 0; i < data[1].length && i < self.options.maxItemCount; i++) {
                    var $item = $('<li/>'); 
                    $item.addClass(self.options.itemClass || '');
                    $item.text(data[1][i]);
                    items.push($item[0]);
                }
                
                $(items).appendTo(self.$menu).on('click touch', function() {
                    self.selectItem(this);
                    self.$inputField.focus();
                }).on('mouseenter', function() {
                    //remove the highlighted class for previous item
                    self.$menu.children('.' + self.options.itemHighlightedClass).removeClass(self.options.itemHighlightedClass);
                    $(this).addClass(self.options.itemHighlightedClass);
                    self.lastSelectedIndex = $(this).index();
                });
            } else {
                //remove menu if no suggestions returned
                self.$menu.remove();
            }
        },
        
        getSuggestions: function(text) {
            var self = this;
            var googleUrl =  'https://suggestqueries.google.com/complete/search';
            $.ajax({
                type: 'GET',
                url: googleUrl,
                dataType: 'jsonp',
                jsonp: 'jsonp',
                jsonpCallback: 'GoogleSuggest.callbacks.' + self.idOrName,
                data: {
                    client: 'chrome',
                    q : text                    
                },
                error: function(xhr, errorType, error) {
                }
            });
        },
        
        addCallback: function () {
            var self = this;
            GoogleSuggest.callbacks[self.idOrName] = function(data) {
                self.showSuggestions(data);
            }
        }, 
        
        removeCallback: function() {
            delete GoogleSuggest.callbacks[this.idOrName];
        },
        
        selectItem: function(item) {
            if(!item) {
                var $items = this.$menu.children();
                $items.removeClass(this.options.itemHighlightedClass);
                this.lastSelectedIndex = (this.lastSelectedIndex + $items.length) % $items.length;
                item = $items[this.lastSelectedIndex];
            }
            
            $(item).addClass(this.options.itemHighlightedClass);
            this.$inputField.val($(item).text());
            this.lastInput = $(item).text();
        },

        startSuggest: function() {
            var self = this;
            //add callback
            self.addCallback();
            self.timer = window.setTimeout(function runGoogleSuggest() {
                if(!!self.timer) {
                    window.clearTimeout(self.timer);
                    self.timer = null;
                }
                
                var input = self.$inputField.val();
                if(input != self.lastInput) {
                    self.lastInput = input;
                    self.getSuggestions(input);
                }
                self.timer = window.setTimeout(runGoogleSuggest, self.options.interval);
            }, self.options.interval);
        },
        
        stopSuggest: function() {
            this.removeCallback();
            if(!!this.timer) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }
        }
    });
    
    //export GoogleSuggest to global scope
    global.GoogleSuggest = GoogleSuggest;
    
    $.fn.googleSuggest = function (options){
        return this.each(function() {
            if(this.tagName.toLowerCase() === 'input' && $.inArray($(this).attr('type'), ['text', 'search', 'email', 'url', 'tel' ]) >= 0 && !this.googleSuggest) {
                new GoogleSuggest($(this), options);
            }
        });
    };

})(window, this.Zepto || this.jQuery);