var socket = io();

var vm = new Vue({
    el: '#app',
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
var sc = new Vue({
    el: '#app2',
    data: {
        pages: {},
        referrers: {},
        activeUsers: 0
    },
   
    created: function () {
        socket.on('desct-scroll', function (data) {
            console.log(data);
            this.pages = data.pages;
            this.referrers = data.referrers;
            this.activeUsers = data.activeUsers;
        }.bind(this));
        

    }
});
