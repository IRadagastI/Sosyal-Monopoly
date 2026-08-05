package com.iradagasti.bilgiopoli;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        tuneWebViewText();
    }

    /**
     * Arayuz 16:9 akilli tahta icin vmin tabanli olceklenir; telefon yatay modunda
     * 1vmin ~ 4px'e duser. WebView'in varsayilan alt siniri (minimumFontSize = 8px)
     * bu kucuk yazilari zorla buyutuyor (0.95vmin -> 8px, yani +%100) ve yazilar
     * karelerden tasiyor. Minimumu kaldırırken sistem yazı ölçeğini güvenli aralıkta
     * korur ve kullanıcı yakınlaştırmasına izin veririz.
     */
    private void tuneWebViewText() {
        if (getBridge() == null) {
            return;
        }
        WebView webView = getBridge().getWebView();
        if (webView == null) {
            return;
        }
        WebSettings settings = webView.getSettings();
        // vmin tabanli kucuk yazilarin zorla buyutulmesini engelle
        settings.setMinimumFontSize(1);
        settings.setMinimumLogicalFontSize(1);
        // Sistem erişilebilirlik yazı ölçeğine saygı göster; aşırı değerlerde tahta
        // yerleşimini korumak için güvenli bir aralıkta sınırla.
        float fontScale = getResources().getConfiguration().fontScale;
        settings.setTextZoom(textZoomForFontScale(fontScale));
        // Kullanıcı gerektiğinde kıstırma hareketiyle yakınlaştırabilsin.
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
    }

    static int textZoomForFontScale(float fontScale) {
        return Math.round(Math.max(0.85f, Math.min(fontScale, 1.30f)) * 100f);
    }
}
