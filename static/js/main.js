import {
  languagesList
} from './_languagesList.js';
google.charts.load("current", {
    packages: ["corechart"]
  });
  var url = "http://127.0.0.1:5000/get?query=";
  var positive,
    negative,
    neutral = 0;
  var aux_tweets = [];
  $("#tweet").submit(function (e) {
    e.preventDefault();
    var keyword = $('#keyword')[0].value;
    var language = $('#language')[0].value.replace(/ /g, "");
    console.log(language)
    if (keyword.length > 0) {
      $("#schart").html("");
      $("#lchart").html("");
      $("#tweet_heading").html("");
      $("#tweet_body").html("");
      $('.loader-container').css('display','block');
      var u;
      if(language.length > 0){
        language = language.toLowerCase();
        if (languagesList.find(l => l.code === language) != undefined){
          u = url + keyword + '&lang=' + language;
        }else{
          window.alert("Language not found. Searching in all languages");
          u = url + keyword;
        }
      }else{
        u = url + keyword;
      }
      $.ajax({
        url: u,
        type : 'POST',
        success: function (response) {
          $("#for").html("for " + keyword);
          $("#hr").html("<hr/>");
          positive = response["Sentiment"]["positive"];
          negative = response["Sentiment"]["negative"];
          neutral = response["Sentiment"]["neutral"];
          schart(positive, negative, neutral);
          language_chart(response["Languages"]);
          aux_tweets = response["Tweets"]["tweets"];
          tweets(response["Tweets"]["tweets"]);
          $('.loader-container').css('display','none');
        }
      });
    }
  });

  function schart(pos, neg, neu) {
    console.log(pos,neu,neg)
    var data = google.visualization.arrayToDataTable([
      ["Sentiment", "Value"],
      ["Positive", pos],
      ["Negative", neg],
      ["Neutral", neu]
    ]);
    var options = {
      title: "Sentiment Analysis",
      tooltip: {
        trigger: 'selection'
      }
    };
    var chart = new google.visualization.PieChart(
      document.getElementById("schart")
    );
    chart.setAction({
          id: 'filter',
          text: 'See tweets with this polarity',
          action: function() {
            var selection = chart.getSelection();
            var aux_array = []
            switch (selection[0].row) {
              case 0: 
                      aux_array = aux_tweets.filter(tweet => tweet.polarity == "Positive");
                      tweets(aux_array);
                      break;
              case 1: 
                      aux_array = aux_tweets.filter(tweet => tweet.polarity == "Negative");
                      tweets(aux_array); 
                      break;
              case 2: 
                      aux_array = aux_tweets.filter(tweet => tweet.polarity == "Neutral");
                      tweets(aux_array); 
                      break;
            }
          }
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
      title: "Language Analysis"
    };
    var chart = new google.visualization.PieChart(
      document.getElementById("lchart")
    );
    chart.draw(data, options);
  }

  function tweets(tweets) {
    console.log(tweets);
    $("#tweets").load("/tweets_template", function(){
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
        $("#tweet_body").append(
          '<ul id="pagination-demo" class="pagination-lg pull-right">'
        );
      });
    });
    
  }