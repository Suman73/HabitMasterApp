package com.habitmaster.app;

import android.annotation.SuppressLint;
import android.app.Dialog;
import android.os.Bundle;
import android.os.Message;
import android.util.DisplayMetrics;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private Dialog popupDialog;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setDatabaseEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        try { settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE); } catch (Throwable ignored) {}
        webView.setInitialScale(100);

        // Ensure cookies (incl. third-party) are allowed for OAuth flows
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        try { CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true); } catch (Throwable ignored) {}

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
                // Create a popup WebView inside a dialog sized to at least 90% of the screen
                WebView child = new WebView(MainActivity.this);
                WebSettings childSettings = child.getSettings();
                childSettings.setJavaScriptEnabled(true);
                childSettings.setDomStorageEnabled(true);
                childSettings.setSupportMultipleWindows(true);
                childSettings.setJavaScriptCanOpenWindowsAutomatically(true);
                childSettings.setUseWideViewPort(true);
                childSettings.setLoadWithOverviewMode(false);
                childSettings.setSupportZoom(false);
                childSettings.setDisplayZoomControls(false);
                childSettings.setTextZoom(100);
                try { childSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE); } catch (Throwable ignored) {}
                child.setInitialScale(100);
                child.setWebViewClient(new WebViewClient());
                child.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onCloseWindow(WebView window) {
                        if (popupDialog != null && popupDialog.isShowing()) {
                            popupDialog.dismiss();
                        }
                    }
                });

                popupDialog = new Dialog(MainActivity.this);
                popupDialog.setContentView(child);

                // Size dialog to 90% of the screen
                DisplayMetrics dm = new DisplayMetrics();
                getWindowManager().getDefaultDisplay().getMetrics(dm);
                int width = (int) (dm.widthPixels * 0.9);
                int height = (int) (dm.heightPixels * 0.9);
                if (popupDialog.getWindow() != null) {
                    popupDialog.getWindow().setLayout(width, height);
                    popupDialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
                }
                popupDialog.show();

                WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
                transport.setWebView(child);
                resultMsg.sendToTarget();
                return true;
            }
        });

        // Load local index.html from assets
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (popupDialog != null && popupDialog.isShowing()) {
            popupDialog.dismiss();
            return;
        }
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
