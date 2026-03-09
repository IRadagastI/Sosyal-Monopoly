import webview
import sys
import os

def get_base_path():
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return base_path

def main():
    html_path = os.path.join(get_base_path(), 'index.html')
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    window = webview.create_window('Sosyal Bilgiler Monopoly', html=html_content, width=1280, height=720, resizable=True, frameless=False)
    webview.start()

if __name__ == '__main__':
    main()
