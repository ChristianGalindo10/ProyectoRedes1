import { languagesList } from "./_languagesList.js";
google.charts.load("current", {
  packages: ["corechart", "geochart", "calendar"],
  'mapsApiKey': 'AIzaSyAMGlIzu-uy-cWpLeXiBgJb229UzYRMZLM'
});
var url = "http://127.0.0.1:5000/get?query=";
var url_del = "http://127.0.0.1:5000/del";
var positive,
  negative,
  neutral = 0;
var aux_tweets = [];
$("#tweet").submit(function (e) {
  e.preventDefault();
  var keyword = $("#keyword")[0].value;
  var language = $("#language")[0].value.replace(/ /g, "");
  var place = $("#place")[0].value;
  var user = $("#user")[0].value;
  var since = $("#since")[0].value;
  var until = $("#until")[0].value;
  var since_year = since.split('-')[0];
  var until_year = until.split('-')[0];
  since_year = parseInt(since_year,10);
  until_year = parseInt(until_year,10);
  var u;
  u = url;
  if (keyword.length > 0) {
    u += keyword;
  }
  $("#schart").html("");
    $("#lchart").html("");
    $("#rchart").html("");
    $("#calendar_basic").html("");
    $("#tweet_heading").html("");
    $("#tweet_body").html("");
    $(".loader-container").css("display", "block");
    if (language.length > 0) {
      language = language.toLowerCase();
      if (languagesList.find((l) => l.code === language) != undefined) {
        u += "&lang=" + language;
      } else {
        window.alert("Language not found. Searching in all languages");
      }
    }
    if (place.length > 0) {
      u += "&place=" + place;
    }
    if (user.length > 0) {
      u += "&user=" + user;
    }
    if (since.length > 0) {
      u += "&since=" + since;
    }
    if (until.length > 0) {
      u += "&until=" + until;
    }
    $.ajax({
      url: u,
      type: "POST",
      success: function (response) {
        $("#for").html("for " + keyword);
        $("#hr").html("<hr/>");
        positive = response["Sentiment"]["positive"];
        negative = response["Sentiment"]["negative"];
        neutral = response["Sentiment"]["neutral"];
        schart(positive, negative, neutral);
        language_chart(response["Languages"]);
        drawRegionsMap(response["Regions"]);
        drawCalendar(response["Tweets"]["tweets"],since_year,until_year);
        aux_tweets = response["Tweets"]["tweets"];
        tweets(response["Tweets"]["tweets"]);
        $(".loader-container").css("display", "none");
      },
    });
});

$("#delete").submit(function (e) {
  e.preventDefault();
    $.ajax({
      url: url_del,
      type: "POST",
      success: function (response) {
        window.location.href = "http://127.0.0.1:5000/"
       },
    });
});

function schart(pos, neg, neu) {
  console.log(pos, neu, neg);
  var data = google.visualization.arrayToDataTable([
    ["Sentiment", "Value"],
    ["Positive", pos],
    ["Negative", neg],
    ["Neutral", neu],
  ]);
  var options = {
    title: "Sentiment Analysis",
    tooltip: {
      trigger: "selection",
    },
  };
  var chart = new google.visualization.PieChart(
    document.getElementById("schart")
  );
  chart.setAction({
    id: "filter",
    text: "See tweets with this polarity",
    action: function () {
      var selection = chart.getSelection();
      var aux_array = [];
      switch (selection[0].row) {
        case 0:
          aux_array = aux_tweets.filter(
            (tweet) => tweet.polarity == "Positive"
          );
          tweets(aux_array);
          break;
        case 1:
          aux_array = aux_tweets.filter(
            (tweet) => tweet.polarity == "Negative"
          );
          tweets(aux_array);
          break;
        case 2:
          aux_array = aux_tweets.filter((tweet) => tweet.polarity == "Neutral");
          tweets(aux_array);
          break;
      }
    },
  });
  chart.draw(data, options);
}

function language_chart(lang_data) {
  console.log(lang_data);
  var lang_obj = JSON.parse(JSON.stringify(lang_data));
  var data = new google.visualization.DataTable();
  data.addColumn("string", "Language");
  data.addColumn("number", "Count");
  var lData = [];
  for (let key in lang_obj) {
    if (lang_obj.hasOwnProperty(key)) {
      lData.push([key, lang_obj[key]]);
    }
  }
  data.addRows(lData);
  var options = {
    title: "Language Analysis",
  };
  var chart = new google.visualization.PieChart(
    document.getElementById("lchart")
  );
  chart.draw(data, options);
}

function drawRegionsMap(region_data) {
  var region_obj = JSON.parse(JSON.stringify(region_data));
  var data = new google.visualization.DataTable();
  data.addColumn("string", "Country");
  data.addColumn("number", "Polarity");
  var rData = [];
  for (let key in region_obj) {
    if (region_obj.hasOwnProperty(key)) {
      rData.push([key, (region_obj[key][1]/region_obj[key][0])]);
    }
  }
  console.log(rData);
  data.addRows(rData);
  var options = {};

  var chart = new google.visualization.GeoChart(
    document.getElementById("rchart")
  );

  chart.draw(data, options);
}

function drawCalendar(tweets,since,until) {
  //var region_obj = JSON.parse(JSON.stringify(region_data));
  var diference = until-since;
  var dateData = []
  console.log(until,since,diference);
  var data = new google.visualization.DataTable();
  data.addColumn({ type: 'date', id: 'Date' });
  data.addColumn({ type: 'number', id: 'Won/Loss' });
  // data.addRows([
  //   [new Date(2012, 3, 13), 37032],
  //   [new Date(2012, 3, 14), 38024],
  //   [new Date(2012, 3, 15), 38024],
  //   [new Date(2012, 3, 16), 38108],
  //   [new Date(2012, 3, 17), 38229],
  //   // Many rows omitted for brevity.
  //   [new Date(2013, 9, 4), 38177],
  //   [new Date(2013, 9, 5), 38705],
  //   [new Date(2013, 9, 12), 38210],
  //   [new Date(2013, 9, 13), 38029],
  //   [new Date(2013, 9, 19), 38823],
  //   [new Date(2013, 9, 23), 38345],
  //   [new Date(2013, 9, 24), 38436],
  //   [new Date(2013, 9, 30), 38447],
  // ]);
  var calendarData = [];
  var pol;
  var t_count;
  $.each(tweets, function (key, value) {
    if(!dateData.includes(tweets[key]["created_at"])){
      dateData.push(tweets[key]["created_at"]);
    }
  });
  $.each(dateData, function (indice,elemento){
    pol = 0;
    t_count = 0;
    $.each(tweets, function (key, value) {
      if(tweets[key]["created_at"]==elemento){
        if (tweets[key]["polarity"]=="Positive"){
          pol += 1;
        }else if(tweets[key]["polarity"]=="Neutral"){
          pol += 0;
        }else{
          pol -= 1;
        }
        t_count+=1;
      }
    });
    calendarData.push([new Date(elemento),(pol/t_count)]);
  });
  data.addRows(calendarData);

  var chart = new google.visualization.Calendar(
    document.getElementById("calendar_basic")
  );

  var options = {
    title: 'Feelings Calendar',
    height: 190+(145*diference),
    calendar: {
      monthLabel: {
        fontName: 'Times-Roman',
        fontSize: 12,
        color: '#981b48',
        bold: true,
        italic: true
      },
      monthOutlineColor: {
        stroke: '#981b48',
        strokeOpacity: 0.8,
        strokeWidth: 2
      },
      unusedMonthOutlineColor: {
        stroke: '#bc5679',
        strokeOpacity: 0.8,
        strokeWidth: 1
      },
      underMonthSpace: 16,
    },
    colorAxis :{
      minValue: -1,  
      maxValue: 1,
      colors: ['#d93025', '#34a853']
    }
  };

  chart.draw(data, options);
  //$('#calendar_basic').find("svg").css( "height", "auto" );
}

function tweets(tweets) {
  console.log(tweets);
  $("#tweets").load("/tweets_template", function () {
    $("#tweet_heading").html('<hr/><h1 align="center">Source Tweets </h1>');
    var id = 0;
    var pid;
    $.each(tweets, function (key, value) {
      id = id + 1;
      pid = "page" + id;
      var twt =
        '<div class="tw-block-parent id' +
        '="' +
        pid +
        '"><div class="timeline-TweetList-tweet"> <div class="timeline-Tweet"><div class="timeline-Tweet-brand"><div class="Icon Icon--twitter"></div> </div><div class="timeline-Tweet-author"><div class="TweetAuthor"><a class="TweetAuthor-link" href="' +
        "https://twitter.com/" +
        tweets[key]["screen_name"] +
        '" target="_blank"></a><span class="TweetAuthor-avatar"><div class="Avatar"><img src="' +
        tweets[key]["profile_image"] +
        '"/></div></span><span class="TweetAuthor-name">' +
        tweets[key]["name"] +
        '</span><span class="TweetAuthor-screenName">' +
        tweets[key]["screen_name"] +
        '</span></div></div><div class="timeline-Tweet-text"><a href="' +
        tweets[key]["url"] +
        '" target="_blank"</a>' +
        tweets[key]["Tweet_Text"] +
        '</div><div class="timeline-Tweet-metadata"><span class="timeline-Tweet-timestamp">' +
        tweets[key]["created_at"] +
        "</span></div></div></div></div></li>";

      $("#tweet_body").append(twt);
    });
    $('#tweet_body').paginate({
        perPage: 10,
        autoScroll: false, 
        scope: $('div'),// targets all div elements
      });
  });
}
