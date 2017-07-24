var socket = io();

var vm = new Vue({
    el: '#app',
    data: {
        pages: {},
        referrers: {},
        activeUsers: 0
    },
    created: function() {
        socket.on('updated-stats', function(data) {
            this.pages = data.pages;
            this.referrers = data.referrers;
            this.activeUsers = data.activeUsers;
            this.mouseX = data.mouseX;
            this.mouseY = data.mouseY;
           
            }.bind(this));
           socket.on('desct-ii', function(data) {
           $(".liveActiviti").append("<p>Disconnected : "+ data.mouseX+"</p>");
           }.bind(this));
           
           
    }
});
var cm = new Vue({
    el: '#app2',
    data: {
        pages: {},
        referrers: {},
        activeUsers: 0
    },
    
    created: function () {
        socket.on('desct-clk', function (data) {
            this.pages = data.pages;
            this.referrers = data.referrers;
            this.activeUsers = data.activeUsers;
        }.bind(this));
        

    }
});
