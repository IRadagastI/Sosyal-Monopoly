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
    # NOT: Oyun artik harici dosyalara (css/, js/, vendor/, icons/) bagimli.
    # Bu yuzden HTML'i string olarak degil, URL (dosya yolu) olarak yukluyoruz
    # ki goreli yollar dogru cozumlensin.
    html_path = os.path.join(get_base_path(), 'index.html')

    webview.create_window('Bilgiopoli – Sosyal Bilgiler', url=html_path, width=1280, height=720, resizable=True, frameless=False)
    webview.start()

if __name__ == '__main__':
    main()
