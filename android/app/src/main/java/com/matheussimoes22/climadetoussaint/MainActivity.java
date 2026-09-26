package com.matheussimoes22.climadetoussaint;

import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String NATIVE_BACK_EVENT =
        "window.dispatchEvent(new Event('toussaint:native-back'))";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);

        // Entrega o gesto/botão Voltar ao roteador da interface em vez de encerrar a Activity.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                getBridge().getWebView().evaluateJavascript(NATIVE_BACK_EVENT, null);
            }
        });
    }
}
