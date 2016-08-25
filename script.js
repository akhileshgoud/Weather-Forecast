// nav dropdown click toggle

$(".navbar-nav li a").click(function(event) {
    $(".navbar-collapse").collapse('hide');
});


//setup sqlite db

var databaseOptions = {
            fileName: "sqlite_test",
            version: "1.0",
            displayName: "SQLite Hello World",
            maxSize: 1024
        };

  var database = openDatabase(
            databaseOptions.fileName,
            databaseOptions.version,
            databaseOptions.displayName,
            databaseOptions.maxSize
        );

  database.transaction(
            function( transaction ){
                console.log("Creating Table");
                transaction.executeSql(
                    "CREATE TABLE IF NOT EXISTS Searches (uId INTEGER PRIMARY KEY AUTOINCREMENT, searchTerm TEXT NOT NULL);"
                );
            }
        );

    function saveData(search_term){
        database.transaction(
                function( transaction ){
                    console.log("Inserting");
                    transaction.executeSql(
                        "INSERT INTO Searches (searchTerm) VALUES ('"+search_term+"');"
                    );
                }
            );
     }

     function getData(){

        database.transaction(
                    function( transaction ){
                        transaction.executeSql('SELECT DISTINCT searchTerm FROM Searches', [],
                        function(transaction, results){
                            if(results.rows.length > 0) {
                                var saved_search = "";
                                saved_search = '<div class="panel panel-primary">';
                                saved_search += '<div class="panel-heading" id="panel-ss-head">Recent Searches</div>';
                                saved_search += '<div class="panel-body" id="panel-ss-content">';
                                saved_search += '</div></div>';
                                document.getElementById("saved-search").innerHTML = saved_search;
                                var save_search_panel_content = "";
                                for(var i=0; i<results.rows.length; i++){
                                    //console.log(results.rows[i].searchTerm);
                                    var save_search_button = '<button class="btn btn-primary btn-saved-search" id="'+results.rows[i].searchTerm+'" onclick="searchFunction()" value="'+results.rows[i].searchTerm+'">'+results.rows[i].searchTerm+'</button>'; 
                                    save_search_panel_content += save_search_button;

                                }
                                document.getElementById("panel-ss-content").innerHTML = save_search_panel_content;
                            }
                        },
                        function(transaction, error){
                            console.log(error);
                        });
                    });
     }
         

// getting location
window.onload = function() {
    if (navigator.geolocation) {
        var startPos;
        var lat;
        var long;
        var geoSuccess = function(position) {
            startPos = position;
            lat = startPos.coords.latitude;
            long = startPos.coords.longitude;
            
            var url1 = "http://api.openweathermap.org/data/2.5/weather?appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial&lat="+lat+"&lon="+long;
            $.getJSON( url1, function( data1 ) {
                var city_name = data1.name;
                var icon = "http://openweathermap.org/img/w/"+data1.weather[0].icon+".png";
                var temp = data1.main.temp;
                document.getElementById('jumbo-content').innerHTML = 'Weather in the city of '+city_name+'<br><img src="'+icon+'"/>&nbsp;&nbsp;'+temp+' &deg;F';
                
                document.getElementById('panel-head').innerHTML = 'Details for '+city_name;
                
                var pres = data1.main.pressure;
                var hum = data1.main.humidity;
                var min_temp = data1.main.temp_min;
                var max_temp = data1.main.temp_max;
                document.getElementById('pressure').innerHTML = pres+' atm';
                document.getElementById('humidity').innerHTML = hum+' %';
                document.getElementById('min-temp').innerHTML = min_temp+' &deg;F';
                document.getElementById('max-temp').innerHTML = max_temp+' &deg;F';
            });
            
            var url2 = "http://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
            $.getJSON( url2, function( data2 ) {
                var city = data2.city.name;
                document.getElementById('panel-hourly-head').innerHTML = 'Hourly Details for '+city;
                document.getElementById('panel-daily-head').innerHTML = 'Daily Details for '+city;
                
                var listArray = data2.list;
                
                // hourly details
                var hourly_table = document.getElementById('hourly-table');
                for (var i=0; i<listArray.length; i++) {
                    if (i % 3 == 0) {
                        var row = hourly_table.insertRow(-1);
                    }
                    var cell1 = row.insertCell(-1);
                    cell1.innerHTML = listArray[i].dt_txt;
                    var cell2 = row.insertCell(-1);
                    var icon_hourly = "http://openweathermap.org/img/w/"+listArray[i].weather[0].icon+".png";
                    cell2.innerHTML = '<img src="'+icon_hourly+'"/>&nbsp;&nbsp;'+listArray[i].main.temp+' &deg;F';
                }
            });
            
            var url3 = "http://api.openweathermap.org/data/2.5/forecast/daily?lat="+lat+"&lon="+long+"&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
            $.getJSON( url3, function( data3 ) {
                
                var listArray_daily = data3.list;
                
                //daily details
                var daily_table = document.getElementById('daily-table');
                for (var j=0; j<listArray_daily.length; j++) {
                    if (j % 3 == 0) {
                        var row_daily = daily_table.insertRow(-1);
                    }
                    var cell1_daily = row_daily.insertCell(-1);
                    var d = new Date(listArray_daily[j].dt * 1000);
                    cell1_daily.innerHTML = d.toDateString();
                    var cell2_daily = row_daily.insertCell(-1);
                    var icon_daily = "http://openweathermap.org/img/w/"+listArray_daily[j].weather[0].icon+".png";
                    cell2_daily.innerHTML = '<img src="'+icon_daily+'"/>&nbsp;&nbsp;'+listArray_daily[j].temp.day+' &deg;F';
                }
            });
                      
        };
        navigator.geolocation.getCurrentPosition(geoSuccess); 
    } else {
        document.getElementById('jumbo-content').innerHTML = "Geolocation is not supported by this browser.";
    }
    
    var results = getData();
    
}


// searching for user input

$("#search-form").submit(function(e) {
    e.preventDefault();
    var term = document.getElementById('search-term').value;

    var url1 = "http://api.openweathermap.org/data/2.5/weather?appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial&q="+term+",us";
    $.getJSON( url1, function( data1 ) {
        var city_name = data1.name;
        var icon = "http://openweathermap.org/img/w/"+data1.weather[0].icon+".png";
        var temp = data1.main.temp;
        document.getElementById('jumbo-content').innerHTML = 'Weather in the city of '+city_name+'<br><img src="'+icon+'"/>&nbsp;&nbsp;'+temp+' &deg;F';

        document.getElementById('panel-head').innerHTML = 'Details for '+city_name;

        var pres = data1.main.pressure;
        var hum = data1.main.humidity;
        var min_temp = data1.main.temp_min;
        var max_temp = data1.main.temp_max;
        document.getElementById('pressure').innerHTML = pres+' atm';
        document.getElementById('humidity').innerHTML = hum+' %';
        document.getElementById('min-temp').innerHTML = min_temp+' &deg;F';
        document.getElementById('max-temp').innerHTML = max_temp+' &deg;F';
    });

    var url2 = "http://api.openweathermap.org/data/2.5/forecast?q="+term+",us&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
    $.getJSON( url2, function( data2 ) {
        var city = data2.city.name;
        document.getElementById('panel-hourly-head').innerHTML = 'Hourly Details for '+city;
        document.getElementById('panel-daily-head').innerHTML = 'Daily Details for '+city;

        var listArray = data2.list;

        // hourly details
        document.getElementById('hourly-table').innerHTML="";
        var hourly_table = document.getElementById('hourly-table');
        for (var i=0; i<listArray.length; i++) {
            if (i % 3 == 0) {
                var row = hourly_table.insertRow(-1);
            }
            var cell1 = row.insertCell(-1);
            cell1.innerHTML = listArray[i].dt_txt;
            var cell2 = row.insertCell(-1);
            var icon_hourly = "http://openweathermap.org/img/w/"+listArray[i].weather[0].icon+".png";
            cell2.innerHTML = '<img src="'+icon_hourly+'"/>&nbsp;&nbsp;'+listArray[i].main.temp+' &deg;F';
        }
    });

    var url3 = "http://api.openweathermap.org/data/2.5/forecast/daily?q="+term+",us&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
    $.getJSON( url3, function( data3 ) {

        var listArray_daily = data3.list;

        //daily details
        document.getElementById('daily-table').innerHTML="";
        var daily_table = document.getElementById('daily-table');
        for (var j=0; j<listArray_daily.length; j++) {
            if (j % 3 == 0) {
                var row_daily = daily_table.insertRow(-1);
            }
            var cell1_daily = row_daily.insertCell(-1);
            var d = new Date(listArray_daily[j].dt * 1000);
            cell1_daily.innerHTML = d.toDateString();
            var cell2_daily = row_daily.insertCell(-1);
            var icon_daily = "http://openweathermap.org/img/w/"+listArray_daily[j].weather[0].icon+".png";
            cell2_daily.innerHTML = '<img src="'+icon_daily+'"/>&nbsp;&nbsp;'+listArray_daily[j].temp.day+' &deg;F';
        }
    });
    
    
    // saving searches
    var result = saveData(term);
    var results = getData();
 
});


// saved locations search

function searchFunction() {
    var term = event.target.value;

    var url1 = "http://api.openweathermap.org/data/2.5/weather?appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial&q="+term+",us";
    $.getJSON( url1, function( data1 ) {
        var city_name = data1.name;
        var icon = "http://openweathermap.org/img/w/"+data1.weather[0].icon+".png";
        var temp = data1.main.temp;
        document.getElementById('jumbo-content').innerHTML = 'Weather in the city of '+city_name+'<br><img src="'+icon+'"/>&nbsp;&nbsp;'+temp+' &deg;F';

        document.getElementById('panel-head').innerHTML = 'Details for '+city_name;

        var pres = data1.main.pressure;
        var hum = data1.main.humidity;
        var min_temp = data1.main.temp_min;
        var max_temp = data1.main.temp_max;
        document.getElementById('pressure').innerHTML = pres+' atm';
        document.getElementById('humidity').innerHTML = hum+' %';
        document.getElementById('min-temp').innerHTML = min_temp+' &deg;F';
        document.getElementById('max-temp').innerHTML = max_temp+' &deg;F';
    });

    var url2 = "http://api.openweathermap.org/data/2.5/forecast?q="+term+",us&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
    $.getJSON( url2, function( data2 ) {
        var city = data2.city.name;
        document.getElementById('panel-hourly-head').innerHTML = 'Hourly Details for '+city;
        document.getElementById('panel-daily-head').innerHTML = 'Daily Details for '+city;

        var listArray = data2.list;

        // hourly details
        document.getElementById('hourly-table').innerHTML="";
        var hourly_table = document.getElementById('hourly-table');
        for (var i=0; i<listArray.length; i++) {
            if (i % 3 == 0) {
                var row = hourly_table.insertRow(-1);
            }
            var cell1 = row.insertCell(-1);
            cell1.innerHTML = listArray[i].dt_txt;
            var cell2 = row.insertCell(-1);
            var icon_hourly = "http://openweathermap.org/img/w/"+listArray[i].weather[0].icon+".png";
            cell2.innerHTML = '<img src="'+icon_hourly+'"/>&nbsp;&nbsp;'+listArray[i].main.temp+' &deg;F';
        }
    });

    var url3 = "http://api.openweathermap.org/data/2.5/forecast/daily?q="+term+",us&appid=1b83a17d019aea7811a9f93bf08d5c3a&mode=JSON&units=imperial";
    $.getJSON( url3, function( data3 ) {

        var listArray_daily = data3.list;

        //daily details
        document.getElementById('daily-table').innerHTML="";
        var daily_table = document.getElementById('daily-table');
        for (var j=0; j<listArray_daily.length; j++) {
            if (j % 3 == 0) {
                var row_daily = daily_table.insertRow(-1);
            }
            var cell1_daily = row_daily.insertCell(-1);
            var d = new Date(listArray_daily[j].dt * 1000);
            cell1_daily.innerHTML = d.toDateString();
            var cell2_daily = row_daily.insertCell(-1);
            var icon_daily = "http://openweathermap.org/img/w/"+listArray_daily[j].weather[0].icon+".png";
            cell2_daily.innerHTML = '<img src="'+icon_daily+'"/>&nbsp;&nbsp;'+listArray_daily[j].temp.day+' &deg;F';
        }
    });
}