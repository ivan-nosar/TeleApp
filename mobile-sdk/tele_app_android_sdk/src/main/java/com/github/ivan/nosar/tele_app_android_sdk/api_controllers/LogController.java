package com.github.ivan.nosar.tele_app_android_sdk.api_controllers;

import com.github.ivan.nosar.tele_app_android_sdk.http_models.Log;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface LogController {
    @POST("/sessions/{sessionId}/logs")
    Call<Log> create(@Header("app-secret") String appSecret, @Path("sessionId") long sessionId, @Body Log log);
}
