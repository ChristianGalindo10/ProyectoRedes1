from wtforms import Form, StringField, validators

class KeywordForm(Form):
    keyword = StringField('Keyword', [
        validators.Required(message = "This field is required!")
    ])
    language = StringField('Language')
    place = StringField('Place')