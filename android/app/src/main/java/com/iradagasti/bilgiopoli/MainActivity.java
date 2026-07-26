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
     * karelerden tasiyor. Sistem yazi boyutu (textZoom) da tum olcegi bozuyor.
     * Ikisini de sabitleyerek telefonda masaustuyle ayni oranli goruntuyu aliyoruz.
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
        // Cihazin sistem yazi boyutu ayari oyun olcegini bozmasin
        settings.setTextZoom(100);
        // Oyun sabit oranli; kullanici yakinlastirmasi layout'u bozuyor
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
    }
}
