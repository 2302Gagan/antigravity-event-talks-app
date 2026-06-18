from flask import Flask, jsonify, render_template
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def extract_text_for_tweet(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    # Extract clean text from HTML
    text = soup.get_text(separator=' ')
    text = ' '.join(text.split())
    return text

def format_tweet_text(date, type_name, text):
    # Emoji based on type
    emoji_map = {
        'feature': '🚀',
        'announcement': '📢',
        'breaking': '⚠️',
        'issue': '🐛',
        'change': '🔄',
        'deprecated': '🚫'
    }
    emoji = emoji_map.get(type_name.lower(), '📢')
    
    prefix = f"{emoji} #BigQuery Update ({date}) - {type_name}:\n"
    suffix = "\n#GoogleCloud #GCP"
    
    # Twitter's character limit is 280 characters.
    max_text_len = 280 - len(prefix) - len(suffix) - 5
    
    if len(text) > max_text_len:
        truncated_text = text[:max_text_len - 3] + "..."
    else:
        truncated_text = text
        
    return f"{prefix}{truncated_text}{suffix}"

def fetch_and_parse_feed():
    try:
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        xml_content = response.content
    except Exception as e:
        print(f"Error fetching feed: {e}")
        return []

    try:
        namespaces = {'atom': 'http://www.w3.org/2005/Atom'}
        root = ET.fromstring(xml_content)
        
        entries = []
        for entry in root.findall('atom:entry', namespaces):
            title_el = entry.find('atom:title', namespaces)
            date = title_el.text if title_el is not None else "Unknown Date"
            
            # Try to get the entry specific link
            link_el = entry.find("atom:link[@rel='alternate']", namespaces)
            if link_el is None:
                link_el = entry.find("atom:link", namespaces)
            link_href = link_el.attrib.get('href', '') if link_el is not None else 'https://cloud.google.com/bigquery/docs/release-notes'
            
            content_el = entry.find('atom:content', namespaces)
            if content_el is None or not content_el.text:
                continue
                
            content_html = content_el.text
            soup = BeautifulSoup(content_html, 'html.parser')
            
            current_type = "Update"
            current_elements = []
            
            for child in soup.contents:
                if isinstance(child, str):
                    continue
                
                if child.name == 'h3':
                    if current_elements:
                        html_text = "".join(str(el) for el in current_elements)
                        clean_text = extract_text_for_tweet(html_text)
                        tweet_text = format_tweet_text(date, current_type, clean_text)
                        entries.append({
                            'date': date,
                            'type': current_type,
                            'content': html_text,
                            'tweet_text': tweet_text,
                            'link': link_href
                        })
                        current_elements = []
                    current_type = child.text.strip()
                else:
                    current_elements.append(child)
            
            if current_elements:
                html_text = "".join(str(el) for el in current_elements)
                clean_text = extract_text_for_tweet(html_text)
                tweet_text = format_tweet_text(date, current_type, clean_text)
                entries.append({
                    'date': date,
                    'type': current_type,
                    'content': html_text,
                    'tweet_text': tweet_text,
                    'link': link_href
                })
                
        return entries
    except Exception as e:
        print(f"Error parsing feed: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def releases():
    data = fetch_and_parse_feed()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
