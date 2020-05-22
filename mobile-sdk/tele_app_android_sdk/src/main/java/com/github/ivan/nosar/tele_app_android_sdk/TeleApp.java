package com.github.ivan.nosar.tele_app_android_sdk;

import android.app.Application;
import android.os.Build;

import com.github.ivan.nosar.tele_app_android_sdk.api_controllers.LogController;
import com.github.ivan.nosar.tele_app_android_sdk.api_controllers.MetricController;
import com.github.ivan.nosar.tele_app_android_sdk.api_controllers.SessionController;
import com.github.ivan.nosar.tele_app_android_sdk.http_models.Metric;
import com.github.ivan.nosar.tele_app_android_sdk.http_models.Session;
import com.github.ivan.nosar.tele_app_android_sdk.http_models.Log;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class TeleApp {

    private final static String BASE_URL = "http://192.168.0.100:4939/";

    public static void start(Application application, final String appSecret) {
        TeleApp instance = getInstance();

        String baseUrl = null;
        if (application != null &&
                application.getApplicationInfo() != null &&
                application.getApplicationInfo().metaData != null) {
            baseUrl = application.getApplicationInfo().metaData.getString("api-server-base-url");
        }
        if (baseUrl == null) {
            baseUrl = BASE_URL;
        }
        instance.configureRetrofit(baseUrl);

        Session body = new Session(
                0,
                "",
                Build.MODEL,
                String.valueOf(Build.VERSION.SDK_INT),
                Locale.getDefault().toString()
        );

        Call<Session> createSessionCall = instance.sessionController.create(appSecret, body);
        try {
            createSessionCall.enqueue(new Callback<Session>() {
                @Override
                public void onResponse(Call<Session> call, Response<Session> response) {
                    if (!response.isSuccessful()) {
                        android.util.Log.d("Error creating session", response.toString());
                        return;
                    }
                    Session session = response.body();
                    android.util.Log.d("New session id", String.valueOf(session.id));
                    TeleApp.getInstance().configure(session, appSecret);
                }

                @Override
                public void onFailure(Call<Session> call, Throwable t) {
                    android.util.Log.e("Error creating session", t.toString());
                    TeleApp.getInstance().dropConfiguration();
                }
            });
        } catch (Exception e) {
            android.util.Log.e("Error creating session", e.toString());
        }
    }

    public static boolean isConfigured() {
        return getInstance().isConfigured;
    }

    public static void trackLog(String text) {
        TeleApp instance = getInstance();
        if (!isConfigured()) {
            android.util.Log.w("TeleApp not configured", "Please call `TeleApp.configure(...)` method before using this method");
            return;
        }

        Log body = new Log(
                0,
                "",
                text
        );

        Call<Log> sendLogCall = instance.logController.create(instance.appSecret, instance.session.id, body);
        try {
            sendLogCall.enqueue(new Callback<Log>() {
                @Override
                public void onResponse(Call<Log> call, Response<Log> response) {
                    if (!response.isSuccessful()) {
                        android.util.Log.d("Error sending log", response.toString());
                        return;
                    }
                    Log log = response.body();
                    android.util.Log.i("TeleApp sent log", "Id: " + log.id);
                }

                @Override
                public void onFailure(Call<Log> call, Throwable t) {
                    android.util.Log.e("Error sending log", t.toString());
                }
            });
        } catch (Exception e) {
            android.util.Log.e("Error sending log", e.toString());
        }
    }

    public static void trackMetric(String name) {
        trackMetric(name, new HashMap<String, Object>());
    }

    public static void trackMetric(String name, Map<String, Object> properties) {
        TeleApp instance = getInstance();
        if (!isConfigured()) {
            android.util.Log.w("TeleApp not configured", "Please call `TeleApp.configure(...)` method before using this method");
            return;
        }

        Metric body = new Metric(
                0,
                "",
                properties
        );

        Call<Metric> sendLogCall = instance.metricController.create(instance.appSecret, instance.session.id, body);
        try {
            sendLogCall.enqueue(new Callback<Metric>() {
                @Override
                public void onResponse(Call<Metric> call, Response<Metric> response) {
                    if (!response.isSuccessful()) {
                        android.util.Log.d("Error sending metric", response.toString());
                        return;
                    }
                    Metric metric = response.body();
                    android.util.Log.i("TeleApp sent metric", "Id: " + metric.id);
                }

                @Override
                public void onFailure(Call<Metric> call, Throwable t) {
                    android.util.Log.e("Error sending metric", t.toString());
                }
            });
        } catch (Exception e) {
            android.util.Log.e("Error sending metric", e.toString());
        }
    }

    private static TeleApp instance;

    private Retrofit retrofit;
    private String baseUrl;
    private boolean isConfigured;
    private String appSecret;
    private Session session;

    private SessionController sessionController;
    private LogController logController;
    private MetricController metricController;

    private TeleApp(String baseUrl) {
        this.isConfigured = false;
    }

    private static synchronized TeleApp getInstance() {
        if (instance == null) {
            instance = new TeleApp(BASE_URL);
        }
        return instance;
    }

    private void configureRetrofit(String baseUrl) {
        this.baseUrl = baseUrl;
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        this.retrofit = new Retrofit.Builder()
                .baseUrl(this.baseUrl)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build();

        sessionController = retrofit.create(SessionController.class);
        logController = retrofit.create(LogController.class);
        metricController = retrofit.create(MetricController.class);
    }

    private synchronized void configure(Session session, String appSecret) {
        this.isConfigured = true;
        this.session = session;
        this.appSecret = appSecret;
    }

    private synchronized void dropConfiguration() {
        this.isConfigured = false;
        this.session = null;
    }
}
