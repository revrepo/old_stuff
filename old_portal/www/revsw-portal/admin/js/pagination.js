var Pagination = function(){
	
};
Pagination.prototype = {
	init: function(options){
		this.options = options;
		this.options.element  = $(options.element);
		this.showNavigation();
	},	
	next : function() {
		
	},
	previous: function() {

	},
	showNavigation: function(){
		this.options.total = this.options.items.length;
		if(this.options.total > this.options.display){
			this.options.pages = Math.ceil(this.options.total/this.options.display);  
			this.show_next_previous();
		}else{
			this.hide_next_previous();
		}
	},
	show_next_previous: function(){
		if(this.options.pages>1){
			this.options.element.html("<ul></ul>");
			var i = 1;
			while(i<this.options.pages){
				this.options.element.find("ul").append("<li>"+i+"</li>");
				i++;
			}
		}
	},
	hide_next_previous: function(){
		this.options.element.html("");
	}
};
