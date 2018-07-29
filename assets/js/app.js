$.ajax({
    method: "GET",
    url: "/config.json",
    complete: function(response) {
        var config = response.responseJSON;
        $("#js-target").html(config.target);
        $("#countdown").countdown(config.deadline, function(event) {
            $(this).text(event.strftime("%D дня %H часов %M минут %S секунд"));
        });
        for(var key in config.tasks) {
          $("#js-todolist").append("<li><b>" + config.tasks[key].user + "</b> - " + config.tasks[key].task + "</li>");
        }
    }
});
