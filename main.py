import webview
import os
import sys
from pathlib import Path


def get_base_path():
    try:
        base_path = sys._MEIPASS
    except AttributeError:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return base_path


def apply_macos_identity():
    """macOS'ta Dock'ta 'python' yerine uygulama simgesi ve adi gorunsun.

    Uygulama `python main.py` ile calistirildiginda Dock, Python yorumlayicisinin
    kimligini gosterir. pywebview macOS'ta PyObjC (Cocoa) kullandigi icin,
    calisma aninda paylasilan NSApplication uzerinden simgeyi ve adi ayarlariz.
    (Tam dogru ad icin uygulamayi Bilgiopoli.app ile de acabilirsiniz.)
    """
    if sys.platform != 'darwin':
        return
    icon_path = os.path.join(get_base_path(), 'icons', 'icon.png')
    try:
        from AppKit import NSApplication, NSImage

        app = NSApplication.sharedApplication()
        img = NSImage.alloc().initWithContentsOfFile_(icon_path)
        if img is not None:
            app.setApplicationIconImage_(img)
    except Exception:
        pass
    # Menu cubugu/uygulama adini 'Bilgiopoli' yapmayi dene.
    try:
        from Foundation import NSBundle

        bundle = NSBundle.mainBundle()
        info = bundle.localizedInfoDictionary() or bundle.infoDictionary()
        if info is not None:
            info['CFBundleName'] = 'Bilgiopoli'
            info['CFBundleDisplayName'] = 'Bilgiopoli'
    except Exception:
        pass


def main():
    # NOT: Oyun artik harici dosyalara (css/, js/, vendor/, icons/) bagimli.
    # Bu yuzden HTML'i string olarak degil, URL (dosya yolu) olarak yukluyoruz
    # ki goreli yollar dogru cozumlensin.
    html_path = Path(get_base_path(), 'index.html').resolve().as_uri()

    webview.create_window(
        'Bilgiopoli – Sosyal Bilgiler',
        url=html_path,
        width=1280,
        height=720,
        resizable=True,
        frameless=False,
    )

    # Dock simgesi/adi: hem baslamadan once hem de baslatildiktan sonra uygula
    # (bazi surumlerde pywebview kendi baslatmasinda simgeyi sifirlayabiliyor).
    apply_macos_identity()
    webview.start(apply_macos_identity)


if __name__ == '__main__':
    main()
