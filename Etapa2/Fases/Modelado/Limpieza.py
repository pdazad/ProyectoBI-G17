import pandas as pd
import unicodedata
import re
import string
import nltk
from nltk.corpus import stopwords
from sklearn.base import BaseEstimator, TransformerMixin
from joblib import Parallel, delayed
import ftfy
import inflect
from nltk import word_tokenize
import contractions

class Limpieza(BaseEstimator, TransformerMixin):
    
    def __init__(self):
        stop_words = stopwords.words('spanish')
        stop_words.append("usarlas")
        stop_words.append("ejecutarlo")
        self.stop_words = set(stop_words)

    def fit(self, X, y=None):
        print("Limpieza")
        return self

    
    def transform(self, X, y=None):
        print("Transformado texto")
        return self.limpiar(X)
    
    
    def limpiar(self, df: pd.DataFrame) -> pd.DataFrame:
        df=pd.DataFrame(df)
        df['Textos_espanol'] = df['Textos_espanol'].apply(fix_malformed_words)
        df['Textos_espanol'] = df['Textos_espanol'].apply(contractions.fix)
        df['Textos_espanol'] = df['Textos_espanol'].apply(word_tokenize).apply(preprocessing)
        df['Textos_espanol'] = df['Textos_espanol'].apply(lambda x: ' '.join(map(str, x))) 
        df_clean = df['Textos_espanol']
        return df_clean
    
    def remove_stopwords(self, review):
        tokens = nltk.word_tokenize(review)
        filtered_tokens = [token for token in tokens if token not in self.stop_words]
        return " ".join(filtered_tokens)

# Esta lista contiene las stop words en español
spanish_stopwords = set(stopwords.words('spanish'))

def fix_malformed_words(text):
    # Utiliza ftfy para corregir problemas de codificación
        text = ftfy.fix_text(text)
        return text

def remove_non_ascii(words):
    """Remove non-ASCII characters from list of tokenized words"""
    new_words = []
    for word in words:
        new_word = unicodedata.normalize('NFKD', word).encode('ascii', 'ignore').decode('utf-8', 'ignore')
        new_words.append(new_word)
    return new_words

def to_lowercase(words):
    """Convert all characters to lowercase from list of tokenized words"""
    new_words = []
    for word in words:
        new_words.append(word.lower())
    return new_words

def remove_punctuation(words):
    """Remove punctuation from list of tokenized words"""
    new_words = []
    for word in words:
        new_word = re.sub(r'[^\w\s]', '', word)
        if new_word != '':
            new_words.append(new_word)
    return new_words

def replace_numbers(words):
    """Replace all integer occurrences in list of tokenized words with textual representation"""
    p = inflect.engine()
    new_words = []
    for word in words:
        if word.isdigit():
            new_word = p.number_to_words(word)
            new_words.append(new_word)
        else:
            new_words.append(word)
    return new_words

def remove_stopwords(words):
    """Remove stop words from list of tokenized words"""
    new_words = []
    for word in words:
        if word not in spanish_stopwords:
            new_words.append(word)
    return new_words

def preprocessing(words):
    words = to_lowercase(words)
    words = replace_numbers(words)
    words = remove_punctuation(words)
    words = remove_non_ascii(words)
    words = remove_stopwords(words)
    return words
