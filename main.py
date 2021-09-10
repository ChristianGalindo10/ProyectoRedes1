import twint
from flask import Flask, render_template, request
from nltk.util import pr
import forms
from textblob import TextBlob
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)
#Config Twint
c = twint.Config()
c.Store_object = True
c.Limit = 100

tweets = []
t_data = {} #dictionary for twitter data
my_json = {"tweets": []} 
lang_data = {} #dictionary for language data


def generate_lang_data(lang):
    global lang_data
    if lang in lang_data:
        val = lang_data[lang]
        lang_data[lang] = val + 1
    else:
        lang_data[lang] = 1


def get_tweets(keyword,lang):
    global tweets, t_data, my_json,lang_data
    tweets.clear()
    if keyword is not None:
        if lang != 'any':
            c.Search = keyword
            c.Lang = lang
        else:
            c.Search = keyword
        twint.run.Search(c)
        public_tweets = twint.output.tweets_list   
    lang_data.clear()
    my_json["tweets"].clear()
    for tweet in public_tweets:
        tweets.append(tweet.tweet)
        t_data = {
            "Tweet_Text": tweet.tweet,
            "url": tweet.link,
            "user_name": tweet.username,
            "screen_name": tweet.username,
            "created_at" : tweet.datestamp,
            "name":tweet.name,
            "profile_image":tweet.profile_image_url,
            "polarity": sentiment(tweet.tweet)
        }
        generate_lang_data(tweet.lang)
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
    global my_json, lang_data

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
    sent_dict = {"Sentiment": pol_dict_data, "Tweets": my_json, "Languages": lang_data}
    return sent_dict



        

@app.route('/')
def index():
    keyword_form = forms.KeywordForm()
    return render_template('index.html', form = keyword_form)

@app.route('/tweets_template')
def tweets_template():
    return render_template('tweets.html')

@app.route('/get', methods=['GET','POST'])
def get():
    query = request.args.get('query')
    lang = request.args.get('lang','any')
    fetched_tweets = get_tweets(query,lang)
    pol = get_polarity(fetched_tweets)
    return pol
    

if __name__ == '__main__':
    app.run()