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
            console.log(data.pages);
            }.bind(this));
           socket.on('desct-ii', function(data) {
           $(".liveActiviti").append("<p>Disconnected : "+ data.mouseX+"</p>");
           }.bind(this));
           
           
    }
});

$(document).ready(function() {
    $("body").on('click', '.la-ac', function() {
        var iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        var iframe = document.createElement('iframe');
        iframe.src = $(this).attr('data-url');
        $(".modal-body").append(iframe);
        $("#showIframe").click();
    });
});

