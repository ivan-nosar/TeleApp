package com.github.ivan.nosar.tele_app_demo;

import android.app.Application;
import android.os.Bundle;

public class TeleAppDemoApplication extends Application {

    @Override
    public void onCreate() {
        super.onCreate();

        if (this.getApplicationInfo().metaData == null) {
            this.getApplicationInfo().metaData = new Bundle();
        }

        this.getApplicationInfo().metaData.putString("api-server-base-url", "http://192.168.0.100:4939/");
    }
}
