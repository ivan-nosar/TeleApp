package com.github.ivan.nosar.tele_app_android_sdk.api_controllers;

import com.github.ivan.nosar.tele_app_android_sdk.http_models.Session;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;

public interface SessionController {
    @POST("/sessions")
    Call<Session> create(@Header("app-secret") String appSecret, @Body Session session);
}
