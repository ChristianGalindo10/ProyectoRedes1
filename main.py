import twint
from flask import Flask, render_template, request
from nltk.util import pr
import forms
import time
from textblob import TextBlob
from flask_cors import CORS
from datetime import date, datetime
from datetime import timedelta

app = Flask(__name__)
CORS(app)
# Config Twint
c = twint.Config()
c.Store_object = True
c.Hide_output = True
#c.Limit = 100
#c.Count = 100

tweets = []
t_data = {}  # dictionary for twitter data
my_json = {"tweets": []}
lang_data = {}  # dictionary for language data
region_data = {}  # dictionary for region data https://unstats.un.org/unsd/methodology/m49/


def generate_lang_data(lang):
    global lang_data
    if lang in lang_data:
        val = lang_data[lang]
        lang_data[lang] = val + 1
    else:
        lang_data[lang] = 1


def generate_region_data(region):
    global region_data
    if region in region_data:
        val = region_data[region]
        region_data[region] = val + 1
    else:
        region_data[region] = 1


def get_tweets(keyword, lang, place):
    # since="2017-01-01"
    #since_date = datetime.strptime(since, '%Y-%m-%d')
    now = datetime.now()
    #now_date = now.strftime("%Y-%m-%d")
    global tweets, t_data, my_json, lang_data, region_data
    tweets.clear()
    lang_data.clear()
    region_data.clear()
    my_json["tweets"].clear()
    twint.output.clean_lists()
    if keyword is not None:
        #date = now - timedelta(days=10)
        c.Search = keyword
        if lang != 'any':
            c.Lang = lang
        if place != 'any':
            c.Near = place
        # while (date != now):
        #     c.Limit = 1
        #     c.Count = 1
        #     format_date = date.strftime("%Y-%m-%d")
        #     c.Until = format_date
        #     twint.run.Search(c)
        #     date = date + timedelta(days=1)
        #     time.sleep(5)
        c.Limit = 50
        c.Count = 50
        twint.run.Search(c)
        public_tweets = twint.output.tweets_list
        c.Lang = None
        c.Near = None
    for tweet in public_tweets:
        tweets.append(tweet.tweet)
        t_data = {
            "Tweet_Text": tweet.tweet,
            "url": tweet.link,
            "user_name": tweet.username,
            "screen_name": tweet.username,
            "created_at": tweet.datestamp,
            "name": tweet.name,
            "profile_image": tweet.profile_image_url,
            "polarity": sentiment(tweet.tweet)
        }
        generate_lang_data(tweet.lang)
        # generate_region_data(tweet.place)
        my_json["tweets"].append(t_data)
    return tweets


def sentiment(text):
    analysis = TextBlob(text)
    if analysis.sentiment.polarity > 0:
        return "Positive"

    if analysis.sentiment.polarity == 0:
        return "Neutral"

    if analysis.sentiment.polarity < 0:
        return "Negative"


def get_polarity(fetched_tweets):
    global my_json, lang_data, region_data

    pos = 0
    neg = 0
    neu = 0

    for tw in fetched_tweets:
        pol = sentiment(tw)
        if pol == 'Positive':
            pos = pos + 1

        if pol == 'Neutral':
            neu = neu + 1

        if pol == 'Negative':
            neg = neg + 1

    # try:
    #     pos_p = (pos / len(fetched_tweets)) * 100
    # except:
    #     pos_p = 0

    # try:
    #     neg_p = (neg / len(fetched_tweets)) * 100
    # except:
    #     neg_p = 0

    # try:
    #     neu_p = (neu / len(fetched_tweets)) * 100
    # except:
    #     neu_p = 0

    pol_dict_data = {"positive": pos, "negative": neg, "neutral": neu}
    sent_dict = {"Sentiment": pol_dict_data, "Tweets": my_json,
                 "Languages": lang_data, "Regions": region_data}
    return sent_dict


@app.route('/')
def index():
    keyword_form = forms.KeywordForm()
    return render_template('index.html', form=keyword_form)


@app.route('/tweets_template')
def tweets_template():
    return render_template('tweets.html')


@app.route('/get', methods=['GET', 'POST'])
def get():
    query = request.args.get('query')
    lang = request.args.get('lang', 'any')
    place = request.args.get('place', 'any')
    fetched_tweets = get_tweets(query, lang, place)
    pol = get_polarity(fetched_tweets)
    return pol


if __name__ == '__main__':
    app.run()
