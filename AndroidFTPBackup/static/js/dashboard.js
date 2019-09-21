$("#open-backup").click(function () {
  $.ajax({
      url: 'ajax/open_/',
      data: {query:''},
  });
});

$(document).ready(function(){
    const query = $('#backup_dir').attr('name');

    $.ajax({
        url: "ajax/open_dir/",
        data:{query:query},
        success:function(data) {
            $('#backup_dir').html(data);
        }
    });

    $.ajax({
        url: 'ajax/get-total-size',
        data: {query:''},
        success:function (data) {
            $('#total-size').html(data)
        }
    });

    $.ajax({
        url: 'https://www.google.com/jsapi?callback',
        cache: true,
        dataType: 'script',
        success: function () {
            google.load('visualization', '1', {
                packages: ['corechart'], 'callback': function () {
                    $.ajax({
                        data: {id: 'data_size'},
                        url: 'ajax/get-chart/',
                        success: function (jsondata) {
                            var result = [];
                            for(var i in jsondata)
                                result.push([i, jsondata[i]]);
                            var data = google.visualization.arrayToDataTable(result);
                            const options_size = {
                                title: 'Disk Space used in GB',
                                fontName: "'Salsa', cursive",
                                pieHole: 0.4,
                            };

                            var chart = new google.visualization.PieChart(document.getElementById('size-chart'));
                            chart.draw(data, options_size);
                        }
                    });

                    $.ajax({
                        data: {id: 'data_count'},
                        url: 'ajax/get-chart/',
                        success: function (jsondata) {
                            var result = [];
                            for(var i in jsondata)
                                result.push([i, jsondata[i]]);
                            var data = google.visualization.arrayToDataTable(result);
                            const options_count = {
                                title: 'Number of files',
                                fontName: "'Salsa', cursive",
                                pieHole: 0.4,
                            };

                            var chart = new google.visualization.PieChart(document.getElementById('count-chart'));
                            chart.draw(data, options_count);
                        }
                    });
                },
            })
        }
    });
});
